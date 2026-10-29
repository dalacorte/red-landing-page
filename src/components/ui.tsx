export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

// Cruz de mira nos cantos de cada seção. Entra com um pequeno escalonamento, como os "ticks" da referência.
function Cross({ side }: { side: 'left' | 'right' }) {
  return <span data-draw-tick aria-hidden="true" className={cn('cross absolute -top-1.5 z-[1] hidden lg:block', side === 'left' ? '-left-1.5' : '-right-1.5')} />
}

// Topo de cada seção: a linha que desenha da esquerda, as cruzes e o rótulo "0N / TÍTULO", todos animados pelo `data-choreo` da seção.
export function SectionHead({ index, title, aside }: { index: string; title: string; aside?: string }) {
  return (
    <>
      <span data-draw-rule aria-hidden="true" className="absolute inset-x-0 top-0 h-px origin-left bg-line" />
      <Cross side="left" />
      <Cross side="right" />
      <div className="border-b border-line px-5 py-3.5 sm:px-8">
        <div data-draw-eyebrow className="flex items-center justify-between gap-6">
          <p className="label">
            {index} / {title}
          </p>
          {aside && <p className="label hidden text-faint sm:block">{aside}</p>}
        </div>
      </div>
    </>
  )
}
