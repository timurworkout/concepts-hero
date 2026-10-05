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


// Остальные машины из public/cars/cars.json. Цены и характеристики — оценка
// id, модель, вид, ₽/сутки, мест, привод, багажник л, клиренс мм, расход, запас хода км, наличие, добавка к подаче
const more = [
  ['jetour-dashing', 'Jetour Dashing', 'Кроссовер', 4300, 5, 'передний', 450, 190, 7.8, 650, null, 15],
  ['omoda-c5', 'Omoda C5', 'Кроссовер', 3900, 5, 'передний', 380, 190, 7.5, 640, null, 10],
  ['changan-uni-s', 'Changan UNI-S', 'Кроссовер', 4400, 5, 'передний', 420, 185, 7.6, 650, 2, 20],
  ['hyundai-tucson', 'Hyundai Tucson', 'Кроссовер', 5200, 5, 'полный', 540, 181, 8.5, 620, null, 20],
  ['jeland-j7', 'Jeland J7', 'Кроссовер', 4100, 5, 'передний', 500, 200, 7.9, 640, null, 15],
  ['volkswagen-t-roc', 'Volkswagen T-Roc', 'Кроссовер', 4800, 5, 'передний', 445, 160, 6.8, 700, 0, 30],
  ['changan-cs35plus-new', 'Changan CS35 Plus', 'Кроссовер', 3200, 5, 'передний', 410, 180, 7.2, 650, null, 5],
  ['tenet-t4', 'Tenet T4', 'Кроссовер', 3400, 5, 'передний', 380, 180, 7.3, 640, null, 10],
  ['toyota-rav4', 'Toyota RAV4', 'Кроссовер', 6200, 5, 'полный', 580, 195, 8.4, 650, 2, 25],
  ['soueast-s06', 'Soueast S06', 'Кроссовер', 3500, 5, 'передний', 420, 185, 7.4, 640, null, 15],
  ['lada-granta-se', 'LADA Granta', 'Седан', 2300, 5, 'передний', 520, 180, 7.0, 700, null, 0],
  ['lada-granta-lb', 'LADA Granta лифтбек', 'Седан', 2400, 5, 'передний', 435, 180, 7.0, 700, null, 0],
  ['tenet-t7', 'Tenet T7', 'Кроссовер', 4500, 5, 'полный', 470, 200, 8.6, 600, null, 20],
  ['geely-coolray', 'Geely Coolray', 'Кроссовер', 3600, 5, 'передний', 330, 196, 7.4, 620, null, 10],
  ['bmw-x3', 'BMW X3', 'Внедорожник', 9500, 5, 'полный', 550, 204, 8.9, 700, 1, 35],
  ['lada-vesta-cross', 'LADA Vesta Cross', 'Седан', 3100, 5, 'передний', 480, 203, 7.7, 640, null, 5],
  ['lada-vesta-sw', 'LADA Vesta SW', 'Универсал', 3100, 5, 'передний', 575, 178, 7.6, 650, null, 5],
  ['lada-vesta-sw-cross', 'LADA Vesta SW Cross', 'Универсал', 3300, 5, 'передний', 575, 203, 7.8, 640, null, 10],
  ['moskvich-3', 'Москвич 3', 'Кроссовер', 3300, 5, 'передний', 360, 175, 7.8, 600, null, 15],
  ['toyota-camry', 'Toyota Camry', 'Седан', 5500, 5, 'передний', 493, 155, 7.8, 750, 2, 25],
  ['lada-granta-cross', 'LADA Granta Cross', 'Универсал', 2700, 5, 'передний', 360, 198, 7.4, 650, null, 5],
  ['toyota-highlander', 'Toyota Highlander', 'Внедорожник', 8500, 7, 'полный', 658, 200, 10.5, 650, 1, 35],
  ['lada-largus-furgon', 'LADA Largus фургон', 'Фургон', 3500, 2, 'передний', 2500, 170, 8.5, 580, null, 30],
  ['exeed-lx', 'Exeed LX', 'Кроссовер', 4600, 5, 'передний', 410, 190, 7.9, 650, null, 15],
  ['gac-gs8-traveller', 'GAC GS8', 'Внедорожник', 7500, 7, 'полный', 700, 200, 10.2, 650, 2, 30],
  ['chery-arrizo-8', 'Chery Arrizo 8', 'Седан', 3800, 5, 'передний', 540, 150, 6.9, 750, null, 15],
  ['jaecoo-j8', 'Jaecoo J8', 'Внедорожник', 7200, 7, 'полный', 640, 210, 9.5, 650, 0, 30],
  ['changan-uni-v', 'Changan UNI-V', 'Седан', 4100, 5, 'передний', 470, 145, 6.9, 750, null, 15],
  ['jetour-t2', 'Jetour T2', 'Внедорожник', 6800, 5, 'полный', 700, 220, 10.8, 650, 2, 30],
  ['changan-uni-t', 'Changan UNI-T', 'Кроссовер', 4200, 5, 'передний', 450, 190, 7.8, 650, null, 15],
  ['changan-uni-k', 'Changan UNI-K', 'Внедорожник', 5800, 5, 'полный', 560, 195, 9.2, 650, null, 20],
  ['haval-dargo', 'Haval Dargo', 'Внедорожник', 5200, 5, 'полный', 520, 220, 9.0, 650, null, 20],
  ['voyah-free', 'Voyah Free', 'Внедорожник', 8000, 5, 'полный', 560, 200, 0, 900, 1, 35],
  ['changan-eadoplus', 'Changan Eado Plus', 'Седан', 3300, 5, 'передний', 500, 150, 6.8, 750, null, 10],
  ['haval-m6', 'Haval M6', 'Кроссовер', 3500, 5, 'передний', 480, 182, 7.9, 600, null, 10],
  ['haval-h9', 'Haval H9', 'Внедорожник', 7800, 7, 'полный', 600, 224, 11.5, 700, 0, 40],
  ['baic-u5-plus', 'BAIC U5 Plus', 'Седан', 2900, 5, 'передний', 450, 150, 7.0, 680, null, 10],
  ['voyah-dream', 'Voyah Dream', 'Минивэн', 9000, 7, 'полный', 700, 160, 0, 800, 1, 40],
  ['changan-cs95', 'Changan CS95', 'Внедорожник', 7000, 7, 'полный', 600, 200, 10.5, 600, null, 30],
  ['changan-alsvin', 'Changan Alsvin', 'Седан', 2600, 5, 'передний', 520, 150, 6.5, 650, null, 5],
  ['changan-hunter-plus', 'Changan Hunter Plus', 'Пикап', 6000, 5, 'полный', 1000, 230, 10.0, 700, 2, 30],
  ['changan-lamore', 'Changan Lamore', 'Седан', 3600, 5, 'передний', 510, 145, 6.6, 760, null, 15],
  ['geely-okavango', 'Geely Okavango', 'Внедорожник', 5500, 7, 'передний', 560, 175, 8.6, 650, null, 20],
  ['tank-300', 'Tank 300', 'Внедорожник', 9000, 5, 'полный', 400, 224, 12.0, 670, 1, 40],
  ['jetour-x70-plus', 'Jetour X70 Plus', 'Внедорожник', 4900, 7, 'передний', 560, 190, 8.6, 640, null, 20],
]

