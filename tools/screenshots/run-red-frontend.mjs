// Sobe o frontend real do red (Vite) apontado para a API fictícia, sem tocar no repositório do red.
// Usa o vite que já está no node_modules do red. Defina RED_FRONTEND_DIR se o red não ficar ao lado desta pasta.
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const frontendDir = path.resolve(process.env.RED_FRONTEND_DIR ?? path.join(here, '..', '..', '..', 'red', 'frontend'))
const viteBin = path.join(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js')
const apiUrl = process.env.MOCK_API_URL ?? 'http://127.0.0.1:5999'
const port = process.env.APP_PORT ?? '5174'

if (!existsSync(viteBin)) {
  console.error(`vite não encontrado em ${viteBin}. Rode "npm install" em ${frontendDir} ou defina RED_FRONTEND_DIR.`)
  process.exit(1)
}

const child = spawn(process.execPath, [viteBin, '--host', '127.0.0.1', '--port', port, '--strictPort'], {
  cwd: frontendDir,
  stdio: 'inherit',
  env: { ...process.env, VITE_API_URL: apiUrl, VITE_SIGNALR_URL: apiUrl },
})
child.on('exit', (code) => process.exit(code ?? 0))
process.on('SIGINT', () => child.kill('SIGINT'))
process.on('SIGTERM', () => child.kill('SIGTERM'))
