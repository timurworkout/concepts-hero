import { useState } from 'react'
import { emptyQuery, TripTile, PickGallery, PickSpecs, MoreCars, CarCheck, carStory, LogoMark } from './App.jsx'
import { cars, cities, plans } from './data.js'

/** Компоненты экрана подбора — те же, из которых собран Э2. Запрос: Сочи, аэропорт, к морю. */
export default { title: 'Компоненты/Подбор' }

const noop = () => {}
const day = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10)
const query = { ...emptyQuery, cityId: 'sochi', locationId: 'aer', dateFrom: day(7), dateTo: day(10), planIds: ['sea'] }
const goal = plans.find((p) => p.id === 'sea')
const [car, ...rest] = cars
const fav = { favs: [], toggleFav: noop }

const Shell = ({ width = 720, children }) => (
  <div style={{ background: 'var(--canvas)', color: 'var(--ink)', padding: 32, minHeight: '100vh' }}>
    <div style={{ maxWidth: width }}>{children}</div>
  </div>
)

export const ЯчейкиПоездки = () => (
  <Shell width={420}>
    <TripTile icon="Цель" label="Про поездку" value="К морю" onClick={noop} />
    <TripTile icon="Аэропорт" label="Где заберёшь" value="Аэропорт Сочи" onClick={noop} />
    <TripTile icon="Даты" label="Когда" empty="Выбери даты" onClick={noop} />
    <TripTile icon="Цель" label="Цель поездки" value="В горы" warn onClick={noop} />
  </Shell>
)
ЯчейкиПоездки.storyName = 'Ячейки поездки · заполнено, пусто, конфликт'

export const Галерея = () => <Shell><PickGallery car={car} fav={fav} lock="on" /></Shell>

export const ПочемуЭтаМашина = () => (
  <Shell width={480}>
    <PickSpecs car={car} query={query} chosen counting={false} story={carStory(car, { goal, companion: '', city: cities.sochi })} />
  </Shell>
)
ПочемуЭтаМашина.storyName = 'Почему эта машина'

export const ЕщёВарианты = () => (
  <Shell width={480}>
    <MoreCars car={car} query={query} items={rest.slice(0, 3).map((c, i) => ({ car: c, label: i === 0 ? 'Дешевле на 2 400 ₽' : null }))} onPick={noop} onMore={noop} />
  </Shell>
)
ЕщёВарианты.storyName = 'Ещё варианты'

export const Видоискатель = () => {
  const [key, setKey] = useState(0)
  return (
    <Shell>
      <button type="button" className="btn-secondary btn-sm" onClick={() => setKey((k) => k + 1)}>Проиграть снова</button>
      <CarCheck key={key} car={rest[0]} goal={goal} onSwap={noop} onDone={noop} />
    </Shell>
  )
}
Видоискатель.storyName = 'Видоискатель · оценка альтернативы'

export const Логотип = () => (
  <Shell>
    <span className="logo" style={{ fontSize: 'var(--fs-hero)' }}><LogoMark /></span>
  </Shell>
)