const suitcases = (n) => `${n} ${n < 5 ? 'чемодана' : 'чемоданов'}`

const routesBy = {
  offroad: ['Плато Лаго-Наки', 'Горнолыжка: Роза Хутор', 'Абхазия: Рица и Ауадхара'],
  family: ['Семьёй на море', 'Озеро Рица и Абхазия', 'Выходные в Красной Поляне'],
  road: ['Побережье: Сочи — Гагра', 'Озеро Рица и Абхазия', 'Выходные в Красной Поляне'],
}

for (const [id, model, kind, pricePerDay, seats, drive, trunk, clearance, fuel, range, stock, etaAdd] of more) {
  const awd = drive === 'полный'
  const electric = fuel === 0
  const tags = [
    awd && '4×4',
    awd && clearance >= 190 && 'есть бокс',
    seats >= 7 && '7 мест',
    trunk >= 550 && kind !== 'Фургон' && `багажник ${trunk} л`,
    electric && 'гибрид, заряд',
  ].filter(Boolean)
  cars.push({ id, model, kind, pricePerDay, seats, drive, trunk, tags, stock, etaAdd })
  carDetails[id] = {
    deposit: Math.round(pricePerDay * 4 / 5000) * 5000,
    fuel: electric ? 'гибрид: электро + бензин' : `${String(fuel).replace('.', ',')} л/100 км`,
    range: `${range} км`,
    clearance: `${clearance} мм`,
    bags: kind === 'Фургон' ? 'грузовой отсек 2,5 м³' : suitcases(Math.max(2, Math.round(trunk / 130))),
    winter: true,
    gravel: awd && clearance >= 200 ? 'грунтовки и серпантины' : clearance >= 185 ? 'лёгкие грунтовки' : 'асфальт',
    unavailableAt: [],
    routes: awd ? routesBy.offroad : seats >= 7 ? routesBy.family : routesBy.road,
  }
}

