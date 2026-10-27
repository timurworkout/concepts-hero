import { useState } from 'react'
import { Wizard } from './App.jsx'

/** Визард с настоящей механикой автоперехода: состояние держит обёртка, как в App. */
export default { title: 'Табло/Визард' }

const emptyQuery = {
  cityId: '', locationId: '', mode: 'days',
  dateFrom: '', timeFrom: '12:00', dateTo: '', timeTo: '12:00',
  start: 'now', hours: 4,
  planIds: [], companion: '', prefs: [], extraIds: [],
  address: '', returnMode: 'same', returnId: '',
}

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
export const ШагДат = () => <Harness initialStep="when" query={{ ...emptyQuery, cityId: 'sochi' }} />
export const Мобильный = () => <Harness initialStep="place" />
Мобильный.parameters = { viewport: { defaultViewport: 'mobile1' } }
