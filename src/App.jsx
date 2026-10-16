import { Fragment, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { locations, locationGroups, cars, scenarios, rub, carDetails, rentTerms, cities, extras, plans, prefOptions, promises, faq } from './data.js'

const carPhoto = (c, size = 'sm') => ({ backgroundImage: `url(${import.meta.env.BASE_URL}cars/${size}/${c.id}.webp)` })

const emptyQuery = {
  cityId: 'sochi',
  locationId: '',
  mode: 'days', // 'hours' | 'days'
  dateFrom: '',
  timeFrom: '12:00',
  dateTo: '',
  timeTo: '12:00',
  start: 'now', // почасово: 'now' | 'HH:MM' сегодня
  hours: 4,
  planIds: [],
  prefs: [], // переключатели Э2
  extraIds: [], // допы живут в запросе — переживают смену машины
  address: '',
}

// Хранилище браузера: избранное, вход, брони. Без него всё работает в памяти
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* приватный режим */ } }
const union = (a, b) => [...new Set([...a, ...b])]

export default function App() {
  const [query, setQuery] = useState(emptyQuery)
  const [screen, setScreen] = useState('e1') // 'e1' | 'e2' | 'e3' | 'e4' | 'e6' | 'booking'
  const [pickedCarId, setPickedCarId] = useState(null)
  const [cameFrom, setCameFrom] = useState('e1') // откуда открыли Э3
  const [booking, setBooking] = useState(null) // { total } с Э3
  const [result, setResult] = useState(null) // оформленная бронь с Э4
  const [user, setUser] = useState(() => load('user', null))
  const [favs, setFavs] = useState(() => load('favs', []))
  const [sheet, setSheet] = useState(null) // 'favs' | 'login' | { picker: группа }
  const afterLogin = useRef(null)

  useEffect(() => { window.scrollTo(0, 0) }, [screen, pickedCarId])

  // Избранное — в браузере, после входа — ещё и в аккаунте
  useEffect(() => {
    save('favs', favs)
    if (!user) return
    const accounts = load('accounts', {})
    accounts[user.phone] = { bookings: [], ...accounts[user.phone], favs }
    save('accounts', accounts)
  }, [favs, user])

  const account = user ? load('accounts', {})[user.phone] ?? { favs: [], bookings: [] } : null

  const login = (u) => {
    const acc = load('accounts', {})[u.phone]
    setFavs((f) => union(acc?.favs ?? [], f))
    setUser(u)
    save('user', u)
    setSheet(null)
    afterLogin.current?.()
    afterLogin.current = null
  }
  const logout = () => { setUser(null); save('user', null); setScreen('e1') }
  const askLogin = (then) => { afterLogin.current = then; setSheet('login') }
  const toggleFav = (id) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [id, ...f]))

  const openCar = (id, from) => { setPickedCarId(id); setCameFrom(from); setScreen('e3'); setSheet(null) }
  const home = () => { setQuery(emptyQuery); setBooking(null); setResult(null); setScreen('e1') }
  const openProfile = () => (user ? setScreen('booking') : askLogin(() => setScreen('booking')))

  const saveBooking = (r) => {
    const accounts = load('accounts', {})
    const acc = accounts[r.phone] ?? { favs, bookings: [] }
    accounts[r.phone] = { ...acc, bookings: [r, ...acc.bookings.filter((b) => b.id !== r.id)] }
    save('accounts', accounts)
    setResult(r)
    setScreen('e6')
  }

  const fav = { favs, toggleFav }
  let page
  if (screen === 'booking') page = <MyBooking bookings={account?.bookings ?? (result ? [result] : [])} user={user} onLogout={logout} onHome={home} />
  else if (screen === 'e6') page = <E6 result={result} onOpenBooking={openProfile} onHome={home} />
  else if (screen === 'e4') page = (
    <E4 query={query} carId={pickedCarId} booking={booking} user={user} onLogin={login} onBack={() => setScreen('e3')} onDone={saveBooking} />
  )
  else if (screen === 'e3') page = (
    <E3 key={pickedCarId} query={query} setQuery={setQuery} carId={pickedCarId} cameFrom={cameFrom} fav={fav}
      onBack={() => setScreen(cameFrom)} onPickOther={() => setScreen('e2')} openPicker={(g) => setSheet({ picker: g })}
      onBook={(b) => { setBooking(b); setScreen('e4') }} />
  )
  else if (screen === 'e2') page = (
    <E2 query={query} setQuery={setQuery} fav={fav} onBack={() => setScreen('e1')} onPick={(id) => openCar(id, 'e2')}
      openPicker={(g) => setSheet({ picker: g })} />
  )
  else page = (
    <Landing query={query} setQuery={setQuery} fav={fav} onSubmit={() => setScreen('e2')} onPickCar={(id) => openCar(id, 'e1')}
      openPicker={(g) => setSheet({ picker: g })} />
  )

  return (
    <>
      <Header dark={screen === 'e1'} user={user} favs={favs} onHome={home} onFavs={() => setSheet(sheet === 'favs' ? null : 'favs')}
        onLogin={() => askLogin(null)} onProfile={openProfile} />
      {page}
      {sheet === 'favs' && <FavSheet query={query} fav={fav} user={user} onLogin={() => askLogin(() => setSheet('favs'))}
        onOpen={(id) => openCar(id, screen === 'e2' ? 'e2' : 'e1')} onClose={() => setSheet(null)} />}
      {sheet === 'login' && <LoginSheet onLogin={login} onClose={() => setSheet(null)} />}
      {sheet?.picker && <PlacePicker query={query} group={sheet.picker} onClose={() => setSheet(null)}
        onPick={(l) => { setQuery((q) => ({ ...q, locationId: l.id, cityId: l.city })); setSheet(null) }} />}
    </>
  )
}

/* ---------- Шапка, избранное, вход ---------- */

function Header({ dark, user, favs, onHome, onFavs, onLogin, onProfile }) {
  const shown = favs.map((id) => cars.find((c) => c.id === id)).filter(Boolean).slice(0, 3)
  return (
    <header className={`header ${dark ? 'header-dark' : ''}`}>
      <button className="logo" onClick={onHome}>Машина ждёт</button>
      <nav className="header-nav">
        <button className="header-btn" onClick={onFavs} aria-label={`Избранное: ${favs.length}`}>
          <Heart on={favs.length > 0} />
          {shown.length > 0 && <span className="fav-stack">{shown.map((c) => <span key={c.id} className="fav-mini photo-car" style={carPhoto(c)} />)}</span>}
          <span className="header-label">Избранное{favs.length > 0 && ` · ${favs.length}`}</span>
        </button>
        <button className="header-btn" onClick={user ? onProfile : onLogin}>
          <span className={`avatar ${user ? 'avatar-user' : ''}`}>{user ? user.phone.slice(-2) : '◯'}</span>
          <span className="header-label">{user ? user.phone : 'Войти'}</span>
        </button>
      </nav>
    </header>
  )
}

