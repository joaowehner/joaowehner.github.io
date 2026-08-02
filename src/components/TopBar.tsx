import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/profile'
import { useActiveSection } from '../hooks/useActiveSection'
import './TopBar.css'

const NAV_ITEMS = [
  { id: 'sobre', label: 'sobre' },
  { id: 'projetos', label: 'projetos' },
  { id: 'stack', label: 'stack' },
  { id: 'links', label: 'links' },
  { id: 'contato', label: 'contato' },
]

const SECTION_IDS = NAV_ITEMS.map((item) => item.id)

/** Precisa bater com o breakpoint do menu em TopBar.css */
const MOBILE_BREAKPOINT = 760

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const active = useActiveSection(SECTION_IDS)

  // Fecha o menu se a viewport crescer além do breakpoint (ex.: rotação),
  // senão o scroll ficaria travado com o menu invisível.
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT + 1}px)`)
    const onChange = () => {
      if (mq.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const menuButton = menuButtonRef.current
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    // Isola o conteúdo coberto pelo overlay da ordem de tabulação
    const covered = document.querySelectorAll('main, footer')
    covered.forEach((el) => el.setAttribute('inert', ''))
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      covered.forEach((el) => el.removeAttribute('inert'))
      menuButton?.focus()
    }
  }, [menuOpen])

  const navLinks = (onClick?: () => void) =>
    NAV_ITEMS.map(({ id, label }) => (
      <a
        key={id}
        href={`#${id}`}
        className={`topbar__link ${active === id ? 'topbar__link--active' : ''}`}
        aria-current={active === id ? 'true' : undefined}
        onClick={onClick}
      >
        {label}
      </a>
    ))

  return (
    <header className="topbar">
      <div className="topbar__inner container">
        <a
          href="#inicio"
          className="topbar__brand"
          aria-label={`${profile.brand} — voltar ao início`}
        >
          <span className="topbar__prompt" aria-hidden="true">
            ❯
          </span>
          {profile.brand}
          <span className="topbar__cursor" aria-hidden="true" />
        </a>

        <nav className="topbar__nav" aria-label="Seções do site">
          {navLinks()}
        </nav>

        <button
          type="button"
          ref={menuButtonRef}
          className="topbar__menu-button"
          aria-expanded={menuOpen}
          aria-controls="menu-mobile"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? 'fechar' : 'menu'}
        </button>
      </div>

      {menuOpen && (
        <nav id="menu-mobile" className="topbar__mobile" aria-label="Seções do site">
          {navLinks(() => setMenuOpen(false))}
        </nav>
      )}
    </header>
  )
}
