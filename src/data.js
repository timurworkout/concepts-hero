// Моки из project/mock-data.md

// meet — где именно ждёт машина
export const locations = [
  { id: 'aer', city: 'sochi', name: 'Аэропорт Сочи (Адлер)', type: 'Аэропорт', etaMin: 20, meet: 'Парковка P1 у терминала, 2-й ряд. Сотрудник ждёт с табличкой' },
  { id: 'adler-rw', city: 'sochi', name: 'Вокзал Адлер', type: 'Вокзал', etaMin: 25, meet: 'Парковка у главного входа, справа от такси' },
  { id: 'sochi-rw', city: 'sochi', name: 'Вокзал Сочи', type: 'Вокзал', etaMin: 35, meet: 'Привокзальная площадь, парковка у часов' },
  { id: 'rosa', city: 'sochi', name: 'Красная Поляна, Роза Хутор', type: 'Отель', etaMin: 50, meet: 'У входа в ваш отель — напишем номер машины в SMS' },
  { id: 'adler-hotel', city: 'sochi', name: 'Ваш отель в Адлере или Сочи', type: 'Отель', etaMin: 40, meet: 'У входа в отель — договоримся с ресепшеном о парковке' },
  { id: 'sochi-park', city: 'sochi', name: 'Центр проката у Морпорта', type: 'Парковка', etaMin: 0, meet: 'Наш офис на парковке Морпорта, работаем 8:00–23:00' },
  { id: 'center', city: 'sochi', name: 'Сочи: к вашему адресу', type: 'Адрес', etaMin: 30, meet: 'К подъезду по адресу, который укажете' },
  { id: 'spb-led', city: 'spb', name: 'Аэропорт Пулково', type: 'Аэропорт', etaMin: 25, meet: 'Парковка P2, 1-й уровень. Сотрудник ждёт с табличкой' },
  { id: 'spb-rw', city: 'spb', name: 'Московский вокзал', type: 'Вокзал', etaMin: 30, meet: 'Парковка со стороны Гончарной улицы' },
  { id: 'spb-park', city: 'spb', name: 'Центр проката на Петроградской', type: 'Парковка', etaMin: 0, meet: 'Наш офис во дворе, вход с Большого проспекта' },
  { id: 'spb-north', city: 'spb', name: 'Петербург: у вашего дома', type: 'Адрес', etaMin: 40, meet: 'К подъезду по адресу, который укажете' },
  { id: 'msk-svo', city: 'msk', name: 'Аэропорт Шереметьево', type: 'Аэропорт', etaMin: 30, meet: 'Парковка P1 у терминала B. Сотрудник ждёт с табличкой' },
  { id: 'msk-rw', city: 'msk', name: 'Ленинградский вокзал', type: 'Вокзал', etaMin: 35, meet: 'Парковка на Комсомольской площади' },
  { id: 'msk-hotel', city: 'msk', name: 'Ваш отель в Москве', type: 'Отель', etaMin: 40, meet: 'У входа в отель — номер машины пришлём в SMS' },
  { id: 'msk-park', city: 'msk', name: 'Центр проката у Белорусской', type: 'Парковка', etaMin: 0, meet: 'Подземный паркинг, −1 этаж, места 101–120' },
  { id: 'msk-home', city: 'msk', name: 'Москва: у вашего дома', type: 'Адрес', etaMin: 45, meet: 'К подъезду по адресу, который укажете' },
  { id: 'kgd', city: 'kgd', name: 'Аэропорт Калининграда (Храброво)', type: 'Аэропорт', etaMin: 20, meet: 'Парковка у терминала, 1-й ряд' },
  { id: 'kgd-home', city: 'kgd', name: 'Калининград: к вашему адресу', type: 'Адрес', etaMin: 35, meet: 'К подъезду по адресу, который укажете' },
  { id: 'mmk', city: 'mmk', name: 'Аэропорт Мурманска', type: 'Аэропорт', etaMin: 20, meet: 'Парковка у терминала — машина уже прогрета' },
  { id: 'mmk-home', city: 'mmk', name: 'Мурманск: к вашему адресу', type: 'Адрес', etaMin: 35, meet: 'К подъезду — машина приедет прогретой' },
  { id: 'kzn-rw', city: 'kzn', name: 'Вокзал Казани', type: 'Вокзал', etaMin: 25, meet: 'Парковка у главного входа' },
  { id: 'kzn-air', city: 'kzn', name: 'Аэропорт Казани', type: 'Аэропорт', etaMin: 25, meet: 'Парковка P1 у терминала 1A' },
  { id: 'kzn-home', city: 'kzn', name: 'Казань: к вашему адресу', type: 'Адрес', etaMin: 35, meet: 'К подъезду по адресу, который укажете' },
]

