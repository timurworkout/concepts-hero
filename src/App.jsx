import { useEffect, useRef, useState } from 'react'
import { locations, locationGroups, cars, kinds, offers, rub } from './data.js'

const carPhoto = (c, size = 'sm') => ({ backgroundImage: `url(${import.meta.env.BASE_URL}cars/${size}/${c.id}.webp)` })

const emptyQuery = {
  locationId: '',
  mode: 'dates', // 'dates' | 'now'
  dateFrom: '',
  timeFrom: '12:00',
  dateTo: '',
  timeTo: '12:00',
  offerId: null,
  carId: null,
}

export default function App() {
  const [query, setQuery] = useState(emptyQuery)
  const [screen, setScreen] = useState('e1') // 'e1' | 'e2' | 'e3'
  const [pickedCarId, setPickedCarId] = useState(null)

  useEffect(() => { window.scrollTo(0, 0) }, [screen])

  if (screen === 'e3') return <StubE3 query={query} carId={pickedCarId} onBack={() => setScreen('e2')} />
  if (screen === 'e2') return (
    <E2 query={query} setQuery={setQuery} onBack={() => setScreen('e1')}
      onPick={(id) => { setPickedCarId(id); setScreen('e3') }} />
  )
  return <Landing query={query} setQuery={setQuery} onSubmit={() => setScreen('e2')} />
}

function Landing({ query, setQuery, onSubmit }) {
  const formRef = useRef(null)
  const [formVisible, setFormVisible] = useState(true)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setFormVisible(e.isIntersecting))
    io.observe(formRef.current)
    return () => io.disconnect()
  }, [])

  const scrollToForm = () => formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const pickOffer = (offer) => {
    setQuery((q) => ({ ...q, locationId: offer.locationId, offerId: offer.id }))
    scrollToForm()
  }

  const pickCar = (car) => {
    setQuery((q) => ({ ...q, carId: car.id }))
    scrollToForm()
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <h1>Машина ждёт тебя,<br />а время поездки остаётся на места</h1>
          <SearchForm ref={formRef} query={query} setQuery={setQuery} onSubmit={onSubmit} />
        </div>
      </section>

      <section className="section">
        <Scroller title="Примеры машин">
          {cars.map((c) => (
            <button key={c.id} className="card car-card" onClick={() => pickCar(c)}>
              <div className="card-photo photo-car" style={carPhoto(c)} />
              <div className="card-body">
                <div className="muted">{c.kind}</div>
                <div className="card-title">{c.model}</div>
                <div className="price">{rub(c.pricePerDay)} / сутки</div>
              </div>
            </button>
          ))}
        </Scroller>
      </section>

      <section className="section">
        <Scroller title="Сезонные предложения">
          {offers.map((o) => (
            <button key={o.id} className="card offer-card" onClick={() => pickOffer(o)}>
              <div className={`card-photo photo-${o.id}`} />
              <div className="card-body">
                <div className="card-title">{o.title}</div>
                <div className="muted">{o.route}</div>
                <div className="body-sm">{o.car} + {o.includes.join(', ')}</div>
                <div className="price">от {o.priceFrom}</div>
              </div>
            </button>
          ))}
        </Scroller>
      </section>

      {!formVisible && (
        <div className="sticky-cta">
          <button className="btn-primary" onClick={scrollToForm}>Подобрать машину</button>
        </div>
      )}
    </main>
  )
}

