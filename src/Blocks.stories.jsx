import { promises, faq } from './data.js'

/** Основные блоки лендинга: кикер, кнопки, вкладки городов, обещания, строки доставки, FAQ. */
export default { title: 'Табло/Блоки' }

const Shell = ({ title, children }) => (
  <div style={{ background: 'var(--paper)', color: 'var(--ink)', padding: 32, minHeight: '100vh' }}>
    <p className="kicker">{title}</p>
    {children}
  </div>
)

export const Кнопки = () => (
  <Shell title="Контролы">
    <h2 style={{ fontFamily: 'var(--display)', textTransform: 'uppercase', marginBottom: 20 }}>Кнопки</h2>
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 28 }}>
      <button type="button" className="btn-primary">Основная</button>
      <button type="button" className="btn-secondary">Вторичная</button>
      <button type="button" className="filter">Фильтр</button>
      <button type="button" className="filter active">Фильтр включён</button>
      <span className="chip">Чип</span>
      <span className="badge">Бейдж</span>
    </div>
    <p style={{ fontFamily: 'var(--text)', fontSize: 14, color: 'var(--body)', maxWidth: 520 }}>
      Панели и рамки — угловатые, контролы — круглые. Сброс кнопок обнуляет border и background,
      иначе строки-кнопки получают браузерную заливку.
    </p>
  </Shell>
)

export const ВкладкиГородов = () => (
  <Shell title="Направления">
    <div className="dir-tabs" role="tablist">
      {['Сочи', 'Петербург', 'Москва', 'Калининград', 'Мурманск', 'Казань'].map((c, i) => (
        <button key={c} type="button" role="tab" aria-selected={i === 0} className={'dir-tab' + (i === 0 ? ' on' : '')}>{c}</button>
      ))}
    </div>
  </Shell>
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
    <div className="delivery-plate cut-both" style={{ maxWidth: 460 }}>
      <p className="kicker">Доставка</p>
      <h2>Машина там,<br />где ты</h2>
      <p>Привезём к аэропорту, вокзалу или к дверям отеля.</p>
      <ul className="delivery-list">
        {['Встретим в аэропорту', 'Привезём к отелю', 'Подъедем по твоему адресу', 'Ждём у вокзала'].map((t) => (
          <li key={t}>
            <button type="button">
              <span>{t}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
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