function Heart({ on }) {
  return (
    <svg className={`heart ${on ? 'on' : ''}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" />
    </svg>
  )
}

function FavToggle({ id, fav, className = '' }) {
  const on = fav.favs.includes(id)
  return (
    <button type="button" className={`fav-toggle ${className}`} aria-pressed={on} aria-label={on ? 'Убрать из избранного' : 'В избранное'}
      onClick={(e) => { e.stopPropagation(); fav.toggleFav(id) }}>
      <Heart on={on} />
    </button>
  )
}

function Sheet({ className = '', onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div className={`sheet ${className}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>,
    document.body
  )
}

function FavSheet({ query, fav, user, onLogin, onOpen, onClose }) {
  const list = fav.favs.map((id) => cars.find((c) => c.id === id)).filter(Boolean)
  return (
    <Sheet className="sheet-top" onClose={onClose}>
      <div className="sheet-head">
        <h2>Избранное</h2>
        <button className="icon-btn" aria-label="Закрыть" onClick={onClose}>×</button>
      </div>
      {list.length === 0 ? (
        <p className="muted">Нажмите на сердце на машине — она появится здесь, и можно будет быстро к ней вернуться.</p>
      ) : (
        <div className="fav-list">
          {list.map((c) => (
            <div key={c.id} className="fav-card" role="button" tabIndex={0} onClick={() => onOpen(c.id)}
              onKeyDown={(e) => e.key === 'Enter' && onOpen(c.id)}>
              <div className="fav-photo photo-car" style={carPhoto(c)}><FavToggle id={c.id} fav={fav} /></div>
              <div className="card-title">{c.model}</div>
              <div className="muted">{c.drive} привод · {c.gearbox} · {c.seats} мест</div>
              <div className="price">{queryReady(query) ? `${rub(rentPrice(c, query))} за ${unitsText(query)}` : `${rub(c.pricePerDay)} / сутки`}</div>
            </div>
          ))}
        </div>
      )}
      {!user && list.length > 0 && (
        <p className="muted fav-note">Избранное хранится в этом браузере. <button className="link" onClick={onLogin}>Войдите</button>, чтобы не потерять его.</p>
      )}
    </Sheet>
  )
}

function LoginSheet({ onLogin, onClose }) {
  return (
    <Sheet className="sheet-center" onClose={onClose}>
      <div className="sheet-head">
        <h2>Вход</h2>
        <button className="icon-btn" aria-label="Закрыть" onClick={onClose}>×</button>
      </div>
      <p className="muted">Чтобы найти свою бронь и сохранить избранное. Подбирать и бронировать можно и без входа.</p>
      <Login onLogin={onLogin} />
    </Sheet>
  )
}

/* ---------- Выбор места ---------- */

// Линейные иконки точек: штрих в тон тексту
const placeIcons = {
  'Аэропорт': <path d="M10.5 3.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V9l7.5 4.5v2l-7.5-2.3v4.5l2.5 1.8v1.5L12 20l-4 1v-1.5l2.5-1.8v-4.5L3 15.5v-2L10.5 9z" />,
  'Вокзал': <><rect x="5" y="3" width="14" height="13" rx="3" /><path d="M5 10h14M9 13h.01M15 13h.01M8 16l-2 4M16 16l2 4M7 19h10" /></>,
  'Отель': <><path d="M3 19V5M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6" /><circle cx="7" cy="11" r="2" /></>,
  'Парковка': <><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><path d="M10 17V7h3a3 3 0 0 1 0 6h-3" /></>,
  'Адрес': <><path d="M4 11l8-7 8 7" /><path d="M6 9.5V20h12V9.5M10 20v-5h4v5" /></>,
  'Город': <><path d="M3 21h18M5 21V8l6-3v16M11 21V10h8v11" /><path d="M8 10h.01M8 14h.01M15 14h.01M15 17h.01" /></>,
}

function PlaceIcon({ type }) {
  return (
    <svg className="place-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {placeIcons[type]}
    </svg>
  )
}

function PlacePicker({ query, group, onPick, onClose }) {
  const [cityId, setCityId] = useState(query.cityId)
  const [text, setText] = useState('')
  const groupRefs = useRef({})

  useEffect(() => {
    if (group && group !== 'all') groupRefs.current[group]?.scrollIntoView({ block: 'start' })
  }, [group])

  const t = text.trim().toLowerCase()
  const items = t ? locations.filter((l) => `${l.name} ${cities[l.city].name}`.toLowerCase().includes(t)) : locations.filter((l) => l.city === cityId)

  return (
    <Sheet className="sheet-full sheet-modal" onClose={onClose}>
      <div className="picker-head">
        <button className="icon-btn" aria-label="Назад" onClick={onClose}>←</button>
        <h2>Выберите место получения</h2>
      </div>
      <input className="picker-search" autoFocus placeholder="Аэропорт, вокзал или адрес" value={text} onChange={(e) => setText(e.target.value)} />
      {!t && <div className="picker-city">Город: <b>{cities[cityId].name}</b></div>}
      <div className="picker-list">
        {locationGroups.map((g) => {
          const list = items.filter((l) => l.type === g.type)
          if (!list.length) return null
          return (
            <div key={g.type} ref={(el) => { groupRefs.current[g.type] = el }}>
              <div className={`picker-group ${group === g.type ? 'active' : ''}`}>{g.label}</div>
              {list.map((l) => (
                <button key={l.id} className="picker-item" onClick={() => onPick(l)}>
                  <span className="picker-icon"><PlaceIcon type={g.type} /></span>
                  <span>{l.name}{t && <span className="muted"> · {cities[l.city].name}</span>}
                    <span className="picker-meet">{l.meet}</span></span>
                </button>
              ))}
            </div>
          )
        })}
        {t && !items.length && <p className="muted">Ничего не нашли. Попробуйте другой город ниже</p>}
        <div ref={(el) => { groupRefs.current.cities = el }}>
          <div className="picker-group">Россия</div>
          {Object.entries(cities).filter(([id]) => id !== cityId || t).map(([id, c]) => (
            <button key={id} className="picker-item" onClick={() => { setCityId(id); setText('') }}>
              <span className="picker-icon"><PlaceIcon type="Город" /></span><span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  )
}

/* ---------- Срок и цена ---------- */

const dayMs = 24 * 60 * 60 * 1000

function rentDays(q) {
  if (!q.dateFrom || !q.dateTo) return 1
  const from = new Date(`${q.dateFrom}T${q.timeFrom || '00:00'}`)
  const to = new Date(`${q.dateTo}T${q.timeTo || '00:00'}`)
  return Math.max(1, Math.ceil((to - from) / dayMs))
}

const isNow = (q) => q.mode === 'hours' && q.start === 'now'
const rentUnits = (q) => (q.mode === 'hours' ? { n: q.hours, unit: 'ч' } : { n: rentDays(q), unit: 'сут.' })
const unitsText = (q) => { const u = rentUnits(q); return `${u.n} ${u.unit}` }
const rentPrice = (car, q) => (q.mode === 'hours' ? car.pricePerHour * q.hours : car.pricePerDay * rentDays(q))
// Допы за сутки в почасовой аренде считаем как одни сутки
const extraCost = (x, q) => (x.per === 'day' ? x.price * (q.mode === 'hours' ? 1 : rentDays(q)) : x.price)
const tripTotal = (car, q) => rentPrice(car, q) + extras.filter((x) => q.extraIds.includes(x.id)).reduce((s, x) => s + extraCost(x, q), 0)

const fmtDate = (d) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })

function whenText(q) {
  if (q.mode === 'hours') return `${q.start === 'now' ? 'сейчас' : `сегодня с ${q.start}`}, на ${q.hours} ч`
  return q.dateFrom && q.dateTo ? `${fmtDate(q.dateFrom)} ${q.timeFrom} — ${fmtDate(q.dateTo)} ${q.timeTo}` : 'даты не выбраны'
}

function summary(q) {
  const loc = locations.find((l) => l.id === q.locationId)
  return `${loc ? loc.name : 'Где забрать?'} · ${whenText(q)}`
}

const queryReady = (q) => q.locationId && (q.mode === 'hours' || (q.dateFrom && q.dateTo && q.dateTo >= q.dateFrom))

const plural = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

// 'ok' | 'sold' — разобрали везде | 'place' — нет в этой точке
function availability(car, locationId) {
  if (car.stock === 0) return 'sold'
  if (carDetails[car.id].unavailableAt.includes(locationId)) return 'place'
  return 'ok'
}

// Ближайшие получасовые слоты сегодня — для почасовой аренды
function hourSlots() {
  const d = new Date()
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0)
  return Array.from({ length: 10 }, (_, i) => {
    const t = new Date(d.getTime() + i * 30 * 60 * 1000)
    return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
  })
}

/* ---------- Подбор ---------- */

const cityPlans = (cityId) => plans.filter((p) => (p.city ? p.city === cityId : !p.cities || p.cities.includes(cityId)))

// Оптимальная машина: подходит под самый строгий план и переключатели, из подходящих — самая выгодная
function pickCar(q, prefs = q.prefs) {
  const chosen = plans.filter((p) => q.planIds.includes(p.id))
  const lead = chosen.reduce((a, p) => (!a || p.level > a.level ? p : a), null)
  const active = prefOptions.filter((o) => prefs.includes(o.id))
  const pool = cars.filter((c) => availability(c, q.locationId) === 'ok')
  const fit = pool.filter((c) => (!lead || lead.test(c)) && active.every((o) => o.test(c))).sort((a, b) => a.pricePerDay - b.pricePerDay)
  return { car: fit[0], lead, chosen, active, count: fit.length, total: pool.length }
}

// Что изменилось при смене машины: + лучше, − хуже
function carDiff(prev, cur, q) {
  const out = []
  const dp = tripTotal(cur, q) - tripTotal(prev, q)
  if (dp) out.push({ good: dp < 0, text: `${dp > 0 ? '+' : '−'}${rub(Math.abs(dp))} за поездку` })
  if (prev.drive !== cur.drive) out.push({ good: cur.drive === 'полный', text: `${cur.drive} привод` })
  if (prev.gearbox !== cur.gearbox) out.push({ good: cur.gearbox === 'автомат', text: cur.gearbox })
  const num = (a, b, label, unit) => { const d = b - a; if (d) out.push({ good: d > 0, text: `${label} ${d > 0 ? '+' : '−'}${Math.abs(d)}${unit}` }) }
  num(prev.seats, cur.seats, 'мест', '')
  num(prev.trunk, cur.trunk, 'багажник', ' л')
  num(prev.clearance, cur.clearance, 'клиренс', ' мм')
  return out
}

/* ---------- Форма «где и когда» ---------- */

function SearchForm({ ref, query, setQuery, onSubmit, openPicker, layout = 'stack', submitLabel = 'Подобрать машину', submitDisabled, children }) {
  const [errors, setErrors] = useState({})
  const [datesOpen, setDatesOpen] = useState(false)
  const location = locations.find((l) => l.id === query.locationId)
  const set = (patch) => { setQuery((q) => ({ ...q, ...patch })); setErrors({}) }

  const submit = (e) => {
    e.preventDefault()
    const err = {}
    if (!query.locationId) err.location = 'Выберите, где забрать машину'
    if (query.mode === 'days' && (!query.dateFrom || !query.dateTo)) err.dates = 'Укажите даты'
    else if (query.mode === 'days' && query.dateTo < query.dateFrom) err.dates = 'Возврат раньше получения'
    setErrors(err)
    if (Object.keys(err).length === 0) onSubmit(query)
  }

  return (
    <form ref={ref} className={`search search-${layout}`} onSubmit={submit} noValidate>
      <div className="mode-toggle" role="tablist">
        {[['hours', 'Почасово'], ['days', 'Посуточно']].map(([m, label]) => (
          <button key={m} type="button" role="tab" aria-selected={query.mode === m}
            className={query.mode === m ? 'active' : ''} onClick={() => set({ mode: m })}>{label}</button>
        ))}
      </div>

      <div className="search-fields">
        <div className={`field field-where ${errors.location ? 'has-error' : ''}`}>
          <span className="field-label">Где забрать</span>
          <button type="button" className="field-btn" onClick={() => openPicker('all')}>
            {location ? location.name : <span className="placeholder">Аэропорт, вокзал или адрес</span>}
          </button>
          {errors.location && <div className="error">{errors.location}</div>}
        </div>

        {query.mode === 'days' ? (
          <>
            <div className={`field ${errors.dates ? 'has-error' : ''}`}>
              <span className="field-label">Получение</span>
              <button type="button" className="field-btn" onClick={() => setDatesOpen(true)}>
                {query.dateFrom ? `${fmtDay(query.dateFrom)}, ${query.timeFrom}` : <span className="placeholder">Дата и время</span>}
              </button>
              {errors.dates && <div className="error">{errors.dates}</div>}
            </div>
            <div className={`field ${errors.dates ? 'has-error' : ''}`}>
              <span className="field-label">Возврат</span>
              <button type="button" className="field-btn" onClick={() => setDatesOpen(true)}>
                {query.dateTo ? `${fmtDay(query.dateTo)}, ${query.timeTo}` : <span className="placeholder">Дата и время</span>}
              </button>
            </div>
          </>
        ) : (
          <>
            <label className="field">
              <span className="field-label">Начало</span>
              <select value={query.start} onChange={(e) => set({ start: e.target.value })}>
                <option value="now">Сейчас{location ? ` — подадим за ${location.etaMin || 5} мин` : ''}</option>
                {hourSlots().map((t) => <option key={t} value={t}>Сегодня, {t}</option>)}
              </select>
            </label>
            <label className="field">
              <span className="field-label">На сколько</span>
              <select value={query.hours} onChange={(e) => set({ hours: Number(e.target.value) })}>
                {[2, 4, 8, 12].map((h) => <option key={h} value={h}>{h} {plural(h, 'час', 'часа', 'часов')}</option>)}
              </select>
            </label>
          </>
        )}
        {layout === 'row' && <button type="submit" className="btn-primary btn-accent" disabled={submitDisabled}>{submitLabel}</button>}
      </div>

      {children}
      {layout !== 'row' && <button type="submit" className="btn-primary" disabled={submitDisabled}>{submitLabel}</button>}
      {datesOpen && <DatePicker query={query} onApply={(patch) => { set(patch); setDatesOpen(false) }} onClose={() => setDatesOpen(false)} />}
    </form>
  )
}

/* ---------- Выбор дат ---------- */

const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fmtDay = (iso) => new Date(`${iso}T00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
const timeSlots = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`)

function DatePicker({ query, onApply, onClose }) {
  const [from, setFrom] = useState(query.dateFrom)
  const [to, setTo] = useState(query.dateTo)
  const [timeFrom, setTimeFrom] = useState(query.timeFrom)
  const [timeTo, setTimeTo] = useState(query.timeTo)
  const today = isoDay(new Date())
  const now = new Date()
  const months = [0, 1, 2].map((i) => new Date(now.getFullYear(), now.getMonth() + i, 1))

  // Первый клик — начало, второй — конец; клик раньше начала начинает заново
  const pick = (d) => {
    if (!from || to || d < from) { setFrom(d); setTo('') } else setTo(d)
  }
  const days = from && to ? Math.round((new Date(to) - new Date(from)) / 864e5) : 0

  return (
    <Sheet className="sheet-dates" onClose={onClose}>
      <h2 className="dates-title">Выберите даты</h2>
      <div className="dates-times">
        <label className="dates-time"><span>Время получения</span>
          <select value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)}>{timeSlots.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
        <label className="dates-time"><span>Время возврата</span>
          <select value={timeTo} onChange={(e) => setTimeTo(e.target.value)}>{timeSlots.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
      </div>
      <div className="dates-scroll">
        {months.map((m) => {
          const lead = (m.getDay() + 6) % 7
          const count = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate()
          return (
            <div key={m.getMonth()} className="month">
              <div className="month-name">{m.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(' г.', '')}</div>
              <div className="month-grid">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((w) => <span key={w} className="wd">{w}</span>)}
                {Array.from({ length: lead }, (_, i) => <span key={`e${i}`} />)}
                {Array.from({ length: count }, (_, i) => {
                  const d = isoDay(new Date(m.getFullYear(), m.getMonth(), i + 1))
                  const edge = d === from || d === to
                  const inRange = from && to && d > from && d < to
                  const cls = ['day', d < today && 'past', d === today && 'today', inRange && 'in', edge && 'edge',
                    from && to && d === from && 'start', from && to && d === to && 'end'].filter(Boolean).join(' ')
                  return <button key={d} type="button" className={cls} disabled={d < today} onClick={() => pick(d)}>{i + 1}</button>
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="dates-foot">
        <button type="button" className="btn-secondary" onClick={onClose}>Отмена</button>
        <button type="button" className="btn-primary btn-accent" disabled={!days}
          onClick={() => onApply({ dateFrom: from, dateTo: to, timeFrom, timeTo })}>
          {days ? `Готово · ${days} ${plural(days, 'сутки', 'суток', 'суток')}` : 'Выберите возврат'}
        </button>
      </div>
    </Sheet>
  )
}

/* ---------- Э1 Лендинг ---------- */


function Landing({ query, setQuery, fav, onSubmit, onPickCar, openPicker }) {
  const formRef = useRef(null)
  const plansRef = useRef(null)
  const [formVisible, setFormVisible] = useState(true)
  const city = cities[query.cityId]

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setFormVisible(e.isIntersecting))
    io.observe(formRef.current)
    return () => io.disconnect()
  }, [])

  const scrollToForm = () => formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const scrollToPlans = () => plansRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })

  // Допы выбранных планов кладём в запрос — их можно снять на Э3
  const submit = () => {
    setQuery((q) => ({ ...q, extraIds: union(q.extraIds, plans.filter((p) => q.planIds.includes(p.id)).flatMap((p) => p.extraIds ?? [])) }))
    onSubmit()
  }
  const submitFromBelow = () => { scrollToForm(); formRef.current.requestSubmit() }

  return (
    <main className="landing">
      <section className="hero">
        <div className="hero-bg" style={{ '--hero-d': `url(${import.meta.env.BASE_URL}hero/d.webp)`, '--hero-m': `url(${import.meta.env.BASE_URL}hero/m.webp)` }} />
        <div className="hero-inner">
          <h1 className="hero-title">Расскажите, что в планах, — подберём лучшую машину для твоей цели</h1>
          <SearchForm ref={formRef} layout="row" query={query} setQuery={setQuery} onSubmit={submit} openPicker={openPicker} />
        </div>
      </section>

      <Plans ref={plansRef} query={query} setQuery={setQuery} onSubmit={submitFromBelow} />
      <Manifest onGoal={scrollToPlans} />
      <Park query={query} setQuery={setQuery} fav={fav} onPickCar={onPickCar} onSubmit={scrollToForm} />
      <WhereYouAre openPicker={openPicker} />

      <section className="section">
        <h2>Что мы обещаем</h2>
        <div className="promises">
          {promises.map((p, i) => (
            <div key={p.title} className="promise"><span className="promise-n">0{i + 1}</span><b>{p.title}</b><p>{p.text}</p></div>
          ))}
        </div>
      </section>

      <section className="section faq">
        <h2>Вопросы, которые нам задают</h2>
        {faq.map((f) => (
          <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
        ))}
      </section>

      {!formVisible && (
        <div className="sticky-cta">
          <button className="btn-primary" onClick={scrollToForm}>Подобрать машину</button>
        </div>
      )}
    </main>
  )
}

function CitySelect({ query, setQuery }) {
  const change = (cityId) => setQuery((q) => ({
    ...q, cityId,
    locationId: locations.find((l) => l.id === q.locationId)?.city === cityId ? q.locationId : '',
    planIds: q.planIds.filter((id) => cityPlans(cityId).some((p) => p.id === id)),
  }))
  return (
    <span className="city-select">
      <select value={query.cityId} onChange={(e) => change(e.target.value)} aria-label="Город">
        {Object.entries(cities).map(([id, c]) => <option key={id} value={id}>{c.name}</option>)}
      </select>
      <span aria-hidden="true">▾</span>
    </span>
  )
}

function Plans({ ref, query, setQuery, onSubmit }) {
  const list = cityPlans(query.cityId)
  const toggle = (id) => setQuery((q) => ({ ...q, planIds: q.planIds.includes(id) ? q.planIds.filter((x) => x !== id) : [...q.planIds, id] }))
  const card = (p) => {
    const on = query.planIds.includes(p.id)
    return (
      <button key={p.id} type="button" className={`plan ${on ? 'on' : ''} ${p.local ? 'plan-local' : ''}`} aria-pressed={on} onClick={() => toggle(p.id)}>
        {p.local && <span className="plan-badge">вы могли не знать</span>}
        <span className="plan-label">{p.label}</span>
        <span className="plan-hint">{p.hint}</span>
      </button>
    )
  }
  return (
    <section ref={ref} className="section plans-section">
      <h2 className="plans-title">Какие планы <CitySelect query={query} setQuery={setQuery} />?</h2>
      <p className="muted">Выберите одну или несколько целей — подберём машину под самую требовательную</p>
      <div className="plans">{list.filter((p) => !p.local).map(card)}</div>
      <h3 className="plans-sub">Только {cities[query.cityId].in}</h3>
      <div className="plans">{list.filter((p) => p.local).map(card)}</div>
      <button className="btn-primary plans-go" onClick={onSubmit}>
        {query.planIds.length ? `Подобрать под ${query.planIds.length} ${plural(query.planIds.length, 'цель', 'цели', 'целей')}` : 'Подобрать машину'}
      </button>
    </section>
  )
}

function Manifest({ onGoal }) {
  return (
    <section className="manifest">
      <p className="manifest-kicker">Почему у нас нет каталога</p>
      <h2 className="manifest-title">Это не маркетплейс.</h2>
      <p className="manifest-text">
        Не трать вечер на 50 вкладок и сравнение Changan с Haval. Назови цель — мы подберём одну машину и объясним, почему она.
        Не подошла — переключи, что важнее, и увидишь, что стало лучше, а что хуже.
      </p>
      <p className="manifest-punch">С тебя цель. С нас машина.</p>
      <ol className="manifest-steps">
        <li><span>01</span><b>Цель</b>Горы, море, дача, Карелия — что угодно, не марка</li>
        <li><span>02</span><b>Подбор с объяснением</b>Серпантин → клиренс. Восемь чемоданов → багажник от 560 л</li>
        <li><span>03</span><b>Машина ждёт</b>Там, где ты, с допами уже внутри</li>
      </ol>
      <button className="btn-secondary btn-on-dark" onClick={onGoal}>Назвать цель</button>
    </section>
  )
}

function Park({ query, setQuery, fav, onPickCar, onSubmit }) {
  const tabs = scenarios.filter((s) => s.carIds)
  const [tab, setTab] = useState(tabs[0].id)
  const ids = tabs.find((t) => t.id === tab).carIds
  const list = cars.filter((c) => ids.includes(c.id)).sort((a, b) => a.pricePerDay - b.pricePerDay)
  const three = list.length <= 3 ? list : [list[0], list[Math.floor(list.length / 2)], list[list.length - 1]]
  return (
    <section className="section park">
      <h2>Какие машины в парке</h2>
      <div className="scenarios" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`scenario ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="park-grid">
        {three.map((c) => (
          <div key={c.id} className="park-card" role="button" tabIndex={0} onClick={() => onPickCar(c.id)} onKeyDown={(e) => e.key === 'Enter' && onPickCar(c.id)}>
            <div className="park-photo photo-car" style={carPhoto(c, 'lg')}><FavToggle id={c.id} fav={fav} /></div>
            <div className="park-body">
              <span>{c.model}</span>
              <span className="muted">от {rub(c.pricePerDay)}/сутки</span>
            </div>
          </div>
        ))}
      </div>
      <div className="park-foot">
        <span>Машины <CitySelect query={query} setQuery={setQuery} /></span>
        <button className="btn-primary" onClick={onSubmit}>Подобрать {cities[query.cityId].in}</button>
      </div>
    </section>
  )
}

const whereCopy = {
  'Адрес': 'Подгоним к подъезду, вернуть можно там же',
  'Аэропорт': 'Ждём на парковке у терминала с табличкой',
  'Вокзал': 'Парковка у главного входа, пять минут пешком',
  'Отель': 'Подгоним ко входу и договоримся о парковке',
  'Парковка': 'Наш центр проката — заберите сами, когда удобно',
}

function WhereYouAre({ openPicker }) {
  const order = ['Адрес', 'Аэропорт', 'Вокзал', 'Отель', 'Парковка']
  return (
    <section className="section where">
      <h2>Машина там, где ты</h2>
      <p className="muted">Выберите, где удобнее забрать — покажем точки в вашем городе и точное место встречи</p>
      <div className="where-grid">
        {order.map((type) => {
          const g = locationGroups.find((x) => x.type === type)
          return (
            <button key={type} className="where-tile" onClick={() => openPicker(type)}>
              <span className="where-icon"><PlaceIcon type={g.type} /></span>
              <b>{g.label}</b>
              <span className="muted">{whereCopy[type]}</span>
              <span className="where-go">Выбрать точку →</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

/* ---------- Э2 Одна машина + переключатели ---------- */

function E2({ query, setQuery, fav, onBack, onPick, openPicker }) {
  const [editing, setEditing] = useState(false)
  const [prev, setPrev] = useState(null) // машина до последнего переключения
  const res = pickCar(query)
  const { car, lead, chosen, active } = res
  const location = locations.find((l) => l.id === query.locationId)

  const change = (patch) => {
    if (car) setPrev(car)
    setQuery((q) => ({ ...q, ...patch }))
  }
  const togglePref = (id) => change({ prefs: query.prefs.includes(id) ? query.prefs.filter((x) => x !== id) : [...query.prefs, id] })
  const togglePlan = (id) => change({ planIds: query.planIds.includes(id) ? query.planIds.filter((x) => x !== id) : [...query.planIds, id] })

  const reasons = []
  if (lead) reasons.push(<><b>{lead.label}</b> → {lead.hint.toLowerCase()}</>)
  else reasons.push(<>Цель не указана — берём просто самую выгодную машину</>)
  const others = chosen.filter((p) => p !== lead)
  if (others.length) reasons.push(<>Ещё учли: {others.map((p) => p.label.toLowerCase()).join(', ')} — допы для них уже в брони</>)
  active.forEach((o) => reasons.push(<>Вы попросили: <b>{o.label.toLowerCase()}</b></>))
  if (car) reasons.push(<>Подходят {res.count} из {res.total} машин — взяли самую выгодную</>)

  const diff = prev && car && prev.id !== car.id ? carDiff(prev, car, query) : null
  // Что даст каждый переключатель — до нажатия
  const preview = (o) => {
    const next = query.prefs.includes(o.id) ? query.prefs.filter((x) => x !== o.id) : [...query.prefs, o.id]
    const r = pickCar(query, next)
    if (!r.car) return { off: true, text: 'нет машин' }
    if (!car || r.car.id === car.id) return { text: 'та же машина' }
    const d = tripTotal(r.car, query) - tripTotal(car, query)
    return { text: d ? `${d > 0 ? '+' : '−'}${rub(Math.abs(d))}` : 'та же цена' }
  }
  const fixes = !car ? active.filter((o) => pickCar(query, query.prefs.filter((x) => x !== o.id)).car) : []

  return (
    <main className="e2">
      <div className="e2-top">
        <button className="link-back" onClick={onBack}>← На главную</button>
        <div className="summary">
          <span className="summary-text">{summary(query)}</span>
          <button className="btn-secondary btn-sm" onClick={() => setEditing((v) => !v)}>{editing ? 'Закрыть' : 'Изменить'}</button>
        </div>
        {editing && (
          <div className="e2-edit">
            <SearchForm query={query} setQuery={(f) => change(typeof f === 'function' ? f(query) : f)} openPicker={openPicker}
              onSubmit={() => setEditing(false)} submitLabel="Пересобрать подбор" />
          </div>
        )}
        <div className="plan-chips">
          <span className="muted">Цели:</span>
          {cityPlans(location?.city ?? query.cityId).map((p) => (
            <button key={p.id} className={`filter ${query.planIds.includes(p.id) ? 'active' : ''}`} aria-pressed={query.planIds.includes(p.id)}
              onClick={() => togglePlan(p.id)}>{p.label}</button>
          ))}
        </div>
      </div>

      <div className="e2-layout">
        <div className="e2-main">
          {diff && (
            <div className="diff" key={`diff-${car.id}`}>
              <span className="diff-title">Вместо {prev.model}:</span>
              {diff.map((d) => <span key={d.text} className={`diff-item ${d.good ? 'good' : 'bad'}`}>{d.good ? '▲' : '▼'} {d.text}</span>)}
              {query.prefs.length > 0 && <button className="link" onClick={() => change({ prefs: [] })}>Сбросить переключатели</button>}
            </div>
          )}

          {car ? (
            <div className="pick-card" key={car.id}>
              <div className="pick-photo photo-car" style={carPhoto(car, 'lg')}>
                <span className="badge">Подобрали для вас</span>
                <FavToggle id={car.id} fav={fav} />
              </div>
              <div className="pick-body">
                <div>
                  <div className="muted">{car.kind}</div>
                  <h1 className="pick-title">{car.model}</h1>
                </div>
                <dl className="pick-specs">
                  {[['Привод', car.drive], ['Коробка', car.gearbox], ['Мест', car.seats], ['Багажник', `${car.trunk} л`], ['Клиренс', `${car.clearance} мм`], ['Мотор', car.engine]]
                    .map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                </dl>
                <div className="pick-foot">
                  <div>
                    <div className="price-big">{rub(tripTotal(car, query))}</div>
                    <div className="muted">за {unitsText(query)}{query.extraIds.length ? ', с допами' : ''}{isNow(query) && location ? ` · подадим через ${location.etaMin + car.etaAdd} мин` : ''}</div>
                  </div>
                  <button className="btn-primary" onClick={() => onPick(car.id)}>Оформить</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty">
              <h2>Под всё сразу машины нет</h2>
              {fixes.length > 0 ? (
                <div className="avail-options">
                  {fixes.map((o) => <button key={o.id} className="btn-secondary btn-sm" onClick={() => togglePref(o.id)}>Выключить «{o.label}»</button>)}
                </div>
              ) : (
                <button className="btn-secondary" onClick={() => change({ prefs: [], planIds: [] })}>Сбросить цели и переключатели</button>
              )}
            </div>
          )}
        </div>

        <aside className="e2-aside">
          <div className="why">
            <div className="why-title">Что учли</div>
            <ul className="why-list">{reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </div>
          <div className="switches">
            <div className="why-title">Здесь мне важнее</div>
            {prefOptions.map((o) => {
              const on = query.prefs.includes(o.id)
              const p = preview(o)
              return (
                <button key={o.id} className={`switch ${on ? 'on' : ''}`} aria-pressed={on} disabled={p.off && !on} onClick={() => togglePref(o.id)}>
                  <span className="switch-knob" />
                  <span className="switch-label">{o.label}</span>
                  <span className="switch-delta">{on ? 'вкл' : p.text}</span>
                </button>
              )
            })}
          </div>
        </aside>
      </div>
    </main>
  )
}

/* ---------- Э3 Машина, допы, калькулятор ---------- */

function E3({ query, setQuery, carId, cameFrom, fav, onBack, onPickOther, openPicker, onBook }) {
  const car = cars.find((c) => c.id === carId)
  const d = carDetails[car.id]
  const location = locations.find((l) => l.id === query.locationId)
  const city = cities[location?.city ?? query.cityId]
  const widgetRef = useRef(null)

  const ready = queryReady(query)
  const status = ready ? availability(car, query.locationId) : null
  const chosen = extras.filter((x) => query.extraIds.includes(x.id))
  const total = tripTotal(car, query)
  const hasDelivery = query.extraIds.includes('delivery')

  const placesHere = locations.filter((l) => l.city === (location?.city ?? query.cityId) && l.id !== query.locationId && !d.unavailableAt.includes(l.id))

  const toggle = (id) => setQuery((q) => ({ ...q, extraIds: q.extraIds.includes(id) ? q.extraIds.filter((x) => x !== id) : [...q.extraIds, id] }))
  const scrollToWidget = () => widgetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const perLabel = (x) => (x.price === 0 ? 'бесплатно' : `${rub(x.price)}${x.per === 'day' ? ' / сутки' : ''}`)
  const book = () => onBook({ total })

  // Резину показываем только в межсезонье
  const month = new Date(query.dateFrom || Date.now()).getMonth() + 1
  const offSeason = [3, 4, 10, 11].includes(month)

  const specs = [
    ['Двигатель', car.engine], ['Коробка', car.gearbox], ['Топливо', car.fuelType], ['Расход', d.fuel],
    ['Запас хода', d.range], ['Клиренс', d.clearance], ['Багаж', d.bags], ['Привод', car.drive], ['Мест', car.seats],
    ...(offSeason ? [['Резина', d.winter ? 'уже зимняя, шипы' : 'летняя']] : []),
  ]

  return (
    <main className="e3">
      <button className="link-back" onClick={onBack}>← {cameFrom === 'e2' ? 'Сменить машину — допы сохранятся' : 'На главную'}</button>

      <div className="e3-layout">
        <div className="e3-main">
          <div className="e3-head">
            <div className="muted">{car.kind}</div>
            <div className="e3-title"><h1>{car.model}</h1><FavToggle id={car.id} fav={fav} className="fav-inline" /></div>
            <div className="tags">
              {car.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              {car.stock > 0 && <span className="badge badge-hot">{car.stock === 1 ? 'Осталась 1' : `Осталось ${car.stock}`}</span>}
              {car.stock === 0 && <span className="badge badge-muted">Разобрали</span>}
            </div>
          </div>
          <div className="e3-photo photo-car" style={carPhoto(car, 'lg')} />

          <section className="e3-section">
            <h2>Для поездки</h2>
            <dl className="specs">{specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </section>

          <section className="e3-section">
            <h2>Подходит для маршрутов</h2>
            <div className="routes">{(city.routes ?? d.routes).map((r) => <span key={r} className="route">{r}</span>)}</div>
          </section>

          <section className="e3-section">
            <h2>Как получите машину</h2>
            <ol className="steps">
              <li><b>{location ? location.name : 'Выберите точку получения'}</b>
                <span>{location ? (hasDelivery && query.address ? `Привезём по адресу: ${query.address}` : location.meet) : 'аэропорт, вокзал, отель, парковка или к дому'}
                  {location && isNow(query) ? ` — подадим через ${location.etaMin + car.etaAdd} мин` : ''}</span></li>
              <li><b>Встречает сотрудник — 10 минут</b>
                <span>Вместе обходите машину и фотографируете её — акт с фото приходит в телефон, так старые царапины не станут вашими. Показываем, как работают допы, и отдаём ключи</span></li>
              <li><b>Сразу в путь</b><span>Бак полный, допы уже в машине, маршрут — в навигаторе</span></li>
            </ol>
          </section>

          <section className="e3-section">
            <h2>Как вернуть</h2>
            <dl className="terms">
              <dt>Куда</dt><dd>{city.dropoff}</dd>
              <dt>Топливо</dt><dd>{rentTerms.fuel}</dd>
              <dt>Залог</dt><dd>{rub(d.deposit)} — снимаем блокировку с карты в день возврата, после осмотра по тем же фото</dd>
            </dl>
          </section>

          <section className="e3-section">
            <h2>Условия</h2>
            <dl className="terms">
              <dt>Пробег</dt><dd>{query.extraIds.includes('unlimited') ? 'Без ограничений — безлимит в вашем расчёте' : `${rentTerms.mileage}. Или возьмите безлимит в расчёте справа`}</dd>
              <dt>Водитель</dt><dd>{rentTerms.driver}</dd>
              <dt>Куда можно</dt><dd>{city.regions}</dd>
              <dt>Страховка</dt><dd>{rentTerms.insurance}</dd>
            </dl>
          </section>

          {[['car', 'Допы к машине'], ['trip', 'В машину для поездки']].map(([g, title]) => (
            <section key={g} className="e3-section">
              <h2>{title}</h2>
              <div className="extras">
                {extras.filter((x) => x.group === g).map((x) => (
                  <label key={x.id} className={`extra ${query.extraIds.includes(x.id) ? 'on' : ''}`}>
                    <input type="checkbox" checked={query.extraIds.includes(x.id)} onChange={() => toggle(x.id)} />
                    <span className="extra-name">{x.name}{x.note && <span className="muted"> · {x.note}</span>}</span>
                    <span className="extra-price">{perLabel(x)}</span>
                  </label>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="e3-aside" ref={widgetRef}>
          <div className="price-big">{query.mode === 'hours' ? `${rub(car.pricePerHour)} ` : `${rub(car.pricePerDay)} `}
            <span className="muted">/ {query.mode === 'hours' ? 'час' : 'сутки'}</span></div>
          <SearchForm query={query} setQuery={setQuery} openPicker={openPicker} submitLabel={ready ? 'Забронировать' : 'Проверить наличие'}
            submitDisabled={status === 'sold' || status === 'place'} onSubmit={() => status === 'ok' && book()}>
            {status === 'ok' && (
              <div className="avail ok">✓ Свободна{isNow(query) ? `, подадим через ${location.etaMin + car.etaAdd} мин` : ''}</div>
            )}
            {status === 'place' && (
              <div className="avail no">
                <div>В точке «{location.name}» этой машины нет. Можно забрать здесь:</div>
                <div className="avail-options">
                  {placesHere.map((l) => (
                    <button type="button" key={l.id} className="filter" onClick={() => setQuery((q) => ({ ...q, locationId: l.id }))}>{l.name}</button>
                  ))}
                </div>
              </div>
            )}
            {status === 'sold' && <div className="avail no">Эту машину разобрали</div>}

            <div className="calc-options">
              {extras.filter((x) => x.group === 'calc').map((x) => (
                <label key={x.id} className={`extra ${query.extraIds.includes(x.id) ? 'on' : ''}`}>
                  <input type="checkbox" checked={query.extraIds.includes(x.id)} onChange={() => toggle(x.id)} />
                  <span className="extra-name">{x.name}</span>
                  <span className="extra-price">{perLabel(x)}</span>
                </label>
              ))}
              {hasDelivery && (
                <input className="calc-address" placeholder="Улица, дом — привезём сюда" value={query.address}
                  onChange={(e) => setQuery((q) => ({ ...q, address: e.target.value }))} />
              )}
            </div>

            {status === 'ok' && (
              <dl className="bill">
                <dt>Аренда, {unitsText(query)}</dt><dd>{rub(rentPrice(car, query))}</dd>
                {chosen.map((x) => <Fragment key={x.id}><dt>{x.name}</dt><dd>{rub(extraCost(x, query))}</dd></Fragment>)}
                <dt className="bill-total">Итого</dt><dd className="bill-total">{rub(total)}</dd>
                <dt className="muted">Залог, вернём</dt><dd className="muted">{rub(d.deposit)}</dd>
              </dl>
            )}
          </SearchForm>

          {(status === 'sold' || status === 'place') && (
            <button className="btn-secondary" onClick={onPickOther}>Подобрать другую — допы сохранятся</button>
          )}
        </aside>
      </div>

      <div className="e3-bar">
        <div>
          <div className="price">{status === 'ok' ? rub(total) : `${rub(car.pricePerDay)} / сутки`}</div>
          <div className="muted">{status === 'ok' ? `за ${unitsText(query)}, с допами` : status ? 'недоступна' : 'укажите, где и когда'}</div>
        </div>
        <button className="btn-primary" onClick={status === 'ok' ? book : scrollToWidget}>{status === 'ok' ? 'Забронировать' : 'Где и когда'}</button>
      </div>
    </main>
  )
}

/* ---------- Э4 Оформление и оплата ---------- */

const banks = ['Сбер', 'Т-Банк', 'Альфа-Банк', 'ВТБ', 'Точка']
const bankClient = { phone: '+7 999 123-45-67', name: 'Иван Петров', birth: '12.04.1990' }
const scannedLicense = { name: 'Иван Петров', birth: '12.04.1990', license: '99 12 345678', issued: '03.2015' }
const HOLD_SEC = 600

const fmtPhone = (digits) => {
  const d = digits.padEnd(10, '_')
  return `+7 ${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`
}
const yearsSince = (month, year, day = 1) => {
  const now = new Date()
  let y = now.getFullYear() - year
  if (now.getMonth() + 1 < month || (now.getMonth() + 1 === month && now.getDate() < day)) y -= 1
  return y
}

// Сумма брони — одна для Э4 и Э6
function bookingTotals(query, car, booking) {
  const chosen = extras.filter((x) => query.extraIds.includes(x.id))
  const payNow = isNow(query) ? booking.total : Math.round(booking.total * 0.2)
  return { chosen, rent: rentPrice(car, query), payNow, rest: booking.total - payNow, deposit: carDetails[car.id].deposit }
}

function Step({ n, title, active, done, summary: doneText, onEdit, children }) {
  return (
    <section className={`step ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
      <div className="step-head">
        <span className="step-n">{done ? '✓' : n}</span>
        <div className="step-title">{title}{done && !active && <div className="muted">{doneText}</div>}</div>
        {done && !active && onEdit && <button type="button" className="link-back" onClick={onEdit}>Изменить</button>}
      </div>
      {active && <div className="step-body">{children}</div>}
    </section>
  )
}

function E4({ query, carId, booking, user, onLogin, onBack, onDone }) {
  const car = cars.find((c) => c.id === carId)
  const location = locations.find((l) => l.id === query.locationId)
  const t = bookingTotals(query, car, booking)
  const needDriver2 = query.extraIds.includes('driver2')
  const now = isNow(query)

  // Уже вошли из шапки — сразу к водителю
  const [step, setStep] = useState(user ? 'driver' : 'login') // 'login' | 'driver' | 'pay'
  const [driver, setDriver] = useState({ name: user?.viaBank ? bankClient.name : '', birth: user?.viaBank ? bankClient.birth : '', license: '', issued: '', fromBank: !!user?.viaBank })
  const [driverOk, setDriverOk] = useState(false)
  const [driver2, setDriver2] = useState(false)
  const [payMethod, setPayMethod] = useState('card')
  const [paying, setPaying] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)

  // «Сейчас»: машина закреплена 10 минут
  const [left, setLeft] = useState(HOLD_SEC)
  const [expired, setExpired] = useState(false)
  useEffect(() => {
    if (!now) return
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [now])
  useEffect(() => {
    if (!now || left > 0) return
    setExpired(true)
    const id = setTimeout(() => { setExpired(false); setLeft(HOLD_SEC) }, 1000)
    return () => clearTimeout(id)
  }, [left, now])

  const login = (u) => {
    onLogin(u)
    if (u.viaBank) setDriver((d) => ({ ...d, name: bankClient.name, birth: bankClient.birth, fromBank: true }))
    setStep(driverOk ? 'pay' : 'driver')
  }

  const pay = () => {
    setPaying(true)
    setTimeout(() => onDone({
      id: Math.random().toString(36).slice(2, 6).toUpperCase(), phone: user.phone, name: driver.name, carId, query, extraIds: query.extraIds,
      total: booking.total, paidNow: t.payNow, rest: t.rest, deposit: t.deposit,
    }), 1500)
  }

  const ready = user && driverOk
  const payLabel = paying ? 'Оплачиваем…' : `Оплатить ${rub(t.payNow)} и забронировать`
  const when = now ? `подадим через ${location.etaMin + car.etaAdd} мин после оплаты` : whenText(query)
  const mm = String(Math.floor(left / 60)), ss = String(left % 60).padStart(2, '0')

  const bookingCard = (
    <div className="e4-booking">
      <div className="e4-car">
        <span className="similar-photo photo-car" style={carPhoto(car)} />
        <div><b>{car.model}</b><div className="muted">{location.name}</div><div className="muted">{when}</div></div>
      </div>
      <dl className="bill">
        <dt>Аренда, {unitsText(query)}</dt><dd>{rub(t.rent)}</dd>
        {t.chosen.map((x) => <Fragment key={x.id}><dt>{x.name}</dt><dd>{rub(extraCost(x, query))}</dd></Fragment>)}
        <dt className="bill-total">Итого</dt><dd className="bill-total">{rub(booking.total)}</dd>
        <dt className="muted">Залог, вернём</dt><dd className="muted">{rub(t.deposit)}</dd>
      </dl>
      <button type="button" className="link-back" onClick={onBack}>Изменить</button>
    </div>
  )

  return (
    <main className="e3 e4">
      <button className="link-back" onClick={onBack}>← Назад к машине</button>

      {now && (
        <div className={`hold ${expired ? 'expired' : ''}`}>
          {expired ? 'Время вышло — проверяем машину заново' : `Машина закреплена за вами ещё ${mm}:${ss}`}
        </div>
      )}

      <button type="button" className="e4-summary-line" onClick={() => setSummaryOpen((v) => !v)}>
        <span>{car.model} · {now ? 'сейчас' : whenText(query)} · {rub(booking.total)}</span>
        <span>{summaryOpen ? '▴' : '▾'}</span>
      </button>
      {summaryOpen && <div className="e4-summary-body">{bookingCard}</div>}

      <div className="e3-layout">
        <div className="e4-form">
          <h1>Оформление</h1>

          <Step n={1} title="Вход" active={step === 'login'} done={!!user}
            summary={`${user?.phone ?? ''}${user?.viaBank ? ' · через банк' : ''} — бронь появится в «Моей брони»`} onEdit={() => setStep('login')}>
            <p className="muted">Номер нужен, чтобы прислать SMS «Машина ждёт» и чтобы вы нашли бронь в «Моей брони».</p>
            <Login onLogin={login} />
          </Step>

          <Step n={2} title="Водитель" active={step === 'driver'} done={driverOk}
            summary={`${driver.name} · права проверены`} onEdit={user ? () => setStep('driver') : null}>
            <Driver driver={driver} setDriver={setDriver} needDriver2={needDriver2} driver2={driver2} setDriver2={setDriver2}
              onOk={() => { setDriverOk(true); setStep('pay') }} />
          </Step>

          <Step n={3} title="Оплата" active={step === 'pay'} done={false}>
            <dl className="bill pay-split">
              {now ? (
                <><dt>Сейчас — вся аренда</dt><dd>{rub(t.payNow)}</dd></>
              ) : (
                <><dt>Сейчас — предоплата 20%</dt><dd>{rub(t.payNow)}</dd>
                  <dt>При получении — остаток</dt><dd>{rub(t.rest)}</dd></>
              )}
            </dl>
            <p className="muted">Залог {rub(t.deposit)} заблокируем на карте при получении — это не списание.</p>
            <div className="mode-toggle pay-methods">
              <button type="button" className={payMethod === 'card' ? 'active' : ''} onClick={() => setPayMethod('card')}>Картой</button>
              <button type="button" className={payMethod === 'sbp' ? 'active' : ''} onClick={() => setPayMethod('sbp')}>СБП</button>
            </div>
            <p className="muted">Бесплатная отмена за 24 часа до подачи.</p>
          </Step>

          <button className="btn-primary e4-pay" disabled={!ready || paying} onClick={pay}>{payLabel}</button>
          {!ready && <p className="muted">Войдите и добавьте права, чтобы оплатить</p>}
        </div>

        <aside className="e3-aside e4-aside">{bookingCard}</aside>
      </div>

      <div className="e3-bar">
        <div>
          <div className="price">{rub(t.payNow)}</div>
          <div className="muted">{now ? 'вся аренда' : 'предоплата 20%'}</div>
        </div>
        <button className="btn-primary" disabled={!ready || paying} onClick={pay}>{paying ? 'Оплачиваем…' : 'Оплатить'}</button>
      </div>
    </main>
  )
}

function Login({ onLogin }) {
  const [way, setWay] = useState('sms') // 'sms' | 'bank'
  const [digits, setDigits] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [code, setCode] = useState('')
  const [resend, setResend] = useState(0)
  const [error, setError] = useState('')
  const [bankLoading, setBankLoading] = useState(null)

  useEffect(() => {
    if (resend <= 0) return
    const id = setTimeout(() => setResend((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [resend])

  const onPhone = (e) => {
    let d = e.target.value.replace(/\D/g, '')
    if (d.startsWith('7') || d.startsWith('8')) d = d.slice(1)
    setDigits(d.slice(0, 10))
    setError('')
  }
  const sendCode = () => {
    if (digits.length < 10) { setError('Введите номер полностью'); return }
    setCodeSent(true); setResend(59)
  }
  const onCode = (e) => {
    const c = e.target.value.replace(/\D/g, '').slice(0, 4)
    setCode(c)
    if (c.length === 4) onLogin({ phone: fmtPhone(digits), viaBank: false })
  }
  const viaBank = (b) => {
    setBankLoading(b)
    setTimeout(() => onLogin({ phone: bankClient.phone, viaBank: true, bank: b }), 1000)
  }

  return (
    <div className="login">
      <div className="mode-toggle">
        <button type="button" className={way === 'sms' ? 'active' : ''} onClick={() => setWay('sms')}>По SMS</button>
        <button type="button" className={way === 'bank' ? 'active' : ''} onClick={() => setWay('bank')}>Через банк</button>
      </div>

      {way === 'sms' ? (
        <>
          <div className={`field ${error ? 'has-error' : ''}`}>
            <label htmlFor="phone">Телефон</label>
            <input id="phone" inputMode="tel" placeholder="+7 ___ ___-__-__" value={digits ? fmtPhone(digits).replace(/[_ -]+$/, '') : ''}
              onChange={onPhone} disabled={codeSent} />
            {error && <div className="error">{error}</div>}
          </div>
          {!codeSent ? (
            <button type="button" className="btn-primary" onClick={sendCode}>Получить код</button>
          ) : (
            <div className="field">
              <label htmlFor="code">Код из SMS</label>
              <input id="code" inputMode="numeric" autoFocus placeholder="4 цифры, подойдёт любой" value={code} onChange={onCode} />
              <div className="muted">
                {resend > 0 ? `Отправить ещё раз через 0:${String(resend).padStart(2, '0')}` :
                  <button type="button" className="link-back" onClick={() => setResend(59)}>Отправить ещё раз</button>}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="muted">Банк передаст имя и дату рождения — не придётся вводить вручную.</p>
          <div className="banks">
            {banks.map((b) => (
              <button type="button" key={b} className="btn-secondary" disabled={!!bankLoading} onClick={() => viaBank(b)}>
                {bankLoading === b ? 'Входим…' : b}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Driver({ driver, setDriver, needDriver2, driver2, setDriver2, onOk }) {
  const [scanning, setScanning] = useState(false)
  const [manual, setManual] = useState(false)
  const [errors, setErrors] = useState({})
  const [checked, setChecked] = useState(false)

  const set = (patch) => { setDriver((d) => ({ ...d, ...patch })); setErrors({}); setChecked(false) }

  const scan = () => {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      // Каскад: поля заполняются по очереди
      const keys = driver.fromBank ? ['license', 'issued'] : ['name', 'birth', 'license', 'issued']
      keys.forEach((k, i) => setTimeout(() => setDriver((d) => ({ ...d, [k]: scannedLicense[k] })), i * 250))
      setTimeout(() => { setChecked(true); if (!needDriver2) setTimeout(onOk, 600) }, keys.length * 250)
    }, 1500)
  }

  const validate = () => {
    const err = {}
    const [bd, bm, by] = driver.birth.split('.').map(Number)
    const [im, iy] = driver.issued.split('.').map(Number)
    if (!driver.name.trim()) err.name = 'Укажите имя и фамилию'
    if (!by || !bm || !bd) err.birth = 'Дата в формате ДД.ММ.ГГГГ'
    else if (yearsSince(bm, by, bd) < 21) err.birth = 'Арендовать можно с 21 года'
    if (driver.license.replace(/\D/g, '').length !== 10) err.license = 'Номер ВУ — 10 цифр'
    if (!iy || !im) err.issued = 'Месяц и год в формате ММ.ГГГГ'
    else if (yearsSince(im, iy) < 2) err.issued = 'Для этой машины нужен стаж от 2 лет'
    setErrors(err)
    if (Object.keys(err).length === 0) onOk()
  }

  const showFields = manual || checked || driver.license || driver.fromBank
  const stage = driver.issued ? yearsSince(...driver.issued.split('.').map(Number)) : 0
  const fields = [
    ['name', 'Имя и фамилия', 'Иван Петров'],
    ['birth', 'Дата рождения', 'ДД.ММ.ГГГГ'],
    ['license', 'Водительское удостоверение', '99 12 345678'],
    ['issued', 'Выдано', 'ММ.ГГГГ'],
  ]

  return (
    <div className="driver">
      {scanning ? (
        <div className="scan"><div className="scan-frame"><div className="scan-line" /></div><div className="muted">Наведите камеру на права</div></div>
      ) : !checked && (
        <>
          <button type="button" className="btn-primary" onClick={scan}>Сфотографировать ВУ</button>
          {!manual && <button type="button" className="link-back" onClick={() => setManual(true)}>Ввести вручную</button>}
        </>
      )}

      {checked && <div className="avail ok">✓ Права проверены, стаж {stage} {plural(stage, 'год', 'года', 'лет')}</div>}

      {showFields && !scanning && (
        <div className="driver-fields">
          {fields.map(([k, label, ph]) => (
            <div key={k} className={`field ${errors[k] ? 'has-error' : ''}`}>
              <label htmlFor={k}>{label}{driver.fromBank && (k === 'name' || k === 'birth') && <span className="from-bank">из банка</span>}</label>
              <input id={k} placeholder={ph} value={driver[k]} onChange={(e) => set({ [k]: e.target.value })} />
              {errors[k] && <div className="error">{errors[k]}</div>}
            </div>
          ))}
        </div>
      )}

      {needDriver2 && (
        <label className="extra"><input type="checkbox" checked={driver2} onChange={(e) => setDriver2(e.target.checked)} />
          <span className="extra-name">Добавить второго водителя<span className="muted"> · права сфотографируем при получении</span></span></label>
      )}

      {showFields && !scanning && (checked ? needDriver2 : manual || driver.license) && <button type="button" className="btn-secondary" onClick={checked ? onOk : validate}>Продолжить</button>}
    </div>
  )
}

/* ---------- Э6 Машина ждёт ---------- */

function E6({ result, onOpenBooking, onHome }) {
  const car = cars.find((c) => c.id === result.carId)
  const q = result.query
  const location = locations.find((l) => l.id === q.locationId)
  const now = isNow(q)
  const chosen = extras.filter((x) => result.extraIds.includes(x.id))
  const inCar = chosen.filter((x) => x.group === 'trip' || x.id === 'child-seat')

  const [eta, setEta] = useState(location.etaMin + car.etaAdd)
  useEffect(() => {
    if (!now) return
    const id = setInterval(() => setEta((m) => Math.max(1, m - 1)), 60000)
    return () => clearInterval(id)
  }, [now])

  const startText = now ? `через ${eta} мин` : q.mode === 'hours' ? `сегодня в ${q.start}` : `${fmtDate(q.dateFrom)} ${q.timeFrom}`
  const sms = `Машина ждёт вас: ${car.model}, ${location.name}, ${startText}.${inCar.length ? ` ${inCar.map((x) => x.name.split(' — ')[0]).join(', ')} — уже внутри.` : ''} Всё о брони: rent.ru/b/${result.id}`

  return (
    <main className="e6">
      <div className="e6-layout">
        <div className="e6-main">
          <svg className="e6-check" viewBox="0 0 52 52" aria-hidden="true">
            <circle cx="26" cy="26" r="24" fill="none" />
            <path d="M15 27l7 7 15-15" fill="none" />
          </svg>
          <div className="e6-head">
            <h1>Машина ждёт вас</h1>
            <div className="muted">Бронь {result.id}</div>
            <p className="e6-when">{car.model} — {location.name}, {startText}</p>
          </div>

          <div className="e6-sms">
            <div className="phone">
              <div className="muted">SMS · сейчас</div>
              <div className="bubble">{sms.split(`rent.ru/b/${result.id}`)[0]}
                <button type="button" className="sms-link" onClick={onOpenBooking}>rent.ru/b/{result.id}</button></div>
            </div>
          </div>

          <section className="e3-section">
            <h2>Что дальше</h2>
            <ol className="steps">
              <li><b>Машина ждёт в точке</b><span>{location.meet}</span></li>
              <li><b>Встречает сотрудник — 10 минут</b><span>Вместе фотографируете машину, акт приходит в телефон. Потом ключи — и всё</span></li>
              <li><b>Сразу в путь</b><span>Бак полный, допы уже в машине</span></li>
            </ol>
          </section>

          <section className="e3-section">
            <h2>Взять с собой</h2>
            <p className="body-sm">Водительское удостоверение и карту, с которой платили, — на ней заблокируем залог.</p>
          </section>

          <section className="e3-section">
            <h2>Оплата</h2>
            <dl className="bill">
              <dt>Оплачено</dt><dd>{rub(result.paidNow)}</dd>
              {result.rest > 0 && <><dt>При получении</dt><dd>{rub(result.rest)}</dd></>}
              <dt className="muted">Залог — заблокируем при получении</dt><dd className="muted">{rub(result.deposit)}</dd>
            </dl>
          </section>

          {inCar.length > 0 && (
            <section className="e3-section">
              <h2>Что в машине</h2>
              <ul className="in-car">{inCar.map((x) => <li key={x.id}>{x.name}</li>)}</ul>
            </section>
          )}

          <div className="e6-actions">
            <button className="btn-primary" onClick={onOpenBooking}>Моя бронь</button>
            <button className="btn-secondary" onClick={onHome}>На главную</button>
          </div>
        </div>
      </div>
    </main>
  )
}

/* ---------- Моя бронь ---------- */

function MyBooking({ bookings, user, onLogout, onHome }) {
  const [last, ...past] = bookings
  if (!last) return (
    <main className="stub">
      <h1>Броней пока нет</h1>
      <p className="muted">Вы вошли как {user?.phone}. Здесь появятся ваши брони и статус машины.</p>
      <div className="e6-actions">
        <button className="btn-primary" onClick={onHome}>Подобрать машину</button>
        <button className="btn-secondary" onClick={onLogout}>Выйти</button>
      </div>
    </main>
  )
  const car = cars.find((c) => c.id === last.carId)
  const location = locations.find((l) => l.id === last.query.locationId)
  const city = cities[location.city]
  const inCar = extras.filter((x) => last.extraIds.includes(x.id))
  return (
    <main className="stub my-booking">
      <div className="muted">Бронь {last.id} · {user?.phone}</div>
      <h1>{car.model}</h1>
      <div className="avail ok">Машина готовится — пришлём SMS, когда будет на месте</div>
      <div className="e3-photo photo-car" style={carPhoto(car, 'lg')} />
      <dl>
        <dt>Где</dt><dd>{location.name}<div className="muted">{location.meet}</div></dd>
        <dt>Когда</dt><dd>{whenText(last.query)}</dd>
        <dt>Допы</dt><dd>{inCar.length ? inCar.map((x) => x.name).join(', ') : '—'}</dd>
        <dt>Оплачено</dt><dd>{rub(last.paidNow)}{last.rest > 0 && <div className="muted">ещё {rub(last.rest)} при получении</div>}</dd>
        <dt>Залог</dt><dd>{rub(last.deposit)} — блокировка на карте</dd>
        <dt>Как вернуть</dt><dd>{city.dropoff}<div className="muted">{rentTerms.fuel}</div></dd>
        <dt>Поддержка</dt><dd>8 800 000-00-00, круглосуточно · подменная машина, если что-то сломается</dd>
      </dl>
      {past.length > 0 && (
        <>
          <h2>Прошлые брони</h2>
          <ul className="body-sm">{past.map((b) => <li key={b.id + b.total}>{cars.find((c) => c.id === b.carId)?.model} · {summary(b.query)}</li>)}</ul>
        </>
      )}
      <div className="e6-actions">
        <button className="btn-secondary" onClick={onHome}>На главную</button>
        <button className="link" onClick={onLogout}>Выйти</button>
      </div>
    </main>
  )
}
