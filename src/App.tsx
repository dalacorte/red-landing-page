import { useEffect } from 'react'
import { Cta } from './components/Cta.tsx'
import { Footer } from './components/Footer.tsx'
import { Hero } from './components/Hero.tsx'
import { Modules } from './components/Modules.tsx'
import { Nav } from './components/Nav.tsx'
import { Principles } from './components/Principles.tsx'
import { Ruler } from './components/Ruler.tsx'
import { SectionIndex } from './components/SectionIndex.tsx'
import { sections, type SectionId } from './content.ts'
import { useActiveSection } from './hooks.ts'
import { startMotion } from './motion.ts'

const sectionIds = sections.map((section) => section.id)

export default function App() {
  const activeId = useActiveSection(sectionIds) as SectionId

  // Rolagem suave, introdução e entrada por seção. Roda depois que todos os filhos montaram, para achar os elementos.
  useEffect(() => startMotion(), [])

  return (
    <>
      <a
        href="#conteudo"
        className="label fixed left-3 top-3 z-[70] -translate-y-20 bg-ink-strong px-4 py-3 font-bold text-on-light focus:translate-y-0"
      >
        Ir para o conteúdo
      </a>
      <Nav activeId={activeId} />
      <Ruler />
      <SectionIndex activeId={activeId} />
      <main id="conteudo" className="frame">
        <Hero />
        <Modules />
        <Principles />
        <Cta />
        <Footer />
      </main>
    </>
  )
}
