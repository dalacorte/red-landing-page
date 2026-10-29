import { gsap } from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { sections, type SectionId } from '../content.ts'

const TOP = 104
const PAST_GAP = 19
const NEXT_GAP = 20
const BOTTOM = 30
const BIG = 30
const SMALL = 13

// Título da seção em pilha, no canto: as anteriores pequenas em cima, a atual grande e as próximas pequenas embaixo.
// Ao trocar de seção, as palavras deslizam de um lugar para o outro e as letras da nova seção entram em sequência.
export function SectionIndex({ activeId }: { activeId: SectionId }) {
  const [viewport, setViewport] = useState(() => (typeof window === 'undefined' ? 900 : window.innerHeight))
  const previous = useRef(activeId)
  const active = Math.max(0, sections.findIndex((section) => section.id === activeId))

  useEffect(() => {
    const onResize = () => setViewport(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    // A entrada da primeira seção é da introdução (motion.ts). Depois, cada troca anima só as letras da seção que ficou grande.
    // Compara com a seção anterior, e não com "primeira vez": no modo de desenvolvimento o React roda o efeito duas vezes.
    if (previous.current === activeId) return
    previous.current = activeId
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const letters = document.querySelectorAll(`[data-index-item="${activeId}"] [data-letter]`)
    gsap.fromTo(letters, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.03, overwrite: true })
  }, [activeId])

  const futureCount = sections.length - 1 - active

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 hidden xl:block">
      {sections.map((section, index) => {
        const state = index < active ? 'past' : index === active ? 'now' : 'next'
        const top =
          state === 'past'
            ? TOP + index * PAST_GAP
            : state === 'now'
              ? TOP + active * PAST_GAP + 6
              : viewport - BOTTOM - (futureCount - (index - active)) * NEXT_GAP - 14

        return (
          <div
            key={section.id}
            data-index-item={section.id}
            {...(state === 'now' ? { 'data-index-now': '' } : {})}
            className="absolute right-[76px] whitespace-nowrap text-right font-display font-bold uppercase leading-none tracking-[0.02em]"
            style={{
              top,
              fontSize: state === 'now' ? BIG : SMALL,
              color: state === 'now' ? 'var(--color-ink-strong)' : 'var(--color-muted)',
              opacity: state === 'now' ? 1 : 0.7,
              transition: 'top 700ms cubic-bezier(0.2,0.7,0.2,1), font-size 700ms cubic-bezier(0.2,0.7,0.2,1), color 400ms, opacity 400ms',
              textShadow: '0 0 12px var(--color-bg), 0 0 24px var(--color-bg)',
            }}
          >
            {section.label.split('').map((letter, position) => (
              <span key={position} data-letter className="inline-block whitespace-pre">
                {letter}
              </span>
            ))}
          </div>
        )
      })}
    </div>
  )
}
