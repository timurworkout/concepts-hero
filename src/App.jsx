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
  const [screen, setScreen] = useState('e1') // 'e1' | 'e2' | 'e3' | 'e4' | 'e6' | 'booking'
  const [pickedCarId, setPickedCarId] = useState(null)
  const [cameFrom, setCameFrom] = useState('e1') // откуда открыли Э3
  const [booking, setBooking] = useState(null) // { extraIds, total } с Э3
  const [result, setResult] = useState(null) // оформленная бронь с Э4

  useEffect(() => { window.scrollTo(0, 0) }, [screen, pickedCarId])

  const openCar = (id, from) => { setPickedCarId(id); setCameFrom(from); setScreen('e3') }

  const home = () => { setQuery(emptyQuery); setBooking(null); setResult(null); setScreen('e1') }

  if (screen === 'booking') return <BookingStub result={result} onBack={() => setScreen('e6')} />
  if (screen === 'e6') return <E6 result={result} onOpenBooking={() => setScreen('booking')} onHome={home} />
  if (screen === 'e4') return (
    <E4 query={query} carId={pickedCarId} booking={booking} onBack={() => setScreen('e3')}
      onDone={(r) => { setResult(r); setScreen('e6') }} />
  )
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
  const days = rentDays(query)
  const chosen = extras.filter((x) => booking.extraIds.includes(x.id))
  const payNow = query.mode === 'now' ? booking.total : Math.round(booking.total * 0.2)
  return { days, chosen, rent: car.pricePerDay * days, payNow, rest: booking.total - payNow, deposit: carDetails[car.id].deposit }
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

