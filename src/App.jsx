import { Fragment, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { locations, locationGroups, cars, scenarios, rub, carDetails, rentTerms, cities, extras, plans, prefOptions, companions, promises, faq, addressHints } from './data.js'

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
  planIds: [], // одна базовая цель + до двух local-уточнений
  companion: '', // с кем едем: two | family | friends
  prefs: [], // переключатели Э2
  extraIds: [], // допы живут в запросе — переживают смену машины
  address: '',
  returnMode: 'same', // 'same' — где забрал | 'point' — в нашей точке | 'free' — где удобно, как каршеринг
  returnId: '', // точка возврата; пусто — решу по дороге
}

// Хранилище браузера: избранное, вход, брони. Без него всё работает в памяти
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* приватный режим */ } }
// Место получения; для отеля и дома имя — введённый адрес
const isAddress = (l) => ['Отель', 'Адрес'].includes(l.type)
function findPlace(q) {
  const l = locations.find((x) => x.id === q.locationId)
  return l && isAddress(l) && q.address ? { ...l, name: `${cities[l.city].name}, ${q.address}` } : l
}
const union = (a, b) => [...new Set([...a, ...b])]

export default function App() {
  const [query, setQuery] = useState(emptyQuery)
  const [screen, setScreen] = useState('e1') // 'e1' | 'e2' | 'e3' | 'final'
  const [pickedCarId, setPickedCarId] = useState(null)
  const [cameFrom, setCameFrom] = useState('e1') // откуда открыли Э3
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
  const home = () => { setQuery(emptyQuery); setScreen('e1') }

  const fav = { favs, toggleFav }
  let page
  if (screen === 'final') page = <Final query={query} carId={pickedCarId} onHome={home} />
  else if (screen === 'e3') page = (
    <E3 key={pickedCarId} query={query} setQuery={setQuery} carId={pickedCarId} cameFrom={cameFrom} fav={fav}
      onBack={() => setScreen(cameFrom)} onPickOther={() => setScreen('e2')} openPicker={(g) => setSheet({ picker: g })}
      onBook={() => setScreen('final')} />
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
        onLogin={() => askLogin(null)} onLogout={logout} />
      {page}
      {sheet === 'favs' && <FavSheet query={query} fav={fav} user={user} onLogin={() => askLogin(() => setSheet('favs'))}
        onOpen={(id) => openCar(id, screen === 'e2' ? 'e2' : 'e1')} onClose={() => setSheet(null)} />}
      {sheet === 'login' && <LoginSheet onLogin={login} onClose={() => setSheet(null)} />}
      {sheet?.picker && <PlacePicker query={query} group={sheet.picker} onClose={() => setSheet(null)}
        onPick={(l, address = '') => { setQuery((q) => ({ ...q, locationId: l.id, cityId: l.city, address })); setSheet(null) }} />}
    </>
  )
}

/* ---------- Шапка, избранное, вход ---------- */

