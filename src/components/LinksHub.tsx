import { profile } from '../data/profile'
import CopyButton from './CopyButton'
import './LinksHub.css'

export default function LinksHub() {
  return (
    <section className="section container" id="links" aria-labelledby="links-titulo">
      <header className="section-head">
        <p className="section-head__cmd">ls ~/links</p>
        <h2 id="links-titulo">Links</h2>
      </header>

      <ul className="links" role="list">
        {profile.social.map((social) => (
          <li className="links__row" key={social.id}>
            <div className="links__info">
              <span className="links__label">{social.label}</span>
              <span className="links__handle">{social.handle}</span>
            </div>
            {social.action === 'copiar' ? (
              <CopyButton
                value={social.handle}
                label="copiar"
                ariaLabel={`copiar ${social.label.toLowerCase()} ${social.handle}`}
              />
            ) : (
              <a
                className="links__open"
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir ${social.label} em nova aba`}
              >
                abrir ↗
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
