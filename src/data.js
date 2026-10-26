import { cars, carDetails, isAutomatic, hasNumber } from './fleet.js'
export { cars, carDetails } from './fleet.js'

// Типографика: короткие слова и тире не висят в конце строки — неразрывный пробел
const SHORT = 'в|во|с|со|к|ко|у|о|об|и|а|но|да|на|по|за|из|до|от|без|для|не|ни|под|над|при|про|через'
export const nb = (t) => t
  .replace(new RegExp(`(^|[\\s(«])(${SHORT})\\s`, 'giu'), '$1$2\u00a0')
  .replace(new RegExp(`(^|[\\s(«])(${SHORT})\\s`, 'giu'), '$1$2\u00a0') // второй проход: «в на ...» подряд
  .replace(/\s—/g, '\u00a0—')
// Прогоняем все строки данных через nb на месте. id без пробелов, их правило не трогает
function typo(v) {
  if (!v || typeof v !== 'object') return
  for (const k of Object.keys(v)) {
    if (typeof v[k] === 'string') v[k] = nb(v[k])
    else typo(v[k])
  }
}

// Моки из project/archive/mock-data.md

// meet — где именно ждёт машина
export const locations = [
  { id: 'aer', city: 'sochi', name: 'Аэропорт Сочи (Адлер)', type: 'Аэропорт', etaMin: 20, meet: 'Парковка P1 у терминала, 2-й ряд. Сотрудник ждёт с табличкой' },
  { id: 'adler-rw', city: 'sochi', name: 'Вокзал Адлер', type: 'Вокзал', etaMin: 25, meet: 'Парковка у главного входа, справа от такси' },
  { id: 'sochi-rw', city: 'sochi', name: 'Вокзал Сочи', type: 'Вокзал', etaMin: 35, meet: 'Привокзальная площадь, парковка у часов' },
  { id: 'rosa', city: 'sochi', name: 'Красная Поляна, Роза Хутор', type: 'Отель', etaMin: 50, meet: 'У входа в твой отель — напишем номер машины в SMS' },
  { id: 'adler-hotel', city: 'sochi', name: 'Твой отель в Адлере или Сочи', type: 'Отель', etaMin: 40, meet: 'У входа в отель — договоримся с ресепшеном о парковке' },
  { id: 'sochi-park', city: 'sochi', name: 'Центр проката у Морпорта', type: 'Парковка', etaMin: 0, meet: 'Наш офис на парковке Морпорта, работаем 8:00–23:00' },
  { id: 'center', city: 'sochi', name: 'Сочи: к твоему адресу', type: 'Адрес', etaMin: 30, meet: 'К подъезду по адресу, который укажешь' },
  { id: 'spb-led', city: 'spb', name: 'Аэропорт Пулково', type: 'Аэропорт', etaMin: 25, meet: 'Парковка P2, 1-й уровень. Сотрудник ждёт с табличкой' },
  { id: 'spb-rw', city: 'spb', name: 'Московский вокзал', type: 'Вокзал', etaMin: 30, meet: 'Парковка со стороны Гончарной улицы' },
  { id: 'spb-park', city: 'spb', name: 'Центр проката на Петроградской', type: 'Парковка', etaMin: 0, meet: 'Наш офис во дворе, вход с Большого проспекта' },
  { id: 'spb-north', city: 'spb', name: 'Петербург: у твоего дома', type: 'Адрес', etaMin: 40, meet: 'К подъезду по адресу, который укажешь' },
  { id: 'msk-svo', city: 'msk', name: 'Аэропорт Шереметьево', type: 'Аэропорт', etaMin: 30, meet: 'Парковка P1 у терминала B. Сотрудник ждёт с табличкой' },
  { id: 'msk-rw', city: 'msk', name: 'Ленинградский вокзал', type: 'Вокзал', etaMin: 35, meet: 'Парковка на Комсомольской площади' },
  { id: 'msk-hotel', city: 'msk', name: 'Твой отель в Москве', type: 'Отель', etaMin: 40, meet: 'У входа в отель — номер машины пришлём в SMS' },
  { id: 'msk-park', city: 'msk', name: 'Центр проката у Белорусской', type: 'Парковка', etaMin: 0, meet: 'Подземный паркинг, −1 этаж, места 101–120' },
  { id: 'msk-home', city: 'msk', name: 'Москва: у твоего дома', type: 'Адрес', etaMin: 45, meet: 'К подъезду по адресу, который укажешь' },
  { id: 'kgd', city: 'kgd', name: 'Аэропорт Калининграда (Храброво)', type: 'Аэропорт', etaMin: 20, meet: 'Парковка у терминала, 1-й ряд' },
  { id: 'kgd-home', city: 'kgd', name: 'Калининград: к твоему адресу', type: 'Адрес', etaMin: 35, meet: 'К подъезду по адресу, который укажешь' },
  { id: 'mmk', city: 'mmk', name: 'Аэропорт Мурманска', type: 'Аэропорт', etaMin: 20, meet: 'Парковка у терминала — машина уже прогрета' },
  { id: 'mmk-home', city: 'mmk', name: 'Мурманск: к твоему адресу', type: 'Адрес', etaMin: 35, meet: 'К подъезду — машина приедет прогретой' },
  { id: 'kzn-rw', city: 'kzn', name: 'Вокзал Казани', type: 'Вокзал', etaMin: 25, meet: 'Парковка у главного входа' },
  { id: 'kzn-air', city: 'kzn', name: 'Аэропорт Казани', type: 'Аэропорт', etaMin: 25, meet: 'Парковка P1 у терминала 1A' },
  { id: 'kzn-home', city: 'kzn', name: 'Казань: к твоему адресу', type: 'Адрес', etaMin: 35, meet: 'К подъезду по адресу, который укажешь' },
]

