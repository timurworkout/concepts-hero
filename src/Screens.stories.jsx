import { useState } from 'react'
import App, { emptyQuery, E2, E3, Final, Bookings, Login, tripTotal } from './App.jsx'
import { cars } from './data.js'

/** Настоящее приложение: актуальные экраны и переходы без копирования разметки. */
export default { id: 'on-move-screens', title: 'Экраны/Приложение', tags: ['!autodocs'] }

export const Mobile = () => (
  <iframe title="ON MOVE — экран 390 px"
    src={`${window.location.pathname}?id=on-move-screens--full-flow&viewMode=story`}
    style={{ display: 'block', width: 390, maxWidth: '100%', height: 844, border: 0, margin: '0 auto' }} />
)
Mobile.storyName = 'Мобильный · 390 px'
export const FullFlow = () => <App />
FullFlow.storyName = 'Лендинг → подбор → допы → бронь'

// Отдельные экраны с готовым запросом: Сочи, аэропорт, поездка через неделю на три дня
const noop = () => {}
const day = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10)
const query = { ...emptyQuery, cityId: 'sochi', locationId: 'aer', dateFrom: day(7), dateTo: day(10), planIds: ['sea'] }
const car = cars[0]
const booking = (n, extra = {}) => ({ id: String(1000 + n), carId: cars[n].id, query: { ...query, dateFrom: day(7 + n * 10), dateTo: day(10 + n * 10) }, total: tripTotal(cars[n], query), createdAt: Date.now(), cancelled: false, ...extra })

function useFav() {
  const [favs, setFavs] = useState([])
  return { favs, toggleFav: (id) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [id, ...f])) }
}

export const Подбор = () => {
  const [q, setQ] = useState(query)
  return <E2 query={q} setQuery={setQ} fav={useFav()} onBack={noop} onPick={noop} openPicker={noop} />
}
export const КарточкаМашины = () => {
  const [q, setQ] = useState(query)
  return <E3 query={q} setQuery={setQ} carId={car.id} cameFrom="e2" fav={useFav()} onBack={noop} onPickOther={noop} openPicker={noop} onBook={noop} />
}
КарточкаМашины.storyName = 'Карточка машины'
export const Вход = () => <main style={{ padding: '48px 24px', maxWidth: 480, margin: '0 auto' }}><Login onLogin={noop} /></main>
export const Бронь = () => <Final booking={booking(0)} onHome={noop} onBookings={noop} />
Бронь.storyName = 'Бронь оформлена'
export const Бронирования = () => (
  <Bookings bookings={[booking(0), booking(1), booking(2, { cancelled: true })]} onHome={noop} onShow={noop} onRepeat={noop} onCancel={noop} />
)