export const locationGroups = [
  { type: 'Аэропорт', label: 'Аэропорты' },
  { type: 'Вокзал', label: 'Вокзалы' },
  { type: 'Отель', label: 'Отели' },
  { type: 'Парковка', label: 'Парковки и центры проката' },
  { type: 'Адрес', label: 'К дому' },
]

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
  fuel: 'Верните с тем же уровнем топлива, что получили, — или вычтем из депозита по цене АЗС',
  insurance: 'ОСАГО и КАСКО. Если повредите машину, заплатите не больше 30 000 ₽ — остальное покроет страховка. С полной страховкой — 0 ₽',
}

// Условия и маршруты по городу подачи (допущение). routes: null — маршруты машины (Сочи)
export const cities = {
  sochi: { name: 'Сочи', in: 'в Сочи', regions: 'Краснодарский край и Адыгея; в Абхазию — с доверенностью, 1 000 ₽',
    dropoff: 'возврат в другой точке Сочи — бесплатно', routes: null },
  spb: { name: 'Петербург', in: 'в Петербурге', regions: 'Ленинградская область и Карелия',
    dropoff: 'возврат у дома или в любой точке Петербурга — бесплатно',
    routes: ['Выборг и Монрепо', 'Карелия: Рускеала и Сортавала', 'Финский залив: Зеленогорск'] },
  msk: { name: 'Москва', in: 'в Москве', regions: 'Московская, Владимирская, Ярославская и Тверская области',
    dropoff: 'возврат у дома или в любой точке Москвы — бесплатно',
    routes: ['На дачу', 'Суздаль и Владимир', 'Переславль и Ростов Великий'] },
  kgd: { name: 'Калининград', in: 'в Калининграде', regions: 'Калининградская область',
    dropoff: 'возврат в аэропорту или в Калининграде — бесплатно',
    routes: ['Куршская коса', 'Зеленоградск и Светлогорск', 'Балтийск'] },
  mmk: { name: 'Мурманск', in: 'в Мурманске', regions: 'Мурманская область',
    dropoff: 'возврат в аэропорту или в Мурманске — бесплатно',
    routes: ['Териберка', 'Хибины и Кировск', 'Охота за северным сиянием'] },
  kzn: { name: 'Казань', in: 'в Казани', regions: 'Татарстан, Марий Эл и Чувашия',
    dropoff: 'возврат на вокзале или в аэропорту Казани — бесплатно',
    routes: ['Свияжск', 'Раифский монастырь', 'Йошкар-Ола'] },
}

