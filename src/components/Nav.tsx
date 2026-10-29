import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CONTACT_HREF, sections, type SectionId } from '../content.ts'
import { cn } from './ui.tsx'

export function Nav({ activeId }: { activeId: SectionId }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header id="site-nav" className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-sm lg:mr-0">
      <div className="flex h-12 items-stretch">
        <a
          href="#inicio"
          aria-label="Lex, voltar ao início"
          className="flex w-14 shrink-0 items-center justify-center border-r border-line sm:w-16"
        >
          <img src="/lex-icon.png" alt="" width={28} height={28} className="size-7 rounded-sm" />
        </a>

        <nav aria-label="Principal" className="hidden min-w-0 items-stretch lg:flex">
          {sections.slice(0, 3).map((section) => {
            const current = section.id === activeId
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={current ? 'location' : undefined}
                className="label flex items-center px-3 transition-colors duration-150 hover:text-ink-strong aria-[current=location]:text-ink-strong"
              >
                <span className={cn('px-2 py-1 transition-colors duration-150', current && 'bg-ink-strong text-on-light')}>{section.short}</span>
              </a>
            )
          })}
        </nav>

        <div className="ml-auto flex items-stretch">
          <a
            href={CONTACT_HREF}
            className="label hidden items-center bg-ink-strong px-5 font-bold text-on-light transition-colors duration-150 hover:bg-accent-ink sm:flex"
          >
            Solicitar demonstração
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="menu-movel"
            onClick={() => setOpen((value) => !value)}
            className="label flex items-center gap-2 border-l border-line px-4 hover:text-ink-strong lg:hidden"
          >
            {open ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
            {open ? 'Fechar' : 'Menu'}
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-movel" aria-label="Principal" className="border-t border-line bg-bg lg:hidden">
          {sections.slice(0, 3).map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={() => setOpen(false)}
              aria-current={section.id === activeId ? 'location' : undefined}
              className="label flex h-12 items-center border-b border-line px-5 hover:text-ink-strong aria-[current=location]:text-ink-strong"
            >
              {section.short}
            </a>
          ))}
          <a
            href={CONTACT_HREF}
            className="label flex h-12 items-center bg-ink-strong px-5 font-bold text-on-light sm:hidden"
          >
            Solicitar demonstração
          </a>
        </nav>
      )}
    </header>
  )
}
