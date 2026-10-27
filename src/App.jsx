import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { selectCars, rankCars, hasNumber, isAutomatic, savedCarIds, savedBookings } from './fleet.js'
import EntryIntro, { hasSeenEntryIntro } from './EntryIntro.jsx'
import { locations, locationGroups, cars, nb, rub, carDetails, rentTerms, cities, inCity, cityPrice, extras, plans, prefOptions, companions, promises, faq, addressHints } from './data.js'

const carPhoto = (c, size = 'sm') => ({ backgroundImage: c ? `url(${import.meta.env.BASE_URL}${size === 'lg' ? c.heroImage : c.image})` : undefined })

const emptyQuery = {
  cityId: '', // город спрашиваем первым шагом формы
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
  const [entryIntro, setEntryIntro] = useState(() => hasSeenEntryIntro() ? 'reveal' : 'scene')
  const finishEntryIntro = useCallback(() => setEntryIntro(null), [])
  const [query, setQuery] = useState(emptyQuery)
  const [screen, setScreen] = useState('e1') // 'e1' | 'e2' | 'e3' | 'final' | 'bookings'
  const [picking, setPicking] = useState(false) // заставка подбора поверх Э2
  const [pickedCarId, setPickedCarId] = useState(null)
  const [cameFrom, setCameFrom] = useState('e1') // откуда открыли Э3
  const [user, setUser] = useState(() => load('user', null))
  const [favs, setFavs] = useState(() => savedCarIds(load('favs', [])))
  const [sheet, setSheet] = useState(null) // 'favs' | 'login' | 'login-book' | { picker: группа }
  const [booking, setBooking] = useState(null) // бронь, которую показывает финал
  const [bookingMotion, setBookingMotion] = useState(false)
  const [, bump] = useState(0) // брони читаются из хранилища — перерисовка после изменения
  const afterLogin = useRef(null)
  const bookingInProgress = useRef(false)

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
    setFavs((f) => savedCarIds(union(savedCarIds(acc?.favs), f)))
    setUser(u)
    save('user', u)
    setSheet(null)
    afterLogin.current?.(u)
    afterLogin.current = null
  }
  const logout = () => { setUser(null); save('user', null); setScreen('e1') }
  const askLogin = (then, reason = 'login') => { afterLogin.current = then; setSheet(reason) }
  const toggleFav = (id) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [id, ...f]))

  const openCar = (id, from) => { bookingInProgress.current = false; setPickedCarId(id); setCameFrom(from); setScreen('e3'); setSheet(null) }
  const home = () => { bookingInProgress.current = false; setBookingMotion(false); setQuery(emptyQuery); setScreen('e1') }

  // Брони живут в аккаунте: бронировать и смотреть их можно только после входа
  const bookings = savedBookings(user ? load('accounts', {})[user.phone]?.bookings : [])
  const saveBookings = (phone, update) => {
    const accounts = load('accounts', {})
    const acc = accounts[phone] ?? { favs, bookings: [] }
    accounts[phone] = { ...acc, bookings: update(acc.bookings ?? []) }
    save('accounts', accounts)
    bump((n) => n + 1)
  }
  const book = (u) => {
    if (bookingInProgress.current) return
    bookingInProgress.current = true
    const b = { id: String(Date.now()).slice(-4), carId: pickedCarId, query, total: tripTotal(cars.find((c) => c.id === pickedCarId), query), createdAt: Date.now(), cancelled: false }
    saveBookings(u.phone, (list) => [b, ...list])
    setBooking(b)
    setBookingMotion(true)
    setScreen('final')
  }
  const cancelBooking = (id) => saveBookings(user.phone, (list) => list.map((b) => (b.id === id ? { ...b, cancelled: true } : b)))
  const openBookings = () => (user ? setScreen('bookings') : askLogin(() => setScreen('bookings')))

  const fav = { favs, toggleFav }
  let page
  if (screen === 'final' && booking) page = <Final booking={booking} animate={bookingMotion} onHome={home} onBookings={openBookings} />
  else if (screen === 'bookings') page = (
    <Bookings bookings={bookings} onHome={home} onCancel={cancelBooking}
      onShow={(b) => { setBookingMotion(false); setBooking(b); setScreen('final') }}
      onRepeat={(b) => { setQuery({ ...b.query, dateFrom: '', dateTo: '' }); setScreen('e2') }} />
  )
  else if (screen === 'e3') page = (
    <E3 key={pickedCarId} query={query} setQuery={setQuery} carId={pickedCarId} cameFrom={cameFrom} fav={fav}
      onBack={() => setScreen(cameFrom)} onPickOther={() => setScreen('e2')} openPicker={(g) => setSheet({ picker: g })}
      onBook={() => (user ? book(user) : askLogin(book, 'login-book'))} />
  )
  else if (screen === 'e2') page = (
    <E2 query={query} setQuery={setQuery} fav={fav} onBack={() => setScreen('e1')} onPick={(id) => openCar(id, 'e2')}
      openPicker={(g) => setSheet({ picker: g })} />
  )
  else page = (
    <Landing query={query} setQuery={setQuery} onSubmit={() => { setScreen('e2'); setPicking(true) }} />
  )

  return (
    <>
      <Header dark={screen === 'e1'} user={user} favs={favs} onHome={home} onFavs={() => setSheet(sheet === 'favs' ? null : 'favs')}
        onLogin={() => askLogin(null)} onLogout={logout}
        bookingsCount={bookings.filter((b) => !b.cancelled && bookingStatus(b) !== 'done').length} onBookings={openBookings} />
      {page}
      {entryIntro && <EntryIntro full={entryIntro === 'scene'} onDone={finishEntryIntro} />}
      {picking && screen === 'e2' && <Picking query={query} onDone={() => setPicking(false)} />}
      {sheet === 'favs' && <FavSheet query={query} fav={fav} user={user} onLogin={() => askLogin(() => setSheet('favs'))}
        onOpen={(id) => openCar(id, screen === 'e2' ? 'e2' : 'e1')} onClose={() => setSheet(null)} />}
      {(sheet === 'login' || sheet === 'login-book') && <LoginSheet forBooking={sheet === 'login-book'} onLogin={login} onClose={() => setSheet(null)} />}
      {sheet?.picker && <PlacePicker query={query} group={sheet.picker} onClose={() => setSheet(null)}
        onPick={(l, address = '') => { setQuery((q) => ({ ...q, locationId: l.id, cityId: l.city, address })); setSheet(null) }} />}
    </>
  )
}

/* ---------- Шапка, избранное, вход ---------- */

function Header({ dark, user, favs, onHome, onFavs, onLogin, onLogout, bookingsCount, onBookings }) {
  const [menu, setMenu] = useState(false)
  const menuRef = useRef(null)
  // Сердце в шапке подпрыгивает, когда в избранном прибавилось
  const favHeart = useRef(null)
  const favCount = useRef(favs.length)
  useEffect(() => {
    if (favs.length > favCount.current) replay(favHeart.current, 'bump')
    favCount.current = favs.length
  }, [favs.length])
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
      <button className="logo" onClick={onHome} aria-label="ON MOVE — на главную">
        <span className="logo-on">ON</span>MOVE
      </button>
      <nav className="header-nav">
        {/* Якоря по секциям лендинга — видны только на широком экране */}
        <span className="header-nav-links">
          <a href="#directions">Куда поедем</a>
          <a href="#delivery">Где забрать</a>
          <a href="#faq">Вопросы</a>
        </span>
        <button ref={favHeart} className="header-btn" onClick={onFavs} aria-label={`Избранное: ${favs.length}`}>
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
              <div className="account-who"><span className="muted">Ты в\u00a0аккаунте</span><b>{user.phone}</b></div>
              <button className="account-item" onClick={() => { setMenu(false); onBookings() }}>Бронирования<span className="muted">{bookingsCount}</span></button>
              <button className="account-item" onClick={() => { setMenu(false); onFavs() }}>Избранное<span className="muted">{favs.length}</span></button>
              <button className="account-item account-out" onClick={() => { setMenu(false); onLogout() }}>Выйти</button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}

// Перезапускает CSS-анимацию: снимаем класс, форсим reflow, ставим снова
const replay = (el, cls) => {
  if (!el) return
  el.classList.remove(cls)
  void el.getBoundingClientRect()
  el.classList.add(cls)
}

// Подложка переключателя переезжает под активную кнопку
function usePill(ref, active) {
  useEffect(() => {
    const root = ref.current
    const place = () => {
      const b = root?.querySelector('button.active')
      if (!b) return
      root.classList.add('pill')
      root.style.setProperty('--pill-x', `${b.offsetLeft}px`)
      root.style.setProperty('--pill-w', `${b.offsetWidth}px`)
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [ref, active])
}

// Кнопка «оживает», когда из неактивной становится активной
function useWake(ref, disabled) {
  const was = useRef(disabled)
  useEffect(() => {
    if (was.current && !disabled) replay(ref.current, 'ready')
    was.current = disabled
  }, [ref, disabled])
}

// Число досчитывается от прошлого значения (или от start при появлении) до нового
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
function useCountUp(value, start = value, ms = 400) {
  const [shown, setShown] = useState(start)
  const from = useRef(start)
  useEffect(() => {
    if (reducedMotion() || from.current === value) { from.current = value; setShown(value); return }
    const a = from.current, t0 = performance.now()
    let raf
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / ms)
      const v = Math.round(a + (value - a) * (1 - (1 - k) ** 3))
      from.current = v
      setShown(v)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])
  return shown
}

// Первое число в строке досчитывается с нуля: «мест +2», «+1 200 ₽ за поездку»
function CountText({ text }) {
  const m = text.match(/\d[\d\s\u00a0\u202f]*\d|\d/)
  const target = m ? Number(m[0].replace(/\D/g, '')) : 0
  const n = useCountUp(target, 0)
  if (!m) return text
  const out = target >= 1000 ? n.toLocaleString('ru-RU') : String(n)
  return <>{text.slice(0, m.index)}{out}{text.slice(m.index + m[0].length)}</>
}

function CountNum({ value }) {
  return useCountUp(value)
}

// Заливка чипа расходится от точки нажатия
const rippleAt = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`)
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
  const toggle = (e) => {
    e.stopPropagation()
    e.currentTarget.classList.remove('pop', 'deflate')
    replay(e.currentTarget, on ? 'deflate' : 'pop')
    fav.toggleFav(id)
  }
  return (
    <button type="button" className={`fav-toggle ${className}`} aria-pressed={on} aria-label={on ? 'Убрать из избранного' : 'В избранное'}
      onClick={toggle}>
      <Heart on={on} />
    </button>
  )
}

const focusable = 'button:not(:disabled), input:not(:disabled), select, textarea, [href], [tabindex]:not([tabindex="-1"])'

// Карточка-кнопка на div открывается по Enter и пробелу, как настоящая кнопка
const onActivateKey = (e, go) => {
  if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return
  e.preventDefault()
  go()
}

// Стрелки и шевроны — иконкой, а не символом шрифта
function Arrow({ dir = 'right', chevron = false }) {
  const d = chevron ? 'M9 5l7 7-7 7' : 'M4 12h16M14 6l6 6-6 6'
  return (
    <svg className={`arrow-icon ${dir === 'left' ? 'arrow-left' : ''}`} viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>
  )
}

function Sheet({ className = '', onClose, children }) {
  const ref = useRef(null)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab') return
      // Tab ходит по кругу внутри поп-апа и не уходит на страницу под ним
      const items = [...ref.current.querySelectorAll(focusable)]
      if (!items.length) return
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  // Фокус переходит в поп-ап, а после закрытия возвращается туда, откуда его открыли
  useEffect(() => {
    const opener = document.activeElement
    if (!ref.current.contains(document.activeElement)) ref.current.querySelector(focusable)?.focus()
    return () => opener?.focus?.()
  }, [])
  // Пока открыт поп-ап, страница под ним не скроллится
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])
  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div ref={ref} className={`sheet ${className}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>{children}</div>
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
        <p className="muted">Пока пусто. Жми сердечко на машине — она подождёт здесь.</p>
      ) : (
        <div className="fav-list">
          {list.map((c) => (
            <div key={c.id} className="fav-card" role="button" tabIndex={0} onClick={() => onOpen(c.id)}
              onKeyDown={(e) => onActivateKey(e, () => onOpen(c.id))}>
              <div className="fav-photo photo-car" style={carPhoto(c)}><FavToggle id={c.id} fav={fav} /></div>
              <div className="card-title">{c.model}</div>
              <div className="muted">{[c.drive && `${c.drive} привод`, c.gearbox, c.seats && `${c.seats} мест`].filter(Boolean).join(' · ')}</div>
              <div className="price">{queryReady(query) ? `${rub(rentPrice(c, query))} за ${unitsText(query)}` : `${rub(c.pricePerDay)} / сутки`}</div>
            </div>
          ))}
        </div>
      )}
      {!user && list.length > 0 && (
        <p className="muted fav-note">Сохранено только в этом браузере. <button className="link" onClick={onLogin}>Войди</button>, чтобы не потерять.</p>
      )}
    </Sheet>
  )
}

