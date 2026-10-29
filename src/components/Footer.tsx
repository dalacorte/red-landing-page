import { groups, modules, type GroupId } from '../content.ts'

const groupOrder: GroupId[] = ['contabilidade', 'notas', 'tributos']

// As colunas seguem os grupos do menu do produto.
export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="grid lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
        <div className="border-b border-line p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <a href="#inicio" className="flex items-center gap-3" aria-label="Lex, voltar ao início">
            <img src="/lex-icon.png" alt="" width={32} height={32} className="size-8 rounded-sm" />
            <span className="font-display text-lg font-semibold tracking-[0.04em] text-ink-strong">LEX</span>
          </a>
          <p className="mt-5 max-w-[20rem] text-[15px] leading-[1.65] text-muted">Contabilidade e fiscal, com a origem de cada número.</p>
        </div>

        {groupOrder.map((groupId) => (
          <nav key={groupId} aria-label={groups[groupId]} className="border-b border-line p-6 sm:p-8 lg:border-b-0 lg:border-r lg:last:border-r-0">
            <p className="label text-faint">{groups[groupId]}</p>
            <ul className="mt-5 space-y-3">
              {modules
                .filter((module) => module.group === groupId)
                .map((module) => (
                  <li key={module.slug}>
                    <a href={`#modulo-${module.slug}`} className="text-[15px] text-muted transition-colors duration-150 hover:text-ink-strong">
                      {module.name.join(' ').trim()}
                    </a>
                  </li>
                ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-4 sm:px-8">
        <p className="label text-faint">© 2026 Lex</p>
        <p className="label hidden text-faint sm:block">Feito para quem confere números</p>
      </div>
    </footer>
  )
}