// Подсказки адресов для поиска в пикере: отели и жилые адреса по городам
export const addressHints = {
  sochi: ['ул. Орджоникидзе, 11', 'Курортный проспект, 50', 'ул. Ленина, 219, Адлер', 'Роза Хутор, Олимпийская ул., 35', 'Отель Radisson Rosa Khutor, Набережная Лаванда, 4', 'ул. Навагинская, 9/3'],
  spb: ['Невский проспект, 28', 'ул. Рубинштейна, 15', 'Отель «Астория», Большая Морская ул., 39', 'Каменноостровский проспект, 42', 'ул. Савушкина, 126'],
  msk: ['ул. Тверская, 3', 'Отель «Метрополь», Театральный проезд, 2', 'Кутузовский проспект, 32', 'ул. Профсоюзная, 56', 'Ленинградский проспект, 39'],
  kgd: ['Ленинский проспект, 30', 'ул. Профессора Баранова, 34', 'Отель «Кайзерхоф», ул. Октябрьская, 6а', 'Советский проспект, 12'],
  mmk: ['проспект Ленина, 82', 'Отель «Арктика», проспект Ленина, 82', 'ул. Карла Маркса, 25а', 'ул. Полярные Зори, 14'],
  kzn: ['ул. Баумана, 9', 'Отель «Шаляпин Палас», ул. Университетская, 7', 'проспект Победы, 141', 'ул. Пушкина, 4'],
}

export const locationGroups = [
  { type: 'Аэропорт', label: 'Аэропорты' },
  { type: 'Вокзал', label: 'Вокзалы' },
  { type: 'Отель', label: 'Отели' },
  { type: 'Парковка', label: 'Парковки и центры проката' },
  { type: 'Адрес', label: 'К дому' },
]

// Условия аренды — общие для всех машин (допущение)
export const rentTerms = {
  mileage: '300 км в сутки, сверх — 10 ₽/км',
  driver: 'от 21 года, стаж от 2 лет',
  fuel: 'Верни с тем же уровнем топлива, что был при получении, — или вычтем из депозита по цене АЗС',
  insurance: 'ОСАГО и КАСКО. Если повредишь машину, заплатишь не больше 30 000 ₽ — остальное покроет страховка. С полной страховкой — 0 ₽',
}

