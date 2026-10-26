import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { cars, plans, prefOptions, companions, inCity } from '../src/data.js'
import { selectCars, primaryCars, rankCars, savedCarIds, savedBookings } from '../src/fleet.js'

const query = (goal, patch = {}) => ({ planIds: goal ? [goal] : [], prefs: [], companion: '', ...patch })
const pick = (q, available) => selectCars(q, plans, prefOptions, companions, available)

test('50 distinct vehicles, every referenced image exists, primary galleries have 5–7 unique frames', () => {
  assert.equal(cars.length, 50)
  assert.equal(new Set(cars.map(c => c.id)).size, 50)
  for (const c of cars) {
    for (const file of [c.image, c.heroImage, ...c.gallery]) assert.ok(existsSync(`public/${file}`), file)
    assert.ok(!c.id.startsWith('lada-') || c.id.startsWith('lada-niva-'))
    if (c.demoScenario) {
      assert.ok(c.gallery.length >= 5 && c.gallery.length <= 7)
      assert.equal(new Set(c.gallery.map(f => readFileSync(`public/${f}`).toString('base64'))).size, c.gallery.length)
    }
  }
})

test('four scenarios select their assigned car in every demo city', () => {
  for (const [goal, id] of Object.entries(primaryCars)) {
    for (const city of ['sochi', 'msk', 'spb', 'kgd', 'kzn', 'mmk']) {
      assert.equal(pick(query(goal), c => inCity(c, city)).car.id, id)
    }
  }
})

test('manual Niva is excluded by the automatic preference; another primary car takes over', () => {
  const result = pick(query('dacha', { prefs: ['auto'] }))
  assert.equal(result.car.id, 'tank-300')
  assert.ok(result.fit.every(c => c.gearbox !== 'механика'))
  assert.ok(!result.fit.some(c => c.id === 'lada-niva-legend-sport'))
})

test('availability and hard parameters take priority; fall back outside the four when needed', () => {
  const available = c => !c.demoScenario
  const result = pick(query('sea'), available)
  assert.ok(result.car)
  assert.ok(!result.car.demoScenario)
  assert.ok(result.fit.every(c => plans.find(p => p.id === 'sea').test(c)))
  assert.equal(pick(query('sea'), c => c.id !== 'toyota-rav4').car.id, 'bmw-x3')
})

test('price does not override a fitting primary car; alternatives keep the same priority', () => {
  const result = pick(query('sea'))
  assert.ok(result.fit.some(c => c.pricePerDay < result.car.pricePerDay))
  assert.equal(result.car.id, 'toyota-rav4')
  assert.equal(result.fit[1].id, 'bmw-x3')
  const changedPrices = result.fit.map(c => ({ ...c, pricePerDay: c.id === 'toyota-rav4' ? 999999 : 1 }))
  assert.equal(rankCars(changedPrices, result.goal)[0].id, 'toyota-rav4')
})

test('unknown dimensions never satisfy numeric requirements; family avoids four-seat Niva', () => {
  assert.ok(pick(query('sea', { companion: 'family' })).fit.every(c => c.seats >= 5 && c.trunk >= 480))
  assert.equal(pick(query('dacha', { companion: 'friends' })).car.id, 'bmw-x3')
  assert.equal(pick(query(null, { prefs: ['seats7'] })).car, undefined)
  assert.ok(cars.filter(c => c.clearance === null).every(c => !plans.find(p => p.id === 'mountains').test(c)))
})


test('old favourites and bookings are filtered without replacing removed models', () => {
  assert.deepEqual(savedCarIds(['lada-vesta', 'tank-300', 'voyah-dream']), ['tank-300'])
  const valid = { carId: 'toyota-rav4', total: 10000 }
  assert.deepEqual(savedBookings([{ carId: 'lada-vesta' }, valid]), [valid])
  assert.deepEqual(savedBookings(null), [])
  assert.deepEqual(savedCarIds(null), [])
})