function SearchForm({ ref, query, setQuery, onSubmit }) {
  const [errors, setErrors] = useState({})
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [text, setText] = useState('')

  const location = locations.find((l) => l.id === query.locationId)
  const offer = offers.find((o) => o.id === query.offerId)
  const car = cars.find((c) => c.id === query.carId)
  const set = (patch) => {
    setQuery((q) => ({ ...q, ...patch }))
    setErrors({})
  }

  const matches = locations.filter((l) => l.name.toLowerCase().includes(text.toLowerCase()))

  const submit = (e) => {
    e.preventDefault()
    const err = {}
    if (!query.locationId) err.location = 'Выберите, где забрать машину'
    if (query.mode === 'dates' && (!query.dateFrom || !query.dateTo)) err.dates = 'Укажите даты'
    else if (query.mode === 'dates' && query.dateTo < query.dateFrom) err.dates = 'Возврат раньше получения'
    setErrors(err)
    if (Object.keys(err).length === 0) onSubmit(query)
  }

  return (
    <form ref={ref} className="search" onSubmit={submit} noValidate>
      <div className="mode-toggle" role="tablist">
        <button type="button" role="tab" aria-selected={query.mode === 'dates'}
          className={query.mode === 'dates' ? 'active' : ''} onClick={() => set({ mode: 'dates' })}>
          На даты
        </button>
        <button type="button" role="tab" aria-selected={query.mode === 'now'}
          className={query.mode === 'now' ? 'active' : ''} onClick={() => set({ mode: 'now' })}>
          Сейчас
        </button>
      </div>

      <div className={`field ${errors.location ? 'has-error' : ''}`}>
        <label htmlFor="loc">Где</label>
        <input
          id="loc"
          placeholder="Аэропорт, вокзал, отель или адрес"
          autoComplete="off"
          value={suggestOpen ? text : location?.name ?? text}
          onFocus={() => { setText(''); setSuggestOpen(true) }}
          onBlur={() => setTimeout(() => setSuggestOpen(false), 150)}
          onChange={(e) => setText(e.target.value)}
        />
        {suggestOpen && (
          <div className="suggest">
            {locationGroups.map((g) => {
              const items = matches.filter((l) => l.type === g)
              if (!items.length) return null
              return (
                <div key={g}>
                  <div className="suggest-group">{g}</div>
                  {items.map((l) => (
                    <button type="button" key={l.id} className="suggest-item"
                      onMouseDown={() => { set({ locationId: l.id }); setSuggestOpen(false) }}>
                      {l.name}
                    </button>
                  ))}
                </div>
              )
            })}
            {!matches.length && <div className="suggest-empty">Ничего не нашли</div>}
          </div>
        )}
        {errors.location && <div className="error">{errors.location}</div>}
      </div>

      {query.mode === 'dates' ? (
        <div className={`field dates ${errors.dates ? 'has-error' : ''}`}>
          <div className="date-pair">
            <label><span>Получение</span>
              <input type="date" value={query.dateFrom} onChange={(e) => set({ dateFrom: e.target.value })} />
              <input type="time" value={query.timeFrom} onChange={(e) => set({ timeFrom: e.target.value })} />
            </label>
            <label><span>Возврат</span>
              <input type="date" value={query.dateTo} min={query.dateFrom} onChange={(e) => set({ dateTo: e.target.value })} />
              <input type="time" value={query.timeTo} onChange={(e) => set({ timeTo: e.target.value })} />
            </label>
          </div>
          {errors.dates && <div className="error">{errors.dates}</div>}
        </div>
      ) : (
        <div className="field now-hint">Покажем ближайшие машины и время подачи</div>
      )}

      {(offer || car) && (
        <div className="chips">
          {offer && (
            <span className="chip">{offer.chip}
              <button type="button" aria-label="Убрать набор" onClick={() => set({ offerId: null })}>×</button>
            </span>
          )}
          {car && <div className="hint">Укажите, где и когда, — покажем {car.model}</div>}
        </div>
      )}

      <button type="submit" className="btn-primary">Подобрать машину</button>
    </form>
  )
}

const dayMs = 24 * 60 * 60 * 1000

function rentDays(q) {
  if (q.mode !== 'dates') return 1
  const from = new Date(`${q.dateFrom}T${q.timeFrom}`)
  const to = new Date(`${q.dateTo}T${q.timeTo}`)
  return Math.max(1, Math.ceil((to - from) / dayMs))
}

const fmtDate = (d) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })

function summary(q) {
  const loc = locations.find((l) => l.id === q.locationId)?.name
  if (q.mode === 'now') return `${loc} · сейчас`
  return `${loc} · ${fmtDate(q.dateFrom)} – ${fmtDate(q.dateTo)}`
}

const filterChips = [
  ...kinds.map((k) => ({ id: k, label: k, test: (c) => c.kind === k })),
  { id: '4x4', label: '4×4', test: (c) => c.tags.includes('4×4') },
  { id: 'box', label: 'есть бокс', test: (c) => c.tags.includes('есть бокс') },
  { id: 'seats7', label: '7 мест', test: (c) => c.seats >= 7 },
]

