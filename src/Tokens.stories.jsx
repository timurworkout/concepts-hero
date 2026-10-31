/** Витрина токенов «Табло»: цвет, шрифт, скругления. Первая страница для сверки глазом. */
export default { title: 'Основы/Токены' }

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

// Шкала стилей — restyle.md §1b. Кегли берутся из токенов styles.css
const styles = [
  ['Hero', { fontSize: 'var(--fs-hero)', fontWeight: 700, letterSpacing: 'var(--ls-display)', lineHeight: 'var(--lh-tight)' }, 'Скажи, куда едешь'],
  ['H1 · секция', { fontSize: 'var(--fs-section)', fontWeight: 700, letterSpacing: 'var(--ls-display)', lineHeight: 'var(--lh-tight)' }, 'Куда поедем'],
  ['H2 · экран, плашка', { fontSize: 'var(--fs-xl)', fontWeight: 700, letterSpacing: 'var(--ls-head)', lineHeight: 'var(--lh-snug)' }, 'Машина под поездку'],
  ['H3 · карточка', { fontSize: 'var(--fs-lg)', fontWeight: 600, lineHeight: 'var(--lh-snug)' }, 'Полный привод'],
  ['Текст', { fontSize: 'var(--fs-md)', fontWeight: 400, lineHeight: 'var(--lh-body)', color: 'var(--body)' }, 'Одна машина под твою поездку, с\u00a0объяснением, почему она.'],
  ['Второстепенный', { fontSize: 'var(--fs-sm)', fontWeight: 400, lineHeight: 'var(--lh-body)', color: 'var(--muted)' }, 'Клиренс 224\u00a0мм, багажник 400\u00a0л'],
  ['Подпись', { fontSize: 'var(--fs-xs)', fontWeight: 600, letterSpacing: 'var(--ls-caps)', textTransform: 'uppercase', color: 'var(--muted)' }, 'REC · кадр 01'],
]

export const Шрифт = () => (
  <Shell>
    <h2>Шрифт: Manrope, запасной Golos</h2>
    <div style={{ display: 'grid', gap: 1, background: 'var(--line)', border: '1px solid var(--line)' }}>
      {styles.map(([name, style, sample]) => (
        <div key={name} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, alignItems: 'baseline', background: 'var(--paper)', padding: '12px 16px' }}>
          <code style={{ fontSize: 13, color: 'var(--muted)' }}>{name}</code>
          <span style={style}>{sample}</span>
        </div>
      ))}
    </div>
    <p style={{ fontSize: 'var(--fs-sm)', maxWidth: 520, color: 'var(--body)', marginTop: 20 }}>
      Капс — только в мелких служебных подписях. Заголовки — обычным регистром.
    </p>
  </Shell>
)

// Шкала читается из styles.css: поменяли значение там — поменялось здесь
const sizes = ['--fs-xs', '--fs-sm', '--fs-md', '--fs-lg', '--fs-xl', '--fs-block', '--fs-section', '--fs-hero']

export const Размеры = () => {
  const root = getComputedStyle(document.documentElement)
  return (
    <Shell>
      <h2>Размеры</h2>
      <div style={{ display: 'grid', gap: 1, background: 'var(--line)', border: '1px solid var(--line)' }}>
        {sizes.map((name) => (
          <div key={name} style={{ display: 'grid', gridTemplateColumns: '120px 220px 1fr', gap: 16, alignItems: 'baseline', background: 'var(--paper)', padding: '12px 16px' }}>
            <code style={{ fontSize: 13 }}>{name}</code>
            <code style={{ fontSize: 13, color: 'var(--muted)' }}>{root.getPropertyValue(name).trim()}</code>
            <span style={{ fontSize: `var(${name})`, lineHeight: 1.1 }}>Куда едешь</span>
          </div>
        ))}
      </div>
    </Shell>
  )
}

export const Скругления = () => (
  <Shell>
    <h2>Скругления</h2>
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ width: 240, height: 120, border: '1px solid var(--line)', borderRadius: 'var(--r-card)', background: 'var(--plate)', boxShadow: 'var(--shadow)', display: 'grid', placeItems: 'center' }}>
        <code style={{ fontSize: 12 }}>--r-card · карточка, фото</code>
      </div>
      <button className="btn-primary">--r-ctl · кнопка</button>
      <button className="filter">--r-ctl · чип</button>
      <button className="icon-btn" aria-label="Пример иконки-кнопки">×</button>
    </div>
    <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--body)', maxWidth: 520, marginTop: 20 }}>
      16 у карточек и фото, 12 у кнопок, чипов и иконок-кнопок. Пилюль нет, круглые только тумблеры.
    </p>
  </Shell>
)
