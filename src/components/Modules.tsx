import { ArrowUpRight, X } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { groups, modules, shotSrc, upcoming, type LexModule } from '../content.ts'
import { SectionHead } from './ui.tsx'

// "Extratos bancários": a primeira parte em tinta neutra e a segunda na cor do módulo, como "Photo" e "Craft" na referência.
function ModuleName({ module, className }: { module: LexModule; className?: string }) {
  return (
    <span className={className}>
      {module.name[0] && <span className="text-ink-strong">{module.name[0]} </span>}
      <span className="text-(--app)">{module.name[1]}</span>
    </span>
  )
}

function ModuleCard({ module, index, onOpen }: { module: LexModule; index: number; onOpen: (module: LexModule) => void }) {
  const Icon = module.icon
  const label = module.name.join(' ').trim()

  return (
    <article
      id={`modulo-${module.slug}`}
      data-reveal
      style={{ '--app': module.color } as CSSProperties}
      className="group relative flex h-full scroll-mt-20 flex-col bg-bg has-[button:focus-visible]:outline-2 has-[button:focus-visible]:-outline-offset-2 has-[button:focus-visible]:outline-accent"
    >
      {/* Linha de destaque que varre o topo do card no hover. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-(--app) transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none"
      />

      <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-3">
        <span className="label bg-(--app) px-2 py-1 font-bold text-on-light">{String(index + 1).padStart(2, '0')}</span>
        <p className="label truncate text-faint">{groups[module.group]}</p>
      </div>

      <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-sunken">
        <img
          src={shotSrc(module.shot)}
          alt={module.shotAlt}
          width={2400}
          height={1500}
          loading="lazy"
          decoding="async"
          className="size-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6 md:px-8 md:pb-8">
        <span className="relative -mt-9 grid size-[72px] shrink-0 place-items-center rounded-[22%] bg-(--app) text-on-light shadow-[0_6px_14px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-out before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(160deg,rgb(255_255_255/0.32),transparent_55%)] group-hover:-translate-y-1 motion-reduce:transition-none">
          <Icon className="relative size-9" strokeWidth={1.5} aria-hidden="true" />
        </span>

        <h3 className="mt-4 leading-none">
          <ModuleName module={module} className="display text-[1.9rem]" />
        </h3>
        <p className="mt-3 leading-relaxed text-muted">{module.summary}</p>

        <div className="mt-6 flex flex-wrap gap-1.5">
          <span className="label w-fit border border-line bg-sunken px-1.5 py-px text-[10px] font-medium tracking-[0.1em] text-(--app)">{module.tag}</span>
        </div>

        {/* O botão se estende por cima do card inteiro, então qualquer clique abre a visualização. */}
        <button
          type="button"
          onClick={() => onOpen(module)}
          className="label mt-6 inline-flex w-fit items-center gap-1.5 text-ink transition-colors duration-150 after:absolute after:inset-0 after:content-[''] group-hover:text-(--app)"
        >
          Explorar {label.toLowerCase()}
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

// Visualização ampliada: <dialog> nativo, que já prende o foco, fecha com Esc e devolve o foco a quem o abriu.
function ModuleDialog({ module, onClose }: { module: LexModule | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) {
      return
    }

    if (module && !dialog.open) {
      dialog.showModal()
    }

    if (!module && dialog.open) {
      dialog.close()
    }
  }, [module])

  return (
    <dialog
      ref={ref}
      className="lightbox"
      aria-labelledby="titulo-ampliado"
      onClose={onClose}
      onClick={(event) => {
        // Clique no fundo (o próprio <dialog>, fora do conteúdo) fecha.
        if (event.target === event.currentTarget) {
          event.currentTarget.close()
        }
      }}
    >
      {module && (
        <div style={{ '--app': module.color } as CSSProperties}>
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 sm:px-8">
            <div>
              <p className="label text-faint">{groups[module.group]}</p>
              <h3 id="titulo-ampliado" className="mt-1">
                <ModuleName module={module} className="display text-2xl" />
              </h3>
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Fechar"
              className="grid size-10 shrink-0 place-items-center border border-line text-muted transition-colors hover:border-line-strong hover:text-ink-strong"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          {/* No celular a tela fica maior que a janela e rola na horizontal, para dar para ler. */}
          <div className="overflow-x-auto bg-sunken">
            <img
              src={shotSrc(module.shot)}
              alt={module.shotAlt}
              width={2400}
              height={1500}
              decoding="async"
              className="block aspect-[16/10] w-full min-w-[900px] object-cover object-top lg:min-w-0"
            />
          </div>

          <p className="label border-t border-line px-5 py-3 text-faint sm:px-8">{module.summary} · Tela real do Lex, dados fictícios</p>
        </div>
      )}
    </dialog>
  )
}

export function Modules() {
  const [selected, setSelected] = useState<LexModule | null>(null)

  return (
    <section id="modulos" data-choreo className="sec relative" aria-labelledby="titulo-modulos">
      <SectionHead index="02" title="Os módulos" aside="Telas reais · Dados fictícios" />

      <div data-reveal className="px-5 pb-12 pt-14 sm:px-8 lg:pb-14 lg:pt-20">
        <h2 id="titulo-modulos" className="display text-[clamp(2.25rem,5vw,3.75rem)]">
          Do extrato ao <span className="text-accent">balancete</span>.
        </h2>
        <p className="mt-5 max-w-[32rem] text-[17px] leading-[1.7] text-muted">Escolha um módulo para ver a tela.</p>
      </div>

      <div data-reveal-group className="grid grid-cols-1 gap-px border-t border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module, index) => (
          <ModuleCard key={module.slug} module={module} index={index} onOpen={setSelected} />
        ))}
      </div>

      {/* "Next up" da referência: o que vem depois, sem ocupar a grade. */}
      <div data-reveal className="flex flex-col gap-2 border-t border-line px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="label text-faint">A caminho</p>
        <p className="text-[15px] text-muted">{upcoming.join(' · ')}</p>
      </div>

      <ModuleDialog module={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
