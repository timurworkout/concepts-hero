import { useState } from 'react'
import { Wizard, emptyQuery } from './App.jsx'

/** Визард с настоящей механикой автоперехода: состояние держит обёртка, как в App. */
export default { id: 'on-move-wizard', title: 'Табло/Визард' }


function Harness({ initialStep = null, query: initial = emptyQuery }) {
  const [query, setQuery] = useState(initial)
  const [step, setStep] = useState(initialStep)
  const [placeType, setPlaceType] = useState(null)
  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh', padding: '32px 24px 420px' }}>
      <Wizard
        query={query} setQuery={setQuery}
        step={step} setStep={setStep}
        placeType={placeType} setPlaceType={setPlaceType}
        onSubmit={() => console.log('submit', query)}
      />
    </div>
  )
}

export const Закрытый = () => <Harness />
export const ШагМеста = () => <Harness initialStep="place" />
export const ШагДат = () => <Harness initialStep="when" query={{ ...emptyQuery, cityId: 'sochi', locationId: 'aer' }} />
export const Возврат = () => <Harness initialStep="return" query={{ ...emptyQuery, cityId: 'sochi', locationId: 'aer', returnMode: 'point' }} />
export const Параметры = () => <Harness initialStep="params" query={{ ...emptyQuery, cityId: 'sochi', locationId: 'aer' }} />
export const Почасовая = () => <Harness initialStep="when" query={{ ...emptyQuery, cityId: 'sochi', locationId: 'aer', mode: 'hours' }} />
export const MobilePlace = () => <Harness initialStep="place" />
MobilePlace.storyName = 'Место — содержимое мобильного примера'
export const Мобильный = () => (
  <iframe title="Визард на экране 390 px" src={`${window.location.pathname}?id=on-move-wizard--mobile-place&viewMode=story`}
    style={{ display: 'block', width: 390, maxWidth: '100%', height: 844, border: 0, margin: '0 auto' }} />
)
