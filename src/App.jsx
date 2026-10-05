import { Fragment, useEffect, useRef, useState } from 'react'
import { locations, locationGroups, cars, scenarios, offers, rub, carDetails, rentTerms, extras } from './data.js'

const carPhoto = (c, size = 'sm') => ({ backgroundImage: `url(${import.meta.env.BASE_URL}cars/${size}/${c.id}.webp)` })

const emptyQuery = {
  locationId: '',
  mode: 'dates', // 'dates' | 'now'
  dateFrom: '',
  timeFrom: '12:00',
  dateTo: '',
  timeTo: '12:00',
  offerId: null,
}

export default function App() {
  const [query, setQuery] = useState(emptyQuery)
  const [screen, setScreen] = useState('e1') // 'e1' | 'e2' | 'e3' | 'e4'
  const [pickedCarId, setPickedCarId] = useState(null)
  const [cameFrom, setCameFrom] = useState('e1') // откуда открыли Э3
  const [booking, setBooking] = useState(null) // { extraIds, total } с Э3

  useEffect(() => { window.scrollTo(0, 0) }, [screen, pickedCarId])

  const openCar = (id, from) => { setPickedCarId(id); setCameFrom(from); setScreen('e3') }

  if (screen === 'e4') return <StubE4 query={query} carId={pickedCarId} booking={booking} onBack={() => setScreen('e3')} />
  if (screen === 'e3') return (
    <E3 key={pickedCarId} query={query} setQuery={setQuery} carId={pickedCarId} cameFrom={cameFrom}
      onBack={() => setScreen(cameFrom)} onOpenCar={(id) => openCar(id, cameFrom)}
      onBook={(b) => { setBooking(b); setScreen('e4') }} />
  )
  if (screen === 'e2') return (
    <E2 query={query} setQuery={setQuery} onBack={() => setScreen('e1')} onPick={(id) => openCar(id, 'e2')} />
  )
  return <Landing query={query} setQuery={setQuery} onSubmit={() => setScreen('e2')} onPickCar={(id) => openCar(id, 'e1')} />
}