// Условия и маршруты по городу подачи (допущение). routes: null — маршруты машины (Сочи)
export const cities = {
  sochi: { priceK: 1.15, parkSkip: 3, name: 'Сочи', in: 'в Сочи', from: 'из Сочи', regions: 'Краснодарский край и Адыгея; в Абхазию — с доверенностью, 1 000 ₽',
    dropoff: 'возврат в другой точке Сочи — бесплатно', routes: null },
  spb: { priceK: 1, parkSkip: 2, name: 'Петербург', in: 'в Петербурге', from: 'из Петербурга', regions: 'Ленинградская область и Карелия',
    dropoff: 'возврат у дома или в любой точке Петербурга — бесплатно',
    routes: ['Выборг и Монрепо', 'Карелия: Рускеала и Сортавала', 'Финский залив: Зеленогорск'] },
  msk: { priceK: 1.05, parkSkip: 5, name: 'Москва', in: 'в Москве', from: 'из Москвы', regions: 'Московская, Владимирская, Ярославская и Тверская области',
    dropoff: 'возврат у дома или в любой точке Москвы — бесплатно',
    routes: ['На дачу', 'Суздаль и Владимир', 'Переславль и Ростов Великий'] },
  kgd: { priceK: 0.95, parkSkip: 4, name: 'Калининград', in: 'в Калининграде', from: 'из Калининграда', regions: 'Калининградская область',
    dropoff: 'возврат в аэропорту или в Калининграде — бесплатно',
    routes: ['Куршская коса', 'Зеленоградск и Светлогорск', 'Балтийск'] },
  mmk: { priceK: 1.2, parkSkip: 6, name: 'Мурманск', in: 'в Мурманске', from: 'из Мурманска', regions: 'Мурманская область',
    dropoff: 'возврат в аэропорту или в Мурманске — бесплатно',
    routes: ['Териберка', 'Хибины и Кировск', 'Охота за северным сиянием'] },
  kzn: { priceK: 0.9, parkSkip: 7, name: 'Казань', in: 'в Казани', from: 'из Казани', regions: 'Татарстан, Марий Эл и Чувашия',
    dropoff: 'возврат на вокзале или в аэропорту Казани — бесплатно',
    routes: ['Свияжск', 'Раифский монастырь', 'Йошкар-Ола'] },
}

// Парк по городам — допущение для концепта: priceK — коэффициент цены, parkSkip — каждой parkSkip-й машины в городе нет
export const inCity = (car, cityId) => !cityId || !!car.demoScenario || cars.indexOf(car) % cities[cityId].parkSkip !== 1
export const cityPrice = (car, cityId) => Math.round(car.pricePerDay * (cityId ? cities[cityId].priceK : Math.min(...Object.values(cities).map((c) => c.priceK))) / 10) * 10

// per: 'day' — за сутки, 'once' — за аренду
export const extras = [
  { id: 'child-seat', group: 'car', name: 'Детское кресло', price: 300, per: 'day' },
  { id: 'driver2', group: 'car', name: 'Второй водитель', price: 500, per: 'once' },
  { id: 'full-ins', group: 'car', name: 'Полная страховка без франшизы', price: 900, per: 'day' },
  { id: 'unlimited', group: 'car', name: 'Безлимитный пробег', price: 700, per: 'day' },
  { id: 'box', group: 'trip', name: 'Бокс на крышу', price: 600, per: 'day' },
  { id: 'ski-rack', group: 'trip', name: 'Крепление для лыж / сноуборда', price: 400, per: 'day' },
  { id: 'bike-rack', group: 'trip', name: 'Крепление для велосипеда', price: 400, per: 'day' },
  { id: 'skis', group: 'trip', name: 'Лыжи или сноуборд в машине', note: 'прокат «Горки»', price: 2000, per: 'day' },
  { id: 'sup', group: 'trip', name: 'Сап в машине', note: 'прокат «Волна»', price: 1500, per: 'day' },
  { id: 'skipass', group: 'trip', name: 'Скипасс Роза Хутор', note: 'Роза Хутор', price: 4500, per: 'day' },
  { id: 'grill', group: 'trip', name: 'Мангал и набор для шашлыка', price: 700, per: 'once' },
  { id: 'tent', group: 'trip', name: 'Палатка и коврики', price: 800, per: 'day' },
  { id: 'route-ritsa', group: 'trip', name: 'Маршрут «Озеро Рица и Абхазия»', note: 'свой гайд', price: 0, per: 'once' },
]


