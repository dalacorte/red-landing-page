import { principles } from '../content.ts'
import { SectionHead } from './ui.tsx'

export function Principles() {
  return (
    <section id="principios" data-choreo className="sec relative" aria-labelledby="titulo-principios">
      <SectionHead index="03" title="Princípios" aside="Regras de todos os módulos" />

      <div data-reveal className="px-5 pb-12 pt-14 sm:px-8 lg:pb-14 lg:pt-20">
        <h2 id="titulo-principios" className="display text-[clamp(2.25rem,5vw,3.75rem)]">
          Construído para <span className="text-accent">conferir</span>.
        </h2>
        <p className="mt-5 max-w-[32rem] text-[17px] leading-[1.7] text-muted">Todo número tem origem, responsável e histórico.</p>
      </div>

      <ul data-reveal-group className="grid grid-cols-1 gap-px border-t border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {principles.map((principle, index) => {
          const Icon = principle.icon
          return (
            <li key={principle.title} data-reveal className="flex flex-col bg-bg p-6 sm:p-8">
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center border border-line text-accent">
                  <Icon className="size-[18px]" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="label text-faint">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="mt-10 font-display text-2xl font-semibold tracking-[-0.02em] text-ink-strong">{principle.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{principle.text}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
