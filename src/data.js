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

// Подробности для карточки машины (Э3). Допущения — оценка, проверить
// unavailableAt — локации, где машины нет на подачу
export const carDetails = {
  'lada-vesta': { deposit: 10000, fuel: '7,5 л/100 км', range: '650 км', clearance: '178 мм', bags: '3 чемодана', winter: true, gravel: 'лёгкие грунтовки', unavailableAt: [],
    routes: ['Озеро Рица и Абхазия', 'Побережье: Сочи — Гагра', 'Выходные в Красной Поляне'] },
  'haval-f7': { deposit: 15000, fuel: '9 л/100 км', range: '580 км', clearance: '190 мм', bags: '3 чемодана + бокс', winter: true, gravel: 'грунтовки и серпантины', unavailableAt: [],
    routes: ['Горнолыжка: Роза Хутор', 'Плато Лаго-Наки', 'Озеро Рица и Абхазия'] },
  'jaecoo-j7': { deposit: 15000, fuel: '8 л/100 км', range: '600 км', clearance: '200 мм', bags: '4 чемодана', winter: true, gravel: 'лёгкие грунтовки', unavailableAt: [],
    routes: ['Море и побережье', 'Гагра и Новый Афон', 'Выходные в Красной Поляне'] },
  'geely-monjaro': { deposit: 25000, fuel: '9,5 л/100 км', range: '650 км', clearance: '204 мм', bags: '4 чемодана + бокс', winter: true, gravel: 'грунтовки и серпантины', unavailableAt: ['rosa'],
    routes: ['Плато Лаго-Наки', 'Горнолыжка: Роза Хутор', 'Абхазия: Рица и Ауадхара'] },
  'lada-largus': { deposit: 30000, fuel: '8,5 л/100 км', range: '580 км', clearance: '170 мм', bags: '5 чемоданов', winter: true, gravel: 'лёгкие грунтовки', unavailableAt: [],
    routes: ['Семьёй на море', 'Озеро Рица и Абхазия'] },
}

// Условия аренды — общие для всех машин (допущение)
export const rentTerms = {
  mileage: '300 км в сутки, сверх — 10 ₽/км',
  driver: 'от 21 года, стаж от 2 лет',
  regions: 'Краснодарский край и Адыгея; в Абхазию — с доверенностью, 1 000 ₽',
  dropoff: 'возврат в другой точке Сочи — бесплатно',
  insurance: 'ОСАГО и КАСКО с франшизой 30 000 ₽',
}

// per: 'day' — за сутки, 'once' — за аренду
export const extras = [
  { id: 'child-seat', group: 'car', name: 'Детское кресло', price: 300, per: 'day' },
  { id: 'driver2', group: 'car', name: 'Второй водитель', price: 500, per: 'once' },
  { id: 'full-ins', group: 'car', name: 'Полная страховка без франшизы', price: 900, per: 'day' },
  { id: 'delivery', group: 'car', name: 'Доставка к отелю', price: 1500, per: 'once' },
  { id: 'box', group: 'trip', name: 'Бокс на крышу', price: 600, per: 'day' },
  { id: 'ski-rack', group: 'trip', name: 'Крепление для лыж / сноуборда', price: 400, per: 'day' },
  { id: 'bike-rack', group: 'trip', name: 'Крепление для велосипеда', price: 400, per: 'day' },
  { id: 'skis', group: 'trip', name: 'Лыжи или сноуборд — уже в машине', note: 'прокат «Горки»', price: 2000, per: 'day' },
  { id: 'sup', group: 'trip', name: 'Сап — уже в машине', note: 'прокат «Волна»', price: 1500, per: 'day' },
  { id: 'skipass', group: 'trip', name: 'Скипасс Роза Хутор', note: 'Роза Хутор', price: 4500, per: 'day' },
  { id: 'route-ritsa', group: 'trip', name: 'Маршрут «Озеро Рица и Абхазия»', note: 'свой гайд', price: 0, per: 'once' },
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
    extraIds: ['box', 'skis', 'skipass'],
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
    extraIds: ['sup'],
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
    extraIds: ['route-ritsa'],
    chip: 'Выходные: маршрут Рица',
    priceFrom: '2 900 ₽/сутки',
  },
]

export const rub = (n) => n.toLocaleString('ru-RU') + ' ₽'
