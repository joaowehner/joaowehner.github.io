import { profile } from '../data/profile'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer" aria-label="Rodapé">
      <div className="footer__inner container">
        <p className="footer__item">
          <span className="footer__prompt" aria-hidden="true">
            ❯
          </span>
          {profile.brand} — {year}
        </p>
        <p className="footer__item footer__item--muted">React · TypeScript · Vite · CSS autoral</p>
        <p className="footer__item footer__item--muted">feito em {profile.location}</p>
      </div>
    </footer>
  )
}
