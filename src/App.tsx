import { useState } from 'react'
import Intro from './components/Intro'
import { readIntroGate } from './components/introGate'
import CursorTrail from './components/CursorTrail'
import TopBar from './components/TopBar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Stack from './components/Stack'
import LinksHub from './components/LinksHub'
import Contact from './components/Contact'
import Footer from './components/Footer'

// 'none': sem intro (retorno na sessão ou reduced-motion) — página estática.
// 'active': intro cobrindo a página; hero aguarda invisível.
// 'done': cortina subiu; hero entra em stagger ao encontro dela.
type IntroState = 'none' | 'active' | 'done'

export default function App() {
  const [intro, setIntro] = useState<IntroState>(() => (readIntroGate() ? 'active' : 'none'))

  const appClass =
    intro === 'active' ? 'app--intro-active' : intro === 'done' ? 'app--intro-done' : ''

  return (
    <div className={appClass}>
      {intro === 'active' && <Intro onDone={() => setIntro('done')} />}
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <CursorTrail />
      <TopBar />
      <main id="conteudo" tabIndex={-1} inert={intro === 'active' ? true : undefined}>
        <Hero />
        <About />
        <Projects />
        <Stack />
        <LinksHub />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