export const kinds = ['Седан', 'Лифтбек', 'Кроссовер', 'Внедорожник']

// Планы поездки. Базовые (без local) — основная цель, одна; local — уточнения «куда», до двух
// test — какие машины подходят; cities — где показываем (нет — везде); local — «вы могли не знать»
const awd = (c) => c.drive === 'полный'
const cityCar = (c) => ['Седан', 'Лифтбек', 'Кроссовер', 'Внедорожник'].includes(c.kind) && hasNumber(c.fuelUse) && c.fuelUse <= 8
export const plans = [
  { id: 'mountains', label: 'В горы', hint: 'Полный привод и подтверждённый клиренс от 180 мм', level: 3, cities: ['sochi', 'mmk'],
    test: (c) => awd(c) && c.clearance >= 180 },
  { id: 'sea', label: 'На море', hint: 'Для поездки вдоль побережья — без ручного переключения передач', level: 1, cities: ['sochi', 'kgd'],
    test: (c) => isAutomatic(c) && cityCar(c), extraIds: ['sup'] },
  { id: 'city', label: 'Покатать по городу', hint: 'Компактная, расход до 8 л, легко парковаться', level: 1, test: cityCar },
  { id: 'dacha', label: 'На дачу', hint: 'Полный привод и клиренс от 175 мм для подъезда по грунтовке', level: 2, cities: ['msk', 'spb'],
    test: (c) => awd(c) && c.clearance >= 175, extraIds: ['grill'] },
  { id: 'business', label: 'Деловая поездка', hint: 'Седан бизнес-класса, без оклейки', level: 1.5, test: (c) => c.kind === 'Седан' && c.pricePerDay >= 3600 },
  { id: 'highway', label: 'По трассам', hint: 'Без ручного переключения передач, двигатель от 147 л. с.', level: 1.5,
    test: (c) => isAutomatic(c) && c.power >= 147 },

  { id: 'sochi-ski', goal: 'mountains', city: 'sochi', local: true, label: 'Горнолыжка в Красной Поляне', hint: 'Бокс и крепление для лыж уже стоят. Тебе осталось взять лыжи', level: 3.5,
    test: (c) => awd(c) && c.clearance >= 190, extraIds: ['box', 'skis'] },
  { id: 'sochi-ritsa', goal: 'mountains', city: 'sochi', local: true, label: 'Абхазия, озеро Рица', hint: 'Оформим доверенность на выезд, маршрут в подарок', level: 2,
    test: (c) => c.clearance >= 170 && c.kind !== 'Фургон', extraIds: ['route-ritsa'] },
  { id: 'sochi-lagonaki', goal: 'mountains', city: 'sochi', local: true, label: 'Плато Лаго-Наки', hint: 'Грунтовка на подъёме — полный привод и клиренс от 200 мм', level: 4,
    test: (c) => awd(c) && c.clearance >= 200 },
  { id: 'sochi-imereti', goal: 'sea', city: 'sochi', local: true, label: 'Имеретинская набережная', hint: 'Парковка у пляжа и багажник под зонт и шезлонги', level: 1, test: cityCar },
  { id: 'sochi-gagra', goal: 'sea', city: 'sochi', local: true, label: 'Гагра и Пицунда', hint: 'Оформим доверенность на выезд в Абхазию', level: 1.5,
    test: (c) => c.kind !== 'Фургон' && c.fuelUse <= 8 },
  { id: 'sochi-lazarevskoe', goal: 'sea', city: 'sochi', local: true, label: 'Лазаревское', hint: '70 км по серпантину — автомат и экономичный расход', level: 1.5,
    test: (c) => isAutomatic(c) && c.fuelUse <= 8 },
  { id: 'sochi-dzhubga', goal: 'sea', city: 'sochi', local: true, label: 'Джубга и Ольгинка', hint: '150 км вдоль побережья — без ручного переключения передач', level: 1.5,
    test: isAutomatic },
  { id: 'spb-karelia', city: 'spb', local: true, label: 'Карелия, Рускеала', hint: '280 км и грунтовки — подтверждённый клиренс от 190 мм', level: 3,
    test: (c) => c.clearance >= 190 },
  { id: 'spb-vyborg', city: 'spb', local: true, label: 'Выборг на выходные', hint: '140 км по трассе — экономичная и с автоматом', level: 1,
    test: (c) => cityCar(c) && isAutomatic(c) },
  { id: 'spb-ladoga', city: 'spb', local: true, label: 'Ладога с палаткой', hint: 'Палатка, коврики и мангал уже в багажнике. Шашлык — с тебя', level: 2,
    test: (c) => c.trunk >= 480 && c.clearance >= 180, extraIds: ['tent', 'grill'] },
  { id: 'msk-ring', city: 'msk', local: true, label: 'Золотое кольцо за выходные', hint: 'Длинный маршрут — расход до 8 л и без механики', level: 1.5,
    test: (c) => c.fuelUse > 0 && c.fuelUse <= 8 && isAutomatic(c) },
  { id: 'msk-yakhroma', city: 'msk', local: true, label: 'Горнолыжка в Яхроме', hint: 'Бокс и крепление для лыж, клиренс от 180 мм', level: 2,
    test: (c) => c.clearance >= 180 && c.kind !== 'Фургон', extraIds: ['box', 'ski-rack'] },
  { id: 'msk-ikea', city: 'msk', local: true, label: 'Дача, рассада и IKEA', hint: 'Универсал или фургон — багажник от 560 л', level: 2,
    test: (c) => c.trunk >= 560 },
  { id: 'kgd-spit', goal: 'sea', city: 'kgd', local: true, label: 'Куршская коса', hint: 'Экосбор оплатим заранее — на КПП просто проедешь', level: 1, test: cityCar },
  { id: 'kgd-castles', city: 'kgd', local: true, label: 'Замки Пруссии', hint: 'Грунтовки к руинам — клиренс от 190 мм', level: 2,
    test: (c) => c.clearance >= 190 },
  { id: 'kgd-coast', goal: 'sea', city: 'kgd', local: true, label: 'Светлогорск и Зеленоградск', hint: 'Крепление для велосипеда — катайтесь по променаду', level: 1,
    test: cityCar, extraIds: ['bike-rack'] },
  { id: 'kgd-yantarny', goal: 'sea', city: 'kgd', local: true, label: 'Пляж в Янтарном', hint: 'Широкий пляж и сосны — багажник под пляжные вещи', level: 1, test: cityCar },
  { id: 'mmk-teriberka', goal: 'mountains', city: 'mmk', local: true, label: 'Териберка', hint: 'Снег и сопки — только полный привод на шипах и клиренс от 200 мм', level: 4,
    test: (c) => awd(c) && c.clearance >= 200 },
  { id: 'mmk-aurora', city: 'mmk', local: true, label: 'Охота за северным сиянием', hint: 'Для выезда за город — полный привод', level: 3,
    test: (c) => awd(c) },
  { id: 'mmk-khibiny', goal: 'mountains', city: 'mmk', local: true, label: 'Хибины, Кировск', hint: 'Горнолыжка — крепление для лыж и полный привод', level: 3,
    test: awd, extraIds: ['ski-rack'] },
  { id: 'kzn-sviyazhsk', city: 'kzn', local: true, label: 'Свияжск и Иннополис', hint: 'Остров-град и город будущего за один день', level: 1, test: cityCar },
  { id: 'kzn-raifa', city: 'kzn', local: true, label: 'Раифский монастырь', hint: 'Лес и озеро в 30 км — лёгкая грунтовка на парковке', level: 1,
    test: (c) => c.clearance >= 170 && cityCar(c) },
  { id: 'kzn-bolgar', city: 'kzn', local: true, label: 'Болгар', hint: '200 км по трассе — без ручного переключения передач', level: 1.5,
    test: (c) => isAutomatic(c) },
]

