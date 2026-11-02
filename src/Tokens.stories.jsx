/** Витрина токенов палитры «Север» (restyle.md §2): цвет, шрифт, размеры, отступы, скругления.
    Значения читаются из :root в styles.css — поменяли там, поменялось здесь. */
import { ActionIcon } from './App.jsx'

export default { title: 'Основы/Токены' }

const root = () => getComputedStyle(document.documentElement)

const swatches = [
  ['--paper', 'White — фон страниц'],
  ['--plate', 'карточки и панели, чуть светлее фона'],
  ['--ink', 'Lazur — текст, выбранное, главная кнопка, тёмные пласты: интро и подвал'],
  ['--muted', 'вторичный текст: подписи, мета'],
  ['--line', 'хайрлайн 1px — единственная обводка'],
  ['--green', 'Green — единственный акцент: «Подобрать» в визарде, вторая строка интро. Только на лазури или рядом'],
  ['--rec', 'Yellow bright — только точка «запись идёт» в логотипе'],
  ['--night', 'Black — подписи и плашки поверх фото'],
  ['--error', 'служебный: ошибки. Не акцент'],
  ['--amber', 'служебный: предупреждения'],
]

const Shell = ({ children }) => (
  <div style={{ background: 'var(--paper)', color: 'var(--ink)', padding: 32, minHeight: '100vh' }}>{children}</div>
)

export const Цвет = () => (
  <Shell>
    <h2>Цвет</h2>
    <div style={{ display: 'grid', gap: 1, background: 'var(--line)', border: '1px solid var(--line)' }}>
      {swatches.map(([name, note]) => (
        <div key={name} style={{ display: 'grid', gridTemplateColumns: '64px 120px 90px 1fr', gap: 16, alignItems: 'center', background: 'var(--paper)', padding: '12px 16px' }}>
          <span style={{ width: 64, height: 40, background: `var(${name})`, border: '1px solid var(--line)', borderRadius: 8 }} />
          <code style={{ fontSize: 13 }}>{name}</code>
          <code style={{ fontSize: 13, color: 'var(--muted)' }}>{root().getPropertyValue(name).trim()}</code>
          <span style={{ color: 'var(--body)', fontSize: 14 }}>{note}</span>
        </div>
      ))}
    </div>
  </Shell>
)

// Роли текста — restyle.md §3: шаг между соседними не меньше 1.25×, ни одна пара не совпадает
const styles = [
  ['Экран · --fs-display', { fontSize: 'var(--fs-display)', fontWeight: 700, letterSpacing: 'var(--ls-display)', lineHeight: 'var(--lh-tight)' }, 'Скажи, куда.'],
  ['Раздел · --fs-section', { fontSize: 'var(--fs-section)', fontWeight: 700, letterSpacing: 'var(--ls-display)', lineHeight: 'var(--lh-tight)' }, 'Хороший план — просто уехать'],
  ['Экран приложения · --fs-xl', { fontSize: 'var(--fs-xl)', fontWeight: 700, letterSpacing: 'var(--ls-head)', lineHeight: 'var(--lh-snug)' }, 'Всё для поездки'],
  ['Пункт · --fs-lg', { fontSize: 'var(--fs-lg)', fontWeight: 600, lineHeight: 'var(--lh-snug)' }, 'Встретим в аэропорту'],
  ['Текст · --fs-md', { fontSize: 'var(--fs-md)', fontWeight: 400, lineHeight: 'var(--lh-body)', color: 'var(--body)' }, 'Одна машина под твою поездку, с\u00a0объяснением, почему она.'],
  ['Мета · --fs-sm', { fontSize: 'var(--fs-sm)', fontWeight: 400, lineHeight: 'var(--lh-body)', color: 'var(--muted)' }, 'Клиренс 224\u00a0мм, багажник 400\u00a0л'],
  ['Подпись · --fs-xs', { fontSize: 'var(--fs-xs)', fontWeight: 600, letterSpacing: 'var(--ls-caps)', textTransform: 'uppercase', color: 'var(--muted)' }, 'В горы'],
]

export const Шрифт = () => (
  <Shell>
    <h2>Шрифт: Manrope, запасной Golos</h2>
    <div style={{ display: 'grid', gap: 1, background: 'var(--line)', border: '1px solid var(--line)' }}>
      {styles.map(([name, style, sample]) => (
        <div key={name} style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: 16, alignItems: 'baseline', background: 'var(--paper)', padding: '12px 16px' }}>
          <code style={{ fontSize: 13, color: 'var(--muted)' }}>{name}</code>
          <span style={style}>{sample}</span>
        </div>
      ))}
    </div>
    <p style={{ fontSize: 'var(--fs-sm)', maxWidth: 520, color: 'var(--body)', marginTop: 20 }}>
      Один шрифт — Manrope, веса 400, 600, 700. Капс — только в мелких служебных подписях. Заголовки и подписи ячеек — обычным регистром.
    </p>
  </Shell>
)

// Шкала читается из styles.css: поменяли значение там — поменялось здесь
const sizes = ['--fs-xs', '--fs-sm', '--fs-md', '--fs-lg', '--fs-xl', '--fs-block', '--fs-section', '--fs-hero', '--fs-display']

export const Размеры = () => {
  const r = root()
  return (
    <Shell>
      <h2>Размеры</h2>
      <div style={{ display: 'grid', gap: 1, background: 'var(--line)', border: '1px solid var(--line)' }}>
        {sizes.map((name) => (
          <div key={name} style={{ display: 'grid', gridTemplateColumns: '120px 220px 1fr', gap: 16, alignItems: 'baseline', background: 'var(--paper)', padding: '12px 16px' }}>
            <code style={{ fontSize: 13 }}>{name}</code>
            <code style={{ fontSize: 13, color: 'var(--muted)' }}>{r.getPropertyValue(name).trim()}</code>
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

// Отступы: шаг между блоками лендинга один на всех, поле страницы — gutter
const spaces = [
  ['--step-block', 'между блоками лендинга'],
  ['--gutter', 'поле страницы слева и справа'],
]

export const Отступы = () => {
  const r = root()
  return (
    <Shell>
      <h2>Отступы</h2>
      <div style={{ display: 'grid', gap: 1, background: 'var(--line)', border: '1px solid var(--line)' }}>
        {spaces.map(([name, note]) => (
          <div key={name} style={{ display: 'grid', gridTemplateColumns: '140px 240px 1fr', gap: 16, alignItems: 'center', background: 'var(--paper)', padding: '12px 16px' }}>
            <code style={{ fontSize: 13 }}>{name}</code>
            <code style={{ fontSize: 13, color: 'var(--muted)' }}>{r.getPropertyValue(name).trim()}</code>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--body)' }}>
              <span style={{ width: `var(${name})`, height: 12, background: 'var(--ink)', borderRadius: 2 }} />{note}
            </span>
          </div>
        ))}
      </div>
    </Shell>
  )
}

// Действие справа в ячейке поездки: один штрих --icon-stroke на всех экранах
export const Действия = () => (
  <Shell>
    <h2>Действия в ячейке</h2>
    <div style={{ display: 'flex', gap: 32, color: 'var(--ink)' }}>
      {[['add', 'пусто — добавить'], ['open', 'заполнено — изменить'], ['clear', 'стереть — только в визарде']].map(([kind, note]) => (
        <span key={kind} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 14 }}><ActionIcon kind={kind} />{note}</span>
      ))}
    </div>
  </Shell>
)
