import { useEffect, useState } from 'react'

// Seção em foco: a última cuja borda de cima já passou de 35% da altura da janela. Atualiza no máximo uma vez por quadro.
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.35
      let current = ids[0] ?? ''

      for (const id of ids) {
        const element = document.getElementById(id)
        if (element && element.getBoundingClientRect().top <= line) {
          current = id
        }
      }

      setActive(current)
    }

    const onScroll = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame !== 0) {
        cancelAnimationFrame(frame)
      }
    }
  }, [ids])

  return active
}