export const kinds = ['Седан', 'Кроссовер', 'Внедорожник', 'Универсал', 'Минивэн', 'Пикап', 'Фургон']

// Сценарии «Куда едете» на Э2: подборка машин и почему их рекомендуем
export const scenarios = [
  { id: 'all', label: 'Все' },
  { id: 'city', label: 'Город и побережье',
    why: 'Седаны и кроссоверы для асфальта: Сочи, побережье, Абхазия по трассе. Расход 6,5–8 л на 100 км — на бензин уйдёт меньше. Сначала дешёвые.',
    carIds: ['lada-vesta', 'changan-alsvin', 'chery-arrizo-8', 'omoda-c5', 'jaecoo-j7', 'toyota-camry', 'volkswagen-t-roc'] },
  { id: 'mountains', label: 'Горы и серпантины',
    why: 'Полный привод и клиренс от 180 мм: серпантин на Красную Поляну, Лаго-Наки, снег зимой. Зимой все на шипах, под лыжи можно взять бокс.',
    carIds: ['haval-f7', 'geely-monjaro', 'haval-dargo', 'toyota-rav4', 'changan-uni-k', 'haval-h9'] },
  { id: 'family', label: 'Семьёй и с багажом',
    why: '7 мест или багажник от 560 л: семья, коляска и чемоданы помещаются без бокса.',
    carIds: ['lada-largus', 'toyota-highlander', 'changan-cs95', 'jetour-x70-plus', 'gac-gs8-traveller', 'jaecoo-j8', 'lada-vesta-sw'] },
  { id: 'offroad', label: 'Бездорожье',
    why: 'Рамные внедорожники и пикап с клиренсом от 220 мм: грунтовки Абхазии, Ауадхара, броды. На асфальте расход выше — 10–12 л на 100 км.',
    carIds: ['tank-300', 'jetour-t2', 'changan-hunter-plus', 'haval-h9'] },
]

export const offers = [
  {
    id: 'ski',
    title: 'Горнолыжка в Красной Поляне',
    locationId: 'aer',
    route: 'Аэропорт Сочи → Роза Хутор',
    car: 'Haval F7 4×4',
    carId: 'haval-f7',
    scenarioId: 'mountains',
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
    scenarioId: 'city',
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
    scenarioId: 'city',
    includes: ['маршрут «Озеро Рица и Абхазия»'],
    extraIds: ['route-ritsa'],
    chip: 'Выходные: маршрут Рица',
    priceFrom: '2 900 ₽/сутки',
  },
]

export const rub = (n) => n.toLocaleString('ru-RU') + ' ₽'
