import { ArrowUpRight } from 'lucide-react'
import { CONTACT_HREF } from '../content.ts'
import { SectionHead } from './ui.tsx'

export function Cta() {
  return (
    <section id="comecar" data-choreo className="sec relative overflow-hidden" aria-labelledby="titulo-comecar">
      {/* O mesmo filtro do painel do Lex: o traço preto da gravura vira luz clara sobre o fundo escuro. */}
      <svg aria-hidden="true" focusable="false" className="absolute size-0">
        <filter id="gravura-traco-claro" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0.96  0 0 0 0 0.97  0 0 0 0 0.96  -0.2764 -0.9298 -0.0939 0 1.3"
            result="traco"
          />
          <feComposite in="traco" in2="SourceAlpha" operator="in" />
        </filter>
      </svg>

      <SectionHead index="04" title="Começar" aside="Demonstração" />

      <div data-reveal-group className="grid items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:py-24">
        <div>
          <p data-reveal className="label text-faint">
            Demonstração
          </p>
          <h2 id="titulo-comecar" data-reveal className="display mt-5 text-[clamp(2.5rem,6vw,4.5rem)]">
            Veja o Lex com <span className="text-accent">os seus números</span>.
          </h2>
          <div data-reveal className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href={CONTACT_HREF} className="btn btn-solid">
              Solicitar demonstração
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* O GSAP anima (e depois limpa) o filter do contêiner. O filtro da gravura fica na imagem de dentro, para não ser apagado. */}
        <div data-reveal className="hidden justify-self-center lg:block">
          <img
            src="/alegoria-justica.webp"
            alt=""
            aria-hidden="true"
            width={1086}
            height={1448}
            loading="lazy"
            decoding="async"
            className="h-[24rem] w-auto"
            style={{ filter: 'url(#gravura-traco-claro)' }}
          />
        </div>
      </div>
    </section>
  )
}
