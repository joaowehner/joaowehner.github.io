import { profile } from '../data/profile'
import './Stack.css'

export default function Stack() {
  return (
    <section className="section container" id="stack" aria-labelledby="stack-titulo">
      <header className="section-head">
        <p className="section-head__cmd">cat stack.json</p>
        <h2 id="stack-titulo">Stack</h2>
      </header>

      <div className="stack">
        {profile.stack.map((group) => (
          <div className="stack__group" key={group.id}>
            <p className="stack__title">
              <span aria-hidden="true">// </span>
              {group.title}
            </p>
            <p className="stack__note">{group.note}</p>
            <ul className="stack__items" role="list">
              {group.items.map((item) => (
                <li className="stack__item" key={item}>
                  <span className="stack__marker" aria-hidden="true">
                    ▸
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