// С кем едем на Э2 — мягкое уточнение подбора
export const companions = [
  { id: 'two', label: 'Для двоих', hint: 'проверили, что есть места для двоих', test: (c) => hasNumber(c.seats) && c.seats >= 2 },
  { id: 'family', label: 'Семьёй', hint: 'семья с вещами — багажник от 480 л', test: (c) => c.seats >= 5 && c.trunk >= 480 },
  { id: 'friends', label: 'С друзьями', hint: 'компания — от 5 мест и места под сумки', test: (c) => c.seats >= 5 && c.trunk >= 450 },
]

// Теги «Авто» на Э2 — жёсткие фильтры
export const prefOptions = [
  { id: 'awd', label: '4×4', test: awd },
  { id: 'auto', label: 'Без механики', test: isAutomatic },
  { id: 'seats7', label: '6+ мест', test: (c) => c.seats >= 6 },
  { id: 'bigTrunk', label: 'Много багажа', test: (c) => c.trunk >= 560 },
  { id: 'premium', label: 'Классом повыше', test: (c) => c.pricePerDay >= 5500 },
]

export const promises = [
  { title: 'Не ведро с гайками', text: 'Перед каждой поездкой моем, проверяем и фотографируем машину' },
  { title: '10 минут, и ты за рулём', text: 'Документы — заранее онлайн, на месте только осмотр и ключи' },
  { title: 'Залог не списываем', text: 'Только замораживаем на карте и размораживаем в день возврата машины' },
  { title: 'На связи круглосуточно', text: 'Даже в три ночи на трассе под Мурманском. Сломалась — привезём подменную туда, где ты' },
]

