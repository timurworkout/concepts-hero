/** Витрина токенов палитры «Север» (restyle.md §2).
    Списки не вписаны руками: токены, значения и пояснения читаются из :root в styles.css,
    так что новый токен появляется здесь сам. Пояснение — комментарий в той же строке CSS. */
import { useState } from 'react'
import { ActionIcon } from './App.jsx'
import css from './styles.css?raw'

export default { title: 'Основы/Токены' }

const root = () => getComputedStyle(document.documentElement)

// Токены первого блока :root: имя, сырое значение и комментарий в строке
// Многострочные комментарии (закомментированный откат палитры) вырезаем, однострочные — это пояснения
const rootCss = css.slice(css.indexOf(':root {'), css.indexOf('\n}', css.indexOf(':root {'))).replace(/\/\*[^*]*\n[\s\S]*?\*\//g, '')
const tokens = [...rootCss.matchAll(/^[ \t]*(--[\w-]+):[ \t]*([^;]+);[ \t]*(?:\/\*[ \t]*(.*?)[ \t]*\*\/)?/gm)]
  .map(([, name, raw, note = '']) => ({ name, raw: raw.trim(), note }))
const pick = (test) => tokens.filter((t) => test(t.name))
const isColor = (t) => !/^--(fs|lh|ls|r|dur|ease|vf|shadow|gutter|step|icon|display|text)\b/.test(t.name) && CSS.supports('color', root().getPropertyValue(t.name).trim())

const Shell = ({ children }) => (
  <div style={{ background: 'var(--paper)', color: 'var(--ink)', padding: 32, minHeight: '100vh' }}>{children}</div>
)

// Таблица токенов: превью, имя, значение, пояснение из CSS
const Table = ({ items, preview, value = (t) => t.raw, cols = '64px 170px 150px 1fr' }) => (
  <div style={{ display: 'grid', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 'var(--r-card)', overflow: 'hidden', marginBottom: 32 }}>
    {items.map((t) => (
      <div key={t.name} style={{ display: 'grid', gridTemplateColumns: cols, gap: 16, alignItems: 'center', background: 'var(--plate)', padding: '12px 16px' }}>
        {preview(t)}
        <code style={{ fontSize: 'var(--fs-sm)' }}>{t.name}</code>
        <code style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)' }}>{value(t)}</code>
        <span style={{ color: 'var(--body)', fontSize: 'var(--fs-sm)' }}>{t.note}</span>
      </div>
    ))}
  </div>
)

const swatch = (t) => <span style={{ width: 64, height: 40, background: `var(${t.name})`, border: '1px solid var(--line)', borderRadius: 'var(--r-ctl)' }} />

// Примитивы — до блока «Семантика», остальные цвета — семантические роли
const semanticFrom = css.indexOf('Семантика')
const isPrimitive = (t) => css.indexOf(`${t.name}:`) < semanticFrom

// Роль, собранная из примитива, показывает ссылку на него: «→ Lazur --ink». Своё значение — как есть
const roleValue = (t) => {
  const ref = t.raw.match(/^var\((--[\w-]+)\)$/)?.[1]
  if (!ref) return t.raw
  const name = tokens.find((x) => x.name === ref)?.note.match(/^([A-Z][\w ]*?)\s*:/)?.[1]
  return <span style={{ color: 'var(--ink)' }}>→ {name ? `${name} ` : ''}{ref}</span>
}

