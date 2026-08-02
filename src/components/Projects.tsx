import { profile, type Project } from '../data/profile'
import './Projects.css'

function statusModifier(status: Project['status']): string {
  switch (status) {
    case 'em produção':
      return 'projects__status--live'
    case 'em evolução':
      return 'projects__status--wip'
    case 'privado':
      return 'projects__status--private'
  }
}

export default function Projects() {
  if (profile.projects.length === 0) return null

  return (
    <section className="section container" id="projetos" aria-labelledby="projetos-titulo">
      <header className="section-head">
        <p className="section-head__cmd">ls ~/projects</p>
        <h2 id="projetos-titulo">Projetos selecionados</h2>
      </header>

      <ul className="projects" role="list">
        {profile.projects.map((project) => (
          <li className="projects__card" key={project.id}>
            <div className="projects__bar">
              <span className="projects__path">{project.path}</span>
              <span className={`projects__status ${statusModifier(project.status)}`}>
                {project.status}
              </span>
            </div>

            <div className="projects__body">
              <h3 className="projects__name">{project.name}</h3>
              <p className="projects__tagline">{project.tagline}</p>
              <p className="projects__description">{project.description}</p>
              <p className="projects__role">
                <span className="projects__role-key">papel</span>
                {project.role}
              </p>
              <ul className="projects__tech" role="list" aria-label="Tecnologias">
                {project.tech.map((tech) => (
                  <li className="projects__tech-item" key={tech}>
                    {tech}
                  </li>
                ))}
              </ul>
            </div>

            <div className="projects__footer">
              {project.url ? (
                <a
                  className="projects__link"
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  abrir {project.urlLabel ?? 'site'} ↗
                </a>
              ) : (
                <span className="projects__private-note">
                  {project.footerNote ?? 'detalhes sob conversa'}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
