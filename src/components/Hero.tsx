import { ArrowDown } from 'lucide-react'
import type { CSSProperties } from 'react'
import { CONTACT_HREF, liveCount, modules, numberWord } from '../content.ts'
import { SectionHead } from './ui.tsx'

export function Hero() {
  return (
    // O hero ocupa a primeira tela inteira (como na referência): a próxima seção só aparece ao rolar.
    <section id="inicio" data-choreo className="sec relative flex min-h-[calc(100svh-48px)] flex-col" aria-labelledby="titulo-inicio">
      <SectionHead index="01" title="Lex" aside={`${numberWord(liveCount)} módulos · Dados oficiais · Rastreável`} />

      <div
        data-reveal-group
        className="grid flex-1 content-center items-center gap-14 px-5 py-14 sm:px-8 lg:py-20 xl:grid-cols-[minmax(0,1fr)_480px] xl:gap-10"
      >
        <div>
          <h1 id="titulo-inicio" data-reveal className="display text-[clamp(2.5rem,4.6vw,4.5rem)]">
            {numberWord(liveCount)} módulos.
            <br />
            Uma só <span className="text-accent">contabilidade</span>.
          </h1>

          <p data-reveal className="mt-7 max-w-[32rem] text-[17px] leading-[1.7] text-muted">
            Extratos, notas fiscais, tributos e balancete no mesmo lugar, com a origem de cada número.
          </p>

          <div data-reveal className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={CONTACT_HREF} className="btn btn-solid">
              Solicitar demonstração
            </a>
            <a href="#modulos" className="btn btn-line">
              <ArrowDown className="size-4" aria-hidden="true" />
              Ver os módulos
            </a>
          </div>
        </div>

        {/* A grade de ícones da referência: blocos de cor sólida com o nome embaixo. Cada bloco leva ao seu card. */}
        <nav
          data-reveal
          aria-label="Módulos do Lex"
          className="mx-auto grid w-fit grid-cols-3 gap-x-5 gap-y-6 xl:mx-0 xl:w-[480px] xl:grid-cols-5"
        >
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <a
                key={module.slug}
                href={`#modulo-${module.slug}`}
                style={{ '--app': module.color } as CSSProperties}
                className="group flex w-20 flex-col items-center gap-2.5 text-center"
              >
                <span className="relative grid size-20 place-items-center rounded-[22%] bg-(--app) text-on-light shadow-[0_6px_14px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-out before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(160deg,rgb(255_255_255/0.32),transparent_55%)] group-hover:-translate-y-1 motion-reduce:transition-none">
                  <Icon className="relative size-10" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <span className="text-[12px] leading-tight text-muted transition-colors duration-150 group-hover:text-ink-strong">
                  {module.name[0]} {module.name[1]}
                </span>
              </a>
            )
          })}
        </nav>
      </div>
    </section>
  )
}
