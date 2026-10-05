// Моки из project/mock-data.md

export const locations = [
  { id: 'aer', name: 'Аэропорт Сочи (Адлер)', type: 'Аэропорт', etaMin: 20 },
  { id: 'adler-rw', name: 'Вокзал Адлер', type: 'Вокзал', etaMin: 25 },
  { id: 'sochi-rw', name: 'Вокзал Сочи', type: 'Вокзал', etaMin: 35 },
  { id: 'rosa', name: 'Красная Поляна, Роза Хутор', type: 'Отель', etaMin: 50 },
  { id: 'center', name: 'Сочи, центр', type: 'Адрес', etaMin: 30 },
]

export const locationGroups = ['Аэропорт', 'Вокзал', 'Отель', 'Адрес']

// stock: number — сколько осталось (null — всегда в наличии, 0 — разобрали)
// etaAdd — добавка к времени подачи локации в режиме «сейчас», мин
export const cars = [
  { id: 'lada-vesta', model: 'LADA Vesta', kind: 'Седан', pricePerDay: 2900, seats: 5, drive: 'передний', trunk: 480, tags: ['без оклейки'], stock: null, etaAdd: 0 },
  { id: 'haval-f7', model: 'Haval F7', kind: 'Кроссовер', pricePerDay: 3800, seats: 5, drive: 'полный', trunk: 440, tags: ['4×4', 'есть бокс'], stock: null, etaAdd: 10 },
  { id: 'jaecoo-j7', model: 'Jaecoo J7', kind: 'Кроссовер', pricePerDay: 4200, seats: 5, drive: 'передний', trunk: 500, tags: ['багажник 500 л'], stock: 2, etaAdd: 15 },
  { id: 'geely-monjaro', model: 'Geely Monjaro', kind: 'Внедорожник', pricePerDay: 6500, seats: 5, drive: 'полный', trunk: 562, tags: ['4×4', 'есть бокс'], stock: 1, etaAdd: 25 },
  { id: 'lada-largus', model: 'LADA Largus', kind: 'Универсал', pricePerDay: 4500, seats: 7, drive: 'передний', trunk: 560, tags: ['7 мест'], stock: 0, etaAdd: 40 },
]

export const kinds = ['Седан', 'Кроссовер', 'Внедорожник', 'Универсал']

export const offers = [
  {
    id: 'ski',
    title: 'Горнолыжка в Красной Поляне',
    locationId: 'aer',
    route: 'Аэропорт Сочи → Роза Хутор',
    car: 'Haval F7 4×4',
    carId: 'haval-f7',
    includes: ['бокс', 'лыжи в машине', 'скипасс'],
    chip: 'Горнолыжка: бокс + лыжи + скипасс',
    priceFrom: '6 400 ₽/сутки + скипасс',
  },
  {
    id: 'sea',
    title: 'Море и побережье',
    locationId: 'aer',
    route: 'Аэропорт Сочи',
    car: 'Jaecoo J7',
    carId: 'jaecoo-j7',
    includes: ['сап в машине', 'маршрут по побережью'],
    chip: 'Море: сап + маршрут',
    priceFrom: '5 700 ₽/сутки',
  },
  {
    id: 'weekend',
    title: 'Выходные: Рица и Абхазия',
    locationId: 'adler-rw',
    route: 'Вокзал Адлер',
    car: 'LADA Vesta',
    carId: 'lada-vesta',
    includes: ['маршрут «Озеро Рица и Абхазия»'],
    chip: 'Выходные: маршрут Рица',
    priceFrom: '2 900 ₽/сутки',
  },
]

export const rub = (n) => n.toLocaleString('ru-RU') + ' ₽'