export const Цвет = () => (
  <Shell>
    <h2>Цвет · примитивы</h2>
    <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', marginBottom: 16 }}>Сырые значения палитры. Компоненты берут их через семантические роли ниже.</p>
    <Table items={tokens.filter((t) => isColor(t) && isPrimitive(t))} preview={swatch} value={roleValue} cols="64px 170px 190px 1fr" />
    <h2>Цвет · роли</h2>
    <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', marginBottom: 16 }}>Семантика: ею пользуются компоненты. Стрелка — роль взята из палитры, hex — у роли своё значение.</p>
    <Table items={tokens.filter((t) => isColor(t) && !isPrimitive(t))} preview={swatch} value={roleValue} cols="64px 170px 190px 1fr" />
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


export const Размеры = () => (
  <Shell>
    <h2>Размеры</h2>
    {/* От крупного к мелкому, как роли на странице «Шрифт» */}
    <Table items={pick((n) => n.startsWith('--fs-')).reverse()} cols="1fr 140px 260px 1fr"
      preview={(t) => <span style={{ fontSize: `var(${t.name})`, lineHeight: 'var(--lh-tight)', fontWeight: 600 }}>Куда едешь</span>} />
  </Shell>
)

export const Форма = () => (
  <Shell>
    <h2>Скругления</h2>
    <Table items={pick((n) => n.startsWith('--r-'))}
      preview={(t) => <span style={{ width: 64, height: 40, border: '1px solid var(--ink)', borderRadius: `var(${t.name})`, background: 'var(--plate)' }} />} />
    <h2>Тени</h2>
    <Table items={pick((n) => n.startsWith('--shadow'))} cols="96px 170px 1fr 1fr"
      preview={(t) => <span style={{ width: 80, height: 48, margin: '12px 0', borderRadius: 'var(--r-card)', background: 'var(--plate)', boxShadow: `var(${t.name})` }} />} />
    <h2>Штрих</h2>
    <Table items={pick((n) => /^--(icon-stroke|vf-stroke)/.test(n))}
      preview={(t) => <span style={{ width: 40, height: 0, borderTop: `var(${t.name}) solid var(--ink)` }} />} />
    <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--body)', maxWidth: 520 }}>
      Обводка одна: 1px, сплошная, цвет --line. Пилюль нет, круглые только тумблеры.
    </p>
  </Shell>
)


export const Отступы = () => (
  <Shell>
    <h2>Отступы</h2>
    <Table items={pick((n) => /^--(gutter|step-)/.test(n))} cols="170px 170px 260px 1fr"
      preview={(t) => <span style={{ width: `var(${t.name})`, height: 12, background: 'var(--ink)', borderRadius: 2 }} />} />
  </Shell>
)

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

// Motion: длительности проигрываются на общей кривой, кривые — на общей длительности
function Track({ duration, easing, run }) {
  return (
    <span style={{ position: 'relative', width: 160, height: 12, borderRadius: 6, background: 'var(--surface-strong)' }}>
      <span style={{ position: 'absolute', top: 0, left: 0, width: 12, height: 12, borderRadius: 6, background: 'var(--ink)',
        transform: run ? 'translateX(148px)' : 'none', transition: run ? `transform ${duration} ${easing}` : 'none' }} />
    </span>
  )
}

export const Motion = () => {
  const [run, setRun] = useState(false)
  const play = () => { setRun(false); requestAnimationFrame(() => requestAnimationFrame(() => setRun(true))) }
  const isTime = (n) => /^--(dur|vf)-/.test(n) && !n.startsWith('--vf-stroke')
  return (
    <Shell>
      <h2>Motion</h2>
      <button type="button" className="btn-secondary btn-sm" onClick={play} style={{ marginBottom: 24 }}>Проиграть</button>
      <h3 style={{ marginBottom: 12 }}>Длительности · на --ease-focus</h3>
      <Table items={pick(isTime)} cols="176px 150px 90px 1fr"
        preview={(t) => <Track run={run} duration={`var(${t.name})`} easing="var(--ease-focus)" />} />
      <h3 style={{ marginBottom: 12 }}>Кривые · на --dur-slow</h3>
      <Table items={pick((n) => n.startsWith('--ease-'))} cols="176px 150px 1fr 1fr"
        preview={(t) => <Track run={run} duration="var(--dur-slow)" easing={`var(${t.name})`} />} />
    </Shell>
  )
}
