// Fotografa o Lex (frontend real do red + API fictícia) com o Edge ou o Chrome em modo headless, via Chrome DevTools Protocol.
// Sem dependências: usa só o WebSocket e o fetch do Node. Pré-requisito: mock-api (5999) e o app (5174) no ar.
//   node tools/screenshots/capture.mjs [nome ...]     (sem nomes, fotografa todas as telas)
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(here, '..', '..', 'public', 'shots')
const appUrl = process.env.APP_URL ?? 'http://127.0.0.1:5174'
const debugPort = 9333
const VIEWPORT = { width: 1600, height: 1000, scale: 1.5 }
// 29/10/2026, 11:42 no horário de Brasília. Congelado para a DRE do "mês atual" e as datas relativas ficarem iguais em toda execução.
const FIXED_NOW = Date.parse('2026-10-29T11:42:00-03:00')

const browserCandidates = [
  process.env.BROWSER_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].filter(Boolean)
const browserPath = browserCandidates.find((candidate) => existsSync(candidate))
if (!browserPath) throw new Error('Edge ou Chrome não encontrado. Defina BROWSER_PATH.')

// Cada tela: rota, nome do arquivo e, quando precisa, um script que prepara o estado antes da foto.
const clickByText = (selector, text) =>
  `(() => { const el = [...document.querySelectorAll(${JSON.stringify(selector)})].find((e) => e.textContent.trim().toLowerCase().startsWith(${JSON.stringify(text.toLowerCase())})); if (el) el.click(); return !!el })()`
const scrollMainTo = (text) =>
  `(() => { const el = [...document.querySelectorAll('h2, h3, p')].find((e) => e.textContent.trim().toLowerCase().startsWith(${JSON.stringify(text.toLowerCase())})); if (!el) return false; el.scrollIntoView({ block: 'start' }); const scroller = document.querySelector('main'); if (scroller) scroller.scrollTop -= 12; window.scrollBy(0, -12); return true })()`

const shots = [
  { name: 'painel-indicadores', route: '/', prepare: scrollMainTo('Como o painel se preenche') },
  { name: 'lancamentos', route: '/lancamentos' },
  { name: 'extratos', route: '/extratos-bancarios', after: scrollMainTo('Movimentações') },
  { name: 'plano-de-contas', route: '/plano-de-contas', after: scrollMainTo('Plano de contas') },
  { name: 'dre', route: '/relatorios', prepare: clickByText('button', 'Expandir tudo'), after: scrollMainTo('Resultado líquido do período') },
  { name: 'notas-de-servico', route: '/notas-fiscais', after: scrollMainTo('Total do mês') },
  { name: 'documentos-fiscais', route: '/documentos-fiscais', after: scrollMainTo('Total do mês') },
  { name: 'apuracoes', route: '/mit' },
  { name: 'situacao-fiscal', route: '/situacao-fiscal' },
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

class Cdp {
  constructor(socket) {
    this.socket = socket
    this.nextId = 1
    this.pending = new Map()
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      const waiter = this.pending.get(message.id)
      if (!waiter) return
      this.pending.delete(message.id)
      message.error ? waiter.reject(new Error(`${waiter.method}: ${message.error.message}`)) : waiter.resolve(message.result)
    })
  }

  send(method, params = {}) {
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method })
      this.socket.send(JSON.stringify({ id, method, params }))
    })
  }

  async evaluate(expression) {
    const { result, exceptionDetails } = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (exceptionDetails) throw new Error(`Falha ao executar script: ${exceptionDetails.text} ${exceptionDetails.exception?.description ?? ''}`)
    return result.value
  }
}

async function connect(profileDir) {
  const browser = spawn(
    browserPath,
    [
      '--headless=new',
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profileDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--hide-scrollbars',
      '--disable-extensions',
      '--lang=pt-BR',
      `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  )

  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()
      const page = targets.find((target) => target.type === 'page')
      if (page) {
        const socket = new WebSocket(page.webSocketDebuggerUrl)
        await new Promise((resolve, reject) => {
          socket.addEventListener('open', resolve, { once: true })
          socket.addEventListener('error', reject, { once: true })
        })
        return { browser, cdp: new Cdp(socket) }
      }
    } catch {
      // O navegador ainda está subindo.
    }
    await sleep(250)
  }
  browser.kill()
  throw new Error('Não consegui conectar ao navegador.')
}

// Espera as telas terminarem de carregar: sem esqueletos, sem barras de andamento e sem requisições pendentes por um instante.
async function settle(cdp) {
  await cdp.evaluate(`new Promise((resolve) => {
    const started = Date.now()
    let calm = 0
    const tick = () => {
      const busy = document.querySelectorAll('.animate-pulse, [role=progressbar], [aria-busy=true]').length > 0
      const loading = /Carregando|Verificando/.test(document.body.innerText)
      calm = busy || loading ? 0 : calm + 1
      if (calm >= 4 || Date.now() - started > 15000) resolve(true)
      else setTimeout(tick, 150)
    }
    tick()
  })`)
  await sleep(350)
}

async function main() {
  const wanted = process.argv.slice(2)
  const selected = wanted.length === 0 ? shots : shots.filter((shot) => wanted.includes(shot.name))
  if (selected.length === 0) throw new Error(`Nenhuma tela com esses nomes. Disponíveis: ${shots.map((s) => s.name).join(', ')}`)
  mkdirSync(outDir, { recursive: true })

  const profileDir = mkdtempSync(path.join(os.tmpdir(), 'lex-shots-'))
  const { browser, cdp } = await connect(profileDir)
  try {
    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: VIEWPORT.scale, mobile: false })
    await cdp.send('Emulation.setTimezoneOverride', { timezoneId: 'America/Sao_Paulo' })
    await cdp.send('Emulation.setLocaleOverride', { locale: 'pt-BR' })
    // Sessão de demonstração e relógio congelado, antes de qualquer script da página.
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        try { sessionStorage.setItem('red.session', JSON.stringify({ accessToken: 'demo-token', expiresAtUtc: '2099-01-01T00:00:00.0000000+00:00' })) } catch {}
        const RealDate = Date
        const FIXED = ${FIXED_NOW}
        const start = RealDate.now()
        class FixedDate extends RealDate {
          constructor(...args) { args.length === 0 ? super(FIXED + (RealDate.now() - start)) : super(...args) }
          static now() { return FIXED + (RealDate.now() - start) }
        }
        globalThis.Date = FixedDate
      `,
    })

    for (const shot of selected) {
      await cdp.send('Page.navigate', { url: `${appUrl}${shot.route}` })
      await sleep(900)
      await settle(cdp)
      if (shot.prepare) {
        await cdp.evaluate(shot.prepare)
        await sleep(500)
        await settle(cdp)
      }
      if (shot.after) {
        await cdp.evaluate(shot.after)
        await sleep(400)
      }
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'webp', quality: 88, optimizeForSpeed: false })
      const file = path.join(outDir, `${shot.name}.webp`)
      writeFileSync(file, Buffer.from(data, 'base64'))
      console.log(`ok  ${shot.name}  ->  ${path.relative(process.cwd(), file)}`)
    }
  } finally {
    browser.kill()
    await sleep(500)
    try {
      rmSync(profileDir, { recursive: true, force: true })
    } catch {
      // O Edge pode segurar a pasta por mais um instante; ela fica no diretório temporário.
    }
  }
}

main().then(() => process.exit(0), (error) => {
  console.error(error)
  process.exit(1)
})
