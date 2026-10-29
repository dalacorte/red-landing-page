import {
  Accessibility,
  ArrowLeftRight,
  CalendarCheck,
  ChartColumn,
  FileSpreadsheet,
  FileText,
  Files,
  History,
  Landmark,
  LayoutDashboard,
  Link2,
  ListTree,
  Radio,
  Server,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

// Troque este endereço pelo e-mail comercial antes de publicar. Os botões "Solicitar demonstração" abrem o cliente de e-mail com ele.
export const CONTACT_EMAIL = 'contato@lex.example'
export const CONTACT_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Quero conhecer o Lex')}`

// Seções da página, na ordem. Alimentam o menu, a régua lateral e o título que acompanha a rolagem.
export const sections = [
  { id: 'inicio', label: 'Lex', short: 'Início' },
  { id: 'modulos', label: 'Os módulos', short: 'Módulos' },
  { id: 'principios', label: 'Princípios', short: 'Princípios' },
  { id: 'comecar', label: 'Começar', short: 'Começar' },
] as const

export type SectionId = (typeof sections)[number]['id']

// Os grupos do menu lateral do produto.
export type GroupId = 'geral' | 'contabilidade' | 'notas' | 'tributos'

export const groups: Record<GroupId, string> = {
  geral: 'Geral',
  contabilidade: 'Contabilidade',
  notas: 'Notas e documentos',
  tributos: 'Tributos',
}

export type LexModule = {
  slug: string
  // O nome em duas partes: a primeira em tinta neutra e a segunda na cor do módulo, como "Photo" e "Craft" na referência.
  name: [string, string]
  group: GroupId
  icon: LucideIcon
  // Cor do módulo: chip de índice, linha de destaque do card e ícone. Cada módulo tem a sua, como cada app na referência.
  color: string
  summary: string
  tag: string
  // Nome do arquivo em public/shots, sem extensão.
  shot: string
  shotAlt: string
}

export const modules: LexModule[] = [
  {
    slug: 'painel',
    name: ['', 'Painel'],
    group: 'geral',
    icon: LayoutDashboard,
    color: '#9d8ee6',
    summary: 'Os números da empresa, módulo a módulo, num só lugar.',
    tag: 'Visão geral',
    shot: 'painel-indicadores',
    shotAlt: 'Painel do Lex com os indicadores de contabilidade, notas e documentos e tributos.',
  },
  {
    slug: 'lancamentos',
    name: ['', 'Lançamentos'],
    group: 'contabilidade',
    icon: ArrowLeftRight,
    color: '#74c7a0',
    summary: 'Partidas dobradas, com responsável e histórico de cada alteração.',
    tag: 'Trilha',
    shot: 'lancamentos',
    shotAlt: 'Tela de lançamentos do Lex, com débito, crédito, valor, origem e situação de cada lançamento.',
  },
  {
    slug: 'extratos',
    name: ['Extratos', 'bancários'],
    group: 'contabilidade',
    icon: Landmark,
    color: '#5aa9ee',
    summary: 'Importe o OFX do banco e classifique cada movimentação.',
    tag: 'OFX',
    shot: 'extratos',
    shotAlt: 'Tela de extratos bancários do Lex, com a conta do plano escolhida para cada movimentação.',
  },
  {
    slug: 'plano-de-contas',
    name: ['Plano de', 'contas'],
    group: 'contabilidade',
    icon: ListTree,
    color: '#e2c27e',
    summary: 'Use o plano padrão ou importe o do cliente.',
    tag: 'XLSX · CSV',
    shot: 'plano-de-contas',
    shotAlt: 'Tela do plano de contas do Lex, com a árvore de contas e a importação de planilha.',
  },
  {
    slug: 'balancete-e-dre',
    name: ['Balancete e', 'DRE'],
    group: 'contabilidade',
    icon: ChartColumn,
    color: '#f07178',
    summary: 'Balancete e DRE do período, direto dos lançamentos.',
    tag: 'XLSX',
    shot: 'dre',
    shotAlt: 'DRE do Lex expandida, com receita bruta, deduções, custos e despesas por conta.',
  },
  {
    slug: 'notas-de-servico',
    name: ['Notas de', 'serviço'],
    group: 'notas',
    icon: FileText,
    color: '#3fd6b8',
    summary: 'NFS-e emitidas e tomadas, lidas do emissor nacional.',
    tag: 'Emissor nacional',
    shot: 'notas-de-servico',
    shotAlt: 'Tela de notas de serviço do Lex, com os totais do mês e do ano e a lista de notas emitidas e tomadas.',
  },
  {
    slug: 'documentos-fiscais',
    name: ['Documentos', 'fiscais'],
    group: 'notas',
    icon: Files,
    color: '#ff9657',
    summary: 'NF-e e NFC-e emitidas e recebidas da SEFAZ.',
    tag: 'SEFAZ',
    shot: 'documentos-fiscais',
    shotAlt: 'Tela de documentos fiscais do Lex, com totais e filtros por origem, tipo de documento e data de emissão.',
  },
  {
    slug: 'apuracoes-mensais',
    name: ['Apurações', 'mensais'],
    group: 'tributos',
    icon: CalendarCheck,
    color: '#e58cc7',
    summary: 'Apurações do MIT dos últimos três anos, lidas no SERPRO.',
    tag: 'SERPRO',
    shot: 'apuracoes',
    shotAlt: 'Tela de apurações mensais do Lex, com o valor apurado no ano e a lista de apurações por período.',
  },
  {
    slug: 'situacao-fiscal',
    name: ['Situação', 'fiscal'],
    group: 'tributos',
    icon: ShieldCheck,
    color: '#a6e04a',
    summary: 'Relatório e pendências fiscais, direto do SERPRO.',
    tag: 'SERPRO',
    shot: 'situacao-fiscal',
    shotAlt: 'Tela de situação fiscal do Lex, com o resumo das pendências e a lista de débitos e declarações.',
  },
]

export const liveCount = modules.length

// Menu do produto que ainda não tem tela. Aparece num aviso curto, como o "Next up" da referência.
export const upcoming = ['Conciliação', 'Divergências', 'Trilha de auditoria']

const numberWords = ['Zero', 'Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete', 'Oito', 'Nove', 'Dez', 'Onze', 'Doze']

// Número por extenso, para os títulos acompanharem a lista de módulos sem ficar desatualizados.
export const numberWord = (value: number) => numberWords[value] ?? String(value)

export const shotSrc = (name: string) => `/shots/${name}.webp`

export const principles: { title: string; text: string; icon: LucideIcon }[] = [
  { title: 'Fontes oficiais', text: 'Notas e tributos vêm do emissor nacional, da SEFAZ e do SERPRO.', icon: Link2 },
  { title: 'Rastreável', text: 'Cada lançamento mostra quem fez, quando e o histórico completo.', icon: History },
  { title: 'Na sua infraestrutura', text: 'Roda em Docker, no servidor que você escolher.', icon: Server },
  { title: 'Em tempo real', text: 'Importações e exportações mostram o andamento ao vivo.', icon: Radio },
  { title: 'Acessível', text: 'Contraste AA, foco visível e uso completo pelo teclado.', icon: Accessibility },
  { title: 'Leva para o Excel', text: 'Exporta notas, apurações, balancete e DRE em .xlsx.', icon: FileSpreadsheet },
]
