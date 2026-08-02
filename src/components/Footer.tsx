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
          {profile.brand} &copy; {year}
        </p>
        <p className="footer__item footer__item--muted">
          React · TypeScript · Vite · CSS autoral
          {profile.sourceUrl && (
            <>
              {' · '}
              <a href={profile.sourceUrl} target="_blank" rel="noopener noreferrer">
                ver código ↗
              </a>
            </>
          )}
        </p>
        <p className="footer__item footer__item--muted">
          Disponível para projetos e parcerias imobiliárias
        </p>
      </div>
    </footer>
  )
}
