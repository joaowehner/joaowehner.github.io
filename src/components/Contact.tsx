import { profile } from '../data/profile'
import CopyButton from './CopyButton'
import './Contact.css'

export default function Contact() {
  return (
    <section className="section container" id="contato" aria-labelledby="contato-titulo">
      <div className="contact">
        <header className="section-head contact__head">
          <p className="section-head__cmd">contact --email</p>
          <h2 id="contato-titulo">Vamos conversar</h2>
        </header>

        <p className="contact__text">
          Projeto, parceria ou uma ideia para automatizar? A caixa de entrada está aberta,
          respondo mais rápido por WhatsApp ou e-mail.
        </p>

        <div className="contact__actions">
          {profile.whatsappUrl && (
            <a
              className="contact__cta"
              href={profile.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          )}
          <a className="contact__secondary" href={`mailto:${profile.email}`}>
            enviar e-mail
          </a>
          <CopyButton value={profile.email} label={`copiar ${profile.email}`} />
        </div>
      </div>
    </section>
  )
}
