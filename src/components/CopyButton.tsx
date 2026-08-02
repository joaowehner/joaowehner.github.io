import { useEffect, useRef, useState } from 'react'
import './CopyButton.css'

interface CopyButtonProps {
  value: string
  label: string
  /** Nome acessível com contexto, ex.: "copiar e-mail fulano@x.com" */
  ariaLabel?: string
  className?: string
}

export default function CopyButton({ value, label, ariaLabel, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard bloqueado: mostra o valor para cópia manual
      window.prompt('Copie manualmente:', value)
    }
  }

  return (
    <button
      type="button"
      className={`copy-button ${copied ? 'copy-button--copied' : ''} ${className ?? ''}`}
      onClick={copy}
      aria-live="polite"
      aria-label={copied ? 'copiado' : ariaLabel}
    >
      {/* Os dois rótulos ocupam a mesma célula: a largura nunca muda */}
      <span className="copy-button__face" aria-hidden={copied}>
        {label}
      </span>
      <span className="copy-button__face copy-button__face--done" aria-hidden={!copied}>
        copiado ✓
      </span>
    </button>
  )
}