function E4({ query, carId, booking, onBack, onDone }) {
  const car = cars.find((c) => c.id === carId)
  const location = locations.find((l) => l.id === query.locationId)
  const t = bookingTotals(query, car, booking)
  const needDriver2 = booking.extraIds.includes('driver2')

  const [step, setStep] = useState('login') // 'login' | 'driver' | 'pay'
  const [user, setUser] = useState(null) // { phone, viaBank }
  const [driver, setDriver] = useState({ name: '', birth: '', license: '', issued: '', fromBank: false })
  const [driverOk, setDriverOk] = useState(false)
  const [driver2, setDriver2] = useState(false)
  const [payMethod, setPayMethod] = useState('card')
  const [paying, setPaying] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)

  // Режим «Сейчас»: машина закреплена 10 минут
  const [left, setLeft] = useState(HOLD_SEC)
  const [expired, setExpired] = useState(false)
  useEffect(() => {
    if (query.mode !== 'now') return
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [query.mode])
  useEffect(() => {
    if (query.mode !== 'now' || left > 0) return
    setExpired(true)
    const id = setTimeout(() => { setExpired(false); setLeft(HOLD_SEC) }, 1000)
    return () => clearTimeout(id)
  }, [left, query.mode])

  const login = (u) => {
    setUser(u)
    if (u.viaBank) setDriver((d) => ({ ...d, name: bankClient.name, birth: bankClient.birth, fromBank: true }))
    setStep(driverOk ? 'pay' : 'driver')
  }

  const pay = () => {
    setPaying(true)
    setTimeout(() => onDone({
      id: '7KQ2', phone: user.phone, name: driver.name, carId, query, extraIds: booking.extraIds,
      total: booking.total, paidNow: t.payNow, rest: t.rest, deposit: t.deposit,
    }), 1500)
  }

  const ready = user && driverOk
  const payLabel = paying ? 'Оплачиваем…' : `Оплатить ${rub(t.payNow)} и забронировать`
  const when = query.mode === 'now' ? `подадим через ${location.etaMin + car.etaAdd} мин после оплаты` : summary(query)
  const mm = String(Math.floor(left / 60)), ss = String(left % 60).padStart(2, '0')

  const bookingCard = (
    <div className="e4-booking">
      <div className="e4-car">
        <span className="similar-photo photo-car" style={carPhoto(car)} />
        <div><b>{car.model}</b><div className="muted">{location.name}</div><div className="muted">{when}</div></div>
      </div>
      <dl className="bill">
        <dt>Аренда, {t.days} сут.</dt><dd>{rub(t.rent)}</dd>
        {t.chosen.map((x) => <Fragment key={x.id}><dt>{x.name}</dt><dd>{rub(extraCost(x, t.days))}</dd></Fragment>)}
        <dt className="bill-total">Итого</dt><dd className="bill-total">{rub(booking.total)}</dd>
        <dt className="muted">Депозит, вернём</dt><dd className="muted">{rub(t.deposit)}</dd>
      </dl>
      <button type="button" className="link-back" onClick={onBack}>Изменить</button>
    </div>
  )

  return (
    <main className="e3 e4">
      <button className="link-back" onClick={onBack}>← Назад к машине</button>

      {query.mode === 'now' && (
        <div className={`hold ${expired ? 'expired' : ''}`}>
          {expired ? 'Время вышло — проверяем машину заново' : `Машина закреплена за вами ещё ${mm}:${ss}`}
        </div>
      )}

      <button type="button" className="e4-summary-line" onClick={() => setSummaryOpen((v) => !v)}>
        <span>{car.model} · {query.mode === 'now' ? 'сейчас' : summary(query).split(' · ')[1]} · {rub(booking.total)}</span>
        <span>{summaryOpen ? '▴' : '▾'}</span>
      </button>
      {summaryOpen && <div className="e4-summary-body">{bookingCard}</div>}

      <div className="e3-layout">
        <div className="e4-form">
          <h1>Оформление</h1>

          <Step n={1} title="Вход" active={step === 'login'} done={!!user}
            summary={`${user?.phone ?? ''}${user?.viaBank ? ' · через банк' : ''}`} onEdit={() => setStep('login')}>
            <Login onLogin={login} />
          </Step>

          <Step n={2} title="Водитель" active={step === 'driver'} done={driverOk}
            summary={`${driver.name} · права проверены`} onEdit={user ? () => setStep('driver') : null}>
            <Driver driver={driver} setDriver={setDriver} needDriver2={needDriver2} driver2={driver2} setDriver2={setDriver2}
              onOk={() => { setDriverOk(true); setStep('pay') }} />
          </Step>

          <Step n={3} title="Оплата" active={step === 'pay'} done={false}>
            <dl className="bill pay-split">
              {query.mode === 'now' ? (
                <><dt>Сейчас — вся аренда</dt><dd>{rub(t.payNow)}</dd></>
              ) : (
                <><dt>Сейчас — предоплата 20%</dt><dd>{rub(t.payNow)}</dd>
                  <dt>При получении — остаток</dt><dd>{rub(t.rest)}</dd></>
              )}
            </dl>
            <p className="muted">Депозит {rub(t.deposit)} заблокируем на карте при получении — это не списание.</p>
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
          <div className="muted">{query.mode === 'now' ? 'вся аренда' : 'предоплата 20%'}</div>
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

function E6({ result, onOpenBooking, onHome }) {
  const car = cars.find((c) => c.id === result.carId)
  const location = locations.find((l) => l.id === result.query.locationId)
  const now = result.query.mode === 'now'
  const chosen = extras.filter((x) => result.extraIds.includes(x.id))
  const inCar = chosen.filter((x) => x.group === 'trip' || x.id === 'child-seat')

  const [eta, setEta] = useState(location.etaMin + car.etaAdd)
  useEffect(() => {
    if (!now) return
    const id = setInterval(() => setEta((m) => Math.max(1, m - 1)), 60000)
    return () => clearInterval(id)
  }, [now])

  const q = result.query
  const whenText = now ? `через ${eta} мин` : `${fmtDate(q.dateFrom)} ${q.timeFrom}`
  const sms = `Машина ждёт вас: ${car.model}, ${location.name}, ${whenText}.${inCar.length ? ` ${inCar.map((x) => x.name.split(' — ')[0]).join(', ')} — уже внутри.` : ''} Всё о брони: rent.ru/b/${result.id}`

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
            <p className="e6-when">{now ? `${car.model} — подадим через ${eta} мин` : `${car.model} — ${location.name}, ${fmtDate(q.dateFrom)}, ${q.timeFrom}`}</p>
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
              <li><b>Машина ждёт в точке</b><span>{location.name}{now ? `, через ${eta} мин` : `, ${fmtDate(q.dateFrom)} к ${q.timeFrom}`}</span></li>
              <li><b>Осмотр и ключи — 10 минут</b><span>Фото машины и акт в телефоне, без офиса и очереди</span></li>
              <li><b>Сразу в путь</b><span>Бак полный, допы уже в машине</span></li>
            </ol>
          </section>

          <section className="e3-section">
            <h2>Взять с собой</h2>
            <p className="body-sm">Водительское удостоверение и карту, с которой платили, — на ней заблокируем депозит.</p>
          </section>

          <section className="e3-section">
            <h2>Оплата</h2>
            <dl className="bill">
              <dt>Оплачено</dt><dd>{rub(result.paidNow)}</dd>
              {result.rest > 0 && <><dt>При получении</dt><dd>{rub(result.rest)}</dd></>}
              <dt className="muted">Депозит — заблокируем при получении</dt><dd className="muted">{rub(result.deposit)}</dd>
            </dl>
          </section>

          {inCar.length > 0 && (
            <section className="e3-section">
              <h2>Что в машине</h2>
              <ul className="in-car">{inCar.map((x) => <li key={x.id}>{x.name}</li>)}</ul>
            </section>
          )}

          <div className="e6-actions">
            <button className="btn-primary" onClick={onOpenBooking}>Открыть бронь</button>
            <button className="btn-secondary" onClick={onHome}>На главную</button>
          </div>
        </div>
      </div>
    </main>
  )
}

function BookingStub({ result, onBack }) {
  const car = cars.find((c) => c.id === result.carId)
  return (
    <main className="stub">
      <button className="link-back" onClick={onBack}>← Назад</button>
      <h1>Моя бронь — скоро</h1>
      <dl>
        <dt>Бронь</dt><dd>{result.id}</dd>
        <dt>Машина</dt><dd>{car.model}</dd>
        <dt>Где и когда</dt><dd>{summary(result.query)}</dd>
        <dt>Оплачено</dt><dd>{rub(result.paidNow)}</dd>
      </dl>
      <p className="muted">Здесь появятся:</p>
      <ul className="body-sm">
        <li>статус подачи и водитель</li>
        <li>продление аренды</li>
        <li>партнёры рядом: маршруты, скипасс, прокат снаряжения</li>
      </ul>
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