function E2({ query, setQuery, onBack, onPick }) {
  const [editing, setEditing] = useState(false)
  const [filters, setFilters] = useState([])
  const location = locations.find((l) => l.id === query.locationId)
  const offer = offers.find((o) => o.id === query.offerId)
  const days = rentDays(query)
  const firstId = query.carId ?? offer?.carId
  const eta = (c) => location.etaMin + c.etaAdd

  const toggle = (id) => setFilters((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
  const active = filterChips.filter((f) => filters.includes(f.id))

  const list = cars
    .filter((c) => active.every((f) => f.test(c)))
    .sort((a, b) => {
      // разобранные в конце, выбранная машина первой
      if ((a.stock === 0) !== (b.stock === 0)) return a.stock === 0 ? 1 : -1
      if (a.id === firstId) return -1
      if (b.id === firstId) return 1
      return query.mode === 'now' ? eta(a) - eta(b) : a.pricePerDay - b.pricePerDay
    })

  return (
    <main className="e2">
      <div className="e2-top">
        <button className="link-back" onClick={onBack}>← На главную</button>
        <div className="summary">
          <span className="summary-text">{summary(query)}</span>
          <button className="btn-secondary btn-sm" onClick={() => setEditing((v) => !v)}>
            {editing ? 'Закрыть' : 'Изменить'}
          </button>
        </div>
        {offer && !editing && (
          <span className="chip">{offer.chip}
            <button type="button" aria-label="Убрать набор" onClick={() => setQuery((q) => ({ ...q, offerId: null }))}>×</button>
          </span>
        )}
        {editing && (
          <div className="e2-edit">
            <SearchForm query={query} setQuery={setQuery} onSubmit={() => setEditing(false)} />
          </div>
        )}
      </div>

      <div className="filters">
        {filterChips.map((f) => (
          <button key={f.id} className={`filter ${filters.includes(f.id) ? 'active' : ''}`}
            aria-pressed={filters.includes(f.id)} onClick={() => toggle(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <p>Под эти фильтры машин нет</p>
          <button className="btn-secondary" onClick={() => setFilters([])}>Сбросить фильтры</button>
        </div>
      ) : (
        <div className="car-grid">
          {list.map((c) => {
            const soldOut = c.stock === 0
            return (
              <button key={c.id} className={`card car-item ${soldOut ? 'sold-out' : ''}`}
                disabled={soldOut} onClick={() => onPick(c.id)}>
                <div className="card-photo photo-car" style={carPhoto(c, 'lg')}>
                  <div className="badges">
                    {offer?.carId === c.id && <span className="badge">В наборе</span>}
                    {soldOut && <span className="badge">Разобрали</span>}
                    {c.stock > 0 && <span className="badge badge-hot">{c.stock === 1 ? 'Осталась 1' : `Осталось ${c.stock}`}</span>}
                  </div>
                  <span>{c.model}</span>
                </div>
                <div className="card-body">
                  <div className="muted">{c.kind}</div>
                  <div className="card-title">{c.model}</div>
                  <div className="tags">{c.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
                  {query.mode === 'now' && !soldOut && <div className="eta">Будет через {eta(c)} мин</div>}
                  <div className="price">{rub(c.pricePerDay)} / сутки</div>
                  {query.mode === 'dates' && <div className="muted">{rub(c.pricePerDay * days)} за {days} сут.</div>}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </main>
  )
}

function StubE3({ query, carId, onBack }) {
  const offer = offers.find((o) => o.id === query.offerId)
  const car = cars.find((c) => c.id === carId)
  return (
    <main className="stub">
      <h1>Э3 в работе</h1>
      <p className="muted">Э2 передал на оформление:</p>
      <dl>
        <dt>Запрос</dt><dd>{summary(query)}</dd>
        <dt>Режим</dt><dd>{query.mode === 'now' ? 'Сейчас' : 'На даты'}</dd>
        <dt>Машина</dt><dd>{car.model}</dd>
        <dt>Набор</dt><dd>{offer ? offer.chip : '—'}</dd>
      </dl>
      <button className="btn-secondary" onClick={onBack}>← Назад к машинам</button>
    </main>
  )
}

function Scroller({ title, children }) {
  const ref = useRef(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const update = () => {
    const el = ref.current
    setEdges({ start: el.scrollLeft <= 1, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 })
  }
  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Перетаскивание мышью; на тач-экранах лента листается нативно
  const drag = useRef(null)
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d || e.buttons !== 1) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true
      ref.current.classList.add('dragging')
    }
    if (d.moved) ref.current.scrollLeft = d.left - dx
  }
  const onPointerUp = () => {
    if (drag.current?.moved) ref.current.classList.remove('dragging')
  }
  // Не открываем карточку, если её тянули
  const onClickCapture = (e) => {
    if (drag.current?.moved) { e.stopPropagation(); e.preventDefault() }
    drag.current = null
  }

  const scrollBy = (dir) => ref.current.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' })

  return (
    <>
      <div className="section-head">
        <h2>{title}</h2>
        <div className="arrows">
          <button className="arrow" aria-label="Назад" disabled={edges.start} onClick={() => scrollBy(-1)}>‹</button>
          <button className="arrow" aria-label="Вперёд" disabled={edges.end} onClick={() => scrollBy(1)}>›</button>
        </div>
      </div>
      <div className="scroller" ref={ref} onScroll={update}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
        onClickCapture={onClickCapture} onDragStart={(e) => e.preventDefault()}>{children}</div>
    </>
  )
}
