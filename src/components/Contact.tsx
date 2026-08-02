import { profile } from '../data/profile'
import CopyButton from './CopyButton'
import './Contact.css'

export default function Contact() {
  const linkedin = profile.social.find((s) => s.id === 'linkedin')

  return (
    <section className="section container" id="contato" aria-labelledby="contato-titulo">
      <div className="contact">
        <header className="section-head contact__head">
          <p className="section-head__cmd">contact --email</p>
          <h2 id="contato-titulo">Vamos conversar</h2>
        </header>

        <p className="contact__text">
          Projeto, vaga, parceria ou uma ideia para automatizar? A caixa de entrada está aberta —
          respondo mais rápido por e-mail ou LinkedIn.
        </p>

        <div className="contact__actions">
          <a className="contact__cta" href={`mailto:${profile.email}`}>
            enviar e-mail
          </a>
          <CopyButton value={profile.email} label={`copiar ${profile.email}`} />
          {linkedin && (
            <a
              className="contact__secondary"
              href={linkedin.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn ↗
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
