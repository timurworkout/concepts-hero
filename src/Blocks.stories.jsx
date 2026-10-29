import { Arrow } from './App.jsx'
import { promises, faq } from './data.js'

/** Блоки лендинга, собранные из компонентов: обещания, доставка, FAQ. */
export default { title: 'Блоки/Лендинг' }

const Shell = ({ title, children }) => (
  <div style={{ background: 'var(--paper)', color: 'var(--ink)', padding: 32, minHeight: '100vh' }}>
    <p className="kicker">{title}</p>
    {children}
  </div>
)

export const Обещания = () => (
  <Shell title="Без сюрпризов">
    <div className="promises">
      {promises.map((p) => (
        <div key={p.title} className="promise">
          <div className="promise-value">{p.value}</div>
          <b>{p.title}</b>
          <p>{p.text}</p>
        </div>
      ))}
    </div>
  </Shell>
)

export const Доставка = () => (
  <Shell title="Доставка">
    <div className="delivery-plate cut-both" style={{ position: 'relative', left: 'auto', bottom: 'auto', width: '100%', maxWidth: 460 }}>
      <p className="kicker">Доставка</p>
      <h2>Машина там,<br />где ты</h2>
      <p>Привезём к аэропорту, вокзалу или к дверям отеля.</p>
      <ul className="delivery-list">
        {['Встретим в аэропорту', 'Привезём к отелю', 'Подъедем по твоему адресу', 'Ждём у вокзала'].map((t) => (
          <li key={t}>
            <button type="button">
              <span>{t}</span>
              <Arrow />
            </button>
          </li>
        ))}
      </ul>
    </div>
  </Shell>
)

export const Вопросы = () => (
  <Shell title="Вопросы">
    <div className="faq" style={{ padding: 0 }}>
      <div className="faq-list">
        {faq.slice(0, 4).map((f, i) => (
          <details key={f.q} open={i === 0}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  </Shell>
)
