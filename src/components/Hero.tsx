import { profile } from '../data/profile'
import Terminal from './Terminal'
import './Hero.css'

export default function Hero() {
  const github = profile.social.find((s) => s.id === 'github')

  return (
    <section className="hero container" id="inicio" aria-label="Apresentação">
      <div className="hero__content">
        <p className="hero__kicker">
          <span aria-hidden="true">~ $ </span>whoami
        </p>
        <h1 className="hero__title">
          {profile.displayName}
          <span className="hero__role">{profile.role}</span>
        </h1>
        <p className="hero__headline">{profile.headline}</p>
        <p className="hero__sub">{profile.subheadline}</p>
        <p className="hero__meta">
          <span className="hero__meta-item">{profile.location}</span>
          <span className="hero__meta-sep" aria-hidden="true">
            ·
          </span>
          <a href={profile.company.url} target="_blank" rel="noopener noreferrer">
            {profile.company.name} ↗
          </a>
        </p>

        <div className="hero__ctas">
          <a className="hero__cta hero__cta--primary" href="#projetos">
            Ver projetos
          </a>
          <a className="hero__cta hero__cta--secondary" href="#contato">
            Vamos conversar
          </a>
          {github && (
            <a
              className="hero__cta hero__cta--ghost"
              href={github.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub ↗
            </a>
          )}
        </div>
      </div>

      <div className="hero__terminal">
        <Terminal />
      </div>
    </section>
  )
}