export const faq = [
  { q: 'А если подобранная машина мне не нравится?',
    a: 'Отметь, что важно, в тегах «Авто» — «4×4», «автомат», «классом повыше» — или возьми одну из альтернатив под машиной. Покажем, что стало лучше, что хуже и сколько это стоит.' },
  { q: 'А если я сам знаю, какую машину хочу?',
    a: 'Нажми на неё в блоке «Парк» — откроется карточка с ценой за твои даты. Понравившиеся машины сохраняй сердечком, чтобы быстро вернуться.' },
  { q: 'Откуда вы знаете, что мне нужно?',
    a: 'Мы не гадаем — мы спрашиваем цель. Серпантин — значит, нужен клиренс, Карелия — запас хода. На экране подбора видно, что именно мы учли.' },
  { q: 'Что, если машина окажется в плохом состоянии?',
    a: 'Каждая машина проходит мойку и осмотр перед арендой. Если на месте что-то не так — заменим машину или вернём деньги.' },
  { q: 'Как вернуть залог и не спорить о царапинах?',
    a: 'При получении фотографируем машину вместе с тобой, акт приходит в телефон. Залог — блокировка на карте, снимаем её в день возврата.' },
]

export const rub = (n) => n.toLocaleString('ru-RU') + ' ₽'

for (const d of [locations, addressHints, cars, carDetails, rentTerms, cities, extras, plans, companions, prefOptions, promises, faq]) typo(d)