// per: 'day' — за сутки, 'once' — за аренду
export const extras = [
  { id: 'child-seat', group: 'car', name: 'Детское кресло', price: 300, per: 'day' },
  { id: 'driver2', group: 'car', name: 'Второй водитель', price: 500, per: 'once' },
  { id: 'full-ins', group: 'car', name: 'Полная страховка без франшизы', price: 900, per: 'day' },
  { id: 'delivery', group: 'calc', name: 'Доставка к адресу', price: 1500, per: 'once' },
  { id: 'unlimited', group: 'calc', name: 'Безлимитный пробег', price: 700, per: 'day' },
  { id: 'box', group: 'trip', name: 'Бокс на крышу', price: 600, per: 'day' },
  { id: 'ski-rack', group: 'trip', name: 'Крепление для лыж / сноуборда', price: 400, per: 'day' },
  { id: 'bike-rack', group: 'trip', name: 'Крепление для велосипеда', price: 400, per: 'day' },
  { id: 'skis', group: 'trip', name: 'Лыжи или сноуборд — уже в машине', note: 'прокат «Горки»', price: 2000, per: 'day' },
  { id: 'sup', group: 'trip', name: 'Сап — уже в машине', note: 'прокат «Волна»', price: 1500, per: 'day' },
  { id: 'skipass', group: 'trip', name: 'Скипасс Роза Хутор', note: 'Роза Хутор', price: 4500, per: 'day' },
  { id: 'grill', group: 'trip', name: 'Мангал и набор для шашлыка', price: 700, per: 'once' },
  { id: 'tent', group: 'trip', name: 'Палатка и коврики', price: 800, per: 'day' },
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

// Характеристики для подбора и карточки (оценка): коробка, мотор, топливо, цена за час
const manual = ['lada-granta-se', 'lada-granta-lb', 'lada-granta-cross', 'lada-largus', 'lada-largus-furgon', 'lada-vesta-sw']
const diesel = ['haval-h9', 'changan-hunter-plus']
for (const c of cars) {
  const d = carDetails[c.id]
  const hybrid = d.fuel.startsWith('гибрид')
  c.clearance = parseInt(d.clearance)
  c.range = parseInt(d.range)
  c.fuelUse = hybrid ? 0 : parseFloat(d.fuel.replace(',', '.'))
  c.gearbox = manual.includes(c.id) ? 'механика' : 'автомат'
  c.fuelType = hybrid ? 'гибрид' : diesel.includes(c.id) ? 'дизель' : 'бензин'
  c.engine = hybrid ? '1,5 л + электромотор' : c.pricePerDay < 3000 ? '1,6 л, 106 л. с.' : c.pricePerDay < 4000 ? '1,5 л турбо, 147 л. с.'
    : c.pricePerDay < 5500 ? '2,0 л, 150–190 л. с.' : '2,0 л турбо, от 200 л. с.'
  c.pricePerHour = Math.round(c.pricePerDay / 6 / 10) * 10
}

// Планы поездки. Базовые (без local) — основная цель, одна; local — уточнения «куда», до двух
// test — какие машины подходят; cities — где показываем (нет — везде); local — «вы могли не знать»
const awd = (c) => c.drive === 'полный'
const cityCar = (c) => ['Седан', 'Кроссовер'].includes(c.kind) && c.fuelUse <= 8
export const plans = [
  { id: 'mountains', label: 'В горы', hint: 'Полный привод и клиренс от 180 мм, зимой шипы', level: 3, cities: ['sochi', 'mmk'],
    test: (c) => awd(c) && c.clearance >= 180 },
  { id: 'sea', label: 'На море', hint: 'Багажник под пляжные вещи, экономичный расход', level: 1, cities: ['sochi', 'kgd'],
    test: (c) => c.trunk >= 420 && c.kind !== 'Фургон' && c.fuelUse <= 8, extraIds: ['sup'] },
  { id: 'city', label: 'Покатать по городу', hint: 'Компактная, расход до 8 л, легко парковаться', level: 1, test: cityCar },
  { id: 'dacha', label: 'На дачу', hint: 'Вместительный багажник и клиренс для грунтовки на последних километрах', level: 2, cities: ['msk', 'spb'],
    test: (c) => c.trunk >= 480 && c.clearance >= 175, extraIds: ['grill'] },
  { id: 'business', label: 'Деловая поездка', hint: 'Седан бизнес-класса, без оклейки', level: 1.5, test: (c) => c.kind === 'Седан' && c.pricePerDay >= 3600 },
  { id: 'highway', label: 'По трассам', hint: 'Автомат, запас хода от 650 км, мотор от 147 л. с.', level: 1.5,
    test: (c) => c.gearbox === 'автомат' && c.range >= 650 && c.pricePerDay >= 3500 && c.kind !== 'Фургон' },

  { id: 'sochi-ski', goal: 'mountains', city: 'sochi', local: true, label: 'Горнолыжка в Красной Поляне', hint: 'Лыжи и бокс уже в машине, полный привод на шипах', level: 3.5,
    test: (c) => awd(c) && c.clearance >= 190, extraIds: ['box', 'skis'] },
  { id: 'sochi-ritsa', goal: 'mountains', city: 'sochi', local: true, label: 'Абхазия, озеро Рица', hint: 'Оформим доверенность на выезд, маршрут в подарок', level: 2,
    test: (c) => c.clearance >= 170 && c.kind !== 'Фургон', extraIds: ['route-ritsa'] },
  { id: 'sochi-lagonaki', goal: 'mountains', city: 'sochi', local: true, label: 'Плато Лаго-Наки', hint: 'Грунтовка на подъёме — полный привод и клиренс от 200 мм', level: 4,
    test: (c) => awd(c) && c.clearance >= 200 },
  { id: 'sochi-imereti', goal: 'sea', city: 'sochi', local: true, label: 'Имеретинская набережная', hint: 'Парковка у пляжа и багажник под зонт и шезлонги', level: 1, test: cityCar },
  { id: 'sochi-gagra', goal: 'sea', city: 'sochi', local: true, label: 'Гагра и Пицунда', hint: 'Оформим доверенность на выезд в Абхазию', level: 1.5,
    test: (c) => c.kind !== 'Фургон' && c.fuelUse <= 8 },
  { id: 'sochi-lazarevskoe', goal: 'sea', city: 'sochi', local: true, label: 'Лазаревское', hint: '70 км по серпантину — автомат и экономичный расход', level: 1.5,
    test: (c) => c.gearbox === 'автомат' && c.fuelUse <= 8 },
  { id: 'sochi-dzhubga', goal: 'sea', city: 'sochi', local: true, label: 'Джубга и Ольгинка', hint: '150 км вдоль побережья — запас хода от 600 км', level: 1.5,
    test: (c) => c.range >= 600 },
  { id: 'spb-karelia', city: 'spb', local: true, label: 'Карелия, Рускеала', hint: '280 км и грунтовки — клиренс от 190 мм, запас хода от 600 км', level: 3,
    test: (c) => c.clearance >= 190 && c.range >= 600 },
  { id: 'spb-vyborg', city: 'spb', local: true, label: 'Выборг на выходные', hint: '140 км по трассе — экономичная и с автоматом', level: 1,
    test: (c) => cityCar(c) && c.gearbox === 'автомат' },
  { id: 'spb-ladoga', city: 'spb', local: true, label: 'Ладога с палаткой', hint: 'Палатка, коврики и мангал уже в машине', level: 2,
    test: (c) => c.trunk >= 480 && c.clearance >= 180, extraIds: ['tent', 'grill'] },
  { id: 'msk-ring', city: 'msk', local: true, label: 'Золотое кольцо за выходные', hint: '600+ км — расход до 8 л и запас хода от 650 км', level: 1.5,
    test: (c) => c.fuelUse > 0 && c.fuelUse <= 8 && c.range >= 650 },
  { id: 'msk-yakhroma', city: 'msk', local: true, label: 'Горнолыжка в Яхроме', hint: 'Бокс и крепление для лыж, клиренс от 180 мм', level: 2,
    test: (c) => c.clearance >= 180 && c.kind !== 'Фургон', extraIds: ['box', 'ski-rack'] },
  { id: 'msk-ikea', city: 'msk', local: true, label: 'Дача, рассада и IKEA', hint: 'Универсал или фургон — багажник от 560 л', level: 2,
    test: (c) => c.trunk >= 560 },
  { id: 'kgd-spit', goal: 'sea', city: 'kgd', local: true, label: 'Куршская коса', hint: 'Экосбор за въезд оплатим заранее — без очереди на КПП', level: 1, test: cityCar },
  { id: 'kgd-castles', city: 'kgd', local: true, label: 'Замки Пруссии', hint: 'Грунтовки к руинам — клиренс от 190 мм', level: 2,
    test: (c) => c.clearance >= 190 },
  { id: 'kgd-coast', goal: 'sea', city: 'kgd', local: true, label: 'Светлогорск и Зеленоградск', hint: 'Крепление для велосипеда — катайтесь по променаду', level: 1,
    test: cityCar, extraIds: ['bike-rack'] },
  { id: 'kgd-yantarny', goal: 'sea', city: 'kgd', local: true, label: 'Пляж в Янтарном', hint: 'Широкий пляж и сосны — багажник под пляжные вещи', level: 1, test: cityCar },
  { id: 'mmk-teriberka', goal: 'mountains', city: 'mmk', local: true, label: 'Териберка', hint: 'Снег и сопки — только полный привод на шипах и клиренс от 200 мм', level: 4,
    test: (c) => awd(c) && c.clearance >= 200 },
  { id: 'mmk-aurora', city: 'mmk', local: true, label: 'Охота за северным сиянием', hint: 'Ночью в тундру — полный привод и запас хода от 600 км', level: 3,
    test: (c) => awd(c) && c.range >= 600 },
  { id: 'mmk-khibiny', goal: 'mountains', city: 'mmk', local: true, label: 'Хибины, Кировск', hint: 'Горнолыжка — крепление для лыж и полный привод', level: 3,
    test: awd, extraIds: ['ski-rack'] },
  { id: 'kzn-sviyazhsk', city: 'kzn', local: true, label: 'Свияжск и Иннополис', hint: 'Остров-град и город будущего за один день', level: 1, test: cityCar },
  { id: 'kzn-raifa', city: 'kzn', local: true, label: 'Раифский монастырь', hint: 'Лес и озеро в 30 км — лёгкая грунтовка на парковке', level: 1,
    test: (c) => c.clearance >= 170 && cityCar(c) },
  { id: 'kzn-bolgar', city: 'kzn', local: true, label: 'Болгар', hint: '200 км по трассе — автомат и запас хода от 650 км', level: 1.5,
    test: (c) => c.gearbox === 'автомат' && c.range >= 650 && c.kind !== 'Фургон' },
]

// С кем едем на Э2 — мягкое уточнение подбора
export const companions = [
  { id: 'two', label: 'Для двоих', hint: 'вдвоём хватит компактной', test: (c) => c.seats <= 5 && c.pricePerDay <= 5000 },
  { id: 'family', label: 'Семьёй', hint: 'семья с вещами — багажник от 480 л', test: (c) => c.trunk >= 480 && c.kind !== 'Пикап' },
  { id: 'friends', label: 'С друзьями', hint: 'компания — от 5 мест и места под сумки', test: (c) => c.trunk >= 450 && c.kind !== 'Пикап' },
]

// Теги «Авто» на Э2 — жёсткие фильтры
export const prefOptions = [
  { id: 'awd', label: '4×4', test: awd },
  { id: 'auto', label: 'Автомат', test: (c) => c.gearbox === 'автомат' },
  { id: 'seats7', label: '6+ мест', test: (c) => c.seats >= 6 },
  { id: 'bigTrunk', label: 'Много багажа', test: (c) => c.trunk >= 560 },
  { id: 'premium', label: 'Классом повыше', test: (c) => c.pricePerDay >= 5500 },
]

export const promises = [
  { title: 'Машина проверена', text: 'Перед каждой арендой — мойка, осмотр и фото. Никаких «ведёр с гайками»' },
  { title: '10 минут на выдачу', text: 'Документы — заранее онлайн. На месте только осмотр и ключи' },
  { title: 'Залог — блокировка на карте', text: 'Не списываем и не берём наличными. Вернём в день возврата машины' },
  { title: 'Поддержка 24/7', text: 'Сломалась — привезём подменную машину туда, где вы' },
]

export const faq = [
  { q: 'А если подобранная машина мне не нравится?',
    a: 'Отметьте, что важно, в тегах «Авто» — «4×4», «автомат», «классом повыше» — или возьмите одну из альтернатив под машиной. Покажем, что стало лучше, что хуже и сколько это стоит.' },
  { q: 'А если я сам знаю, какую машину хочу?',
    a: 'Нажмите на неё в блоке «Парк» — откроется карточка с ценой за ваши даты. Понравившиеся машины сохраняйте сердечком, чтобы быстро вернуться.' },
  { q: 'Откуда вы знаете, что мне нужно?',
    a: 'Мы не гадаем — мы спрашиваем цель. Серпантин — значит, нужен клиренс, Карелия — запас хода. На экране подбора видно, что именно мы учли.' },
  { q: 'Что, если машина окажется в плохом состоянии?',
    a: 'Каждая машина проходит мойку и осмотр перед арендой. Если на месте что-то не так — заменим машину или вернём деньги.' },
  { q: 'Как вернуть залог и не спорить о царапинах?',
    a: 'При получении фотографируем машину вместе с вами, акт приходит в телефон. Залог — блокировка на карте, снимаем её в день возврата.' },
]

export const rub = (n) => n.toLocaleString('ru-RU') + ' ₽'
