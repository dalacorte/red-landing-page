import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)

// A régua usa a mesma instância para saltar e arrastar com rolagem suave.
export const lenisRef: { current: Lenis | null } = { current: null }

// O GSAP só limpa o que ele animou: um clearProps "all" apagaria também as variáveis de cor (--app) que o React põe no estilo inline.
const CLEAR = 'opacity,visibility,transform,filter'

// Entrada padrão de um bloco: sai do desfoque e sobe 28 px em 0,9 s. É a mesma da referência.
const hidden = { autoAlpha: 0, y: 28, filter: 'blur(8px)' }
const shown = { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', overwrite: true, clearProps: CLEAR }

// Tempos da introdução, em segundos: o menu e a régua montam primeiro, e o texto do hero entra logo depois.
const INSTRUMENT_AT = 0.7
const COPY_AT = 1.05
const SKIP_SPEED = 4

const q = <T extends Element>(selector: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(selector))

// Liga tudo o que se move na página. Sem movimento reduzido: rolagem suave (Lenis), introdução e entrada por seção (GSAP).
// Com movimento reduzido, nada é escondido nem animado. Devolve a função que desfaz tudo.
export function startMotion(): () => void {
  const root = document.documentElement
  const media = gsap.matchMedia()

  media.add('(prefers-reduced-motion: reduce)', () => {
    root.classList.add('motion-ready')
  })

  media.add('(prefers-reduced-motion: no-preference)', () => {
    const lenis = new Lenis({ lerp: 0.12, anchors: { offset: -48 } })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Estados iniciais. O CSS esconde os blocos até aqui (html:not(.motion-ready)); a partir daqui é o GSAP quem manda.
    const navItems = q('#site-nav > div > *')
    const heroCopy = q('#inicio [data-reveal-group] [data-reveal]')
    const ticks = q('[data-ruler-tick]')
    const indexLetters = q('[data-index-now] [data-letter]')

    gsap.set(navItems, { autoAlpha: 0, y: -6 })
    gsap.set(heroCopy, hidden)
    gsap.set(ticks, { scaleX: 0, transformOrigin: '100% 50%' })
    gsap.set(indexLetters, { autoAlpha: 0, y: 10 })

    q('[data-choreo]').forEach((section) => {
      const rule = section.querySelector('[data-draw-rule]')
      const eyebrow = section.querySelector('[data-draw-eyebrow]')
      const crosses = q('[data-draw-tick]', section)

      if (rule) gsap.set(rule, { scaleX: 0, transformOrigin: '0% 50%' })
      if (eyebrow) gsap.set(eyebrow, hidden)
      if (crosses.length) gsap.set(crosses, { scale: 0, autoAlpha: 0 })

      ScrollTrigger.create({
        trigger: section,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          const timeline = gsap.timeline()
          if (rule) timeline.to(rule, { scaleX: 1, duration: 0.7, ease: 'power2.out', clearProps: CLEAR }, 0)
          if (eyebrow) timeline.to(eyebrow, { ...shown }, 0.15)
          if (crosses.length) {
            timeline.to(crosses, { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'power3.out', stagger: 0.06, clearProps: CLEAR }, 0.35)
          }
        },
      })
    })

    // Blocos soltos entram quando chegam a 85% da janela.
    q('[data-reveal]').forEach((element) => {
      if (element.closest('[data-reveal-group]')) return
      gsap.set(element, hidden)
      ScrollTrigger.create({ trigger: element, start: 'top 85%', once: true, onEnter: () => gsap.to(element, shown) })
    })

    // Grupos (como a grade de cards): cada item entra com um atraso proporcional à posição horizontal, da esquerda para a direita.
    q('[data-reveal-group]').forEach((group) => {
      if (group.closest('#inicio')) return
      const items = q('[data-reveal]', group)
      if (!items.length) return
      gsap.set(items, hidden)
      const box = group.getBoundingClientRect()
      items.forEach((item) => {
        const delay = box.width > 0 ? ((item.getBoundingClientRect().left - box.left) / box.width) * 0.18 : 0
        ScrollTrigger.create({ trigger: item, start: 'top 88%', once: true, onEnter: () => gsap.to(item, { ...shown, delay }) })
      })
    })

    // Introdução: o menu e a régua montam, depois o texto do hero entra em sequência.
    const intro = gsap.timeline()
    intro.to(navItems, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', clearProps: CLEAR }, INSTRUMENT_AT)
    intro.to(ticks, { scaleX: 1, duration: 0.4, ease: 'power3.out', stagger: { each: 0.012 }, clearProps: 'transform' }, INSTRUMENT_AT)
    intro.to(indexLetters, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.035 }, 0.9)
    intro.to(heroCopy, { ...shown, stagger: 0.08 }, COPY_AT)

    // Rolar, clicar ou teclar durante a introdução acelera, sem corte seco.
    const events = ['wheel', 'pointerdown', 'keydown', 'touchstart'] as const
    const skip = () => {
      intro.timeScale(SKIP_SPEED)
      events.forEach((name) => window.removeEventListener(name, skip))
    }
    events.forEach((name) => window.addEventListener(name, skip, { passive: true }))

    const refresh = () => ScrollTrigger.refresh()
    void document.fonts?.ready.then(refresh)
    root.classList.add('motion-ready')

    return () => {
      events.forEach((name) => window.removeEventListener(name, skip))
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
      root.classList.remove('motion-ready')
    }
  })

  return () => media.revert()
}