function Header({ dark, user, favs, onHome, onFavs, onLogin, onLogout }) {
  const [menu, setMenu] = useState(false)
  const menuRef = useRef(null)
  // Меню профиля закрывается кликом мимо и по Esc
  useEffect(() => {
    if (!menu) return
    const onClick = (e) => !menuRef.current?.contains(e.target) && setMenu(false)
    const onKey = (e) => e.key === 'Escape' && setMenu(false)
    document.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onClick); window.removeEventListener('keydown', onKey) }
  }, [menu])
  return (
    <header className={`header ${dark ? 'header-dark' : ''}`}>
      <button className="logo" onClick={onHome} aria-label="вольно — на главную">
        в<svg className="logo-o" viewBox="0 0 40 40" aria-hidden="true">
          <circle className="logo-rim" cx="20" cy="20" r="16.5" fill="none" strokeWidth="5" />
          <g stroke="currentColor" strokeWidth="3.4" strokeLinecap="round"><line x1="5" y1="19" x2="14" y2="20" /><line x1="35" y1="19" x2="26" y2="20" /><line x1="20" y1="26" x2="20" y2="35" /></g>
          <circle cx="20" cy="21" r="5.5" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>льно
      </button>
      <nav className="header-nav">
        <button className="header-btn" onClick={onFavs} aria-label={`Избранное: ${favs.length}`}>
          <Heart on={favs.length > 0} />
          <span className="header-label">Избранное</span>
        </button>
        <div className="account" ref={menuRef}>
          <button className="header-btn" onClick={user ? () => setMenu(!menu) : onLogin} aria-expanded={user ? menu : undefined}>
            <svg className="profile-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" /></svg>
            <span className="header-label">Профиль</span>
          </button>
          {user && menu && (
            <div className="account-menu">
              <div className="account-who"><span className="muted">Вы вошли</span><b>{user.phone}</b></div>
              <button className="account-item" onClick={() => { setMenu(false); onFavs() }}>Избранное<span className="muted">{favs.length}</span></button>
              <button className="account-item account-out" onClick={() => { setMenu(false); onLogout() }}>Выйти</button>
            </div>
          )}
        </div>
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
  // Пока открыт поп-ап, страница под ним не скроллится
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])
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
  'Даты': <><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
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
  const inputRef = useRef(null)

  useEffect(() => {
    if (group && group !== 'all') groupRefs.current[group]?.scrollIntoView({ block: 'start' })
  }, [group])

  const t = text.trim().toLowerCase()
  const points = locations.filter((l) => !isAddress(l))
  const items = t ? points.filter((l) => `${l.name} ${cities[l.city].name}`.toLowerCase().includes(t)) : points.filter((l) => l.city === cityId)
  const addrPlace = locations.find((l) => l.city === cityId && l.type === 'Адрес') ?? locations.find((l) => l.city === cityId && isAddress(l))
  const hints = (addressHints[cityId] ?? []).filter((a) => a.toLowerCase().includes(t))
  const addrs = t ? (hints.length ? hints : [text.trim()]) : []

  return (
    <Sheet className="sheet-full sheet-modal" onClose={onClose}>
      <div className="picker-head">
        <button className="icon-btn" aria-label="Назад" onClick={onClose}>←</button>
        <h2>Выберите место получения</h2>
      </div>
      <input ref={inputRef} className="picker-search" autoFocus placeholder="Аэропорт, вокзал или адрес отеля / дома" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="picker-city">Привезём к аэропорту, вокзалу или по любому адресу в городе — без доплаты</div>
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
        <div>
          <div className="picker-group">{t ? `Адреса · ${cities[cityId].name}` : 'Отель или дом'}</div>
          {t ? addrs.map((a) => (
            <button key={a} className="picker-item" onClick={() => onPick(addrPlace, a)}>
              <span className="picker-icon"><PlaceIcon type="Адрес" /></span>
              <span>{a}<span className="picker-meet">Привезём к подъезду или ко входу отеля</span></span>
            </button>
          )) : (
            <button className="picker-item" onClick={() => inputRef.current?.focus()}>
              <span className="picker-icon"><PlaceIcon type="Адрес" /></span>
              <span>Введите адрес<span className="picker-meet">Начните вводить улицу или название отеля</span></span>
            </button>
          )}
        </div>
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

// Точки сервиса в городе — туда можно вернуть машину без доплаты
const servicePoints = (cityId) => locations.filter((l) => l.city === cityId && ['Аэропорт', 'Вокзал'].includes(l.type))
function returnText(q) {
  if (q.returnMode === 'free') return 'Где удобно, в зоне города'
  if (q.returnMode === 'point') return locations.find((l) => l.id === q.returnId)?.name ?? 'В любой нашей точке'
  return 'Где забрали'
}

function summary(q) {
  const loc = findPlace(q)
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

// Одна базовая цель (взаимоисключающие) + до двух уточнений «куда»
function togglePlanIds(ids, id) {
  const byId = (x) => plans.find((p) => p.id === x)
  const isLocal = (x) => byId(x)?.local
  // снимаем цель — уходят и её подсказки
  if (ids.includes(id)) return ids.filter((x) => x !== id && byId(x)?.goal !== id)
  if (!isLocal(id)) return [...ids.filter((x) => isLocal(x) && (!byId(x).goal || byId(x).goal === id)), id]
  const places = ids.filter(isLocal)
  const drop = places.length >= 2 ? places[0] : null // третье уточнение вытесняет самое раннее
  const next = [...ids.filter((x) => x !== drop), id]
  // место с целью (горнолыжка → «В горы») включает свою цель
  const goal = byId(id).goal
  if (!goal || next.includes(goal)) return next
  return [...next.filter((x) => isLocal(x) && (!byId(x).goal || byId(x).goal === goal)), goal]
}

// Подбор: фильтр по основной цели и тегам «Авто», уточнения сужают, только если остаются машины; из подходящих — самая выгодная
function pickCar(q, prefs = q.prefs) {
  const chosen = plans.filter((p) => q.planIds.includes(p.id))
  const goal = chosen.find((p) => !p.local) ?? null
  const places = chosen.filter((p) => p.local)
  const companion = companions.find((c) => c.id === q.companion) ?? null
  const active = prefOptions.filter((o) => prefs.includes(o.id))
  const pool = cars.filter((c) => availability(c, q.locationId) === 'ok')
  let fit = pool.filter((c) => (!goal || goal.test(c)) && active.every((o) => o.test(c)))
  const skipped = []
  for (const s of [...places, companion].filter(Boolean)) {
    const narrow = fit.filter(s.test)
    if (narrow.length) fit = narrow
    else skipped.push(s)
  }
  fit.sort((a, b) => a.pricePerDay - b.pricePerDay)
  return { car: fit[0], fit, goal, places, companion, active, skipped, count: fit.length, total: pool.length }
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

function SearchForm({ ref, query, setQuery, onSubmit, openPicker, layout = 'stack', submitLabel = 'Подобрать машину', submitDisabled, params, children }) {
  const [errors, setErrors] = useState({})
  const [paramsOpen, setParamsOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [datesOpen, setDatesOpen] = useState(false)
  const [hoursOpen, setHoursOpen] = useState(false)
  const location = findPlace(query)
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

      <div className={`search-fields ${query.returnMode !== 'same' ? 'has-return' : ''}`}>
        <div className={`field field-where ${errors.location ? 'has-error' : ''}`}>
          <span className="field-label">Где забрать</span>
          <button type="button" className="field-btn" onClick={() => openPicker('all')}>
            {location ? location.name : <span className="placeholder">Аэропорт, вокзал или адрес</span>}
          </button>
          {errors.location && <div className="error">{errors.location}</div>}
        </div>

        {query.returnMode !== 'same' && (
          <div className="field">
            <span className="field-label">Где вернуть</span>
            <button type="button" className="field-btn" onClick={() => setReturnOpen(true)}>{returnText(query)}</button>
          </div>
        )}

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
            <div className="field">
              <span className="field-label">Начало</span>
              <button type="button" className="field-btn" onClick={() => setHoursOpen(true)}>
                {query.start === 'now' ? 'Сейчас' : `Сегодня, ${query.start}`}
              </button>
            </div>
            <div className="field">
              <span className="field-label">На сколько</span>
              <button type="button" className="field-btn" onClick={() => setHoursOpen(true)}>
                {query.hours} {plural(query.hours, 'час', 'часа', 'часов')}
              </button>
            </div>
          </>
        )}
        {params && (
          <div className="field">
            <span className="field-label">Параметры</span>
            <button type="button" className="field-btn" onClick={() => setParamsOpen(true)}>
              {paramsText(query) || <span className="placeholder">Куда, с кем, какое авто</span>}
            </button>
          </div>
        )}
        {layout === 'row' && <button type="submit" className="btn-primary btn-accent" disabled={submitDisabled}>{submitLabel}</button>}
      </div>

      <label className="return-check">
        <input type="checkbox" checked={query.returnMode !== 'same'}
          onChange={(e) => (e.target.checked ? setReturnOpen(true) : set({ returnMode: 'same', returnId: '' }))} />
        Вернуть в другом месте
      </label>

      {children}
      {layout !== 'row' && <button type="submit" className="btn-primary" disabled={submitDisabled}>{submitLabel}</button>}
      {datesOpen && <DatePicker query={query} onApply={(patch) => { set(patch); setDatesOpen(false) }} onClose={() => setDatesOpen(false)} />}
      {returnOpen && <ReturnPicker query={query} onApply={(patch) => { set(patch); setReturnOpen(false) }} onClose={() => setReturnOpen(false)} />}
      {paramsOpen && <ParamsPicker query={query} onApply={(patch) => { set(patch); setParamsOpen(false) }} onClose={() => setParamsOpen(false)} />}
      {hoursOpen && <HoursPicker query={query} location={location} onApply={(patch) => { set(patch); setHoursOpen(false) }} onClose={() => setHoursOpen(false)} />}
    </form>
  )
}

/* ---------- Выбор дат ---------- */

const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fmtDay = (iso) => new Date(`${iso}T00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
const timeSlots = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`)

// Параметры поездки до подбора: цель, с кем, требования к авто
const paramsText = (q) => [
  ...plans.filter((p) => q.planIds.includes(p.id)).map((p) => p.label),
  companions.find((c) => c.id === q.companion)?.label,
  ...prefOptions.filter((o) => q.prefs.includes(o.id)).map((o) => o.label),
].filter(Boolean).map((t, i) => (i ? t.toLowerCase() : t)).join(' · ')

function ParamsPicker({ query, onApply, onClose }) {
  const [planIds, setPlanIds] = useState(query.planIds)
  const [companion, setCompanion] = useState(query.companion)
  const [prefs, setPrefs] = useState(query.prefs)
  const chip = (on, label, onClick) => (
    <button key={label} type="button" className={`chip ${on ? 'active' : ''}`} onClick={onClick}>{label}</button>
  )
  return (
    <Sheet className="sheet-dates" onClose={onClose}>
      <h2 className="dates-title">Параметры поездки</h2>
      <div className="dates-scroll">
        <p className="muted">Необязательно. Чем больше расскажете, тем точнее подбор.</p>
        <div className="chips-label">Еду</div>
        <div className="chips">{cityPlans(query.cityId).filter((p) => !p.local).map((p) => chip(planIds.includes(p.id), p.label, () => setPlanIds(togglePlanIds(planIds, p.id))))}</div>
        <div className="chips-label">С кем</div>
        <div className="chips">{companions.map((c) => chip(companion === c.id, c.label, () => setCompanion(companion === c.id ? '' : c.id)))}</div>
        <div className="chips-label">Авто</div>
        <div className="chips">{prefOptions.map((o) => chip(prefs.includes(o.id), o.label, () => setPrefs(prefs.includes(o.id) ? prefs.filter((x) => x !== o.id) : [...prefs, o.id])))}</div>
      </div>
      <div className="dates-foot">
        <button type="button" className="btn-secondary" onClick={() => { setPlanIds([]); setCompanion(''); setPrefs([]) }}>Сбросить</button>
        <button type="button" className="btn-primary btn-accent" onClick={() => onApply({ planIds, companion, prefs })}>Готово</button>
      </div>
    </Sheet>
  )
}

function ReturnPicker({ query, onApply, onClose }) {
  const [mode, setMode] = useState(query.returnMode)
  const [id, setId] = useState(query.returnId)
  const location = findPlace(query)
  const points = servicePoints(location?.city ?? query.cityId)
  const opt = (m, title, hint, free) => (
    <button key={m} type="button" className={`row-cell ${mode === m ? 'on' : ''}`} onClick={() => setMode(m)}>
      <span className="row-text">
        <span className="plan-label">{title}</span>
        <span className="plan-hint">{hint}</span>
        {free && <span className="return-free">Без доплаты</span>}
      </span>
      {mode === m && <span className="row-arrow">✓</span>}
    </button>
  )
  return (
    <Sheet className="sheet-dates" onClose={onClose}>
      <h2 className="dates-title">Где вернуть машину</h2>
      <div className="dates-scroll">
        {opt('same', 'Где забрали', location?.name ?? 'Там же, где получите')}
        {opt('point', 'В нашей точке', points.map((l) => l.name).join(', '), true)}
        {mode === 'point' && (
          <div className="chips return-points">
            {[{ id: '', name: 'Решу по дороге' }, ...points].map((l) => (
              <button key={l.id} type="button" className={`chip ${id === l.id ? 'active' : ''}`} onClick={() => setId(l.id)}>{l.name}</button>
            ))}
          </div>
        )}
        {opt('free', 'Где удобно', 'Как в каршеринге: оставьте на любой парковке в зоне города и завершите аренду в SMS', true)}
      </div>
      <div className="dates-foot">
        <button type="button" className="btn-secondary" onClick={onClose}>Отмена</button>
        <button type="button" className="btn-primary btn-accent" onClick={() => onApply({ returnMode: mode, returnId: mode === 'point' ? id : '' })}>Готово</button>
      </div>
    </Sheet>
  )
}

function HoursPicker({ query, location, onApply, onClose }) {
  const [start, setStart] = useState(query.start)
  const [hours, setHours] = useState(query.hours)
  const starts = [['now', `Сейчас${location ? ` · за ${location.etaMin || 5} мин` : ''}`], ...hourSlots().map((t) => [t, t])]

  return (
    <Sheet className="sheet-dates" onClose={onClose}>
      <h2 className="dates-title">Когда и на сколько</h2>
      <div className="dates-scroll">
        <div className="chips-label">На сколько</div>
        <div className="chips">
          {[2, 4, 8, 12].map((h) => (
            <button key={h} type="button" className={`chip ${hours === h ? 'active' : ''}`} onClick={() => setHours(h)}>
              {h} {plural(h, 'час', 'часа', 'часов')}
            </button>
          ))}
        </div>
        <div className="chips-label">Начало, сегодня</div>
        <div className="chips">
          {starts.map(([v, label]) => (
            <button key={v} type="button" className={`chip ${start === v ? 'active' : ''}`} onClick={() => setStart(v)}>{label}</button>
          ))}
        </div>
      </div>
      <div className="dates-foot">
        <button type="button" className="btn-secondary" onClick={onClose}>Отмена</button>
        <button type="button" className="btn-primary btn-accent" onClick={() => onApply({ start, hours })}>Готово</button>
      </div>
    </Sheet>
  )
}

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
  // Клик по цели или месту — сразу на подбор с этим планом
  const pickPlan = (p) => {
    const ids = p.local && p.goal ? [p.goal, p.id] : [p.id]
    setQuery((q) => ({ ...q, planIds: ids, extraIds: union(q.extraIds, plans.filter((x) => ids.includes(x.id)).flatMap((x) => x.extraIds ?? [])) }))
    onSubmit()
  }

  return (
    <main className="landing">
      <section className="hero">
        <div className="hero-bg" style={{ '--hero-d': `url(${import.meta.env.BASE_URL}hero/d.webp)`, '--hero-m': `url(${import.meta.env.BASE_URL}hero/m.webp)` }} />
        <div className="hero-inner">
          <h1 className="hero-title">Расскажите, что в планах, — подберём лучшую машину для твоей цели</h1>
          <SearchForm ref={formRef} layout="row" params query={query} setQuery={setQuery} onSubmit={submit} openPicker={openPicker} />
        </div>
      </section>

      <Plans ref={plansRef} query={query} setQuery={setQuery} onPick={pickPlan} />
      <Manifest onGoal={scrollToPlans} />
      <Park query={query} setQuery={setQuery} fav={fav} onPickCar={onPickCar} />
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

function CitySelect({ query, setQuery, inCity }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  // Список закрывается кликом мимо и по Esc
  useEffect(() => {
    if (!open) return
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onClick); window.removeEventListener('keydown', onKey) }
  }, [open])
  const change = (cityId) => {
    setQuery((q) => ({
      ...q, cityId,
      locationId: findPlace(q)?.city === cityId ? q.locationId : '',
      planIds: q.planIds.filter((id) => cityPlans(cityId).some((p) => p.id === id)),
    }))
    setOpen(false)
  }
  return (
    <span className="city-wrap" ref={ref}>
      <button type="button" className="city-select" aria-expanded={open} onClick={() => setOpen(!open)}>
        {inCity ? cities[query.cityId].in : cities[query.cityId].name}
        <svg className="city-chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4.5l4 4 4-4" /></svg>
      </button>
      {open && (
        <span className="city-pop" role="listbox">
          {Object.entries(cities).map(([id, c]) => (
            <button key={id} type="button" role="option" aria-selected={id === query.cityId} className="city-option" onClick={() => change(id)}>
              {c.name}{id === query.cityId && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </span>
      )}
    </span>
  )
}

function Plans({ ref, query, setQuery, onPick }) {
  const list = cityPlans(query.cityId)
  const row = (p) => (
    <button key={p.id} type="button" className="row-cell" onClick={() => onPick(p)}>
      <span className="row-text">
        <span className="plan-label">{p.label}</span>
        <span className="plan-hint">{p.hint}</span>
      </span>
      <span className="row-arrow" aria-hidden="true">→</span>
    </button>
  )
  return (
    <section ref={ref} className="section plans-section">
      <h2 className="plans-title">Какие планы <CitySelect query={query} setQuery={setQuery} />?</h2>
      <p className="muted">Места, о которых вы могли не знать, — выберите, сразу подберём машину</p>
      <div className="rows">{list.filter((p) => p.local).map(row)}</div>
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

function Park({ query, setQuery, fav, onPickCar }) {
  const tabs = scenarios.filter((s) => s.carIds)
  const [tab, setTab] = useState(tabs[0].id)
  const ids = tabs.find((t) => t.id === tab).carIds
  const list = cars.filter((c) => ids.includes(c.id)).sort((a, b) => a.pricePerDay - b.pricePerDay)
  const three = list.length <= 3 ? list : [list[0], list[Math.floor(list.length / 2)], list[list.length - 1]]
  return (
    <section className="section park">
      <h2>Какие машины в парке <CitySelect query={query} setQuery={setQuery} inCity /></h2>
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

const stockText = (n) => (n === 1 ? 'Осталась 1' : `Осталось ${n}`)
const goods = (prev, cur, q) => carDiff(prev, cur, q).filter((d) => d.good && !d.text.includes('₽')).map((d) => d.text)
const priceDelta = (base, c, q) => { const d = tripTotal(c, q) - tripTotal(base, q); return d ? `${d > 0 ? '+' : '−'}${rub(Math.abs(d))}` : 'та же цена' }

function E2({ query, setQuery, fav, onBack, onPick, openPicker }) {
  const [prev, setPrev] = useState(null) // машина до последнего переключения
  const [pickedId, setPickedId] = useState(null) // выбрал из альтернатив вручную
  const [datesOpen, setDatesOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const res = pickCar(query)
  const { goal, places, companion, active, skipped, fit } = res
  const car = fit.find((c) => c.id === pickedId) ?? res.car
  const location = findPlace(query)
  const [paramsOpen, setParamsOpen] = useState(false)

  const change = (patch) => {
    if (car) setPrev(car)
    setPickedId(null)
    setQuery((q) => ({ ...q, ...patch }))
  }
  const choose = (id) => { setPrev(car); setPickedId(id); setMoreOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const togglePref = (id) => change({ prefs: query.prefs.includes(id) ? query.prefs.filter((x) => x !== id) : [...query.prefs, id] })

  const reasons = []
  if (goal) reasons.push(<><b>{goal.label}</b> → {goal.hint.toLowerCase()}</>)
  else reasons.push(<>Цель не выбрана — берём самую выгодную машину</>)
  places.filter((p) => !skipped.includes(p)).forEach((p) => reasons.push(<><b>{p.label}</b> → {p.hint.toLowerCase()}</>))
  if (companion && !skipped.includes(companion)) reasons.push(<><b>{companion.label}</b> → {companion.hint}</>)
  skipped.forEach((s) => reasons.push(<>Под «{s.label.toLowerCase()}» отдельно машин не нашлось — учли остальное</>))
  active.forEach((o) => reasons.push(<>Авто: <b>{o.label}</b></>))
  if (car) reasons.push(<>Подходят {res.count} из {res.total} машин — взяли самую выгодную</>)

  // Две альтернативы: похожая по цене и с улучшением
  const rest = car ? fit.filter((c) => c.id !== car.id) : []
  const better = rest.find((c) => c.pricePerDay > car.pricePerDay && goods(car, c, query).length >= 2)
  const similar = rest.find((c) => c !== better)
  const tiles = [
    similar && { car: similar, note: goods(car, similar, query)[0] ? `похожая, ${goods(car, similar, query)[0]}` : 'похожая' },
    better && { car: better, note: goods(car, better, query).slice(0, 2).join(', ') },
  ].filter(Boolean)

  // «Ещё 7»: та же цель и теги, включая разобранные — они внизу
  const shown = [car, ...tiles.map((t) => t.car)].filter(Boolean).map((c) => c.id)
  const same = cars
    .filter((c) => !shown.includes(c.id) && (!goal || goal.test(c)) && active.every((o) => o.test(c)))
    .map((c) => ({ car: c, av: availability(c, query.locationId) }))
    .sort((a, b) => a.car.pricePerDay - b.car.pricePerDay)
  const gone = same.filter((x) => x.av !== 'ok').slice(0, 2) // разобранные показываем всегда, но не больше двух
  const more = [...same.filter((x) => x.av === 'ok').slice(0, 7 - gone.length), ...gone]

  const diff = prev && car && prev.id !== car.id ? carDiff(prev, car, query) : null
  const fixes = !car ? active.filter((o) => pickCar(query, query.prefs.filter((x) => x !== o.id)).car) : []

  const cells = (cls) => (
    <div className={`cells ${cls}`}>
      <button type="button" className="cell" onClick={() => openPicker('all')}>
        <PlaceIcon type={location?.type ?? 'Адрес'} />
        <span className="cell-text"><span className="cell-label">Где забрать</span>{location ? location.name : 'Выберите место'}{query.returnMode !== 'same' && <span className="muted"> · вернуть: {returnText(query).toLowerCase()}</span>}</span>
        <span className="cell-arrow" aria-hidden="true">›</span>
      </button>
      <button type="button" className="cell" onClick={() => setDatesOpen(true)}>
        <PlaceIcon type="Даты" />
        <span className="cell-text"><span className="cell-label">Когда</span>{whenText(query)}</span>
        <span className="cell-arrow" aria-hidden="true">›</span>
      </button>
    </div>
  )

  return (
    <main className="e2">
      <button className="link-back" onClick={onBack}>← На главную</button>

      <div className="e2-layout">
        <div className="e2-main">
          {cells('cells-inline')}

          <div className="params-line">
            <span><span className="muted">Учли: </span>{paramsText(query) || 'параметры не заданы'}</span>
            <button type="button" className="link" onClick={() => setParamsOpen(true)}>Изменить</button>
          </div>

          {car && diff && (
            <div className="diff" key={`diff-${car.id}`}>
              <span className="diff-title">Вместо {prev.model}:</span>
              {diff.map((d) => <span key={d.text} className={`diff-item ${d.good ? 'good' : 'bad'}`}>{d.good ? '▲' : '▼'} {d.text}</span>)}
              {query.prefs.length > 0 && <button className="link" onClick={() => change({ prefs: [] })}>Сбросить «Авто»</button>}
            </div>
          )}

          {car ? (
            <div className="pick-card" key={car.id}>
              <div className="pick-photo photo-car" style={carPhoto(car, 'lg')}>
                <span className="badge">{paramsText(query) ? 'Под ваши параметры' : 'Подобрали для вас'}</span>
                <FavToggle id={car.id} fav={fav} />
              </div>
              <div className="pick-body">
                <div className="muted">{car.gearbox[0].toUpperCase() + car.gearbox.slice(1)} · {car.kind}{car.stock > 0 ? ` · ${stockText(car.stock).toLowerCase()}` : ''}</div>
                <h1 className="pick-title">{car.model}</h1>
                <div className="pick-specs">{car.seats} мест · багажник {car.trunk} л · {car.drive} · клиренс {car.clearance} мм · {car.engine}</div>
                <button type="button" className="link pick-more" onClick={() => onPick(car.id)}>Информация об автомобиле</button>
              </div>
            </div>
          ) : (
            <div className="empty">
              <h2>Под всё сразу машины нет</h2>
              {fixes.length > 0 ? (
                <div className="avail-options">
                  {fixes.map((o) => <button key={o.id} className="btn-secondary btn-sm" onClick={() => togglePref(o.id)}>Убрать «{o.label}»</button>)}
                </div>
              ) : (
                <button className="btn-secondary" onClick={() => change({ prefs: [], planIds: [], companion: '' })}>Сбросить цели и теги</button>
              )}
            </div>
          )}

          {car && tiles.length > 0 && (
            <div className="alts">
              <div className="why-title">Или посмотрите</div>
              <div className="alt-grid">
                {tiles.map((t) => (
                  <button key={t.car.id} type="button" className="alt" onClick={() => choose(t.car.id)}>
                    <span className="alt-photo photo-car" style={carPhoto(t.car)} />
                    <b>{t.car.model}</b>
                    <span className="muted">{t.note}</span>
                    <span className="alt-foot">{priceDelta(car, t.car, query)}
                      {t.car.stock > 0 && <span className="badge badge-hot">{stockText(t.car.stock)}</span>}</span>
                  </button>
                ))}
              </div>
              {more.length > 0 && <button type="button" className="btn-secondary alts-more" onClick={() => setMoreOpen(true)}>Показать ещё {more.length}</button>}
            </div>
          )}
        </div>

        <aside className="e2-aside">
          {car && (
            <div className="book-card">
              {cells('cells-card')}
              <div className="book-sum">
                <div className="price-big">{rub(tripTotal(car, query))}</div>
                <div className="muted">за {unitsText(query)}{query.extraIds.length ? ', с допами' : ''}{isNow(query) && location ? ` · подадим через ${location.etaMin + car.etaAdd} мин` : ''}</div>
              </div>
              <button className="btn-primary" onClick={() => onPick(car.id)}>Оформить</button>
              <div className="book-note muted">✓ Бесплатная отмена за 48 ч</div>
            </div>
          )}
          <div className="why">
            <div className="why-title">Что учли</div>
            <ul className="why-list">{reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </div>
        </aside>
      </div>

      {paramsOpen && <ParamsPicker query={query} onApply={(patch) => { change(patch); setParamsOpen(false) }} onClose={() => setParamsOpen(false)} />}
      {datesOpen && <DatePicker query={query} onClose={() => setDatesOpen(false)}
        onApply={(patch) => { change({ ...patch, mode: 'days' }); setDatesOpen(false) }} />}
      {moreOpen && (
        <Sheet className="sheet-full sheet-modal" onClose={() => setMoreOpen(false)}>
          <div className="picker-head">
            <button className="icon-btn" aria-label="Закрыть" onClick={() => setMoreOpen(false)}>←</button>
            <h2>{goal ? `Ещё под «${goal.label.toLowerCase()}»` : 'Ещё машины'}</h2>
          </div>
          <div className="more-list">
            {more.map(({ car: c, av }) => (
              <button key={c.id} type="button" className={`more-row ${av !== 'ok' ? 'off' : ''}`} disabled={av !== 'ok'} onClick={() => choose(c.id)}>
                <span className="more-photo photo-car" style={carPhoto(c)} />
                <span className="more-text"><b>{c.model}</b>
                  <span className="muted">{av === 'sold' ? 'Разобрали на ваши даты' : av === 'place' ? 'Нет в этой точке' : goods(car, c, query).slice(0, 2).join(', ') || c.kind}</span></span>
                <span className="more-side">{av === 'ok' ? priceDelta(car, c, query) : '—'}
                  {av === 'ok' && c.stock > 0 && <span className="badge badge-hot">{stockText(c.stock)}</span>}
                  {av === 'sold' && <span className="badge badge-muted">Разобрали</span>}</span>
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </main>
  )
}

/* ---------- Э3 Машина, допы, калькулятор ---------- */

function E3({ query, setQuery, carId, cameFrom, fav, onBack, onPickOther, openPicker, onBook }) {
  const car = cars.find((c) => c.id === carId)
  const d = carDetails[car.id]
  const location = findPlace(query)
  const city = cities[location?.city ?? query.cityId]
  const widgetRef = useRef(null)
  const [edit, setEdit] = useState(null) // 'when' | 'return'

  const ready = queryReady(query)
  const status = ready ? availability(car, query.locationId) : null
  const chosen = extras.filter((x) => query.extraIds.includes(x.id))
  const total = tripTotal(car, query)

  const placesHere = locations.filter((l) => l.city === (location?.city ?? query.cityId) && l.id !== query.locationId && !d.unavailableAt.includes(l.id))

  const toggle = (id) => setQuery((q) => ({ ...q, extraIds: q.extraIds.includes(id) ? q.extraIds.filter((x) => x !== id) : [...q.extraIds, id] }))
  const scrollToWidget = () => widgetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const perLabel = (x) => (x.price === 0 ? 'бесплатно' : `${rub(x.price)}${x.per === 'day' ? ' / сутки' : ''}`)
  const book = () => onBook()

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
                <span>{location ? location.meet : 'аэропорт, вокзал, отель, парковка или к дому'}
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
              <dt>Пробег</dt><dd>{query.extraIds.includes('unlimited') ? 'Без ограничений — безлимит в вашем расчёте' : `${rentTerms.mileage}. Или возьмите безлимит в допах ниже`}</dd>
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
          {[
            ['Где', location ? location.name : 'Выберите место', () => openPicker('all')],
            ['Когда', whenText(query), () => setEdit('when')],
            ['Вернуть', returnText(query), () => setEdit('return')],
          ].map(([label, value, onClick]) => (
            <div key={label} className="book-row">
              <span><span className="cell-label">{label}</span>{value}</span>
              <button type="button" className="link" onClick={onClick}>Изменить</button>
            </div>
          ))}

          {status === 'place' && (
            <div className="avail no">
              <div>В точке «{location.name}» этой машины нет. Можно забрать здесь:</div>
              <div className="avail-options">
                {placesHere.map((l) => (
                  <button type="button" key={l.id} className="filter" onClick={() => setQuery((q) => ({ ...q, locationId: l.id, address: '' }))}>{l.name}</button>
                ))}
              </div>
            </div>
          )}
          {status === 'sold' && <div className="avail no">Эту машину разобрали</div>}

          {status === 'ok' && (
            <>
              <div className="price-big">{rub(total)}</div>
              <div className="muted">за {unitsText(query)}{chosen.length ? ', с допами' : ''}</div>
              <dl className="bill">
                <dt>Аренда, {unitsText(query)}</dt><dd>{rub(rentPrice(car, query))}</dd>
                {chosen.map((x) => <Fragment key={x.id}><dt>{x.name}</dt><dd>{rub(extraCost(x, query))}</dd></Fragment>)}
                <dt>Подача и возврат</dt><dd className="bill-inc">включено</dd>
                <dt className="muted">Залог, вернём после аренды</dt><dd className="muted">{rub(d.deposit)}</dd>
              </dl>
            </>
          )}
          <button className="btn-primary btn-accent btn-book" disabled={status === 'sold' || status === 'place'}
            onClick={status === 'ok' ? book : () => openPicker('all')}>{ready ? 'Забронировать' : 'Укажите, где и когда'}</button>
          {status === 'ok' && <div className="book-note muted">✓ Бесплатная отмена за 48 ч</div>}
          {edit === 'when' && (query.mode === 'hours'
            ? <HoursPicker query={query} location={location} onApply={(patch) => { setQuery((q) => ({ ...q, ...patch })); setEdit(null) }} onClose={() => setEdit(null)} />
            : <DatePicker query={query} onApply={(patch) => { setQuery((q) => ({ ...q, ...patch })); setEdit(null) }} onClose={() => setEdit(null)} />)}
          {edit === 'return' && <ReturnPicker query={query} onApply={(patch) => { setQuery((q) => ({ ...q, ...patch })); setEdit(null) }} onClose={() => setEdit(null)} />}

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

/* ---------- Вход (для избранного) ---------- */

const banks = ['Сбер', 'Т-Банк', 'Альфа-Банк', 'ВТБ', 'Точка']
const bankClient = { phone: '+7 999 123-45-67', name: 'Иван Петров', birth: '12.04.1990' }

const fmtPhone = (digits) => {
  const d = digits.padEnd(10, '_')
  return `+7 ${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`
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

/* ---------- Финал: машина ждёт, конец концепта ---------- */

function Final({ query, carId, onHome }) {
  const car = cars.find((c) => c.id === carId)
  const location = findPlace(query)
  const inCar = extras.filter((x) => query.extraIds.includes(x.id) && (x.group === 'trip' || x.id === 'child-seat'))
  const startText = isNow(query) ? `через ${location.etaMin + car.etaAdd} мин` : query.mode === 'hours' ? `сегодня в ${query.start}` : `${fmtDate(query.dateFrom)} ${query.timeFrom}`
  const sms = `Машина ждёт вас: ${car.model}, ${location.name}, ${startText}.${inCar.length ? ` ${inCar.map((x) => x.name.split(' — ')[0]).join(', ')} — уже внутри.` : ''} Открыть: rent.ru/b/4821`

  return (
    <main className="final">
      <div className="final-in">
        <div>
          <div className="final-kick">Забронировано</div>
          <h1 className="final-title">Машина будет ждать вас здесь</h1>
          <div className="final-map">
            <svg viewBox="0 0 400 300" width="100%" height="100%" aria-hidden="true">
              <path d="M0 210 L400 150" stroke="#ffffff" strokeWidth="18" />
              <path d="M120 0 L170 300" stroke="#ffffff" strokeWidth="12" />
              <path d="M260 0 L300 300" stroke="#ffffff" strokeWidth="8" />
              <path d="M0 80 Q200 120 400 60" stroke="#ffffff" strokeWidth="8" fill="none" />
              <rect x="40" y="110" width="60" height="70" rx="6" fill="#e2e4e6" />
              <rect x="190" y="200" width="70" height="50" rx="6" fill="#e2e4e6" />
              <circle cx="200" cy="170" r="30" fill="var(--ink)" opacity=".12" />
              <circle cx="200" cy="170" r="10" fill="var(--accent)" stroke="var(--ink)" strokeWidth="3" />
            </svg>
          </div>
          <p className="final-meet">{location.name}. {location.meet}. {startText[0].toUpperCase() + startText.slice(1)}</p>
        </div>
        <div>
          <div className="final-sms"><span>SMS · за час до получения</span>{sms}</div>
          <div className="final-end">
            <b>Здесь концепт заканчивается</b>
            <p>Оформление, вход и оплата — как в любом сервисе аренды, их я не показываю. Главное в концепте — подбор машины под поездку.</p>
            <button className="btn-secondary" onClick={onHome}>На главную</button>
          </div>
        </div>
      </div>
    </main>
  )
}
