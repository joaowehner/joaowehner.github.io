import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/profile'
import { markIntroSeen } from './introGate'
import './Intro.css'

// ─────────────────────────────────────────────────────────────
// Introdução cinematográfica: sequência de boot do terminal.
// Três atos — cursor solitário, comando que se digita sozinho,
// sistema que desperta e revela o nome — e a cortina sobe.
// Exibida uma vez por sessão; Esc/Enter ou "pular" encerram.
// ─────────────────────────────────────────────────────────────

const COMMAND = `ssh ${profile.brand}@web`

/** Timeline central (ms) — cada fase referencia a anterior. */
const T = {
  cursorAlone: 500,
  typeSpeed: 70,
  afterTyping: 350,
  statusStagger: 320,
  afterStatus: 380,
  reveal: 1200,
  hold: 400,
  exit: 700,
  exitFast: 320,
}

const STATUS_LINES = [
  { label: 'identidade', value: 'ok' },
  { label: 'projetos', value: 'ok' },
  { label: 'terminal', value: 'ok' },
]

type Phase = 'cursor' | 'typing' | 'status' | 'reveal' | 'exit' | 'exit-fast'

interface IntroProps {
  onDone: () => void
}

export default function Intro({ onDone }: IntroProps) {
  const [phase, setPhase] = useState<Phase>('cursor')
  const [typed, setTyped] = useState('')
  const [statusCount, setStatusCount] = useState(0)
  const timersRef = useRef<number[]>([])
  const doneRef = useRef(false)

  const schedule = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms))
  }

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    onDone()
  }

  const skip = () => {
    if (doneRef.current || phase === 'exit' || phase === 'exit-fast') return
    timersRef.current.forEach(window.clearTimeout)
    timersRef.current = []
    setPhase('exit-fast')
    schedule(finish, T.exitFast)
  }

  // Sequência principal — replay em reload não faz sentido: marca já no início
  useEffect(() => {
    markIntroSeen()
    document.body.style.overflow = 'hidden'

    schedule(() => setPhase('typing'), T.cursorAlone)

    const typingDone = T.cursorAlone + COMMAND.length * T.typeSpeed
    for (let i = 1; i <= COMMAND.length; i++) {
      schedule(() => setTyped(COMMAND.slice(0, i)), T.cursorAlone + i * T.typeSpeed)
    }

    const statusStart = typingDone + T.afterTyping
    schedule(() => setPhase('status'), statusStart)
    for (let i = 1; i <= STATUS_LINES.length; i++) {
      schedule(() => setStatusCount(i), statusStart + (i - 1) * T.statusStagger)
    }

    const revealStart = statusStart + STATUS_LINES.length * T.statusStagger + T.afterStatus
    schedule(() => setPhase('reveal'), revealStart)

    const exitStart = revealStart + T.reveal + T.hold
    schedule(() => setPhase('exit'), exitStart)
    schedule(finish, exitStart + T.exit)

    return () => {
      timersRef.current.forEach(window.clearTimeout)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault()
        skip()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const showPrompt = phase !== 'cursor'
  const dimmed = phase === 'reveal' || phase === 'exit'

  return (
    <div
      className={`intro intro--${phase}`}
      role="dialog"
      aria-label="Introdução — pressione Esc para pular"
    >
      <div className="intro__glow" aria-hidden="true" />

      <div className="intro__stage">
        <p className={`intro__prompt ${dimmed ? 'intro__prompt--dim' : ''}`}>
          <span className="intro__prompt-char" aria-hidden="true">
            ❯
          </span>
          {showPrompt && <span className="intro__typed">{typed}</span>}
          <span className="intro__cursor" aria-hidden="true" />
        </p>

        <div className={`intro__status ${dimmed ? 'intro__status--dim' : ''}`} aria-hidden="true">
          {STATUS_LINES.slice(0, statusCount).map((line) => (
            <p className="intro__status-line" key={line.label}>
              <span className="intro__status-marker">▸</span>
              <span className="intro__status-label">{line.label}</span>
              <span className="intro__status-dots" />
              <span className="intro__status-ok">{line.value}</span>
            </p>
          ))}
        </div>

        {/* Sempre presente para reservar altura — o palco não pode saltar
            quando a identidade entra em cena */}
        <div className="intro__identity" aria-hidden={phase !== 'reveal' && phase !== 'exit'}>
          <p className="intro__name-mask">
            {(phase === 'reveal' || phase === 'exit') && (
              <span className="intro__name">{profile.displayName}</span>
            )}
          </p>
          <p className="intro__role-mask">
            {(phase === 'reveal' || phase === 'exit') && (
              <span className="intro__role">{profile.role}</span>
            )}
          </p>
        </div>
      </div>

      <button type="button" className="intro__skip" onClick={skip}>
        pular <kbd>esc</kbd>
      </button>
    </div>
  )
}
