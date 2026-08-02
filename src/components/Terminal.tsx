import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/profile'
import {
  completeCommand,
  quickCommands,
  runCommand,
  type Line,
} from '../terminal/commands'
import './Terminal.css'

interface Entry {
  input: string | null
  lines: Line[]
}

const hintEntry: Entry = {
  input: null,
  lines: [
    {
      text: 'digite "help" ou use os atalhos abaixo — o site inteiro também funciona sem o terminal.',
      kind: 'muted',
    },
  ],
}

// Estado inicial complementa o hero (que já diz quem é o João):
// um teaser dos projetos em vez de repetir a identidade.
const initialEntries: Entry[] = [
  {
    input: 'ls ~/projects',
    lines: profile.projects.map((p) => ({
      text: `  ${p.path.replace('~/projects/', '').padEnd(20)} ${p.status}`,
      kind: 'out' as const,
    })),
  },
  hintEntry,
]

function lineClass(kind: Line['kind']): string {
  return `terminal__line terminal__line--${kind ?? 'out'}`
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function Terminal() {
  const [entries, setEntries] = useState<Entry[]>(initialEntries)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [hint, setHint] = useState<string[]>([])
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = outputRef.current
    if (!el) return
    const items = el.querySelectorAll<HTMLElement>('.terminal__entry')
    const last = items[items.length - 1]
    // Resposta mais alta que a janela: mostra o início dela;
    // resposta curta: comportamento clássico de rolar ao fundo.
    if (last && last.offsetHeight >= el.clientHeight) {
      el.scrollTop = last.offsetTop
    } else {
      el.scrollTop = el.scrollHeight
    }
  }, [entries])

  const execute = (raw: string) => {
    const trimmed = raw.trim()
    setHint([])
    setInput('')
    setHistoryIndex(-1)
    if (trimmed === '') return

    const result = runCommand(trimmed, profile)
    setHistory((h) => (h[h.length - 1] === trimmed ? h : [...h, trimmed]))

    if (result.action?.type === 'clear') {
      setEntries([hintEntry])
      return
    }

    setEntries((e) => [...e, { input: trimmed, lines: result.lines }])

    if (result.action?.type === 'goto') {
      document.getElementById(result.action.section)?.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      })
    } else if (result.action?.type === 'open') {
      window.open(result.action.url, '_blank', 'noopener,noreferrer')
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      execute(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const next = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(next)
      setInput(history[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === -1) return
      const next = historyIndex + 1
      if (next >= history.length) {
        setHistoryIndex(-1)
        setInput('')
      } else {
        setHistoryIndex(next)
        setInput(history[next])
      }
    } else if (e.key === 'Tab') {
      // Tab só é capturado quando há autocomplete a fazer —
      // Shift+Tab e campo vazio seguem o fluxo normal de foco.
      if (e.shiftKey || input.trim() === '') return
      const candidates = completeCommand(input)
      if (candidates.length === 0) return
      e.preventDefault()
      if (candidates.length === 1) {
        setInput(candidates[0])
        setHint([])
      } else {
        setHint(candidates)
      }
    } else if (e.key === 'Escape') {
      setHint([])
    }
  }

  const focusInput = () => {
    // Em telas touch, focar aqui abriria o teclado virtual a cada toque
    if (window.matchMedia('(pointer: fine)').matches) {
      inputRef.current?.focus()
    }
  }

  return (
    <section
      className="terminal"
      aria-label="Terminal interativo — alternativa: use a navegação do site"
      onClick={focusInput}
    >
      <div className="terminal__bar">
        <span className="terminal__dot terminal__dot--red" aria-hidden="true" />
        <span className="terminal__dot terminal__dot--yellow" aria-hidden="true" />
        <span className="terminal__dot terminal__dot--green" aria-hidden="true" />
        <span className="terminal__title">{profile.brand}@web — zsh</span>
      </div>

      <div className="terminal__output" ref={outputRef} role="log" aria-live="polite">
        {entries.map((entry, i) => (
          <div className="terminal__entry" key={i}>
            {entry.input !== null && (
              <p className="terminal__echo">
                <span aria-hidden="true">❯ </span>
                {entry.input}
              </p>
            )}
            {entry.lines.map((line, j) =>
              line.href ? (
                <p className={lineClass(line.kind)} key={j}>
                  <a href={line.href} target="_blank" rel="noopener noreferrer">
                    {line.text}
                  </a>
                </p>
              ) : (
                <p className={lineClass(line.kind)} key={j}>
                  {line.text}
                </p>
              ),
            )}
          </div>
        ))}
        {hint.length > 0 && (
          <p className="terminal__line terminal__line--muted">{hint.join('  ')}</p>
        )}
      </div>

      <div className="terminal__input-row">
        <label className="terminal__prompt" htmlFor="terminal-input" aria-hidden="true">
          ❯
        </label>
        <input
          id="terminal-input"
          ref={inputRef}
          className="terminal__input"
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setHint([])
          }}
          onKeyDown={onKeyDown}
          aria-label='Digite um comando — por exemplo, "help"'
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
        />
      </div>

      <div className="terminal__quick" aria-label="Atalhos de comandos">
        {quickCommands.map((cmd) => (
          <button
            key={cmd}
            type="button"
            className="terminal__chip"
            onClick={(e) => {
              e.stopPropagation()
              execute(cmd)
            }}
          >
            {cmd}
          </button>
        ))}
      </div>
    </section>
  )
}