function Landing({ query, setQuery, onSubmit, onPickCar }) {
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
            <button key={c.id} className="card car-card" onClick={() => onPickCar(c.id)}>
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

function SearchForm({ ref, query, setQuery, onSubmit, submitLabel = 'Подобрать машину', submitDisabled, children }) {
  const [errors, setErrors] = useState({})
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [text, setText] = useState('')

  const location = locations.find((l) => l.id === query.locationId)
  const offer = offers.find((o) => o.id === query.offerId)
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

      {offer && (
        <div className="chips">
          <span className="chip">{offer.chip}
            <button type="button" aria-label="Убрать набор" onClick={() => set({ offerId: null })}>×</button>
          </span>
        </div>
      )}

      {children}
      <button type="submit" className="btn-primary" disabled={submitDisabled}>{submitLabel}</button>
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
  { id: '4x4', label: '4×4', test: (c) => c.tags.includes('4×4') },
  { id: 'seats7', label: '7 мест', test: (c) => c.seats >= 7 },
  { id: 'box', label: 'бокс на крышу', test: (c) => c.tags.includes('есть бокс') },
  { id: 'bags4', label: '4+ чемодана', test: (c) => c.trunk >= 520 },
  { id: 'cheap', label: 'до 4 000 ₽/сутки', test: (c) => c.pricePerDay <= 4000 },
]

const PAGE = 10

function E2({ query, setQuery, onBack, onPick }) {
  const [editing, setEditing] = useState(false)
  const offer = offers.find((o) => o.id === query.offerId)
  const [scenarioId, setScenarioId] = useState(offer?.scenarioId ?? 'all')
  const [filters, setFilters] = useState([])
  const [hideUnavailable, setHideUnavailable] = useState(false)
  const [shown, setShown] = useState(PAGE)
  const location = locations.find((l) => l.id === query.locationId)
  const days = rentDays(query)
  const firstId = offer?.carId
  const eta = (c) => location.etaMin + c.etaAdd

  const scenario = scenarios.find((x) => x.id === scenarioId)
  const unavailable = (c) => availability(c, query.locationId) !== 'ok'
  const pickScenario = (id) => { setScenarioId(id); setShown(PAGE) }
  const toggle = (id) => { setFilters((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])); setShown(PAGE) }
  const resetFilters = () => { setScenarioId('all'); setFilters([]); setHideUnavailable(false); setShown(PAGE) }
  const active = filterChips.filter((f) => filters.includes(f.id))

  const list = cars
    .filter((c) => !scenario.carIds || scenario.carIds.includes(c.id))
    .filter((c) => active.every((f) => f.test(c)))
    .filter((c) => !hideUnavailable || !unavailable(c))
    .sort((a, b) => {
      // недоступные в конце, выбранная машина первой
      if (unavailable(a) !== unavailable(b)) return unavailable(a) ? 1 : -1
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

      <div className="scenarios" role="tablist">
        {scenarios.map((x) => (
          <button key={x.id} role="tab" aria-selected={scenarioId === x.id}
            className={`scenario ${scenarioId === x.id ? 'active' : ''}`} onClick={() => pickScenario(x.id)}>
            {x.label}
          </button>
        ))}
      </div>

      <div className="filters">
        {filterChips.map((f) => (
          <button key={f.id} className={`filter ${filters.includes(f.id) ? 'active' : ''}`}
            aria-pressed={filters.includes(f.id)} onClick={() => toggle(f.id)}>
            {f.label}
          </button>
        ))}
        <button className={`filter ${hideUnavailable ? 'active' : ''}`} aria-pressed={hideUnavailable}
          onClick={() => { setHideUnavailable((v) => !v); setShown(PAGE) }}>
          скрыть недоступные
        </button>
      </div>

      {(scenario.why || active.length > 0) && list.length > 0 && (
        <div className="why">
          <div className="why-title">Подобрали {list.length} {plural(list.length, 'машину', 'машины', 'машин')}</div>
          {scenario.why && <p>{scenario.why}</p>}
          {active.length > 0 && <p className="muted">С учётом: {active.map((f) => f.label).join(', ')}</p>}
        </div>
      )}

      {list.length === 0 ? (
        <div className="empty">
          <p>Под эти фильтры машин нет</p>
          <button className="btn-secondary" onClick={resetFilters}>Сбросить фильтры</button>
        </div>
      ) : (
        <>
          <div className="car-grid">
            {list.slice(0, shown).map((c) => {
              const status = availability(c, query.locationId)
              const off = status !== 'ok'
              return (
                <button key={c.id} className={`card car-item ${off ? 'sold-out' : ''}`}
                  disabled={off} onClick={() => onPick(c.id)}>
                  <div className="card-photo photo-car" style={carPhoto(c, 'lg')}>
                    <div className="badges">
                      {offer?.carId === c.id && <span className="badge">В наборе</span>}
                      {status === 'sold' && <span className="badge">Разобрали</span>}
                      {status === 'place' && <span className="badge">Нет в этой точке</span>}
                      {!off && c.stock > 0 && <span className="badge badge-hot">{c.stock === 1 ? 'Осталась 1' : `Осталось ${c.stock}`}</span>}
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="muted">{c.kind}</div>
                    <div className="card-title">{c.model}</div>
                    <div className="tags">{c.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
                    {query.mode === 'now' && !off && <div className="eta">Будет через {eta(c)} мин</div>}
                    <div className="price">{rub(c.pricePerDay)} / сутки</div>
                    {query.mode === 'dates' && <div className="muted">{rub(c.pricePerDay * days)} за {days} сут.</div>}
                  </div>
                </button>
              )
            })}
          </div>
          {list.length > shown && (
            <button className="btn-secondary show-more" onClick={() => setShown((n) => n + PAGE)}>
              Показать ещё {Math.min(PAGE, list.length - shown)}
            </button>
          )}
        </>
      )}
    </main>
  )
}

const plural = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

const queryReady = (q) => q.locationId && (q.mode === 'now' || (q.dateFrom && q.dateTo && q.dateTo >= q.dateFrom))

// 'ok' | 'sold' — разобрали везде | 'place' — нет в этой точке
function availability(car, locationId) {
  if (car.stock === 0) return 'sold'
  if (carDetails[car.id].unavailableAt.includes(locationId)) return 'place'
  return 'ok'
}

const extraCost = (x, days) => (x.per === 'day' ? x.price * days : x.price)

function E3({ query, setQuery, carId, cameFrom, onBack, onOpenCar, onBook }) {
  const car = cars.find((c) => c.id === carId)
  const d = carDetails[car.id]
  const offer = offers.find((o) => o.id === query.offerId)
  const location = locations.find((l) => l.id === query.locationId)
  const [picked, setPicked] = useState(() => (offer?.carId === car.id ? offer.extraIds : []))
  const widgetRef = useRef(null)

  const ready = queryReady(query)
  const days = rentDays(query)
  const status = ready ? availability(car, query.locationId) : null
  const rent = car.pricePerDay * days
  const chosen = extras.filter((x) => picked.includes(x.id))
  const total = rent + chosen.reduce((s, x) => s + extraCost(x, days), 0)

  const otherPlaces = locations.filter((l) => l.id !== query.locationId && !d.unavailableAt.includes(l.id))
  const similar = cars
    .filter((c) => c.id !== car.id && c.stock !== 0 && (!ready || availability(c, query.locationId) === 'ok'))
    .sort((a, b) => (b.kind === car.kind) - (a.kind === car.kind) || Math.abs(a.pricePerDay - car.pricePerDay) - Math.abs(b.pricePerDay - car.pricePerDay))
    .slice(0, 3)

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  const scrollToWidget = () => widgetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const perLabel = (x) => (x.price === 0 ? 'бесплатно' : `${rub(x.price)}${x.per === 'day' ? ' / сутки' : ''}`)

  const specs = [
    ['Расход', d.fuel], ['Запас хода', d.range], ['Клиренс', d.clearance], ['Багаж', d.bags],
    ['Привод', car.drive], ['Мест', car.seats], ['Резина', d.winter ? 'зимой — зимняя, шипы' : 'летняя'], ['Дороги', d.gravel],
  ]

  return (
    <main className="e3">
      <button className="link-back" onClick={onBack}>← {cameFrom === 'e2' ? 'Назад к машинам' : 'На главную'}</button>

      <div className="e3-layout">
        <div className="e3-main">
          <div className="e3-head">
            <div className="muted">{car.kind}</div>
            <h1>{car.model}</h1>
            <div className="tags">
              {car.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              {car.stock > 0 && <span className="badge badge-hot">{car.stock === 1 ? 'Осталась 1' : `Осталось ${car.stock}`}</span>}
              {car.stock === 0 && <span className="badge badge-muted">Разобрали</span>}
            </div>
          </div>
          <div className="e3-photo photo-car" style={carPhoto(car, 'lg')} />

          <section className="e3-section">
            <h2>Для поездки</h2>
            <dl className="specs">
              {specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </section>

          <section className="e3-section">
            <h2>Подходит для маршрутов</h2>
            <div className="routes">{d.routes.map((r) => <span key={r} className="route">{r}</span>)}</div>
          </section>

          <section className="e3-section">
            <h2>Как получите машину</h2>
            <ol className="steps">
              <li><b>Машина ждёт в точке</b>
                <span>{location ? location.name : 'аэропорт, вокзал, отель или адрес'}{query.mode === 'now' && location ? ` — подадим через ${location.etaMin + car.etaAdd} мин` : ' — к вашему времени'}</span></li>
              <li><b>Осмотр и ключи — 10 минут</b><span>Фото машины и акт в телефоне, без офиса и очереди</span></li>
              <li><b>Сразу в путь</b><span>Бак полный, допы уже в машине</span></li>
            </ol>
          </section>

          <section className="e3-section">
            <h2>Условия</h2>
            <dl className="terms">
              <dt>Пробег</dt><dd>{rentTerms.mileage}</dd>
              <dt>Водитель</dt><dd>{rentTerms.driver}</dd>
              <dt>Куда можно</dt><dd>{rentTerms.regions}</dd>
              <dt>Возврат</dt><dd>{rentTerms.dropoff}</dd>
              <dt>Страховка</dt><dd>{rentTerms.insurance}</dd>
              <dt>Депозит</dt><dd>{rub(d.deposit)}, блокируем на карте и возвращаем после возврата машины</dd>
            </dl>
          </section>

          {[['car', 'Допы к машине'], ['trip', 'В машину для поездки']].map(([g, title]) => (
            <section key={g} className="e3-section">
              <h2>{title}</h2>
              <div className="extras">
                {extras.filter((x) => x.group === g).map((x) => (
                  <label key={x.id} className={`extra ${picked.includes(x.id) ? 'on' : ''}`}>
                    <input type="checkbox" checked={picked.includes(x.id)} onChange={() => toggle(x.id)} />
                    <span className="extra-name">{x.name}{x.note && <span className="muted"> · {x.note}</span>}</span>
                    <span className="extra-price">{perLabel(x)}</span>
                  </label>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="e3-aside" ref={widgetRef}>
          <div className="price-big">{rub(car.pricePerDay)} <span className="muted">/ сутки</span></div>
          <SearchForm query={query} setQuery={setQuery} submitLabel={ready ? 'Забронировать' : 'Проверить наличие'}
            submitDisabled={status === 'sold' || status === 'place'}
            onSubmit={() => status === 'ok' && onBook({ extraIds: picked, total })}>
            {status === 'ok' && (
              <div className="avail ok">✓ Свободна{query.mode === 'now' ? `, подадим через ${location.etaMin + car.etaAdd} мин` : ' на эти даты'}</div>
            )}
            {status === 'place' && (
              <div className="avail no">
                <div>В точке «{location.name}» этой машины нет. Можно забрать здесь:</div>
                <div className="avail-options">
                  {otherPlaces.map((l) => (
                    <button type="button" key={l.id} className="filter" onClick={() => setQuery((q) => ({ ...q, locationId: l.id }))}>{l.name}</button>
                  ))}
                </div>
              </div>
            )}
            {status === 'sold' && <div className="avail no">Эту машину разобрали. Посмотрите похожие ниже</div>}
            {status === 'ok' && (
              <dl className="bill">
                <dt>Аренда, {days} сут.</dt><dd>{rub(rent)}</dd>
                {chosen.map((x) => <Fragment key={x.id}><dt>{x.name}</dt><dd>{rub(extraCost(x, days))}</dd></Fragment>)}
                <dt className="bill-total">Итого</dt><dd className="bill-total">{rub(total)}</dd>
                <dt className="muted">Депозит, вернём</dt><dd className="muted">{rub(d.deposit)}</dd>
              </dl>
            )}
          </SearchForm>

          {(status === 'sold' || status === 'place') && (
            <div className="similar">
              <div className="card-title">Похожие машины{location ? ` в точке «${location.name}»` : ''}</div>
              {similar.map((c) => (
                <button key={c.id} className="similar-item" onClick={() => onOpenCar(c.id)}>
                  <span className="similar-photo photo-car" style={carPhoto(c)} />
                  <span><b>{c.model}</b><br /><span className="muted">{rub(c.pricePerDay)} / сутки</span></span>
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>

      <div className="e3-bar">
        <div>
          <div className="price">{status === 'ok' ? rub(total) : `${rub(car.pricePerDay)} / сутки`}</div>
          <div className="muted">{status === 'ok' ? `за ${days} сут., с допами` : status ? 'недоступна' : 'укажите, где и когда'}</div>
        </div>
        <button className="btn-primary" onClick={status === 'ok' ? () => onBook({ extraIds: picked, total }) : scrollToWidget}>
          {status === 'ok' ? 'Забронировать' : 'Где и когда'}
        </button>
      </div>
    </main>
  )
}

function StubE4({ query, carId, booking, onBack }) {
  const car = cars.find((c) => c.id === carId)
  const chosen = extras.filter((x) => booking.extraIds.includes(x.id))
  return (
    <main className="stub">
      <h1>Э4 в работе</h1>
      <p className="muted">Э3 передал на оформление:</p>
      <dl>
        <dt>Запрос</dt><dd>{summary(query)}</dd>
        <dt>Машина</dt><dd>{car.model}</dd>
        <dt>Допы</dt><dd>{chosen.length ? chosen.map((x) => x.name).join(', ') : '—'}</dd>
        <dt>Итого</dt><dd>{rub(booking.total)}</dd>
      </dl>
      <button className="btn-secondary" onClick={onBack}>← Назад к машине</button>
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