function LoginSheet({ forBooking, onLogin, onClose }) {
  return (
    <Sheet className="sheet-center" onClose={onClose}>
      <div className="sheet-head">
        <h2>{forBooking ? 'Войди, чтобы забронировать' : 'Вход'}</h2>
        <button className="icon-btn" aria-label="Закрыть" onClick={onClose}>×</button>
      </div>
      <p className="muted">{forBooking
        ? 'Бронь привяжем к номеру — по нему пришлём SMS и покажем её в «Бронированиях».'
        : 'Чтобы видеть свои бронирования и сохранить избранное. Подбирать машину можно и без входа.'}</p>
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
  'Цель': <path d="M5 21V4M5 4h11l-2 4 2 4H5" />,
  'Возврат': <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" />,
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
  const [cityId, setCityId] = useState(query.cityId || Object.keys(cities)[0])
  const [text, setText] = useState('')
  const groupRefs = useRef({})
  const inputRef = useRef(null)

  useEffect(() => {
    if (group && group !== 'all') groupRefs.current[group]?.scrollIntoView({ block: 'start' })
  }, [group])

  const t = text.trim().toLowerCase()
  const plain = (x) => x.replace(/\u00a0/g, ' ').toLowerCase() // в данных неразрывные пробелы
  const points = locations.filter((l) => !isAddress(l))
  const items = t ? points.filter((l) => plain(`${l.name} ${cities[l.city].name}`).includes(t)) : points.filter((l) => l.city === cityId)
  const addrPlace = locations.find((l) => l.city === cityId && l.type === 'Адрес') ?? locations.find((l) => l.city === cityId && isAddress(l))
  const hints = (addressHints[cityId] ?? []).filter((a) => plain(a).includes(t))
  const addrs = t ? (hints.length ? hints : [text.trim()]) : []

  return (
    <Sheet className="sheet-full sheet-modal" onClose={onClose}>
      <div className="picker-head">
        <button className="icon-btn" aria-label="Назад" onClick={onClose}><Arrow dir="left" /></button>
        <h2>Куда привезти машину?</h2>
      </div>
      <input ref={inputRef} className="picker-search" autoFocus placeholder="Аэропорт, вокзал или адрес отеля / дома" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="picker-city">Привезём хоть к трапу, хоть к подъезду. Бесплатно</div>
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
              <span>{a}<span className="picker-meet">Привезём к подъезду или к дверям отеля</span></span>
            </button>
          )) : (
            <button className="picker-item" onClick={() => inputRef.current?.focus()}>
              <span className="picker-icon"><PlaceIcon type="Адрес" /></span>
              <span>Введи адрес<span className="picker-meet">Начни с улицы или названия отеля</span></span>
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

// Обязательные параметры → главная машина сценария → основная четвёрка → остальной парк.
function pickCar(q, prefs = q.prefs) {
  return selectCars({ ...q, prefs }, plans, prefOptions, companions,
    (c) => availability(c, q.locationId) === 'ok' && inCity(c, q.cityId))
}

// Что изменилось при смене машины: + лучше, − хуже
function carDiff(prev, cur, q) {
  const out = []
  const dp = tripTotal(cur, q) - tripTotal(prev, q)
  if (dp) out.push({ good: dp < 0, text: `${dp > 0 ? '+' : '−'}${rub(Math.abs(dp))} за поездку` })
  if (prev.drive && cur.drive && prev.drive !== cur.drive) out.push({ good: cur.drive === 'полный', text: `${cur.drive} привод` })
  if (prev.gearbox && cur.gearbox && prev.gearbox !== cur.gearbox) out.push({ good: isAutomatic(cur), text: cur.gearbox })
  const num = (a, b, label, unit) => { if (!hasNumber(a) || !hasNumber(b)) return; const d = b - a; if (d) out.push({ good: d > 0, text: `${label} ${d > 0 ? '+' : '−'}${Math.abs(d)}${unit}` }) }
  num(prev.seats, cur.seats, 'мест', '')
  num(prev.trunk, cur.trunk, 'багажник', ' л')
  num(prev.clearance, cur.clearance, 'клиренс', ' мм')
  return out
}

/* ---------- Форма «где и когда» ---------- */

function SearchForm({ ref, query, setQuery, onSubmit, openPicker, layout = 'stack', submitLabel = 'Подобрать машину', submitDisabled, params, children }) {
  const [errors, setErrors] = useState({})
  const [paramsOpen, setParamsOpen] = useState(false)
  const pillRef = useRef(null)
  const submitRef = useRef(null)
  usePill(pillRef, query.mode)
  useWake(submitRef, submitDisabled)
  const [returnOpen, setReturnOpen] = useState(false)
  const [datesOpen, setDatesOpen] = useState(false)
  const [hoursOpen, setHoursOpen] = useState(false)
  const location = findPlace(query)
  const set = (patch) => { setQuery((q) => ({ ...q, ...patch })); setErrors({}) }

  const submit = (e) => {
    e.preventDefault()
    const err = {}
    if (!query.locationId) err.location = 'Выбери, где забрать машину'
    if (query.mode === 'days' && (!query.dateFrom || !query.dateTo)) err.dates = 'Укажи даты'
    else if (query.mode === 'days' && query.dateTo < query.dateFrom) err.dates = 'Возврат раньше получения'
    setErrors(err)
    if (Object.keys(err).length === 0) onSubmit(query)
  }

  return (
    <form ref={ref} className={`search search-${layout}`} onSubmit={submit} noValidate>
      <div className="mode-toggle" role="tablist" ref={pillRef}>
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
        {layout === 'row' && <button ref={submitRef} type="submit" className="btn-primary btn-accent" disabled={submitDisabled}>{submitLabel}</button>}
      </div>

      <label className="return-check">
        <input type="checkbox" checked={query.returnMode !== 'same'}
          onChange={(e) => (e.target.checked ? setReturnOpen(true) : set({ returnMode: 'same', returnId: '' }))} />
        Вернуть в другом месте
      </label>

      {children}
      {layout !== 'row' && <button ref={submitRef} type="submit" className="btn-primary" disabled={submitDisabled}>{submitLabel}</button>}
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
    <button key={label} type="button" className={`chip ${on ? 'active' : ''}`} onPointerDown={rippleAt} onClick={onClick}>{label}</button>
  )
  return (
    <Sheet className="sheet-dates" onClose={onClose}>
      <h2 className="dates-title">Расскажи про поездку</h2>
      <div className="dates-scroll">
        <p className="muted">Можно пропустить. Но если скажешь «в горы с детьми», подберём точнее.</p>
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
        {opt('same', 'Где забрали', location?.name ?? 'Там же, где заберёшь')}
        {opt('point', 'В нашей точке', points.map((l) => l.name).join(', '), true)}
        {mode === 'point' && (
          <div className="chips return-points">
            {[{ id: '', name: 'Решу по дороге' }, ...points].map((l) => (
              <button key={l.id} type="button" className={`chip ${id === l.id ? 'active' : ''}`} onClick={() => setId(l.id)}>{l.name}</button>
            ))}
          </div>
        )}
        {opt('free', 'Где удобно', 'Как в каршеринге: оставь на любой парковке в зоне города и заверши аренду в SMS', true)}
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

// Своё поле времени вместо системного select: ячейка + выпадающий список слотов
function TimeSelect({ label, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    ref.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'center' })
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])
  return (
    <div className="dates-time" ref={ref}>
      <button type="button" className="time-btn" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{label}</span>
        <b>{value}<svg className="city-chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4.5l4 4 4-4" /></svg></b>
      </button>
      {open && (
        <div className="time-pop" role="listbox">
          {timeSlots.map((t) => (
            <button key={t} type="button" role="option" aria-selected={t === value} className="city-option" onClick={() => { onChange(t); setOpen(false) }}>
              {t}{t === value && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
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
      <h2 className="dates-title">Когда и надолго ли</h2>
      <div className="dates-times">
        <TimeSelect label="Время получения" value={timeFrom} onChange={setTimeFrom} />
        <TimeSelect label="Время возврата" value={timeTo} onChange={setTimeTo} />
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
          {days ? `Готово · ${days} ${plural(days, 'сутки', 'суток', 'суток')}` : 'Выбери возврат'}
        </button>
      </div>
    </Sheet>
  )
}

/* ---------- Визард подбора на лендинге (как у Airbnb) ---------- */

const plainText = (x) => x.replace(/ /g, ' ').toLowerCase() // в данных неразрывные пробелы
const cityHints = { sochi: 'Море, Красная Поляна, Абхазия', spb: 'Карелия, Выборг, Финский залив', msk: 'Дача, Суздаль, Золотое кольцо', kgd: 'Куршская коса и Балтика', mmk: 'Териберка и северное сияние', kzn: 'Свияжск и Раифа' }

// Пустое поле «Куда едешь»: города сменяют друг друга, как на барабане
function CityDrum() {
  const names = Object.values(cities).map((c) => c.name)
  const [i, setI] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return // без движения — первый город стоит
    const t = setInterval(() => setI((n) => (n + 1) % names.length), 2000)
    return () => clearInterval(t)
  }, [names.length])
  return <span className="drum" aria-hidden="true"><span key={i} className="drum-word">{names[i]}</span></span>
}

function PlacePanel({ query, isReturn, text, type, onClearType, onPick, onReturn }) {
  const location = findPlace(query)
  const [cityId, setCityId] = useState(isReturn ? location?.city : location?.city ?? '')
  const t = isReturn ? '' : text.trim().toLowerCase()
  const row = (l, name = l.name, meet = l.meet, onClick = () => onPick(l)) => (
    <button key={l.id + name} type="button" className="wz-item" onClick={onClick}>
      <span className="wz-ico"><PlaceIcon type={l.type} /></span>
      <span><b>{name}</b><small>{meet}</small></span>
    </button>
  )
  if (t) {
    const found = locations.filter((l) => !isAddress(l) && plainText(`${l.name} ${cities[l.city].name}`).includes(t))
    const city = location?.city ?? found[0]?.city ?? Object.keys(cities)[0]
    const addrPlace = locations.find((l) => l.city === city && l.type === 'Адрес') ?? locations.find((l) => l.city === city && isAddress(l))
    const hints = (addressHints[city] ?? []).filter((a) => plainText(a).includes(t))
    return (
      <>
        {found.length > 0 && <div className="wz-cap">Найдено</div>}
        {found.map((l) => row(l, `${l.name} · ${cities[l.city].name}`))}
        <div className="wz-cap">Адрес · {cities[city].name}</div>
        {(hints.length ? hints : [text.trim()]).map((a) => row(addrPlace, a, 'Привезём к подъезду или к дверям отеля', () => onPick(addrPlace, a)))}
      </>
    )
  }
  if (isReturn) {
    const opt = (key, title, hint, onClick, on) => (
      <button key={key} type="button" className={`wz-item ${on ? 'on' : ''}`} onClick={onClick}>
        <span className="wz-ico"><PlaceIcon type={key === 'free' ? 'Адрес' : 'Город'} /></span><span><b>{title}</b><small>{hint}</small></span>
      </button>
    )
    return (
      <>
        <div className="wz-cap">Где вернуть · {cities[cityId].name} · без доплаты</div>
        {servicePoints(cityId).filter((l) => l.id !== query.locationId).map((l) => row(l, l.name, l.meet, () => onReturn({ returnMode: 'point', returnId: l.id })))}
        {opt('later', 'Решу по дороге', 'Точку возврата можно выбрать позже', () => onReturn({ returnMode: 'point', returnId: '' }), query.returnMode === 'point' && !query.returnId)}
        {opt('free', 'Где удобно', 'Как в каршеринге: на любой парковке в зоне города', () => onReturn({ returnMode: 'free', returnId: '' }), query.returnMode === 'free')}
      </>
    )
  }
  // Пришли с плитки «Машина там, где ты» — сразу точки этого типа, фильтр снимается чипом
  if (type) {
    const g = locationGroups.find((x) => x.type === type)
    return (
      <>
        <button type="button" className="wz-chip" onClick={onClearType}>{g.label}<span aria-hidden="true">✕</span></button>
        {locations.filter((l) => l.type === type && (!cityId || l.city === cityId)).map((l) => row(l, cityId ? l.name : `${l.name} · ${cities[l.city].name}`))}
      </>
    )
  }
  if (cityId) {
    return (
      <>
        <button type="button" className="wz-back" onClick={() => setCityId('')}><Arrow dir="left" />Все города</button>
        <div className="wz-cap">Где забрать · {cities[cityId].name}</div>
        {locationGroups.flatMap((g) => locations.filter((l) => l.city === cityId && l.type === g.type)).map((l) => row(l))}
      </>
    )
  }
  return (
    <>
      <div className="wz-cap">Откуда стартуешь</div>
      {Object.entries(cities).map(([id, c]) => (
        // Город — не выбор, а раскрытие его точек
        <button key={id} type="button" className="wz-item" onClick={() => setCityId(id)}>
          <span className="wz-ico"><PlaceIcon type="Город" /></span><span><b>{c.name}</b><small>{cityHints[id]}</small></span>
        </button>
      ))}
    </>
  )
}

function DatesPanel({ query, set, onNext }) {
  const [offset, setOffset] = useState(0)
  const now = new Date()
  const today = isoDay(now)
  const { dateFrom: from, dateTo: to } = query
  // Первый клик — начало, второй — конец; клик раньше начала начинает заново
  const pick = (d) => (!from || to || d < from ? set({ dateFrom: d, dateTo: '' }) : set({ dateTo: d }))
  const days = from && to ? Math.round((new Date(to) - new Date(from)) / 864e5) : 0
  const month = (i) => {
    const m = new Date(now.getFullYear(), now.getMonth() + offset + i, 1)
    const lead = (m.getDay() + 6) % 7
    const count = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate()
    return (
      <div key={i} className="wz-month">
        <div className="wz-month-head">
          {i === 0 ? <button type="button" disabled={!offset} onClick={() => setOffset(offset - 1)} aria-label="Раньше"><Arrow dir="left" chevron /></button> : <span />}
          <span className="month-name">{m.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(' г.', '')}</span>
          {i === 1 ? <button type="button" onClick={() => setOffset(offset + 1)} aria-label="Позже"><Arrow chevron /></button> : <span />}
        </div>
        <div className="month-grid">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((w) => <span key={w} className="wd">{w}</span>)}
          {Array.from({ length: lead }, (_, k) => <span key={`e${k}`} />)}
          {Array.from({ length: count }, (_, k) => {
            const d = isoDay(new Date(m.getFullYear(), m.getMonth(), k + 1))
            const cls = ['day', d < today && 'past', d === today && 'today', from && to && d > from && d < to && 'in',
              (d === from || d === to) && 'edge', from && to && d === from && 'start', from && to && d === to && 'end'].filter(Boolean).join(' ')
            return <button key={d} type="button" className={cls} disabled={d < today} onClick={() => pick(d)}>{k + 1}</button>
          })}
        </div>
      </div>
    )
  }
  return (
    <>
      <div className="wz-cal">{month(0)}{month(1)}</div>
      <div className="wz-foot">
        <div className="wz-times">
          <TimeSelect label="Получение" value={query.timeFrom} onChange={(v) => set({ timeFrom: v })} />
          <TimeSelect label="Возврат" value={query.timeTo} onChange={(v) => set({ timeTo: v })} />
          <span className="muted">{!from ? 'Выбери, когда заберёшь' : !to ? 'Теперь — день возврата' : `${days} ${plural(days, 'сутки', 'суток', 'суток')}`}</span>
        </div>
        <button type="button" className="btn-primary" disabled={!days} onClick={onNext}>Далее</button>
      </div>
    </>
  )
}

function HoursPanel({ query, set, onNext }) {
  const location = findPlace(query)
  const starts = [['now', `Сейчас${location ? ` · за ${location.etaMin || 5} мин` : ''}`], ...hourSlots().map((t) => [t, t])]
  const chip = (on, label, onClick) => <button key={label} type="button" className={`chip ${on ? 'active' : ''}`} onPointerDown={rippleAt} onClick={onClick}>{label}</button>
  return (
    <>
      <div className="chips-label">Начало, сегодня</div>
      <div className="chips">{starts.map(([v, label]) => chip(query.start === v, label, () => set({ start: v })))}</div>
      <div className="chips-label">На сколько</div>
      <div className="chips">{[2, 4, 8, 12].map((h) => chip(query.hours === h, `${h} ${plural(h, 'час', 'часа', 'часов')}`, () => set({ hours: h })))}</div>
      <div className="wz-foot"><span /><button type="button" className="btn-primary" onClick={onNext}>Далее</button></div>
    </>
  )
}

function ParamsPanel({ query, set, onSubmit }) {
  const chip = (on, label, onClick) => <button key={label} type="button" className={`chip ${on ? 'active' : ''}`} onPointerDown={rippleAt} onClick={onClick}>{label}</button>
  return (
    <>
      <div className="chips-label">Еду</div>
      <div className="chips">{cityPlans(query.cityId).filter((p) => !p.local).map((p) => chip(query.planIds.includes(p.id), p.label, () => set({ planIds: togglePlanIds(query.planIds, p.id) })))}</div>
      <div className="chips-label">С кем</div>
      <div className="chips">{companions.map((c) => chip(query.companion === c.id, c.label, () => set({ companion: query.companion === c.id ? '' : c.id })))}</div>
      <div className="chips-label">Авто</div>
      <div className="chips">{prefOptions.map((o) => chip(query.prefs.includes(o.id), o.label, () => set({ prefs: query.prefs.includes(o.id) ? query.prefs.filter((x) => x !== o.id) : [...query.prefs, o.id] })))}</div>
      <div className="wz-foot"><span className="muted">Можно пропустить. Но если скажешь «в горы с детьми», подберём точнее</span>
        <button type="button" className="btn-primary btn-accent" onClick={onSubmit}>Подобрать машину</button></div>
    </>
  )
}

const mobileQuery = '(max-width: 743px)'
function useMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia(mobileQuery).matches)
  useEffect(() => {
    const mq = window.matchMedia(mobileQuery)
    const on = () => setMobile(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return mobile
}

// Полоса сегментов, панель выбранного шага раскрывается под ней.
// Одиночный выбор сразу ведёт дальше; даты и параметры — по кнопке
// Значение «Когда» — для визарда и липкой шапки
const wizardWhen = (query) => query.mode === 'hours'
  ? `${query.start === 'now' ? 'Сейчас' : `Сегодня, ${query.start}`} · ${query.hours} ч`
  : query.dateFrom ? `${fmtDay(query.dateFrom)}, ${query.timeFrom} — ${query.dateTo ? `${fmtDay(query.dateTo)}, ${query.timeTo}` : '…'}` : ''

export function Wizard({ ref, query, setQuery, step, setStep, placeType, setPlaceType, onSubmit }) {
  const [text, setText] = useState('')
  const barRef = useRef(null)
  const rootRef = useRef(null)
  const pillRef = useRef(null)
  usePill(pillRef, query.mode)
  const inputRef = useRef(null)
  const previousStep = useRef(null)
  const [panelLeft, setPanelLeft] = useState(0)
  const mobile = useMobile()
  const location = findPlace(query)
  const withReturn = query.returnMode !== 'same'
  const set = (patch) => setQuery((q) => ({ ...q, ...patch }))

  const segs = ['place', withReturn && 'return', 'when', 'params'].filter(Boolean)
  const next = (id) => segs[segs.indexOf(id) + 1]
  const go = (id) => { setStep(id); if (id === 'place') inputRef.current?.focus() }

  // Одобренное превью: графитовый отклик и мягкая смена панелей без задержки шага.
  useEffect(() => {
    const previous = previousStep.current
    previousStep.current = step
    if (previous === step) return
    const reduced = reducedMotion()
    const animations = []
    const segment = previous && barRef.current?.querySelector(`[data-seg="${previous}"]`)
    if (segment && !reduced) animations.push(segment.animate(
      [{ backgroundColor: 'var(--surface-strong)' }, { backgroundColor: 'transparent' }],
      { duration: 260, easing: 'ease-out' },
    ))
    const panel = step && (mobile ? document.querySelector('.overlay .sheet') : rootRef.current?.querySelector('.wz-panel'))
    let savedAnimation
    if (panel) {
      savedAnimation = panel.style.animation
      panel.style.animation = 'none'
      animations.push(panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduced ? 150 : 220, easing: 'ease-out' }))
    }
    return () => {
      animations.forEach((animation) => animation.cancel())
      if (panel) panel.style.animation = savedAnimation
    }
  }, [step, mobile])

  // Фильтр с плитки живёт, пока открыт шаг места
  useEffect(() => { if (step !== 'place') setPlaceType?.(null) }, [step, setPlaceType])

  // Панель закрывается кликом мимо и по Esc; шторки на мобилке закрываются сами
  useEffect(() => {
    if (!step || mobile) return
    const onClick = (e) => !rootRef.current?.contains(e.target) && setStep(null)
    const onKey = (e) => e.key === 'Escape' && setStep(null)
    document.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onClick); window.removeEventListener('keydown', onKey) }
  }, [step, setStep, mobile])

  // Узкая панель — под своим сегментом, но не вылезает за полосу
  useEffect(() => {
    const seg = barRef.current?.querySelector(`[data-seg="${step}"]`)
    if (seg) setPanelLeft(Math.max(0, Math.min(seg.offsetLeft, barRef.current.offsetWidth - 440)))
    // Высота панели считается от её верхней кромки, чтобы календарь не уходил за край экрана
    if (step && barRef.current) {
      const top = barRef.current.getBoundingClientRect().bottom + 10
      rootRef.current?.style.setProperty('--wz-top', `${Math.round(top)}px`)
    }
  }, [step, withReturn])

  const pickPlace = (l, address = '') => {
    setQuery((q) => ({ ...changeCity(q, l.city), locationId: l.id, address, returnId: findPlace(q)?.city === l.city ? q.returnId : '' }))
    setText('')
    setStep(withReturn ? 'return' : 'when')
  }
  const missing = () => (!query.locationId ? 'place' : query.mode === 'days' && !(query.dateFrom && query.dateTo && query.dateTo > query.dateFrom) ? 'when' : null)
  const submit = () => { const m = missing(); if (m) go(m); else { setStep(null); onSubmit() } }

  const values = {
    return: location ? returnText(query) : '',
    when: wizardWhen(query),
    params: paramsText(query),
  }
  const labels = { return: 'Где вернуть', when: query.mode === 'days' ? 'Когда' : 'Начало · на сколько', params: 'Параметры' }
  const placeholders = { return: 'Точка возврата', when: 'Даты и время', params: 'Цель, с кем, авто' }
  const clears = { params: { planIds: [], companion: '', prefs: [] } }
  const clearIcon = <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6" /></svg>

  const placeValue = location ? location.name : text
  return (
    <div ref={(el) => { rootRef.current = el; if (ref) ref.current = el }} className="wizard">
      <div className="mode-toggle" role="tablist" ref={pillRef}>
        {[['hours', 'Почасово'], ['days', 'Посуточно']].map(([m, label]) => (
          <button key={m} type="button" role="tab" aria-selected={query.mode === m}
            className={query.mode === m ? 'active' : ''} onClick={() => set({ mode: m })}>{label}</button>
        ))}
      </div>
        <div ref={barRef} className={`wz-bar ${step ? 'has-active' : ''}`}>
          <label data-seg="place" data-i="0" className={`wz-seg wz-wide ${step === 'place' ? 'active' : ''}`}>
            <b>Куда едешь</b>
            <input ref={inputRef} value={placeValue} autoComplete="off" aria-label="Куда едешь"
              readOnly={mobile} onFocus={() => step !== 'place' && setStep('place')}
              onChange={(e) => { setText(e.target.value); if (location) set({ locationId: '', address: '' }) }} />
            {!placeValue && (step === 'place' ? <span className="drum">Город, аэропорт или адрес</span> : <CityDrum />)}
            {location && <button type="button" className="wz-clear" aria-label="Очистить" onClick={() => { set({ locationId: '', address: '' }); go('place') }}>{clearIcon}</button>}
          </label>
          {segs.slice(1).map((id) => (
            <div key={id} data-seg={id} data-i={segs.indexOf(id)} className={`wz-seg ${id === 'when' ? 'wz-wide' : ''} ${step === id ? 'active' : ''}`}>
              <button type="button" className="wz-seg-btn" onClick={() => setStep(step === id ? null : id)}>
                <b>{labels[id]}</b>
                <span className={`wz-val ${values[id] ? 'filled' : ''}`}>{values[id] || placeholders[id]}</span>
              </button>
              {values[id] && clears[id] && <button type="button" className="wz-clear" aria-label="Очистить" onClick={() => { set(clears[id]); setStep(id) }}>{clearIcon}</button>}
            </div>
          ))}
          <button type="button" className="wz-go" aria-label="Подобрать машину" onClick={submit}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></svg>
          </button>
          {step && !mobile && (
            <div className={`wz-panel ${step === 'when' ? 'wz-panel-wide' : ''}`} style={step === 'when' ? undefined : { left: panelLeft }} data-step={step} data-after={segs.indexOf(step)}>
              {step === 'place' && <PlacePanel key={location?.city ?? ''} query={query} text={text} type={placeType} onClearType={() => setPlaceType(null)} onPick={pickPlace} />}
              {step === 'return' && location && <PlacePanel isReturn query={query} text="" onReturn={(p) => { set(p); setStep('when') }} />}
              {step === 'return' && !location && <div className="wz-cap">Сначала скажи, где забрать</div>}
              {step === 'when' && (query.mode === 'days'
                ? <DatesPanel query={query} set={set} onNext={() => setStep(next('when'))} />
                : <HoursPanel query={query} set={set} onNext={() => setStep(next('when'))} />)}
              {step === 'params' && <ParamsPanel query={query} set={set} onSubmit={submit} />}
            </div>
          )}
      </div>
      {/* Мобилка: полноэкранные шторки по очереди — выбрал и сразу следующая */}
      {mobile && step === 'place' && <PlacePicker query={query} group={placeType ?? 'all'} onPick={pickPlace} onClose={() => setStep(null)} />}
      {mobile && step === 'return' && <ReturnPicker query={query} onApply={(p) => { set(p); setStep('when') }} onClose={() => setStep(null)} />}
      {mobile && step === 'when' && (query.mode === 'days'
        ? <DatePicker query={query} onApply={(p) => { set(p); setStep(next('when')) }} onClose={() => setStep(null)} />
        : <HoursPicker query={query} location={location} onApply={(p) => { set(p); setStep(next('when')) }} onClose={() => setStep(null)} />)}
      {mobile && step === 'params' && <ParamsPicker query={query} onApply={(p) => { set(p); setStep(null) }} onClose={() => setStep(null)} />}
      <label className="return-check">
        <input type="checkbox" checked={withReturn}
          onChange={(e) => { set(e.target.checked ? { returnMode: 'point', returnId: '' } : { returnMode: 'same', returnId: '' }); if (e.target.checked && location) setStep('return'); else if (step === 'return') setStep(null) }} />
        Вернуть в другом месте
      </label>
    </div>
  )
}

/* ---------- Э1 Лендинг ---------- */

// Липкая шапка с поиском: въезжает сверху, когда визард ушёл за экран
function StickySearch({ shown, query, onOpen }) {
  const location = findPlace(query)
  const when = wizardWhen(query)
  const params = paramsText(query)
  const searchIcon = <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></svg>
  const segs = [
    ['place', 'Куда едешь', location?.name, 'Город или адрес'],
    ['when', query.mode === 'days' ? 'Когда' : 'Начало · на\u00a0сколько', when, 'Даты и\u00a0время'],
    ['params', 'Параметры', params, 'Цель, с\u00a0кем, авто'],
  ]
  return (
    <div className={`sticky-search ${shown ? 'on' : ''}`} aria-hidden={!shown} inert={!shown}>
      <button type="button" className="logo ss-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Наверх"><span className="logo-on">ON</span>MOVE</button>
      <div className="ss-bar">
        {segs.map(([id, label, value, ph]) => (
          <button key={id} type="button" className="ss-seg" onClick={() => onOpen(id)}>
            <b>{label}</b><span className={value ? 'filled' : ''}>{value || ph}</span>
          </button>
        ))}
        <button type="button" className="wz-go ss-go" aria-label="Подобрать машину" onClick={() => onOpen(location ? 'when' : 'place')}>{searchIcon}</button>
      </div>
      <button type="button" className="ss-pill" onClick={() => onOpen('place')}>
        {searchIcon}
        <span><b>{location?.name || 'Куда едешь'}</b><small>{[when || 'Даты и\u00a0время', params || 'параметры'].join(' · ')}</small></span>
      </button>
    </div>
  )
}


function Landing({ query, setQuery, onSubmit }) {
  const formRef = useRef(null)
  const [formVisible, setFormVisible] = useState(true)
  const [step, setStep] = useState(null) // открытый шаг визарда
  const [placeType, setPlaceType] = useState(null) // фильтр места с плитки «Машина там, где ты»

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setFormVisible(e.isIntersecting))
    io.observe(formRef.current)
    return () => io.disconnect()
  }, [])

  const scrollToForm = () => formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
  // Липкая шапка: на мобилке шторка шага открывается поверх, на десктопе сначала едем к визарду
  const mobile = useMobile()
  const openStep = (id) => { if (mobile) setStep(id); else { scrollToForm(); setTimeout(() => setStep(id), 400) } }
  // Плитка места — тот же визард с отфильтрованным списком; поле «Куда» коротко подсвечиваем, чтобы было видно, куда перенесло
  const pickPlaceType = (type) => {
    setPlaceType(type)
    openStep('place')
    if (mobile || reducedMotion()) return
    const seg = formRef.current.querySelector('[data-seg="place"]')
    setTimeout(() => { seg.classList.add('flash'); setTimeout(() => seg.classList.remove('flash'), 800) }, 450)
  }

  // Допы выбранных планов кладём в запрос — их можно снять на Э3
  const submit = () => {
    setQuery((q) => ({ ...q, extraIds: union(q.extraIds, plans.filter((p) => q.planIds.includes(p.id)).flatMap((p) => p.extraIds ?? [])) }))
    onSubmit()
  }
  // Клик по месту в «Направлениях» — сразу на подбор с этим планом
  const pickPlan = (p) => {
    const ids = p.local && p.goal ? [p.goal, p.id] : [p.id]
    setQuery((q) => ({ ...q, planIds: ids, extraIds: union(q.extraIds, plans.filter((x) => ids.includes(x.id)).flatMap((x) => x.extraIds ?? [])) }))
    onSubmit()
  }

  return (
    <main className="landing">
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">
            <span className="hero-title-line">{'Скажи,'}</span>
            <span className="hero-title-line">{'куда '}<em>едешь</em></span>
          </h1>
          <p className="hero-sub">Одна машина под твою поездку. С объяснением, почему она.</p>
          <div className="hero-kicker">
            <b>Подбор, не каталог</b>
            <span>{'Машину подберём сами\u00a0— без 50 вкладок и сравнений.'}</span>
          </div>
          <Wizard ref={formRef} query={query} setQuery={setQuery} step={step} setStep={setStep} placeType={placeType} setPlaceType={setPlaceType} onSubmit={submit} />
        </div>
      </section>

      <Directions onPick={(cityId, p) => { setQuery((q) => changeCity(q, cityId)); pickPlan(p) }} />
      <WhereYouAre onPick={pickPlaceType} />

      <section className="section" id="promises">
        <p className="kicker">Без сюрпризов</p>
        <h2>{nb('Сюрпризы пусть будут в поездке')}</h2>
        <div className="promises">
          {promises.map((p) => (
            <div key={p.title} className="promise">
              <div className="promise-value">{p.value}</div>
              <b>{p.title}</b>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section faq" id="faq">
        <div className="faq-grid">
          <div>
            <p className="kicker">Вопросы</p>
            <h2>{nb('Что обычно спрашивают')}</h2>
          </div>
          <div className="faq-list">
            {faq.map((f) => (
              <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <button className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="ON MOVE — наверх">
          <span className="logo-on">ON</span>MOVE
        </button>
        <p>{nb('Учебный концепт сервиса аренды машин. Условия показаны как часть концепта.')}</p>
        <button className="back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Наверх<Arrow /></button>
      </footer>

      <StickySearch shown={!formVisible} query={query} onOpen={openStep} />
    </main>
  )
}

// Смена города: место получения и цели другого города сбрасываем
const changeCity = (q, cityId) => ({
  ...q, cityId,
  locationId: findPlace(q)?.city === cityId ? q.locationId : '',
  planIds: q.planIds.filter((id) => cityPlans(cityId).some((p) => p.id === id)),
})

// Фон-заглушка места, пока нет фото: свой градиент у каждого места, остальным — общий
const placeBg = {
  'sochi-ski': '#2e4a63,#8fb0c9 60%,#e9eef2', 'sochi-ritsa': '#123d3a,#2f7d72 55%,#8cc7b5', 'sochi-imereti': '#0f4c75,#3282b8 55%,#f3d9a4',
  'sochi-lagonaki': '#3b4a2a,#7a8f4e 55%,#d9d3a0', 'spb-karelia': '#1f3d36,#3f6f5f 55%,#9cc2b0', 'spb-vyborg': '#3a3550,#6c6487 55%,#c9bfd9',
  'spb-ladoga': '#22344a,#4d6d8f 55%,#d6c4a0', 'msk-ring': '#4a2a2a,#9a5b3c 55%,#e7c08a', 'msk-yakhroma': '#2d3a4f,#7f93ad 55%,#eef1f5',
  'msk-ikea': '#2f4a2b,#6d9a52 55%,#d8e6a8', 'kgd-spit': '#24425a,#5f8aa3 55%,#e8dcb8', 'kgd-castles': '#3a3030,#7a6658 55%,#c9b8a2',
  'kgd-coast': '#1f4d5c,#4f9aa8 55%,#f0e2c0', 'mmk-teriberka': '#1d2a3a,#4a6280 55%,#dfe7ef', 'mmk-aurora': '#0d1b2a,#1f4e5f 55%,#5fd3a0',
  'mmk-khibiny': '#2a3646,#7d8fa6 55%,#eef1f5', 'kzn-sviyazhsk': '#3b2f2a,#8a6a4f 55%,#e3cfa8', 'kzn-raifa': '#22382c,#4f7a5c 55%,#c9dcb8',
  'kzn-bolgar': '#3a3328,#8a7a5a 55%,#e6d8b0',
}
const placeGradient = (id) => `linear-gradient(160deg, ${placeBg[id] ?? '#2b3446,#56627a 55%,#a7a9b8'})`

// Фото мест — Wikimedia Commons: автор, лицензия, страница файла. Без фото остаётся градиент
const placePhoto = {
  'kgd-castles': ['Ruth Leiserowitz', 'CC BY-SA 4.0', 'File:Burgruine_in_Balga,_1995.jpg'],
  'kgd-coast': ['Alexander Grebenkov', 'CC BY 3.0', 'File:Yantarny,_Kaliningrad_Oblast_-_Colorful_sea_and_sky_at_the_beach.jpg'],
  'kgd-spit': ['Alexander Grebenkov', 'CC BY 3.0', 'File:Curonian_Spit_-_Dunes_view_from_Epha_Berg_5.jpg'],
  'kgd-yantarny': ['Alexander Grebenkov', 'CC BY 3.0', 'File:Yantarny,_Kaliningrad_Oblast_-_Sun_shines_through_clouds_on_the_beach.jpg'],
  'kzn-bolgar': ['Alexxx1979', 'CC BY-SA 4.0', 'File:Bolgar._Volga_River_P5181971_2200.jpg'],
  'kzn-raifa': ['Alexxx1979', 'CC BY-SA 4.0', 'File:Raifa_Bogoroditsky_Monastery._Raifskoye_Lake_P6200612_2410.jpg'],
  'kzn-sviyazhsk': ['A.Savin', 'FAL', 'File:View_of_Makaryevsky_Monastery_from_Sviyazhsk_Island_08-2016.jpg'],
  'mmk-khibiny': ['Ninara', 'CC BY 2.0', 'File:Kirovsk,_Russia_(21990875622).jpg'],
  'mmk-teriberka': ['Андрей Сачков', 'CC BY-SA 4.0', 'File:DJI_0200_Андрей_Сачков.jpg'],
  'msk-ikea': ['Velga', 'CC BY-SA 3.0', 'File:Всадник_на_дороге_к_храму..jpg'],
  'msk-ring': ['Ludvig14', 'CC BY-SA 4.0', 'File:Banner_Suzdal_191_1296.jpg'],
  'msk-yakhroma': ['Alexey V. Kurochkin', 'CC BY-SA 4.0', 'File:Hot_air_balloons_near_Yakhroma_(Russia,_Moscow_Oblast)_IMGP0548a1.jpg'],
  'sochi-imereti': ['SKas', 'CC BY-SA 4.0', 'File:Sunset_in_Sochi.jpg'],
  'sochi-lagonaki': ['Alexxx1979', 'CC BY-SA 4.0', 'File:Krasnodar_Krai._Apsheronsky_District._Lago-Naki_P6111675_2575.jpg'],
  'sochi-ritsa': ['Alexxx1979', 'CC BY-SA 4.0', 'File:Abkhazia._Lake_Ritsa_P9100178_2600.jpg'],
  'sochi-ski': ['SKas', 'CC BY-SA 4.0', 'File:Autumn_in_the_Sochi_National_Park_near_Krasnaya_Polyana.JPG'],
  'spb-karelia': ['GAlexandrova', 'CC BY-SA 4.0', 'File:9814._Ruskeala._Italian_canyon.jpg'],
  'spb-ladoga': ['Sergey A. Demidov', 'CC BY 4.0', 'File:20210523_Lake_Ladoga_19.jpg'],
  'spb-vyborg': ['Sergey A. Demidov', 'CC BY 4.0', 'File:20240522_Vyborg_Castle_182.jpg'],
}
const placeImage = (id) => (placePhoto[id] ? `url(${import.meta.env.BASE_URL}places/${id}.webp), ` : '') + placeGradient(id)

// Направления: город → места, где важны и направление, и машина под него. Машину не называем — её показывает подбор
function Directions({ onPick }) {
  const drag = useDragScroll()
  const [cityId, setCityId] = useState('sochi')
  const [active, setActive] = useState(0)
  const places = cityPlans(cityId).filter((p) => p.local).slice(0, 4)
  const fromPrice = (p) => Math.min(...cars.filter((c) => inCity(c, cityId) && p.test(c)).map((c) => cityPrice(c, cityId)))
  const goalLabel = (p) => plans.find((g) => g.id === p.goal)?.label
  const city = (id) => { setCityId(id); setActive(0) }
  return (
    <section className="dir" id="directions">
      <div className="section-top">
        <div>
          <p className="kicker">Направления</p>
          <h2>{nb('Хороший план — просто уехать')}</h2>
        </div>
        <p>{nb('От города до мест, ради которых ты приехал. Покажи, куда хочется, — найдём подходящую машину.')}</p>
      </div>
      <div className="dir-tabs" role="tablist" {...drag}>
        {Object.entries(cities).map(([id, c]) => (
          <button key={id} type="button" role="tab" aria-selected={id === cityId} className={`dir-tab ${id === cityId ? 'on' : ''}`} onClick={() => city(id)}>{c.name}</button>
        ))}
      </div>
      <div className="dir-places" key={cityId}>
        {places.slice(0, 3).map((p, i) => {
          const price = fromPrice(p)
          return (
            <button key={p.id} type="button" style={{ '--i': i }} className="dir-place cut-both"
              onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => onPick(cityId, p)}>
              <div className="dir-place-photo" style={{ backgroundImage: placeImage(p.id) }} />
              <div className="dir-caption">
                <div>
              {goalLabel(p) && <small>{goalLabel(p)}</small>}
              <b>{p.label}</b>
              <span className="dir-hint">{p.hint}</span>
              {Number.isFinite(price) && <span className="dir-price">от {rub(price)} в{' '}сутки</span>}
                </div>
                <Arrow />
              </div>
            </button>
          )
        })}
      </div>
      <div className="dir-tail">
        <span>{nb(`Куда съездить ${cities[cityId].from}`)}</span>
        {placePhoto[places[active]?.id] ? (() => {
          const [author, license, file] = placePhoto[places[active].id]
          return <a className="dir-credit" href={`https://commons.wikimedia.org/wiki/${file}`} target="_blank" rel="noreferrer">Фото: {author} · {license}</a>
        })() : <span>Выбери место — подберём машину<Arrow /></span>}
      </div>
    </section>
  )
}

// Ленту без полосы прокрутки мышью листаем перетаскиванием; клик после перетаскивания не срабатывает
function useDragScroll() {
  const drag = useRef(null)
  return {
    onPointerDown: (e) => {
      if (e.pointerType !== 'mouse') return
      drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false }
    },
    onPointerMove: (e) => {
      const d = drag.current
      if (!d) return
      const dx = e.clientX - d.x
      if (Math.abs(dx) > 5) d.moved = true
      if (d.moved) e.currentTarget.scrollLeft = d.left - dx
    },
    onPointerUp: () => { setTimeout(() => { drag.current = null }) },
    onPointerLeave: () => { drag.current = null },
    onClickCapture: (e) => { if (drag.current?.moved) { e.stopPropagation(); e.preventDefault() } },
  }
}

const whereCopy = {
  'Адрес': 'Подгоним к подъезду, вернуть можно там же',
  'Аэропорт': 'Ждём на парковке у терминала с табличкой',
  'Вокзал': 'Парковка у главного входа, пять минут пешком',
  'Отель': 'Подгоним ко входу и договоримся о парковке',
  'Парковка': 'Наш центр проката — забери сам, когда удобно',
}

// Как зовём точку в списке доставки: глаголом, а не типом места
const deliveryCopy = {
  'Аэропорт': 'Встретим в аэропорту',
  'Отель': 'Привезём к отелю',
  'Адрес': 'Подъедем по твоему адресу',
  'Вокзал': 'Ждём у вокзала',
  'Парковка': 'Заберёшь сам в центре проката',
}

// Доставка: кадр побережья, поверх — плита со списком точек. Клик уводит в визард с нужным типом места
function WhereYouAre({ onPick }) {
  const order = ['Аэропорт', 'Отель', 'Адрес', 'Вокзал', 'Парковка']
  return (
    <section className="delivery" id="delivery">
      <div className="delivery-stage">
        <img src={`${import.meta.env.BASE_URL}places/kgd-coast.webp`} alt="Балтийское побережье — море, песок и низкое небо" loading="lazy" />
        <span className="stage-caption">Балтийское побережье</span>
        <div className="delivery-plate cut-both">
          <p className="kicker">Доставка</p>
          <h2>Машина там,<br />где ты</h2>
          <p>{nb('Привезём к аэропорту, вокзалу или к дверям отеля. Чемодан далеко нести не придётся.')}</p>
          <ul className="delivery-list">
            {order.map((type) => (
              <li key={type}>
                <button type="button" onClick={() => onPick(type)} title={whereCopy[type]}>
                  <span>{deliveryCopy[type]}</span>
                  <Arrow />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ---------- Заставка «Подбираем машину» Э1 → Э2 ---------- */

// Показывает логику подбора по шагам, как в «Что учли», и уходит на Э2 сама или по клику
function Picking({ query, onDone }) {
  const { goal, car, fit, count } = pickCar(query)
  const pool = cars.filter((c) => availability(c, query.locationId) === 'ok' && inCity(c, query.cityId))
  const top = car ? [car, ...fit.filter((c) => c.id !== car.id)].slice(0, 9) : []
  const locationText = query.cityId && cities[query.cityId] ? `Смотрим, что есть ${cities[query.cityId].in}` : 'Смотрим доступные машины'
  const features = car && [car.model, car.drive && `${car.drive} привод`, hasNumber(car.clearance) && `клиренс ${car.clearance} мм`].filter(Boolean).join(' · ')
  const resultText = car ? features : 'Попробуй изменить параметры поездки'
  const caps = goal?.id === 'mountains' ? [
    ['Едешь в горы', locationText],
    ['Для гор нужен полный привод', 'Проверяем, у каких машин он есть'],
    ['Сверяем клиренс', `От 180 мм. С учётом твоих параметров подходят ${count} из ${pool.length}`],
    [car ? 'Нашли. Вот она' : 'Подходящих машин не нашлось', resultText],
  ] : [
    ['Смотрим машины для поездки', locationText],
    [goal?.label || 'Учитываем твои планы', goal?.hint || 'Смотрим подходящие характеристики'],
    ['Сверяем характеристики', `С учётом параметров подходят ${count} из ${pool.length}`],
    [car ? 'Нашли. Вот она' : 'Подходящих машин не нашлось', resultText],
  ]
  const [stage, setStage] = useState(0)
  const [fly, setFly] = useState(false)
  const tiles = useRef({})

  useEffect(() => {
    const W = innerWidth, H = innerHeight, phone = W < 744
    const cols = phone ? 6 : 10, rows = Math.max(1, Math.ceil(pool.length / cols)), gap = phone ? 4 : 8
    const target = document.querySelector('.pick-photo')?.getBoundingClientRect()
    const ratio = target ? target.width / target.height : 1.5
    const tw = Math.min((W * .9 - gap * (cols - 1)) / cols, ((H * .60 - gap * (rows - 1)) / rows) * ratio)
    const th = tw / ratio, ox = (W - (cols * tw + (cols - 1) * gap)) / 2
    const place = (el, x, y, scale = 1) => { if (el) el.style.transform = `translate(${x}px,${y}px) scale(${scale})` }
    pool.forEach((c, i) => {
      const el = tiles.current[c.id]
      el.style.width = `${tw}px`; el.style.height = `${th}px`
      place(el, ox + (i % cols) * (tw + gap), H * (phone ? .34 : .31) + Math.floor(i / cols) * (th + gap))
    })
    const timers = []
    const later = (fn, ms) => timers.push(setTimeout(fn, ms))
    const onKey = (event) => { if (event.key === 'Escape') onDone() }
    window.addEventListener('keydown', onKey)
    if (reducedMotion()) later(onDone, 200)
    else if (!car) { later(() => setStage(3), 700); later(onDone, 1800) }
    else {
      later(() => {
        setStage(1)
        pool.filter((c) => !top.some((item) => item.id === c.id)).forEach((c, i) => {
          const el = tiles.current[c.id]
          el.style.transitionDelay = `${(i % 8) * 60}ms`
          el.classList.add('gone')
        })
      }, 1100)
      later(() => {
        setStage(2)
        const n = Math.min(3, top.length), scale = Math.min(W * .8 / (n * tw), H * .6 / (3 * th)) / 1.04, g = 10
        const cw = tw * scale, ch = th * scale, x = (W - (n * cw + (n - 1) * g)) / 2
        top.forEach((c, i) => place(tiles.current[c.id], x + (i % n) * (cw + g), H * (phone ? .35 : .31) + Math.floor(i / n) * (ch + g), scale))
      }, 2400)
      later(() => { setStage(3); top.forEach((c) => tiles.current[c.id]?.classList.add(c.id === car.id ? 'win' : 'dim')) }, 3500)
      later(() => {
        setFly(true)
        const el = tiles.current[car.id], rect = document.querySelector('.pick-photo')?.getBoundingClientRect()
        top.filter((c) => c.id !== car.id).forEach((c) => tiles.current[c.id]?.classList.add('gone'))
        if (el && rect) place(el, rect.left, rect.top, rect.width / tw)
      }, 4400)
      later(onDone, 5300)
    }
    return () => { timers.forEach(clearTimeout); window.removeEventListener('keydown', onKey) }
  }, [])

  return createPortal(
    <div className={`pickgrid ${fly ? 'fly' : ''}`} role="status" aria-live="polite" onClick={onDone}>
      <div className="pickgrid-bg" />
      <div className="pickgrid-head">
        <strong>{stage < 2 ? pool.length : stage === 3 ? Number(Boolean(car)) : count}</strong>
        <div className="picking-caption" key={stage}><span>{caps[stage][0]}</span><small>{caps[stage][1]}</small></div>
      </div>
      {pool.map((c) => <div key={c.id} ref={(el) => { tiles.current[c.id] = el }} className="pickgrid-tile photo-car" style={carPhoto(c, c.id === car?.id ? 'lg' : 'sm')} />)}
      <button type="button" className="pickgrid-skip" onClick={(e) => { e.stopPropagation(); onDone() }}>Пропустить <small>Esc</small></button>
    </div>, document.body,
  )
}

/* ---------- Э2 Одна машина + переключатели ---------- */

const stockText = (n) => (n === 1 ? 'Осталась 1' : `Осталось ${n}`)
const goods = (prev, cur, q) => carDiff(prev, cur, q).filter((d) => d.good && !d.text.includes('₽')).map((d) => d.text)
const priceDelta = (base, c, q) => { const d = tripTotal(c, q) - tripTotal(base, q); return d ? `${d > 0 ? '+' : '−'}${rub(Math.abs(d))}` : 'та же цена' }

function PickGallery({ car, prev, fav }) {
  const photos = car.gallery.length ? car.gallery : [car.heroImage || car.image]
  const [active, setActive] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const change = (index) => setActive((index + photos.length) % photos.length)
  return (
    <div className="pick-gallery">
      <div className="pick-photo photo-car" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}${photos[active]})` }}>
        {prev && prev.id !== car.id && <div key={`prev-${car.id}`} className="pick-photo-prev photo-car" style={carPhoto(prev, 'lg')} />}
        <button type="button" className="pick-photo-open" onClick={() => setExpanded(true)} aria-label={`Увеличить фото ${car.model}`} />
        <FavToggle id={car.id} fav={fav} />
      </div>
      {photos.length > 1 && <div className="car-gallery-thumbs" role="group" aria-label={`Фотографии ${car.model}`}>
        {photos.map((src, i) => <button key={src} type="button" aria-label={`Фото ${i + 1}`} aria-pressed={i === active} onClick={() => setActive(i)}>
          <img src={`${import.meta.env.BASE_URL}${src}`} alt="" loading="lazy" />
        </button>)}
      </div>}
      {expanded && <Sheet className="sheet-photo" onClose={() => setExpanded(false)}>
        <button type="button" className="photo-close" onClick={() => setExpanded(false)} aria-label="Закрыть">×</button>
        <img src={`${import.meta.env.BASE_URL}${photos[active]}`} alt={`${car.model} — фото ${active + 1}`} />
        {photos.length > 1 && <div className="photo-controls"><button type="button" onClick={() => change(active - 1)} aria-label="Предыдущее фото"><Arrow dir="left" /></button><span>{active + 1} / {photos.length}</span><button type="button" onClick={() => change(active + 1)} aria-label="Следующее фото"><Arrow /></button></div>}
      </Sheet>}
    </div>
  )
}

function PickSpecs({ car, query }) {
  const d = carDetails[car.id]
  const month = new Date(query.dateFrom || Date.now()).getMonth() + 1
  const rows = [
    ['Привод', car.drive], ['Клиренс', d.clearance], ['Коробка', car.gearbox], ['Мест', car.seats],
    ['Багажник', d.bags], ['Двигатель', car.engine], ['Расход', d.fuel], ['Запас хода', d.range], ['Топливо', car.fuelType],
    ...([3, 4, 10, 11].includes(month) ? [['Резина', d.winter ? 'уже зимняя, шипы' : 'летняя']] : []),
  ].filter(([, value]) => value != null && value !== '')
  return <section className="pick-details"><h2>Всё для дороги</h2><dl className="pick-details-list">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
}

function CarAssessment({ car, goal, onComplete, onDismiss }) {
  const [phase, setPhase] = useState(0)
  const [exiting, setExiting] = useState(false)
  const completed = useRef(false)
  const skipRef = useRef(null)
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete
  useEffect(() => {
    const root = document.getElementById('root'), wasInert = root?.inert
    const overflow = document.body.style.overflow
    if (root) root.inert = true
    document.body.style.overflow = 'hidden'
    skipRef.current?.focus({ preventScroll: true })
    let finishTimer
    const finish = () => {
      if (completed.current) return
      completed.current = true
      completeRef.current()
      setExiting(true)
      finishTimer = setTimeout(onDismiss, 400)
    }
    const onKey = (event) => { if (event.key === 'Escape') finish() }
    const timers = [setTimeout(() => setPhase(1), 900), setTimeout(() => setPhase(2), 1800), setTimeout(finish, 2800)]
    window.addEventListener('keydown', onKey)
    skipRef.current?.addEventListener('click', finish)
    return () => {
      timers.forEach(clearTimeout); clearTimeout(finishTimer)
      window.removeEventListener('keydown', onKey)
      skipRef.current?.removeEventListener('click', finish)
      if (root) root.inert = wasInert
      document.body.style.overflow = overflow
    }
  }, [])
  const mountain = goal?.id === 'mountains'
  const captions = mountain ? [
    ['Смотрим, подойдёт ли для гор', car.model],
    ['Проверяем полный привод', car.drive ? `${car.drive[0].toUpperCase() + car.drive.slice(1)} привод` : 'Данные о приводе не указаны'],
    ['Сверяем клиренс', hasNumber(car.clearance) ? `${car.clearance} мм · для гор нужно от 180 мм` : 'Данные о клиренсе не указаны'],
  ] : [
    ['Смотрим, подойдёт ли для поездки', car.model],
    [goal ? `Учитываем: ${goal.label.toLowerCase()}` : 'Сверяем характеристики', goal?.hint || carSummary(car)],
    ['Сверяем параметры', carSummary(car)],
  ]
  return createPortal(
    <div className={`swap-assessment ${exiting ? 'is-exiting' : ''}`} role="dialog" aria-modal="true" aria-label="Проверяем машину">
      <button type="button" ref={skipRef} className="swap-skip">Пропустить <small>Esc</small></button>
      <div className="swap-assessment-content">
        <div className="swap-caption" key={phase} aria-live="polite"><strong>{captions[phase][0]}</strong><span>{captions[phase][1]}</span></div>
        <div className="swap-vehicle" style={carPhoto(car, 'lg')} />
        <div className="swap-steps" aria-hidden="true"><i className={phase >= 0 ? 'active' : ''} /><i className={phase >= 1 ? 'active' : ''} /><i className={phase >= 2 ? 'active' : ''} /></div>
      </div>
    </div>, document.body,
  )
}

export function E2({ query, setQuery, fav, onBack, onPick, openPicker }) {
  const [prev, setPrev] = useState(null) // машина до последнего переключения
  const [pickedId, setPickedId] = useState(null) // выбрал из альтернатив вручную
  const [datesOpen, setDatesOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [assessmentId, setAssessmentId] = useState(null)
  const res = pickCar(query)
  const { goal, places, companion, active, fit } = res
  const car = fit.find((c) => c.id === pickedId) ?? res.car
  const skipped = places.filter((p) => !car || !p.test(car))
  const location = findPlace(query)
  const [paramsOpen, setParamsOpen] = useState(false)

  const change = (patch) => {
    if (car) setPrev(car)
    setPickedId(null)
    setQuery((q) => ({ ...q, ...patch }))
  }
  const chooseNow = (id) => { setPrev(car); setPickedId(id); setMoreOpen(false); window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' }) }
  const choose = (id) => {
    setMoreOpen(false)
    if (reducedMotion()) chooseNow(id)
    else setAssessmentId(id)
  }
  const togglePref = (id) => change({ prefs: query.prefs.includes(id) ? query.prefs.filter((x) => x !== id) : [...query.prefs, id] })

  const reasons = []
  if (goal) reasons.push(<><b>{goal.label}</b> <Arrow /> {goal.hint.toLowerCase()}</>)
  else reasons.push(<>Цель не выбрана — предлагаем одну из основных машин для путешествий</>)
  places.filter((p) => !skipped.includes(p)).forEach((p) => reasons.push(<><b>{p.label}</b> <Arrow /> {p.hint.toLowerCase()}</>))
  if (companion && !skipped.includes(companion)) reasons.push(<><b>{companion.label}</b> <Arrow /> {companion.hint}</>)
  skipped.forEach((s) => reasons.push(<>Под «{s.label.toLowerCase()}» отдельно машин не нашлось — учли остальное</>))
  active.forEach((o) => reasons.push(<>Авто: <b>{o.label}</b></>))
  if (car) reasons.push(<>Подходят {res.count} из {res.total} машин — учли маршрут и твои параметры</>)

  // Тот же порядок, что и в подборе: сначала подходящие машины основной четвёрки.
  const rest = car ? fit.filter((c) => c.id !== car.id) : []
  const tiles = rest.slice(0, 2).map((c) => ({ car: c,
    note: goods(car, c, query).slice(0, 2).join(', ') || 'тоже подходит под параметры' }))

  // «Ещё 7»: та же цель и теги, включая разобранные — они внизу
  const shown = [car, ...tiles.map((t) => t.car)].filter(Boolean).map((c) => c.id)
  const same = rankCars(cars.filter((c) => !shown.includes(c.id) && inCity(c, query.cityId)
    && (!goal || goal.test(c)) && active.every((o) => o.test(c)) && (!companion || companion.test(c))),
    goal, [...places, companion].filter(Boolean))
    .map((c) => ({ car: c, av: availability(c, query.locationId) }))
  const gone = same.filter((x) => x.av !== 'ok').slice(0, 2) // разобранные показываем всегда, но не больше двух
  const more = [...same.filter((x) => x.av === 'ok').slice(0, 7 - gone.length), ...gone]

  const diff = prev && car && prev.id !== car.id ? carDiff(prev, car, query) : null
  const fixes = !car ? active.filter((o) => pickCar(query, query.prefs.filter((x) => x !== o.id)).car) : []

  const cells = (cls) => (
    <div className={`cells ${cls}`}>
      <button type="button" className="cell" onClick={() => openPicker('all')}>
        <PlaceIcon type={location?.type ?? 'Адрес'} />
        <span className="cell-text"><span className="cell-label">Где забрать</span>{location ? location.name : 'Выбери место'}{query.returnMode !== 'same' && <span className="muted"> · вернуть: {returnText(query).toLowerCase()}</span>}</span>
        <span className="cell-arrow"><Arrow chevron /></span>
      </button>
      <button type="button" className="cell" onClick={() => setDatesOpen(true)}>
        <PlaceIcon type="Даты" />
        <span className="cell-text"><span className="cell-label">Когда</span>{whenText(query)}</span>
        <span className="cell-arrow"><Arrow chevron /></span>
      </button>
    </div>
  )

  return (
    <main className="e2">
      <button className="link-back" onClick={onBack}><Arrow dir="left" />На главную</button>

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
              {diff.map((d) => <span key={d.text} className={`diff-item ${d.good ? 'good' : 'bad'}`}>{d.good ? '▲' : '▼'} <CountText text={d.text} /></span>)}
              {query.prefs.length > 0 && <button className="link" onClick={() => change({ prefs: [] })}>Сбросить «Авто»</button>}
            </div>
          )}

          {car ? (
            <div className="pick-card">
              <div className="pick-heading">
                <div className="muted">{paramsText(query) ? 'Под твои параметры' : 'Подобрали для тебя'} · {car.kind}</div>
                <h1 className="pick-title swap-in" key={car.id}>{car.model}</h1>
                <div className="pick-reason">{goal ? <><b>{goal.label}</b> — {goal.hint.toLowerCase()}</> : <>Подобрали машину для твоей поездки</>}</div>
              </div>
              <PickGallery key={car.id} car={car} prev={prev} fav={fav} />
              <PickSpecs car={car} query={query} />
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
              <div className="why-title">Или глянь</div>
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
              <button className="btn-primary" onClick={() => onPick(car.id)}>Подобрать допы</button>
              <div className="book-note muted">✓ Бесплатная отмена за 48 ч</div>
            </div>
          )}
          <div className="why">
            <div className="why-title">Что учли</div>
            <ul className="why-list">{reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </div>
        </aside>
      </div>

      {assessmentId && <CarAssessment key={assessmentId} car={cars.find((item) => item.id === assessmentId)} goal={goal}
        onComplete={() => chooseNow(assessmentId)} onDismiss={() => setAssessmentId(null)} />}
      {paramsOpen && <ParamsPicker query={query} onApply={(patch) => { change(patch); setParamsOpen(false) }} onClose={() => setParamsOpen(false)} />}
      {datesOpen && <DatePicker query={query} onClose={() => setDatesOpen(false)}
        onApply={(patch) => { change({ ...patch, mode: 'days' }); setDatesOpen(false) }} />}
      {moreOpen && (
        <Sheet className="sheet-full sheet-modal" onClose={() => setMoreOpen(false)}>
          <div className="picker-head">
            <button className="icon-btn" aria-label="Закрыть" onClick={() => setMoreOpen(false)}><Arrow dir="left" /></button>
            <h2>{goal ? `Ещё под «${goal.label.toLowerCase()}»` : 'Ещё машины'}</h2>
          </div>
          <div className="more-list">
            {more.map(({ car: c, av }) => (
              <button key={c.id} type="button" className={`more-row ${av !== 'ok' ? 'off' : ''}`} disabled={av !== 'ok'} onClick={() => choose(c.id)}>
                <span className="more-photo photo-car" style={carPhoto(c)} />
                <span className="more-text"><b>{c.model}</b>
                  <span className="muted">{av === 'sold' ? 'На эти даты все уехали' : av === 'place' ? 'Нет в этой точке' : goods(car, c, query).slice(0, 2).join(', ') || c.kind}</span></span>
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

const carPresentation = {
  mountains: nb('За поворотом — следующий вид. У Tank 300 полный привод и клиренс 224 мм: выбрали его для маршрута в горы.'),
  sea: nb('Сегодня — один пляж, завтра — другой. RAV4 с полным приводом и вариатором подойдёт для поездки вдоль побережья.'),
  dacha: nb('Свернуть к дому за лесом. Niva Legend Sport — полный привод, механика и клиренс 220 мм для выезда за город.'),
  highway: nb('Пусть дорога станет частью отпуска. BMW X3 с автоматом и полным приводом — наш выбор для поездки по трассе.'),
}

function CarGallery({ car }) {
  const photos = car.gallery.length ? car.gallery : [car.image]
  const [active, setActive] = useState(0)
  const change = (index) => setActive((index + photos.length) % photos.length)
  return (
    <div className="car-gallery" onKeyDown={(e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault(); change(active + (e.key === 'ArrowRight' ? 1 : -1))
      }
    }}>
      <img className="e3-photo" src={`${import.meta.env.BASE_URL}${photos[active]}`} alt={`${car.model} — фото ${active + 1}`} />
      {photos.length > 1 && <div className="car-gallery-thumbs" role="group" aria-label="Фотографии автомобиля">
        {photos.map((src, i) => <button key={src} type="button" aria-label={`Фото ${i + 1}`} aria-pressed={i === active}
          onClick={() => setActive(i)}><img src={`${import.meta.env.BASE_URL}${src}`} alt="" loading="lazy" /></button>)}
      </div>}
    </div>
  )
}

export function E3({ query, setQuery, carId, cameFrom, fav, onBack, onPickOther, openPicker, onBook }) {
  const car = cars.find((c) => c.id === carId)
  const d = carDetails[car.id]
  const location = findPlace(query)
  const city = cities[location?.city ?? query.cityId]
  const widgetRef = useRef(null)
  const [edit, setEdit] = useState(null) // 'when' | 'return' | 'goal'
  // Цель поездки: если машину открыли с главной, её ещё нет — предлагаем только цели под эту машину
  const goal = plans.find((p) => !p.local && query.planIds.includes(p.id))
  const carGoals = cityPlans(location?.city ?? query.cityId).filter((p) => !p.local && p.test(car))
  const pickGoal = (p) => {
    setQuery((q) => ({ ...q, planIds: [p.id], extraIds: union(q.extraIds, p.extraIds ?? []) }))
    setEdit(null)
  }

  const ready = queryReady(query)
  const status = ready ? availability(car, query.locationId) : null
  const chosen = extras.filter((x) => query.extraIds.includes(x.id))
  const total = tripTotal(car, query)

  const placesHere = locations.filter((l) => l.city === (location?.city ?? query.cityId) && l.id !== query.locationId && !d.unavailableAt.includes(l.id))

  const toggle = (id) => setQuery((q) => ({ ...q, extraIds: q.extraIds.includes(id) ? q.extraIds.filter((x) => x !== id) : [...q.extraIds, id] }))
  const scrollToWidget = () => widgetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const perLabel = (x) => (x.price === 0 ? 'бесплатно' : `${rub(x.price)}${x.per === 'day' ? ' / сутки' : ' за\u00a0аренду'}`)
  const book = () => onBook()

  // Резину показываем только в межсезонье
  const month = new Date(query.dateFrom || Date.now()).getMonth() + 1
  const offSeason = [3, 4, 10, 11].includes(month)

  const specs = [
    ['Двигатель', car.engine], ['Коробка', car.gearbox], ['Топливо', car.fuelType], ['Расход', d.fuel],
    ['Запас хода', d.range], ['Клиренс', d.clearance], ['Багаж', d.bags], ['Привод', car.drive], ['Мест', car.seats],
    ...(offSeason ? [['Резина', d.winter ? 'уже зимняя, шипы' : 'летняя']] : []),
  ].filter(([, value]) => value != null && value !== '')

  return (
    <main className="e3">
      <button className="link-back" onClick={onBack}><Arrow dir="left" />{cameFrom === 'e2' ? 'Сменить машину — допы сохранятся' : 'На главную'}</button>

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
          <CarGallery car={car} />

          <section className="e3-section">
            <h2>Для поездки</h2>
            {car.demoScenario && <p>{carPresentation[car.demoScenario]}</p>}
            <dl className="specs">{specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </section>

          {(city?.routes ?? d.routes).length > 0 && <section className="e3-section">
            <h2>Подходит для маршрутов</h2>
            <div className="routes">{(city?.routes ?? d.routes).map((r) => <span key={r} className="route">{r}</span>)}</div>
          </section>}

          <section className="e3-section">
            <h2>Как заберёшь машину</h2>
            <ol className="steps">
              <li><b>{location ? location.name : 'Выбери, где забрать'}</b>
                <span>{location ? location.meet : 'аэропорт, вокзал, отель, парковка или к дому'}
                  {location && isNow(query) ? ` — подадим через ${location.etaMin + car.etaAdd} мин` : ''}</span></li>
              <li><b>Встречает сотрудник — 10 минут</b>
                <span>Вместе обходим машину и фотографируем её — акт с фото приходит в телефон, так чужие царапины не станут твоими. Показываем, как работают допы, и отдаём ключи</span></li>
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
              <dt>Пробег</dt><dd>{query.extraIds.includes('unlimited') ? 'Без ограничений — безлимит в твоём расчёте' : `${rentTerms.mileage}. Или возьми безлимит в допах ниже`}</dd>
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
                    <span className="extra-text">
                      <span className="extra-name">{x.name}</span>
                      <span className="extra-price">{perLabel(x)}{x.note && ` · ${x.note}`}</span>
                    </span>
                    <input type="checkbox" role="switch" className="switch" checked={query.extraIds.includes(x.id)} onChange={() => toggle(x.id)} />
                  </label>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="e3-aside" ref={widgetRef}>
          <div className="book-tiles">
            <button type="button" className={`book-tile ${goal && !goal.test(car) ? 'book-tile-warn' : ''}`} onClick={() => setEdit('goal')}>
              <PlaceIcon type="Цель" />
              <span className="cell-text"><span className="cell-label">Цель поездки</span>{goal ? goal.label : <span className="muted">Подберём под неё машину</span>}</span>
              <span className="cell-arrow"><Arrow chevron /></span>
            </button>
            {goal && !goal.test(car) && (
              <div className="goal-warn">
                Для «{goal.label}» {car.model} не лучший выбор. Нужно: {goal.hint[0].toLowerCase() + goal.hint.slice(1)}.{' '}
                <button type="button" className="link" onClick={onPickOther}>Подобрать под цель</button>
              </div>
            )}
            {[
              ['Где', location ? location.name : 'Выбери место', location?.type ?? 'Адрес', () => openPicker('all')],
              ['Когда', whenText(query), 'Даты', () => setEdit('when')],
              ['Вернуть', returnText(query), 'Возврат', () => setEdit('return')],
            ].map(([label, value, icon, onClick]) => (
              <button key={label} type="button" className="book-tile" onClick={onClick}>
                <PlaceIcon type={icon} />
                <span className="cell-text"><span className="cell-label">{label}</span>{value}</span>
                <span className="cell-arrow"><Arrow chevron /></span>
              </button>
            ))}
          </div>

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

          {ready && <div className="book-sum-tile">
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
            onClick={book}>Забронировать</button>
          {status === 'ok' && <div className="book-note muted">✓ Бесплатная отмена за 48 ч</div>}
          </div>}
          {edit === 'when' && (query.mode === 'hours'
            ? <HoursPicker query={query} location={location} onApply={(patch) => { setQuery((q) => ({ ...q, ...patch })); setEdit(null) }} onClose={() => setEdit(null)} />
            : <DatePicker query={query} onApply={(patch) => { setQuery((q) => ({ ...q, ...patch })); setEdit(null) }} onClose={() => setEdit(null)} />)}
          {edit === 'goal' && (
            <Sheet className="sheet-dates" onClose={() => setEdit(null)}>
              <h2 className="dates-title">Цель поездки</h2>
              <div className="dates-scroll">
                <p className="muted">Только цели, для которых подходит {car.model}</p>
                {carGoals.map((p) => (
                  <button key={p.id} type="button" className={`row-cell goal-option ${goal?.id === p.id ? 'on' : ''}`} onClick={() => pickGoal(p)}>
                    <span className="row-text"><span className="plan-label">{p.label}</span><span className="plan-hint">{p.hint}</span></span>
                    {goal?.id === p.id && <span className="row-arrow">✓</span>}
                  </button>
                ))}
                <p className="muted goal-other">Для других целей лучше другая машина — <button type="button" className="link" onClick={() => { setEdit(null); onPickOther() }}>подобрать под цель</button></p>
              </div>
            </Sheet>
          )}
          {edit === 'return' && <ReturnPicker query={query} onApply={(patch) => { setQuery((q) => ({ ...q, ...patch })); setEdit(null) }} onClose={() => setEdit(null)} />}

          {(status === 'sold' || status === 'place') && (
            <button className="btn-secondary" onClick={onPickOther}>Подобрать другую — допы сохранятся</button>
          )}
        </aside>
      </div>

      <div className="e3-bar">
        <div>
          <div className="price">{status === 'ok' ? rub(total) : `${rub(car.pricePerDay)} / сутки`}</div>
          <div className="muted">{status === 'ok' ? `за ${unitsText(query)}, с допами` : status ? 'недоступна' : 'укажи, где и когда'}</div>
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
  const pillRef = useRef(null)
  usePill(pillRef, way)
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
    if (digits.length < 10) { setError('Введи номер полностью'); return }
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
      <div className="mode-toggle" ref={pillRef}>
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

export function Final({ booking, onHome, onBookings, animate = false }) {
  const { query } = booking
  const car = cars.find((c) => c.id === booking.carId)
  const location = findPlace(query)
  const inCar = extras.filter((x) => query.extraIds.includes(x.id) && (x.group === 'trip' || x.id === 'child-seat'))
  const startText = isNow(query) ? `через ${location.etaMin + car.etaAdd} мин` : query.mode === 'hours' ? `сегодня в ${query.start}` : `${fmtDate(query.dateFrom)} ${query.timeFrom}`
  const sms = `Машина ждёт тебя: ${car.model}, ${location.name}, ${startText}.${inCar.length ? ` ${inCar.map((x) => x.name.replace(/\s+в\s+машине$/, '')).join(', ')} — уже внутри.` : ''} Открыть: rent.ru/b/${booking.id}`

  return (
    <main className={`final ${animate ? 'final-confirmation' : ''}`}>
      <div className="final-in">
        <div>
          <div className="final-kick">Забронировано</div>
          <h1 className="final-title">Машина будет ждать тебя здесь</h1>
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
            <div className="final-actions">
              <button className="btn-secondary" onClick={onHome}>На главную</button>
              <button className="link" onClick={onBookings}>Все бронирования</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

/* ---------- Бронирования ---------- */

const HOUR = 60 * 60 * 1000
// Начало и конец аренды по запросу брони
function bookingTimes(b) {
  const q = b.query
  if (q.mode === 'hours') {
    const from = q.start === 'now' ? b.createdAt : new Date(`${isoDay(new Date(b.createdAt))}T${q.start}`).getTime()
    return { from, to: from + q.hours * HOUR }
  }
  return { from: new Date(`${q.dateFrom}T${q.timeFrom}`).getTime(), to: new Date(`${q.dateTo}T${q.timeTo}`).getTime() }
}
function bookingStatus(b) {
  if (b.cancelled) return 'cancel'
  const { from, to } = bookingTimes(b)
  const now = Date.now()
  return now < from ? 'up' : now < to ? 'now' : 'done'
}
const statusLabel = { up: 'Предстоит', now: 'Идёт', done: 'Завершена', cancel: 'Отменена' }

function Bookings({ bookings, onHome, onShow, onRepeat, onCancel }) {
  const [confirm, setConfirm] = useState(null)
  const active = bookings.filter((b) => ['up', 'now'].includes(bookingStatus(b)))
  const past = bookings.filter((b) => ['done', 'cancel'].includes(bookingStatus(b)))
  const canCancel = (b) => bookingStatus(b) === 'up' && bookingTimes(b).from - Date.now() > 48 * HOUR

  const card = (b) => {
    const car = cars.find((c) => c.id === b.carId)
    const st = bookingStatus(b)
    return (
      <div key={b.id + b.createdAt} className={`trip ${st === 'done' || st === 'cancel' ? 'trip-past' : ''}`}>
        <div className="trip-photo photo-car" style={carPhoto(car)} />
        <div className="trip-body">
          <div className="trip-top"><b className="trip-model">{car.model}</b><span className={`trip-status trip-${st}`}>{statusLabel[st]}</span></div>
          <div className="trip-info">
            <div><span className="muted">Где · </span>{findPlace(b.query)?.name}</div>
            <div><span className="muted">Когда · </span>{whenText(b.query)}</div>
            <div><span className="muted">Вернуть · </span>{returnText(b.query)}</div>
          </div>
          <div className="trip-foot">
            <b className="trip-sum">{rub(b.total)}</b>
            {(st === 'up' || st === 'now') && <button className="btn-primary btn-sm" onClick={() => onShow(b)}>Где машина</button>}
            {canCancel(b) && <button className="link trip-cancel-link" onClick={() => setConfirm(b)}>Отменить</button>}
            {(st === 'done' || st === 'cancel') && <button className="btn-secondary btn-sm" onClick={() => onRepeat(b)}>Повторить поездку</button>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="trips">
      <button className="link-back" onClick={onHome}><Arrow dir="left" />На главную</button>
      <h1>Бронирования</h1>
      {bookings.length === 0 ? (
        <div className="trips-empty">
          <b>Пока нет поездок</b>
          <p className="muted">Расскажи о планах — подберём машину</p>
          <button className="btn-primary btn-accent" onClick={onHome}>Подобрать машину</button>
        </div>
      ) : (
        <>
          {active.length > 0 && <><h2 className="trips-group">Предстоящие</h2>{active.map(card)}</>}
          {past.length > 0 && <><h2 className="trips-group">Прошлые</h2>{past.map(card)}</>}
        </>
      )}
      {confirm && (
        <Sheet className="sheet-center" onClose={() => setConfirm(null)}>
          <h2>Отменить бронь?</h2>
          <p className="muted">{cars.find((c) => c.id === confirm.carId).model}, {whenText(confirm.query)}. Отмена бесплатная — до получения больше 48 часов.</p>
          <div className="trips-confirm">
            <button className="btn-secondary" onClick={() => setConfirm(null)}>Оставить</button>
            <button className="btn-primary" onClick={() => { onCancel(confirm.id); setConfirm(null) }}>Отменить бронь</button>
          </div>
        </Sheet>
      )}
    </main>
  )
}
