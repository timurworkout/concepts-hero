import records from './fleet.json' with { type: 'json' }

export const primaryCars = {
  mountains: 'tank-300', sea: 'toyota-rav4', dacha: 'lada-niva-legend-sport', highway: 'bmw-x3',
}
const primaryIds = Object.values(primaryCars)
export const isAutomatic = (c) => ['автомат', 'робот', 'вариатор'].includes(c.gearbox)
export const hasNumber = (n) => Number.isFinite(n)

// Тарифы, наличие, зимняя резина и время подачи — допущения демо.
// Технические данные и источники находятся в fleet.json; неизвестные значения — null.
export const cars = records.map((c) => ({
  ...c, kind: c.kind ?? 'Автомобиль', tags: [
    c.drive === 'полный' && '4×4',
    c.seats >= 7 && '7 мест',
    c.trunk >= 550 && `багажник ${c.trunk} л`,
  ].filter(Boolean), stock: null, etaAdd: 15, fuelType: c.engine ? 'бензин' : null,
  pricePerHour: Math.round(c.pricePerDay / 6 / 10) * 10,
}))

export const carDetails = Object.fromEntries(cars.map((c) => [c.id, {
  deposit: Math.round(c.pricePerDay * 4 / 5000) * 5000,
  fuel: hasNumber(c.fuelUse) ? `${String(c.fuelUse).replace('.', ',')} л/100 км` : null,
  range: hasNumber(c.range) ? `${c.range} км` : null,
  clearance: hasNumber(c.clearance) ? `${c.clearance} мм` : null,
  bags: hasNumber(c.trunk) ? `${c.trunk} л` : null,
  winter: true, unavailableAt: [], routes: [],
}]))

export const knownCarId = (id) => cars.some((c) => c.id === id)
export const savedCarIds = (ids) => Array.isArray(ids) ? ids.filter(knownCarId) : []
export const savedBookings = (bookings) => Array.isArray(bookings) ? bookings.filter((b) => b && knownCarId(b.carId)) : []

export function rankCars(pool, goal, refinements = []) {
  const score = (c) => refinements.reduce((n, p) => n + Number(p.test(c)), 0)
  const tier = (c) => c.id === primaryCars[goal?.id] ? 0 : primaryIds.includes(c.id) ? 1 : 2
  const order = (c) => cars.findIndex((r) => r.id === c.id)
  return [...pool].sort((a, b) => tier(a) - tier(b) || score(b) - score(a) || order(a) - order(b))
}

export function selectCars(q, planOptions, preferenceOptions, companionOptions, available = () => true) {
  const chosen = planOptions.filter((p) => q.planIds.includes(p.id))
  const goal = chosen.find((p) => !p.local) ?? null
  const places = chosen.filter((p) => p.local)
  const companion = companionOptions.find((c) => c.id === q.companion) ?? null
  const active = preferenceOptions.filter((p) => q.prefs.includes(p.id))
  const pool = cars.filter(available)
  const refinements = [...places, companion].filter(Boolean)
  const fit = rankCars(pool.filter((c) => (!goal || goal.test(c)) && active.every((p) => p.test(c)) && (!companion || companion.test(c))), goal, refinements)
  const skipped = places.filter((p) => !fit[0] || !p.test(fit[0]))
  return { car: fit[0], fit, goal, places, companion, active, skipped, count: fit.length, total: pool.length }
}

export function carSummary(c) {
  return [hasNumber(c.seats) && `${c.seats} мест`, hasNumber(c.trunk) && `багажник ${c.trunk} л`,
    c.drive && `${c.drive} привод`, hasNumber(c.clearance) && `клиренс ${c.clearance} мм`, c.engine].filter(Boolean).join(' · ')
}
