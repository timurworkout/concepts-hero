import { emptyQuery, LoginSheet, PlacePicker, DatePicker, ReturnPicker, ParamsPicker, HoursPicker } from './App.jsx'
import { locations } from './data.js'

/** Шторки и поп-апы выбора — те же, что открываются в форме поиска и в визарде. */
// Полноэкранные поп-апы: на общей Docs-странице налезли бы друг на друга
export default { title: 'Компоненты/Шторки', tags: ['!autodocs'] }

const noop = () => {}
const q = { ...emptyQuery, cityId: 'sochi', locationId: 'aer' }
const aer = locations.find((l) => l.id === 'aer')

export const Вход = () => <LoginSheet onLogin={noop} onClose={noop} />
export const ВходДляБрони = () => <LoginSheet forBooking onLogin={noop} onClose={noop} />
ВходДляБрони.storyName = 'Вход · перед бронью'
export const Место = () => <PlacePicker query={emptyQuery} group="all" onPick={noop} onClose={noop} />
export const Даты = () => <DatePicker query={q} onApply={noop} onClose={noop} />
export const Часы = () => <HoursPicker query={{ ...q, mode: 'hours' }} location={aer} onApply={noop} onClose={noop} />
export const Возврат = () => <ReturnPicker query={q} onApply={noop} onClose={noop} />
export const Параметры = () => <ParamsPicker query={q} onApply={noop} onClose={noop} />
