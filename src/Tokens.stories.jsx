/** Витрина токенов «Табло»: цвет, шрифт, срез угла. Первая страница для сверки глазом. */
export default { title: 'Табло/Токены' }

const swatches = [
  ['--paper', 'бумага — фон страниц'],
  ['--plate', 'плита — поля и панели'],
  ['--ink', 'чернила — текст и рамки'],
  ['--rec', 'REC — запись идёт: кнопка пуска, точка в логотипе'],
  ['--rec-text', 'REC для мелкого текста — контраст AA'],
  ['--amber', 'янтарь — акцент подсказок'],
]

const Shell = ({ children }) => (
  <div style={{ background: 'var(--paper)', color: 'var(--ink)', padding: 32, minHeight: '100vh' }}>{children}</div>
)

export const Цвет = () => (
  <Shell>
    <h2>Цвет</h2>
    <div style={{ display: 'grid', gap: 1, background: 'var(--line)', border: '1px solid var(--line)' }}>
      {swatches.map(([name, note]) => (
        <div key={name} style={{ display: 'grid', gridTemplateColumns: '64px 160px 1fr', gap: 16, alignItems: 'center', background: 'var(--paper)', padding: '12px 16px' }}>
          <span style={{ width: 64, height: 40, background: `var(${name})`, border: '1px solid var(--line)' }} />
          <code style={{ fontFamily: 'var(--display)', fontSize: 13 }}>{name}</code>
          <span style={{ color: 'var(--body)', fontSize: 14 }}>{note}</span>
        </div>
      ))}
    </div>
  </Shell>
)

export const Шрифт = () => (
  <Shell>
    <h2>Шрифт</h2>
    <p style={{ fontFamily: 'var(--display)', fontSize: 44, fontWeight: 600, fontStretch: '88%', textTransform: 'uppercase', margin: '0 0 8px' }}>
      Скажи, куда <span style={{ color: 'var(--rec)' }}>едешь</span>
    </p>
    <p style={{ fontFamily: 'var(--display)', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
      Tektur — заголовки и служебные подписи
    </p>
    <p style={{ fontFamily: 'var(--text)', fontSize: 16, maxWidth: 520, color: 'var(--body)' }}>
      Onest — связный текст. Одна машина под твою поездку, с объяснением, почему она. Живой текст набираем только им.
    </p>
  </Shell>
)

export const СрезУгла = () => (
  <Shell>
    <h2>Срез угла</h2>
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <div style={{ width: 240, height: 120, border: '1.5px solid var(--ink)', background: 'var(--plate)', display: 'grid', placeItems: 'center', clipPath: 'polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut))' }}>
        <code style={{ fontFamily: 'var(--display)', fontSize: 12 }}>clip-path · плита</code>
      </div>
      <button className="wz-go" style={{ width: 120, height: 56 }} aria-label="Пример кнопки запуска">REC</button>
      <span className="chip" style={{ alignSelf: 'center' }}>круглый контрол</span>
    </div>
    <p style={{ fontFamily: 'var(--text)', fontSize: 14, color: 'var(--body)', maxWidth: 520, marginTop: 20 }}>
      Правило равновесия: рамки и панели — угловатые, контролы (чипы, пилюли, иконки) — круглые.
    </p>
  </Shell>
)
