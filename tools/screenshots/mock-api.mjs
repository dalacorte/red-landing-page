// API fictícia do Lex, só para fotografar o frontend real do red sem dados de clientes.
// Tudo aqui é inventado: empresa, CNPJs, bancos, clientes e valores. Os formatos seguem os tipos do frontend (src/features/*Api.ts).
// Uso: node tools/screenshots/mock-api.mjs   (porta 5999, ou PORT)
import http from 'node:http'

const PORT = Number(process.env.PORT ?? 5999)
const USER = { id: '0197a1f0-0000-7000-8000-000000000001', email: 'ana.souza@meridiano.example' }
const COMPANY_CNPJ = '11222333000181'
const COMPANY_NAME = 'MERIDIANO COMÉRCIO E SERVIÇOS DIGITAIS LTDA'

// ---------- utilidades ----------
let seed = 20261029
function rand() {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const between = (min, max) => min + rand() * (max - min)
const pick = (list) => list[Math.floor(rand() * list.length)]
const r2 = (n) => Math.round(n * 100) / 100
const pad = (n, size = 2) => String(n).padStart(size, '0')
const date = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`
const instant = (day, hour = 12, minute = 0) => `${day}T${pad(hour)}:${pad(minute)}:00Z`
const uid = (kind, n) => `00000000-0000-7000-8000-${kind.padEnd(2, '0').slice(0, 2)}${n.toString(16).padStart(10, '0')}`
const digits = (n) => Array.from({ length: n }, () => Math.floor(rand() * 10)).join('')

// ---------- plano de contas ----------
// código, nome, grupo, natureza, analítica, linha da DRE, papel no sistema
const planRows = [
  ['1', 'ATIVO', 'asset', 'debit', false],
  ['1.1', 'Ativo circulante', 'asset', 'debit', false],
  ['1.1.1', 'Disponibilidades', 'asset', 'debit', false],
  ['1.1.1.01', 'Caixa', 'asset', 'debit', true],
  ['1.1.1.02', 'Banco conta movimento', 'asset', 'debit', true, 'none', 'defaultBank'],
  ['1.1.2', 'Direitos realizáveis', 'asset', 'debit', false],
  ['1.1.2.01', 'Clientes a receber', 'asset', 'debit', true],
  ['1.2', 'Ativo não circulante', 'asset', 'debit', false],
  ['1.2.1', 'Imobilizado', 'asset', 'debit', false],
  ['1.2.1.01', 'Equipamentos de informática', 'asset', 'debit', true],
  ['2', 'PASSIVO', 'liability', 'credit', false],
  ['2.1', 'Passivo circulante', 'liability', 'credit', false],
  ['2.1.1', 'Fornecedores', 'liability', 'credit', false],
  ['2.1.1.01', 'Fornecedores nacionais', 'liability', 'credit', true],
  ['2.1.2', 'Obrigações trabalhistas', 'liability', 'credit', false],
  ['2.1.2.01', 'Provisões de férias e 13º', 'liability', 'credit', true],
  ['2.1.3', 'Obrigações tributárias', 'liability', 'credit', false],
  ['2.1.3.01', 'Impostos a recolher', 'liability', 'credit', true],
  ['3', 'PATRIMÔNIO LÍQUIDO', 'equity', 'credit', false],
  ['3.1', 'Capital social', 'equity', 'credit', false],
  ['3.1.1', 'Capital subscrito', 'equity', 'credit', false],
  ['3.1.1.01', 'Capital social integralizado', 'equity', 'credit', true],
  ['3.2', 'Reservas e lucros', 'equity', 'credit', false],
  ['3.2.1', 'Lucros acumulados', 'equity', 'credit', false],
  ['3.2.1.01', 'Lucros ou prejuízos acumulados', 'equity', 'credit', true, 'none', 'retainedEarnings'],
  ['4', 'RECEITAS', 'revenue', 'credit', false],
  ['4.1', 'Receita operacional bruta', 'revenue', 'credit', false],
  ['4.1.1', 'Receita de serviços', 'revenue', 'credit', false],
  ['4.1.1.01', 'Receita de serviços prestados', 'revenue', 'credit', true, 'grossRevenue'],
  ['4.2', 'Deduções da receita', 'revenue', 'debit', false],
  ['4.2.1', 'Impostos sobre faturamento', 'revenue', 'debit', false],
  ['4.2.1.01', 'ISS sobre serviços', 'revenue', 'debit', true, 'deductions'],
  ['4.2.1.02', 'PIS e Cofins sobre faturamento', 'revenue', 'debit', true, 'deductions'],
  ['5', 'CUSTOS', 'cost', 'debit', false],
  ['5.1', 'Custos dos serviços', 'cost', 'debit', false],
  ['5.1.1', 'Custos diretos', 'cost', 'debit', false],
  ['5.1.1.01', 'Infraestrutura em nuvem', 'cost', 'debit', true, 'costs'],
  ['5.1.1.02', 'Prestadores de serviço', 'cost', 'debit', true, 'costs'],
  ['6', 'DESPESAS', 'expense', 'debit', false],
  ['6.1', 'Despesas administrativas', 'expense', 'debit', false],
  ['6.1.1', 'Despesas gerais', 'expense', 'debit', false],
  ['6.1.1.01', 'Aluguel', 'expense', 'debit', true, 'administrativeExpenses'],
  ['6.1.1.02', 'Energia e internet', 'expense', 'debit', true, 'administrativeExpenses'],
  ['6.1.1.03', 'Serviços contábeis', 'expense', 'debit', true, 'administrativeExpenses'],
  ['6.1.1.04', 'Material de escritório', 'expense', 'debit', true, 'administrativeExpenses'],
  ['6.2', 'Despesas com pessoal', 'expense', 'debit', false],
  ['6.2.1', 'Folha de pagamento', 'expense', 'debit', false],
  ['6.2.1.01', 'Salários', 'expense', 'debit', true, 'personnelExpenses'],
  ['6.2.1.02', 'Encargos sociais', 'expense', 'debit', true, 'personnelExpenses'],
  ['6.3', 'Despesas comerciais', 'expense', 'debit', false],
  ['6.3.1', 'Marketing', 'expense', 'debit', false],
  ['6.3.1.01', 'Publicidade e marketing', 'expense', 'debit', true, 'commercialExpenses'],
  ['6.4', 'Despesas tributárias', 'expense', 'debit', false],
  ['6.4.1', 'Tributos', 'expense', 'debit', false],
  ['6.4.1.01', 'IRPJ e CSLL', 'expense', 'debit', true, 'taxExpenses'],
  ['6.4.1.02', 'Taxas e licenças', 'expense', 'debit', true, 'taxExpenses'],
  ['6.5', 'Resultado financeiro', 'expense', 'debit', false],
  ['6.5.1', 'Despesas financeiras', 'expense', 'debit', false],
  ['6.5.1.01', 'Tarifas bancárias', 'expense', 'debit', true, 'financialResult'],
  ['6.5.1.02', 'Juros e multas', 'expense', 'debit', true, 'financialResult'],
]
const accounts = planRows.map(([code, name, group, nature, isAnalytic, dreLine = 'none', systemRole = 'none'], index) => ({
  id: uid('ac', index + 1),
  code,
  name,
  parentId: null,
  level: code.split('.').length,
  group,
  nature,
  isAnalytic,
  systemRole,
  dreLine,
  origin: 'default',
}))
const byCode = new Map(accounts.map((a) => [a.code, a]))
for (const a of accounts) {
  const parentCode = a.code.includes('.') ? a.code.slice(0, a.code.lastIndexOf('.')) : null
  a.parentId = parentCode ? byCode.get(parentCode).id : null
}
const ref = (code) => ({ id: byCode.get(code).id, code, name: byCode.get(code).name })

// ---------- empresa ----------
const company = {
  cnpj: COMPANY_CNPJ,
  legalName: COMPANY_NAME,
  tradeName: 'Meridiano Digital',
  headOffice: true,
  foundedOn: '2019-06-03',
  status: { code: 2, text: 'ATIVA' },
  statusDate: '2019-06-03',
  statusReason: null,
  nature: { code: 2062, text: 'Sociedade Empresária Limitada' },
  size: { code: 3, text: 'Demais' },
  equity: 120000,
  mainActivity: { code: '6201501', text: 'Desenvolvimento de programas de computador sob encomenda' },
  sideActivities: [{ code: '4751201', text: 'Comércio varejista especializado de equipamentos e suprimentos de informática' }],
  address: { street: 'Rua das Acácias', number: '420', details: 'Sala 42', district: 'Vila Nova', city: 'São Paulo', state: 'SP', zip: '01310100' },
  phones: [{ type: 'landline', area: '11', number: '33334444' }],
  emails: [{ address: 'contato@meridiano.example' }],
  simples: { optant: false, since: null },
  simei: { optant: false, since: null },
  stateRegistrations: [
    { number: '110042490114', state: 'SP', enabled: true, status: { code: 1, text: 'HABILITADA' }, statusDate: '2019-06-20', type: { code: 1, text: 'NORMAL' } },
  ],
  suframa: [],
  partners: [
    { name: 'Ana Souza', taxId: '***482130**', type: 'natural', role: { code: 49, text: 'Sócio-Administrador' }, since: '2019-06-03' },
  ],
  certificate: { holderName: COMPANY_NAME, validFrom: '2026-02-01T00:00:00Z', validUntil: '2027-02-01T00:00:00Z', uploadedAt: '2026-02-03T12:00:00Z' },
  consultedAt: '2026-10-28T12:00:00Z',
  sourceUpdatedAt: '2026-10-20T00:00:00Z',
}

// ---------- extrato bancário e lançamentos ----------
const BANK = { bankCode: '999', compeCode: '999', ispbCode: '00000000', bankName: 'BANCO EXEMPLO S.A.', branchNumber: '0001', branchCheckDigit: null, accountNumber: '48201', accountCheckDigit: '7' }
const bankAccountId = uid('ba', 1)
const clients = ['ORBITAL LOGISTICA LTDA', 'CASA VENTO ALIMENTOS SA', 'PIXEL E PEDRA ARQUITETURA', 'CLINICA BEM VIVER', 'GRUPO AURORA EDUCACAO', 'TROPICAL MOBILIDADE LTDA', 'STUDIO FAISCA PRODUCOES', 'NUVEM AZUL TELECOM', 'ROTA 66 TRANSPORTES', 'QUINTAL DIGITAL EDITORA']
const entries = []
const transactions = []
let entryNumber = 0
let txnSeq = 0

function addEntry({ day, debit, credit, amount, memo, origin = 'bankTransaction', txn = null, responsible = USER.email }) {
  entryNumber += 1
  entries.push({
    id: uid('le', entryNumber),
    number: entryNumber,
    date: day,
    debitAccount: ref(debit),
    creditAccount: ref(credit),
    amount: r2(amount),
    memo,
    origin,
    sourceBankTransactionId: txn ? txn.id : null,
    sourceBankAccountId: txn ? bankAccountId : null,
    isActive: true,
    responsibleEmail: responsible,
    updatedAtUtc: instant(day, 15, 10),
  })
}

// Uma movimentação do banco já classificada: gera a movimentação e o lançamento que ela origina.
function bankMovement({ day, direction, amount, counter, name, memo, type }) {
  txnSeq += 1
  const signed = direction === 'credit' ? r2(amount) : -r2(amount)
  const [y, m] = day.split('-')
  const txn = {
    id: uid('bt', txnSeq),
    bankStatementId: uid('bs', Number(y) * 100 + Number(m)),
    fitid: `2026${digits(10)}`,
    occurrence: 1,
    trnType: type ?? (direction === 'credit' ? 'CREDIT' : 'DEBIT'),
    direction,
    amount: signed,
    postedOn: day,
    postedAtUtc: null,
    name,
    memo: memo ?? null,
    checkNumber: null,
    referenceNumber: digits(6),
    isSuperseded: false,
    correctFitid: null,
    correctAction: null,
    transferBankCode: null,
    transferAccountId: null,
    category: counter ? ref(counter) : null,
  }
  transactions.push(txn)
  if (counter) {
    addEntry({
      day,
      debit: direction === 'credit' ? '1.1.1.02' : counter,
      credit: direction === 'credit' ? counter : '1.1.1.02',
      amount,
      memo: memo ?? name,
      txn,
      responsible: 'importacao@lex',
    })
  }
  return txn
}

// Capital integralizado: lançamento manual, sem extrato.
addEntry({ day: '2026-01-02', debit: '1.1.1.02', credit: '3.1.1.01', amount: 120000, memo: 'Integralização de capital social', origin: 'manual', responsible: USER.email })

const revenueBase = [38200, 41500, 44100, 47800, 50300, 53600, 56400, 58900, 61700, 64200]
for (let m = 1; m <= 10; m += 1) {
  const lastDay = m === 10 ? 28 : 28
  const revenue = revenueBase[m - 1] + between(-900, 900)
  const parts = [0.34, 0.38, 0.28]
  ;[6, 14, 22].forEach((d, i) => {
    const client = pick(clients)
    bankMovement({
      day: date(2026, m, d),
      direction: 'credit',
      amount: revenue * parts[i],
      counter: '4.1.1.01',
      name: `PIX RECEBIDO ${client}`,
      memo: `Recebimento NFS-e ${pad(100 + m * 4 + i, 4)} - ${client.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())}`,
      type: 'CREDIT',
    })
  })
  bankMovement({ day: date(2026, m, 15), direction: 'debit', amount: revenue * 0.03, counter: '4.2.1.01', name: 'PAGTO ISS PREFEITURA SP', memo: 'ISS sobre serviços', type: 'PAYMENT' })
  bankMovement({ day: date(2026, m, 25), direction: 'debit', amount: revenue * 0.0365, counter: '4.2.1.02', name: 'DARF PIS COFINS', memo: 'PIS e Cofins sobre faturamento', type: 'PAYMENT' })
  bankMovement({ day: date(2026, m, 5), direction: 'debit', amount: revenue * 0.06, counter: '5.1.1.01', name: 'COMPRA CARTAO NUVEM SERVICOS', memo: 'Infraestrutura em nuvem', type: 'DEBIT' })
  bankMovement({ day: date(2026, m, 12), direction: 'debit', amount: revenue * 0.07, counter: '5.1.1.02', name: 'PIX ENVIADO PRESTADORES TI', memo: 'Prestadores de serviço - quinzena 1', type: 'DEBIT' })
  bankMovement({ day: date(2026, m, 27), direction: 'debit', amount: revenue * 0.07, counter: '5.1.1.02', name: 'PIX ENVIADO PRESTADORES TI', memo: 'Prestadores de serviço - quinzena 2', type: 'DEBIT' })
  bankMovement({ day: date(2026, m, 5), direction: 'debit', amount: 4800, counter: '6.1.1.01', name: 'BOLETO IMOBILIARIA CENTRAL', memo: 'Aluguel da sala 42', type: 'PAYMENT' })
  bankMovement({ day: date(2026, m, 10), direction: 'debit', amount: between(590, 660), counter: '6.1.1.02', name: 'DEB AUTOM ENERGIA E INTERNET', memo: 'Energia e internet', type: 'PAYMENT' })
  bankMovement({ day: date(2026, m, 8), direction: 'debit', amount: 890, counter: '6.1.1.03', name: 'PIX ENVIADO ESCRITORIO CONTABIL', memo: 'Honorários contábeis', type: 'DEBIT' })
  bankMovement({ day: date(2026, m, 18), direction: 'debit', amount: between(320, 560), counter: '6.1.1.04', name: 'COMPRA CARTAO PAPELARIA', memo: 'Material de escritório', type: 'DEBIT' })
  bankMovement({ day: date(2026, m, 5), direction: 'debit', amount: 12600 + m * 140, counter: '6.2.1.01', name: 'PAGTO FOLHA SALARIOS', memo: 'Folha de pagamento', type: 'PAYMENT' })
  bankMovement({ day: date(2026, m, 20), direction: 'debit', amount: 4320 + m * 40, counter: '6.2.1.02', name: 'GUIA FGTS E INSS', memo: 'Encargos sociais', type: 'PAYMENT' })
  bankMovement({ day: date(2026, m, 16), direction: 'debit', amount: between(2200, 3100), counter: '6.3.1.01', name: 'COMPRA CARTAO ANUNCIOS ONLINE', memo: 'Publicidade e marketing', type: 'DEBIT' })
  bankMovement({ day: date(2026, m, 21), direction: 'debit', amount: 128.5, counter: '6.4.1.02', name: 'TAXA ALVARA FUNCIONAMENTO', memo: 'Taxas e licenças', type: 'PAYMENT' })
  bankMovement({ day: date(2026, m, lastDay), direction: 'debit', amount: 89.9, counter: '6.5.1.01', name: 'TARIFA PACOTE SERVICOS', memo: 'Tarifas bancárias', type: 'FEE' })
  if ([4, 7, 10].includes(m)) {
    bankMovement({ day: date(2026, m, 27), direction: 'debit', amount: 9800 + m * 120, counter: '6.4.1.01', name: 'DARF IRPJ CSLL TRIMESTRAL', memo: 'IRPJ e CSLL do trimestre', type: 'PAYMENT' })
  }
}
bankMovement({ day: '2026-03-14', direction: 'debit', amount: 18900, counter: '1.2.1.01', name: 'COMPRA CARTAO ELETRONICOS', memo: 'Notebooks para a equipe', type: 'DEBIT' })
bankMovement({ day: '2026-07-18', direction: 'debit', amount: 214.37, counter: '6.5.1.02', name: 'JUROS MULTA ATRASO', memo: 'Juros e multa por atraso', type: 'FEE' })

// Provisões feitas à mão.
addEntry({ day: '2026-06-30', debit: '6.2.1.02', credit: '2.1.2.01', amount: 4200, memo: 'Provisão de férias e 13º - 1º semestre', origin: 'manual', responsible: USER.email })
addEntry({ day: '2026-09-30', debit: '6.2.1.02', credit: '2.1.2.01', amount: 4200, memo: 'Provisão de férias e 13º - 3º trimestre', origin: 'manual', responsible: USER.email })
addEntry({ day: '2026-10-22', debit: '6.1.1.04', credit: '6.1.1.01', amount: 180, memo: 'Reclassificação de despesa de escritório', origin: 'manual', responsible: USER.email })

// Movimentações recentes que ainda esperam categoria.
bankMovement({ day: '2026-10-27', direction: 'credit', amount: 8400, counter: null, name: 'PIX RECEBIDO CLIENTE NOVO', memo: 'Pix recebido', type: 'CREDIT' })
bankMovement({ day: '2026-10-27', direction: 'debit', amount: 312.8, counter: null, name: 'DEB AUTOM SEGURO EMPRESARIAL', memo: 'Débito automático', type: 'PAYMENT' })
bankMovement({ day: '2026-10-28', direction: 'debit', amount: 1850, counter: null, name: 'PIX ENVIADO FORNECEDOR', memo: 'Pix enviado', type: 'DEBIT' })

entries.sort((a, b) => (a.date === b.date ? b.number - a.number : a.date < b.date ? 1 : -1))
transactions.sort((a, b) => (a.postedOn === b.postedOn ? 0 : a.postedOn < b.postedOn ? 1 : -1))
const ledgerBalance = r2(transactions.reduce((sum, t) => sum + t.amount, 0))

const statements = Array.from({ length: 10 }, (_, i) => {
  const m = i + 1
  const lastDay = m === 10 ? 28 : new Date(2026, m, 0).getDate()
  const count = transactions.filter((t) => t.postedOn.startsWith(`2026-${pad(m)}`)).length
  return {
    id: uid('bi', m),
    sourceFileName: `extrato-${pad(m)}-2026.ofx`,
    importedAt: instant(date(2026, m, lastDay), 20, 30),
    accountCount: 1,
    statementCount: 1,
    transactionCount: count,
    insertedCount: count,
    duplicateCount: 0,
    supersededCount: 0,
  }
}).reverse()

const bankAccount = {
  id: bankAccountId,
  ...BANK,
  accountType: 'checking',
  currencyCode: 'BRL',
  lastStatement: { periodStart: '2026-10-01', periodEnd: '2026-10-28', ledgerBalance, ledgerBalanceAsOf: '2026-10-28', availableBalance: ledgerBalance, availableBalanceAsOf: '2026-10-28' },
  chartAccount: null,
}

// ---------- balancete e DRE, calculados a partir dos lançamentos ----------
const yearStart = '2026-01-01'
function movement(from, to) {
  const totals = new Map()
  for (const e of entries) {
    if (e.date < from || e.date > to) continue
    const d = totals.get(e.debitAccount.code) ?? { debit: 0, credit: 0 }
    d.debit += e.amount
    totals.set(e.debitAccount.code, d)
    const c = totals.get(e.creditAccount.code) ?? { debit: 0, credit: 0 }
    c.credit += e.amount
    totals.set(e.creditAccount.code, c)
  }
  return totals
}
const balanceOf = (net) => ({ amount: r2(Math.abs(net)), side: net >= 0 ? 'debit' : 'credit' })

function uncategorizedIn(from, to) {
  const open = transactions.filter((t) => t.category === null && t.postedOn >= from && t.postedOn <= to)
  const credit = r2(open.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0))
  const debit = r2(open.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0))
  return {
    count: open.length,
    creditTotal: credit,
    debitTotal: debit,
    accounts: open.length === 0 ? [] : [{ bankAccountId, bankName: BANK.bankName, accountNumber: `${BANK.accountNumber}-${BANK.accountCheckDigit}`, count: open.length, creditTotal: credit, debitTotal: debit }],
  }
}

function trialBalance(from, to, withoutMovement) {
  const prev = movement(yearStart, new Date(Date.parse(from) - 86400000).toISOString().slice(0, 10))
  const cur = movement(from, to)
  const sum = (code, map) => {
    let debit = 0
    let credit = 0
    for (const [c, v] of map) {
      if (c === code || c.startsWith(`${code}.`)) {
        debit += v.debit
        credit += v.credit
      }
    }
    return { debit, credit }
  }
  const lines = []
  for (const a of accounts) {
    const p = sum(a.code, prev)
    const c = sum(a.code, cur)
    const previousNet = p.debit - p.credit
    const currentNet = previousNet + c.debit - c.credit
    const hasMovement = Math.abs(previousNet) > 0.004 || c.debit > 0 || c.credit > 0
    if (!hasMovement && !withoutMovement) continue
    lines.push({
      accountId: a.id,
      parentId: a.parentId,
      code: a.code,
      name: a.name,
      level: a.level,
      isAnalytic: a.isAnalytic,
      previousBalance: balanceOf(previousNet),
      debit: r2(c.debit),
      credit: r2(c.credit),
      currentBalance: balanceOf(currentNet),
    })
  }
  const analytic = lines.filter((l) => l.isAnalytic)
  const total = (pick2) => r2(analytic.reduce((s, l) => s + pick2(l), 0))
  const totals = {
    previousDebit: total((l) => (l.previousBalance.side === 'debit' ? l.previousBalance.amount : 0)),
    previousCredit: total((l) => (l.previousBalance.side === 'credit' ? l.previousBalance.amount : 0)),
    debit: total((l) => l.debit),
    credit: total((l) => l.credit),
    currentDebit: total((l) => (l.currentBalance.side === 'debit' ? l.currentBalance.amount : 0)),
    currentCredit: total((l) => (l.currentBalance.side === 'credit' ? l.currentBalance.amount : 0)),
  }
  const ytd = movement(yearStart, to)
  let yearResult = 0
  for (const [code, v] of ytd) if (/^[456]/.test(code) && byCode.get(code).isAnalytic) yearResult += v.credit - v.debit
  return {
    from,
    to,
    includeAccountsWithoutMovement: withoutMovement,
    lines,
    totals,
    difference: r2(totals.currentDebit - totals.currentCredit),
    isClosed: Math.abs(totals.currentDebit - totals.currentCredit) < 0.005,
    yearResult: r2(yearResult),
    uncategorized: uncategorizedIn(from, to),
  }
}

function incomeStatement(from, to) {
  const cur = movement(from, to)
  const valueOf = (a) => {
    const v = cur.get(a.code)
    return v ? r2(v.credit - v.debit) : 0
  }
  const accountsFor = (dreLine) =>
    accounts
      .filter((a) => a.isAnalytic && a.dreLine === dreLine && cur.has(a.code))
      .map((a) => ({ accountId: a.id, code: a.code, name: a.name, value: valueOf(a) }))
  const sumOf = (list) => r2(list.reduce((s, a) => s + a.value, 0))
  const line = (kind, level, isSubtotal, value, accountList = []) => ({ kind, level, isSubtotal, value, accounts: accountList })

  const gross = accountsFor('grossRevenue')
  const deductions = accountsFor('deductions')
  const costs = accountsFor('costs')
  const admin = accountsFor('administrativeExpenses')
  const personnel = accountsFor('personnelExpenses')
  const commercial = accountsFor('commercialExpenses')
  const taxes = accountsFor('taxExpenses')
  const financial = accountsFor('financialResult')
  const other = accountsFor('otherRevenuesExpenses')

  const netRevenue = r2(sumOf(gross) + sumOf(deductions))
  const grossProfit = r2(netRevenue + sumOf(costs))
  const operatingExpenses = r2(sumOf(admin) + sumOf(personnel) + sumOf(commercial) + sumOf(taxes))
  const operatingResult = r2(grossProfit + operatingExpenses)
  const netResult = r2(operatingResult + sumOf(financial) + sumOf(other))

  return {
    from,
    to,
    lines: [
      line('grossRevenue', 1, false, sumOf(gross), gross),
      line('deductions', 1, false, sumOf(deductions), deductions),
      line('netRevenue', 1, true, netRevenue),
      line('costs', 1, false, sumOf(costs), costs),
      line('grossProfit', 1, true, grossProfit),
      line('operatingExpenses', 1, true, operatingExpenses),
      line('administrativeExpenses', 2, false, sumOf(admin), admin),
      line('personnelExpenses', 2, false, sumOf(personnel), personnel),
      line('commercialExpenses', 2, false, sumOf(commercial), commercial),
      line('taxExpenses', 2, false, sumOf(taxes), taxes),
      line('operatingResult', 1, true, operatingResult),
      line('financialResult', 1, false, sumOf(financial), financial),
      line('otherRevenuesExpenses', 1, false, sumOf(other), other),
      line('netResult', 1, true, netResult),
    ],
    netResult,
    uncategorized: uncategorizedIn(from, to),
  }
}

// ---------- notas de serviço (NFS-e) ----------
const serviceInvoices = []
{
  const descriptions = [
    'Desenvolvimento e manutenção de software sob demanda',
    'Consultoria em arquitetura de sistemas',
    'Licenciamento e suporte de plataforma web',
    'Integração de sistemas via API',
    'Sustentação e monitoramento de aplicações',
  ]
  let issuedNumber = 100
  let takenNumber = 5000
  const make = (direction, m, day, party, cancelled = false) => {
    const issuedDay = date(2026, m, day)
    const value = direction === 'issued' ? r2(between(6500, 21500)) : r2(between(900, 5200))
    const iss = r2(value * 0.03)
    const pis = r2(value * 0.0065)
    const cofins = r2(value * 0.03)
    const company_ = { document: COMPANY_CNPJ, name: COMPANY_NAME }
    const issuer = direction === 'issued' ? company_ : party
    const taker = direction === 'issued' ? party : company_
    const number = direction === 'issued' ? (issuedNumber += 1) : (takenNumber += 1)
    serviceInvoices.push({
      id: uid('si', serviceInvoices.length + 1),
      accessKey: `3550308${digits(43)}`,
      number,
      series: '1',
      dpsNumber: number,
      issuedAt: instant(issuedDay, 10 + (day % 6), 5 * (day % 12)),
      competenceDate: issuedDay,
      direction,
      status: cancelled ? 'cancelled' : 'issued',
      cancelledAt: cancelled ? instant(issuedDay, 17, 20) : null,
      cancellationReason: cancelled ? 'Erro na identificação do tomador' : null,
      issuerDocument: issuer.document,
      issuerName: issuer.name,
      issuerMunicipalRegistration: direction === 'issued' ? '4.512.887-3' : null,
      issuerCityCode: '3550308',
      takerDocument: taker.document,
      takerName: taker.name,
      takerCityCode: '3550308',
      intermediaryDocument: null,
      intermediaryName: null,
      nationalServiceCode: '010101',
      municipalServiceCode: '1.01',
      nbsCode: '115090000',
      serviceDescription: pick(descriptions),
      incidenceCityCode: '3550308',
      incidenceCityName: 'São Paulo',
      serviceValue: value,
      netValue: r2(value - iss),
      issValue: iss,
      issRate: 3,
      pisValue: pis,
      cofinsValue: cofins,
      irrfValue: 0,
      csllValue: 0,
      inssValue: 0,
      approximateTaxesValue: r2(value * 0.1665),
      importedAt: instant(date(2026, 10, 28), 8, 5),
    })
  }
  const taken = ['NUVEM SERVICOS EM TECNOLOGIA LTDA', 'ESCRITORIO CONTABIL PRIMA LTDA', 'TECH TALENTOS CONSULTORIA ME']
  for (let m = 1; m <= 10; m += 1) {
    const issuedCount = 4
    for (let i = 0; i < issuedCount; i += 1) {
      const client = pick(clients)
      make('issued', m, 4 + i * 6 + (i % 2), { document: digits(14), name: client }, m === 4 && i === 1 ? true : m === 8 && i === 2)
    }
    make('taken', m, 9, { document: digits(14), name: pick(taken) })
    if (m % 2 === 0) make('taken', m, 21, { document: digits(14), name: pick(taken) })
  }
  serviceInvoices.sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1))
}

// ---------- documentos fiscais (NF-e e NFC-e) ----------
const fiscalDocuments = []
{
  const suppliers = ['DISTRIBUIDORA ALFA INFORMATICA LTDA', 'PAPELARIA E SUPRIMENTOS BOA ESCRITA SA', 'MOVEIS PRIMAVERA INDUSTRIA LTDA', 'ELETRONICOS HORIZONTE COMERCIO LTDA']
  const make = (direction, model, m, day, party, cancelled = false) => {
    const issueDay = date(2026, m, day)
    const total = r2(direction === 'received' ? between(480, 7800) : between(1200, 9400))
    const number = 1000 + fiscalDocuments.length * 7
    fiscalDocuments.push({
      id: uid('fd', fiscalDocuments.length + 1),
      accessKey: `35${pad(m)}26${digits(36)}`,
      model,
      series: 1,
      number,
      issuedAt: instant(issueDay, 9 + (day % 8), (day * 3) % 60),
      issueDate: issueDay,
      status: cancelled ? 'cancelled' : 'authorized',
      authorizationProtocol: `135${digits(12)}`,
      authorizedAt: instant(issueDay, 9 + (day % 8), ((day * 3) % 60) + 1),
      cancelledAt: cancelled ? instant(issueDay, 18, 0) : null,
      cancellationReason: cancelled ? 'Cancelamento por duplicidade de emissão' : null,
      operationType: direction === 'received' ? 'incoming' : 'outgoing',
      natureOfOperation: direction === 'received' ? 'Compra para uso e consumo' : 'Venda de mercadoria',
      issuerDocument: direction === 'received' ? party.document : COMPANY_CNPJ,
      issuerName: direction === 'received' ? party.name : COMPANY_NAME,
      issuerStateRegistration: direction === 'received' ? digits(12) : '110042490114',
      issuerState: 'SP',
      recipientDocument: direction === 'received' ? COMPANY_CNPJ : party.document,
      recipientName: direction === 'received' ? COMPANY_NAME : party.name,
      recipientState: 'SP',
      takerDocument: null,
      takerName: null,
      originState: 'SP',
      destinationState: 'SP',
      itemCount: 1 + (day % 5),
      totalValue: total,
      productsValue: total,
      discountValue: 0,
      freightValue: 0,
      insuranceValue: 0,
      otherValue: 0,
      ipiValue: 0,
      icmsBaseValue: total,
      icmsValue: r2(total * 0.18),
      icmsStValue: 0,
      pisValue: r2(total * 0.0165),
      cofinsValue: r2(total * 0.076),
      approximateTaxesValue: r2(total * 0.2),
      importedAt: instant(date(2026, 10, 28), 8, 10),
      direction,
      isSummary: false,
    })
  }
  for (let m = 1; m <= 10; m += 1) {
    const n = m % 3 === 0 ? 4 : 3
    for (let i = 0; i < n; i += 1) make('received', 'nfe', m, 3 + i * 8, { document: digits(14), name: pick(suppliers) }, m === 6 && i === 0)
    if (m % 3 === 1) make('issued', 'nfe', m, 12, { document: digits(14), name: pick(clients) })
    if (m % 4 === 0) make('issued', 'nfce', m, 19, { document: '', name: 'CONSUMIDOR' })
  }
  fiscalDocuments.sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1))
}

// ---------- MIT e situação fiscal ----------
const mitApuracoes = []
for (let y = 2024; y <= 2026; y += 1) {
  for (let m = 1; m <= 12; m += 1) {
    if (y === 2026 && m > 9) break
    const total = r2(between(3400, 9800))
    mitApuracoes.push({
      id: uid('mt', mitApuracoes.length + 1),
      idApuracao: 700000 + mitApuracoes.length * 3,
      year: y,
      month: m,
      situacao: 2,
      textoSituacao: 'Encerrada',
      dataEncerramento: m === 12 ? date(y + 1, 1, 14) : date(y, m + 1, 14),
      eventoEspecial: false,
      valorTotalApurado: total,
      semMovimento: false,
      totalDebitos: total,
      importedAt: instant('2026-10-27', 9, 40),
    })
  }
}
mitApuracoes.sort((a, b) => b.year * 100 + b.month - (a.year * 100 + a.month))

function mitDetail(item) {
  const irpj = r2(item.valorTotalApurado * 0.42)
  const csll = r2(item.valorTotalApurado * 0.18)
  const pis = r2(item.valorTotalApurado * 0.07)
  const cofins = r2(item.valorTotalApurado - irpj - csll - pis)
  const debit = (id, code, v) => ({
    idDebito: id,
    idEventoDebito: null,
    codigoDebito: code,
    paDebito: item.year * 100 + item.month,
    anoPostergado: null,
    trimPostergado: null,
    anoDebito: item.year,
    cnpjEstabelecimento: COMPANY_CNPJ,
    cnpjIncorporacao: null,
    cnpjScp: null,
    codigoMunicipioOuro: null,
    valorDebito: v,
  })
  return {
    ...item,
    detalhes: {
      textoSituacao: item.textoSituacao,
      transmissaoImediata: true,
      dadosIniciais: { semMovimento: false, qualificacaoPj: 1, tributacaoLucro: 3, variacoesMonetarias: 1, regimePisCofins: 2, responsavel: { cpf: '***.482.130-**', ddd: '11', telefone: '999990000', email: 'contabil@meridiano.example', ufRegistro: 'SP', numeroRegistro: '1SP000000/O' } },
      eventosEspeciais: [],
      debitos: [
        { tributo: 'Irpj', debitos: [debit(1, '2089-01', irpj)], debitosAposEvento: [], total: irpj },
        { tributo: 'Csll', debitos: [debit(2, '2372-01', csll)], debitosAposEvento: [], total: csll },
        { tributo: 'PisPasep', debitos: [debit(3, '8109-01', pis)], debitosAposEvento: [], total: pis },
        { tributo: 'Cofins', debitos: [debit(4, '2172-01', cofins)], debitosAposEvento: [], total: cofins },
      ],
      suspensoes: [],
      totalDebitos: item.valorTotalApurado,
    },
  }
}

const situacaoReports = [
  { id: uid('sf', 6), status: 'completed', origin: 'serpro', sourceFileName: null, emittedAt: '2026-10-27T13:02:00Z', requestedAt: '2026-10-27T13:01:00Z', startedAt: '2026-10-27T13:01:05Z', updatedAt: '2026-10-27T13:02:10Z', completedAt: '2026-10-27T13:02:10Z', errorCode: null },
  { id: uid('sf', 5), status: 'completed', origin: 'serpro', sourceFileName: null, emittedAt: '2026-09-29T12:40:00Z', requestedAt: '2026-09-29T12:39:00Z', startedAt: '2026-09-29T12:39:05Z', updatedAt: '2026-09-29T12:40:10Z', completedAt: '2026-09-29T12:40:10Z', errorCode: null },
  { id: uid('sf', 4), status: 'completed', origin: 'file', sourceFileName: 'relatorio-situacao-fiscal-agosto.pdf', emittedAt: '2026-08-28T15:10:00Z', requestedAt: '2026-08-30T10:00:00Z', startedAt: null, updatedAt: '2026-08-30T10:00:03Z', completedAt: '2026-08-30T10:00:03Z', errorCode: null },
  { id: uid('sf', 3), status: 'completed', origin: 'serpro', sourceFileName: null, emittedAt: '2026-07-30T12:30:00Z', requestedAt: '2026-07-30T12:29:00Z', startedAt: '2026-07-30T12:29:05Z', updatedAt: '2026-07-30T12:30:10Z', completedAt: '2026-07-30T12:30:10Z', errorCode: null },
  { id: uid('sf', 2), status: 'failed', origin: 'serpro', sourceFileName: null, emittedAt: null, requestedAt: '2026-06-30T12:00:00Z', startedAt: '2026-06-30T12:00:05Z', updatedAt: '2026-06-30T12:00:40Z', completedAt: null, errorCode: 'serpro.unavailable' },
  { id: uid('sf', 1), status: 'completed', origin: 'serpro', sourceFileName: null, emittedAt: '2026-06-30T12:20:00Z', requestedAt: '2026-06-30T12:19:00Z', startedAt: '2026-06-30T12:19:05Z', updatedAt: '2026-06-30T12:20:10Z', completedAt: '2026-06-30T12:20:10Z', errorCode: null },
]
const pendencias = {
  status: 'withPendencies',
  pendencias: [
    { grupo: 'openDebt', categoria: 'pis', codigo: '8109-01', receita: 'PIS - FATURAMENTO', periodo: '09/2026', vencimento: '2026-10-25', valorOriginal: 1328.4, saldoDevedor: 1328.4, multa: 26.57, juros: 4.12, saldoConsolidado: 1359.09, situacao: 'DEVEDOR', detalhes: [] },
    { grupo: 'missingDeclaration', categoria: 'other', codigo: null, receita: 'DCTFWeb - DECLARAÇÃO NÃO APRESENTADA', periodo: '09/2026', vencimento: '2026-10-15', valorOriginal: null, saldoDevedor: null, multa: null, juros: null, saldoConsolidado: null, situacao: 'OMISSA', detalhes: [{ rotulo: 'Origem', valor: 'DCTFWeb mensal' }] },
  ],
  problems: [],
}

// ---------- roteador ----------
const pageOf = (list, q) => {
  const page = Math.max(1, Number(q.get('page') ?? 1))
  const pageSize = Math.max(1, Number(q.get('pageSize') ?? 20))
  return { items: list.slice((page - 1) * pageSize, page * pageSize), page, pageSize, totalCount: list.length }
}
const totals = (list, pickDate) => {
  const sum = (items) => ({
    count: items.length,
    total: r2(items.reduce((s, i) => s + (i.serviceValue ?? i.totalValue ?? 0), 0)),
    cancelledCount: items.filter((i) => i.status === 'cancelled').length,
    cancelledTotal: r2(items.filter((i) => i.status === 'cancelled').reduce((s, i) => s + (i.serviceValue ?? i.totalValue ?? 0), 0)),
  })
  return (year, month) => ({
    totalCount: list.length,
    month: sum(list.filter((i) => pickDate(i).startsWith(`${year}-${pad(month)}`))),
    year: sum(list.filter((i) => pickDate(i).startsWith(`${year}-`))),
  })
}
const serviceSummary = totals(serviceInvoices, (i) => i.competenceDate ?? '')
const documentSummary = totals(
  fiscalDocuments.filter((d) => d.model === 'nfe' || d.model === 'nfce'),
  (d) => d.issueDate,
)

function route(method, path, q, res) {
  const send = (status, body) => {
    res.writeHead(status, { 'Content-Type': status >= 400 ? 'application/problem+json' : 'application/json' })
    res.end(body === undefined ? '' : JSON.stringify(body))
  }
  const ok = (body) => send(200, body)
  const notFound = () => send(404, { status: 404, title: 'Not found' })

  if (path.startsWith('/health/')) return send(200)
  if (method === 'POST' && path === '/api/v1/auth/login') return ok({ accessToken: 'demo-token', tokenType: 'Bearer', expiresAtUtc: '2099-01-01T00:00:00Z', user: USER })
  if (path === '/api/v1/auth/me') return ok(USER)
  if (path === '/api/v1/initial-setup') return ok(company)
  if (path === '/api/v1/chart-of-accounts') return ok(accounts)
  if (path === '/api/v1/trial-balance') return ok(trialBalance(q.get('from'), q.get('to'), q.get('includeAccountsWithoutMovement') === 'true'))
  if (path === '/api/v1/income-statement') return ok(incomeStatement(q.get('from'), q.get('to')))

  if (path === '/api/v1/accounting-entries') {
    let list = entries
    if (q.get('origin')) list = list.filter((e) => e.origin === q.get('origin'))
    if (q.get('from')) list = list.filter((e) => e.date >= q.get('from'))
    if (q.get('to')) list = list.filter((e) => e.date <= q.get('to'))
    return ok(pageOf(list, q))
  }
  let m = path.match(/^\/api\/v1\/accounting-entries\/([^/]+)$/)
  if (m) {
    const entry = entries.find((e) => e.id === m[1])
    if (!entry) return notFound()
    const changes = [{ action: 'created', changedAtUtc: instant(entry.date, 15, 10), changedByEmail: entry.responsibleEmail }]
    return ok({ entry, changes })
  }

  if (path === '/api/v1/bank-accounts') return ok([bankAccount])
  m = path.match(/^\/api\/v1\/bank-accounts\/([^/]+)\/transactions$/)
  if (m) {
    let list = transactions
    if (q.get('direction')) list = list.filter((t) => t.direction === q.get('direction'))
    if (q.get('postedFrom')) list = list.filter((t) => t.postedOn >= q.get('postedFrom'))
    if (q.get('postedTo')) list = list.filter((t) => t.postedOn <= q.get('postedTo'))
    if (q.get('categorized') === 'true') list = list.filter((t) => t.category !== null)
    if (q.get('categorized') === 'false') list = list.filter((t) => t.category === null)
    return ok(pageOf(list, q))
  }
  if (path === '/api/v1/bank-statement-imports') return ok(pageOf(statements, q))
  if (path === '/api/v1/bank-transactions/category-suggestions') return ok([])

  if (path === '/api/v1/service-invoices') {
    let list = serviceInvoices
    if (q.get('direction')) list = list.filter((i) => i.direction === q.get('direction'))
    if (q.get('status')) list = list.filter((i) => i.status === q.get('status'))
    return ok(pageOf(list, q))
  }
  if (path === '/api/v1/service-invoices/summary') return ok(serviceSummary(Number(q.get('year')), Number(q.get('month'))))
  if (path === '/api/v1/service-invoice-imports/latest') {
    return ok({ id: uid('sm', 1), status: 'completed', progress: 100, importedCount: serviceInvoices.length, unreadableCount: 0, requestedAt: '2026-10-28T08:00:00Z', startedAt: '2026-10-28T08:00:04Z', updatedAt: '2026-10-28T08:03:10Z', completedAt: '2026-10-28T08:03:10Z', errorCode: null })
  }

  if (path === '/api/v1/fiscal-documents') {
    let list = fiscalDocuments
    if (q.get('products') === 'true') list = list.filter((d) => d.model === 'nfe' || d.model === 'nfce')
    if (q.get('model')) list = list.filter((d) => d.model === q.get('model'))
    if (q.get('status')) list = list.filter((d) => d.status === q.get('status'))
    if (q.get('direction')) list = list.filter((d) => d.direction === q.get('direction'))
    if (q.get('issuedFrom')) list = list.filter((d) => d.issueDate >= q.get('issuedFrom'))
    if (q.get('issuedTo')) list = list.filter((d) => d.issueDate <= q.get('issuedTo'))
    return ok(pageOf(list, q))
  }
  if (path === '/api/v1/fiscal-documents/summary') return ok(documentSummary(Number(q.get('year')), Number(q.get('month'))))
  if (path === '/api/v1/fiscal-document-imports/latest') {
    return ok({ id: uid('fm', 1), status: 'completed', progress: 100, totalCount: 12, processedCount: 12, importedCount: 12, cancelledCount: 0, skippedCount: 0, unreadableCount: 0, sourceFileName: 'notas-emitidas-2026.zip', requestedAt: '2026-10-20T10:00:00Z', startedAt: '2026-10-20T10:00:03Z', updatedAt: '2026-10-20T10:00:40Z', completedAt: '2026-10-20T10:00:40Z', errorCode: null })
  }
  if (path === '/api/v1/fiscal-distributions') {
    return ok([{ family: 'nfe', lastNsu: 48210, maxNsu: 48210, lastRunAt: '2026-10-29T11:00:00Z', lastSuccessAt: '2026-10-29T11:00:00Z', nextRunAt: '2026-10-29T18:00:00Z', statusCode: '137', errorCode: null }])
  }
  if (path === '/api/v1/nfce-sp-listing') {
    return ok({ applicable: true, listedUntil: '2026-10-28T23:59:00Z', lastRunAt: '2026-10-29T10:00:00Z', lastSuccessAt: '2026-10-29T10:00:00Z', nextRunAt: '2026-10-30T10:00:00Z', statusCode: 'ok', errorCode: null })
  }

  if (path === '/api/v1/mit-apuracoes') {
    let list = mitApuracoes
    if (q.get('year')) list = list.filter((i) => i.year === Number(q.get('year')))
    if (q.get('month')) list = list.filter((i) => i.month === Number(q.get('month')))
    return ok(pageOf(list, q))
  }
  if (path === '/api/v1/mit-apuracoes/summary') {
    const year = Number(q.get('year'))
    const inYear = mitApuracoes.filter((i) => i.year === year)
    return ok({ totalCount: mitApuracoes.length, yearCount: inYear.length, yearTotal: r2(inYear.reduce((s, i) => s + i.valorTotalApurado, 0)), yearClosedCount: inYear.length, latest: mitApuracoes[0] ?? null })
  }
  m = path.match(/^\/api\/v1\/mit-apuracoes\/([^/]+)$/)
  if (m) {
    const item = mitApuracoes.find((i) => i.id === m[1])
    return item ? ok(mitDetail(item)) : notFound()
  }
  if (path === '/api/v1/mit-imports/latest') {
    return ok({ id: uid('mi', 1), status: 'completed', progress: 100, importedCount: mitApuracoes.length, failedCount: 0, requestedAt: '2026-10-27T09:30:00Z', startedAt: '2026-10-27T09:30:03Z', updatedAt: '2026-10-27T09:41:00Z', completedAt: '2026-10-27T09:41:00Z', errorCode: null })
  }

  if (path === '/api/v1/situacao-fiscal-relatorios') return ok(pageOf(situacaoReports, q))
  if (path === '/api/v1/situacao-fiscal-relatorios/latest') return ok(situacaoReports[0])
  if (/^\/api\/v1\/situacao-fiscal-relatorios\/[^/]+\/pendencias$/.test(path)) return ok(pendencias)
  if (path === '/api/v1/exports') return ok({ items: [], page: 1, pageSize: 20, totalCount: 0 })

  return notFound()
}

http
  .createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, x-signalr-user-agent')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      return res.end()
    }
    const url = new URL(req.url ?? '/', 'http://localhost')
    try {
      route(req.method ?? 'GET', url.pathname, url.searchParams, res)
    } catch (error) {
      console.error(error)
      res.writeHead(500)
      res.end()
    }
  })
  .listen(PORT, '127.0.0.1', () => {
    console.log(`API fictícia do Lex em http://127.0.0.1:${PORT} (${entries.length} lançamentos, ${transactions.length} movimentações)`)
  })
