import { profile } from '../data/profile'
import './About.css'

export default function About() {
  return (
    <section className="section container" id="sobre" aria-labelledby="sobre-titulo">
      <header className="section-head">
        <p className="section-head__cmd">cat about.md</p>
        <h2 id="sobre-titulo">Sobre</h2>
      </header>

      <div className="about">
        <div className="about__text">
          {profile.about.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <aside className="about__card" aria-label="Resumo rápido">
          <p className="about__card-line">
            <span className="about__key">nome</span>
            {profile.fullName}
          </p>
          <p className="about__card-line">
            <span className="about__key">base</span>
            {profile.location}
          </p>
          <p className="about__card-line">
            <span className="about__key">papel</span>
            {profile.role}
          </p>
          <p className="about__card-line">
            <span className="about__key">empresa</span>
            <a href={profile.company.url} target="_blank" rel="noopener noreferrer">
              {profile.company.name} ↗
            </a>
          </p>
        </aside>
      </div>
    </section>
  )
}
