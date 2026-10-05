import { useEffect, useRef, useState } from 'react'
import { locations, locationGroups, cars, offers, rub } from './data.js'

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
  const [submitted, setSubmitted] = useState(null)

  if (submitted) return <StubE2 query={submitted} onBack={() => setSubmitted(null)} />
  return <Landing query={query} setQuery={setQuery} onSubmit={setSubmitted} />
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
        <div className="hero-photos" aria-hidden="true">
          <div className="photo photo-mountains"><span>Красная Поляна</span></div>
          <div className="photo photo-sea"><span>Побережье Сочи</span></div>
          <div className="photo photo-lake"><span>Озеро Рица</span></div>
        </div>
        <div className="hero-content">
          <h1>Машина ждёт тебя,<br />а время поездки остаётся на места</h1>
          <SearchForm ref={formRef} query={query} setQuery={setQuery} onSubmit={onSubmit} />
        </div>
      </section>

      <section className="section">
        <h2>Сезонные предложения</h2>
        <div className="scroller">
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
        </div>
      </section>

      <section className="section">
        <h2>Примеры машин</h2>
        <div className="scroller">
          {cars.map((c) => (
            <button key={c.id} className="card car-card" onClick={() => pickCar(c)}>
              <div className="card-photo photo-car"><span>{c.model}</span></div>
              <div className="card-body">
                <div className="muted">{c.kind}</div>
                <div className="card-title">{c.model}</div>
                <div className="price">{rub(c.pricePerDay)} / сутки</div>
              </div>
            </button>
          ))}
        </div>
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

function StubE2({ query, onBack }) {
  const location = locations.find((l) => l.id === query.locationId)
  const offer = offers.find((o) => o.id === query.offerId)
  const car = cars.find((c) => c.id === query.carId)
  return (
    <main className="stub">
      <h1>Э2 в работе</h1>
      <p className="muted">Форма передала на подбор машины:</p>
      <dl>
        <dt>Где</dt><dd>{location.name}</dd>
        <dt>Режим</dt><dd>{query.mode === 'now' ? 'Сейчас' : 'На даты'}</dd>
        {query.mode === 'dates' && (<>
          <dt>Получение</dt><dd>{query.dateFrom} {query.timeFrom}</dd>
          <dt>Возврат</dt><dd>{query.dateTo} {query.timeTo}</dd>
        </>)}
        <dt>Набор</dt><dd>{offer ? offer.chip : '—'}</dd>
        <dt>Машина</dt><dd>{car ? car.model : '—'}</dd>
      </dl>
      <button className="btn-secondary" onClick={onBack}>← Назад на лендинг</button>
    </main>
  )
}
