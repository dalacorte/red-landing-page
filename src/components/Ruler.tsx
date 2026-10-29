import { useEffect, useRef, type PointerEvent } from 'react'
import { lenisRef } from '../motion.ts'

const NAV_HEIGHT = 48
const EDGE_PAD = 12
const PERCENTS = Array.from({ length: 101 }, (_, percent) => percent)
const clamp01 = (value: number) => Math.max(0, Math.min(1, value))
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

// Régua no lugar da barra de rolagem, como na referência: as marcas andam com a página, a agulha mostra o ponto da leitura e o
// número ao lado gira como um odômetro. Clicar salta com rolagem suave, e arrastar percorre a página.
// Tudo é escrito direto no DOM, sem estado: a rolagem não renderiza o React a cada quadro.
export function Ruler() {
  const railRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const needleRef = useRef<HTMLDivElement>(null)
  const readoutRef = useRef<HTMLDivElement>(null)
  const ghostRef = useRef<HTMLDivElement>(null)
  const ghostValueRef = useRef<HTMLSpanElement>(null)
  const digitRefs = useRef<(HTMLSpanElement | null)[]>([])
  const tickRefs = useRef<(HTMLSpanElement | null)[]>([])
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([])
  const geometry = useRef({ range: 1, base: NAV_HEIGHT + EDGE_PAD, span: 1, dragging: false, moved: 0 })

  useEffect(() => {
    const track = trackRef.current
    const needle = needleRef.current
    const readout = readoutRef.current
    if (!track || !needle || !readout) {
      return
    }

    let frame = 0
    let previousPercent = -1

    // A marca do porcento p fica na agulha quando a leitura está em p. Por isso ela mora em base + p*(span + range).
    const measure = () => {
      const g = geometry.current
      const viewport = window.innerHeight
      g.range = Math.max(1, document.documentElement.scrollHeight - viewport)
      g.base = NAV_HEIGHT + EDGE_PAD
      g.span = Math.max(1, viewport - g.base - EDGE_PAD)
      track.style.height = `${g.base + g.span + g.range}px`

      PERCENTS.forEach((percent) => {
        const top = `${g.base + (percent / 100) * (g.span + g.range)}px`
        const tick = tickRefs.current[percent]
        const label = labelRefs.current[percent]
        if (tick) tick.style.top = top
        if (label) label.style.top = top
      })
    }

    const update = () => {
      frame = 0
      const g = geometry.current
      const y = window.scrollY
      const progress = clamp01(y / g.range)
      const needleY = g.base + progress * g.span

      track.style.transform = `translate3d(0, ${-y}px, 0)`
      needle.style.transform = `translate3d(0, ${needleY}px, 0)`
      // A leitura vai para cima da agulha quando ela chega ao pé da janela.
      readout.style.top = needleY > window.innerHeight - 26 ? '-14px' : '4px'

      const percent = Math.round(progress * 100)
      if (percent !== previousPercent) {
        previousPercent = percent
        const text = String(percent).padStart(3, '0')
        for (let index = 0; index < 3; index += 1) {
          const digit = digitRefs.current[index]
          if (digit) digit.style.transform = `translateY(${-(text.charCodeAt(index) - 48)}em)`
        }
      }
    }

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update)
    }
    const remeasure = () => {
      measure()
      schedule()
    }

    remeasure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', remeasure)
    const observer = new ResizeObserver(remeasure)
    observer.observe(document.body)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', remeasure)
      observer.disconnect()
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [])

  const targetFor = (clientY: number) => {
    const g = geometry.current
    return clamp01((clientY - g.base) / g.span) * g.range
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const g = geometry.current
    const y = Math.max(g.base, Math.min(g.base + g.span, event.clientY))
    const ghost = ghostRef.current
    if (ghost) {
      ghost.style.transform = `translate3d(0, ${y}px, 0)`
      ghost.style.opacity = '1'
    }
    if (ghostValueRef.current) ghostValueRef.current.textContent = `${Math.round(clamp01((y - g.base) / g.span) * 100)}%`

    if (g.dragging) {
      g.moved = Math.max(g.moved, 1)
      lenisRef.current?.scrollTo(targetFor(event.clientY), { lerp: 0.2 })
    }
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    geometry.current.dragging = true
    geometry.current.moved = 0
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const g = geometry.current
    const wasDrag = g.moved > 0
    g.dragging = false
    if (wasDrag) return

    // Clique simples: salta para o ponto com a mesma curva da referência (mais longo para saltos maiores).
    const target = targetFor(event.clientY)
    const distance = Math.abs(target - window.scrollY)
    const duration = 1.2 * (0.4 + 0.6 * Math.min(1, distance / (2.5 * window.innerHeight)))
    const lenis = lenisRef.current
    if (lenis) lenis.scrollTo(target, { duration, easing: easeOutExpo })
    else window.scrollTo({ top: target })
  }

  const onPointerLeave = () => {
    if (ghostRef.current) ghostRef.current.style.opacity = '0'
  }

  return (
    <div
      ref={railRef}
      aria-hidden="true"
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        geometry.current.dragging = false
      }}
      onPointerLeave={onPointerLeave}
      className="fixed inset-y-0 right-0 z-40 hidden w-[60px] cursor-crosshair touch-none overflow-hidden border-l border-line lg:block"
    >
      {/* Vidro fosco: o conteúdo passa por trás da régua, esmaecendo para dentro. */}
      <div
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-bg)_55%,transparent)] backdrop-blur-[9px]"
        style={{ maskImage: 'linear-gradient(to left, black 0 55%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 0 55%, transparent 100%)' }}
      />

      <div ref={trackRef} className="absolute inset-x-0 top-0 will-change-transform">
        {PERCENTS.map((percent) => {
          const major = percent % 5 === 0
          return (
            <span key={percent}>
              <span
                data-ruler-tick
                ref={(element) => {
                  tickRefs.current[percent] = element
                }}
                className={major ? 'absolute right-0 block h-px w-[18px] bg-ink opacity-90' : 'absolute right-0 block h-px w-2 bg-ink opacity-40'}
              />
              {major && (
                <span
                  data-ruler-tick
                  ref={(element) => {
                    labelRefs.current[percent] = element
                  }}
                  className="absolute right-[22px] -translate-y-1/2 font-mono text-[9px] leading-none tracking-[0.08em] text-ink opacity-60"
                >
                  {percent}
                </span>
              )}
            </span>
          )
        })}
      </div>

      {/* Agulha da leitura atual, com o número em odômetro. */}
      <div ref={needleRef} className="pointer-events-none absolute inset-x-0 top-0 h-0 will-change-transform">
        <span className="absolute inset-x-0 top-0 block h-px bg-accent" />
        <div ref={readoutRef} className="absolute right-0 flex items-center bg-accent px-1.5 font-mono text-[9px] font-medium leading-none tracking-[0.04em] text-on-light" style={{ top: 4, height: 11 }}>
          {[0, 1, 2].map((slot) => (
            <span key={slot} className="relative block h-[1em] w-[0.62em] overflow-hidden">
              <span
                ref={(element) => {
                  digitRefs.current[slot] = element
                }}
                className="block transition-transform duration-[400ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
              >
                {Array.from({ length: 10 }, (_, digit) => (
                  <span key={digit} className="block h-[1em] leading-[1em]">
                    {digit}
                  </span>
                ))}
              </span>
            </span>
          ))}
          <span>%</span>
        </div>
      </div>

      {/* Fantasma sob o ponteiro: mostra para onde o clique levaria. */}
      <div ref={ghostRef} className="pointer-events-none absolute inset-x-0 top-0 h-0 opacity-0 transition-opacity duration-150">
        <span className="absolute inset-x-0 top-0 block h-px bg-ink opacity-60" />
        <span ref={ghostValueRef} className="absolute left-1.5 top-1 font-mono text-[9px] leading-none tracking-[0.06em] text-ink opacity-80">
          0%
        </span>
      </div>
    </div>
  )
}
