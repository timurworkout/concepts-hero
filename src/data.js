// Моки из project/mock-data.md

export const locations = [
  { id: 'aer', name: 'Аэропорт Сочи (Адлер)', type: 'Аэропорт', etaMin: 20 },
  { id: 'adler-rw', name: 'Вокзал Адлер', type: 'Вокзал', etaMin: 25 },
  { id: 'sochi-rw', name: 'Вокзал Сочи', type: 'Вокзал', etaMin: 35 },
  { id: 'rosa', name: 'Красная Поляна, Роза Хутор', type: 'Отель', etaMin: 50 },
  { id: 'center', name: 'Сочи, центр', type: 'Адрес', etaMin: 30 },
]

export const locationGroups = ['Аэропорт', 'Вокзал', 'Отель', 'Адрес']

export const cars = [
  { id: 'rio', model: 'Kia Rio', kind: 'Седан', pricePerDay: 2900 },
  { id: 'jolion', model: 'Haval Jolion', kind: 'Кроссовер', pricePerDay: 3800 },
  { id: 'tiggo', model: 'Chery Tiggo 7 Pro', kind: 'Кроссовер', pricePerDay: 4200 },
  { id: 'monjaro', model: 'Geely Monjaro', kind: 'Внедорожник', pricePerDay: 6500 },
  { id: 'staria', model: 'Hyundai Staria', kind: 'Минивэн', pricePerDay: 7900 },
]

export const offers = [
  {
    id: 'ski',
    title: 'Горнолыжка в Красной Поляне',
    locationId: 'aer',
    route: 'Аэропорт Сочи → Роза Хутор',
    car: 'Haval Jolion 4×4',
    includes: ['бокс', 'лыжи в машине', 'скипасс'],
    chip: 'Горнолыжка: бокс + лыжи + скипасс',
    priceFrom: '6 400 ₽/сутки + скипасс',
  },
  {
    id: 'sea',
    title: 'Море и побережье',
    locationId: 'aer',
    route: 'Аэропорт Сочи',
    car: 'Chery Tiggo 7 Pro',
    includes: ['сап в машине', 'маршрут по побережью'],
    chip: 'Море: сап + маршрут',
    priceFrom: '5 700 ₽/сутки',
  },
  {
    id: 'weekend',
    title: 'Выходные: Рица и Абхазия',
    locationId: 'adler-rw',
    route: 'Вокзал Адлер',
    car: 'Kia Rio',
    includes: ['маршрут «Озеро Рица и Абхазия»'],
    chip: 'Выходные: маршрут Рица',
    priceFrom: '2 900 ₽/сутки',
  },
]

export const rub = (n) => n.toLocaleString('ru-RU') + ' ₽'
