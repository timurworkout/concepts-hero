# Weave — стандарты проекта

Читать перед любой генерацией фото или видео. Общий порядок работы — глобальный скилл `weave`; этот файл главнее его дефолтов. Всё, что пользователь утвердил (модель, эталон, промпт, критерий кадра), дописывать сюда.

## Модели

| Задача | Модель | id | Параметры | Цена |
|---|---|---|---|---|
| Стилизация места | Nano Banana 2.1 (edit) | `bebebed5-50c1-4701-98b3-86929db21585` | `resolution: 2K`, `output_format: jpeg`, `aspect_ratio: Default` | 10 кр. |
| Кадр дороги для заставки | Nano Banana 2.1 | тот же | то же, `aspect_ratio: 16:9` | 10 кр. |
| Видео заставки | Kling Video 2.5 Turbo Pro | через `weave_find_model "kling 2.5 turbo"` | image-to-video, 5 с — тест, 10 с — финал | 35 / 70 кр. |

Правило: каждый запуск, включая повтор, — показать цену и получить одобрение пользователя.

## Эталоны стиля

Подаются вторым изображением.

- **Рица v2** — эталон для мест: `https://media.weavy.ai/image/upload/v1793716203/uploads/7ZQgVKi51yYJC3KcmBaYq8XFcW23/ykyfxwrgnordlmgqaxob.jpg`
- **Дорога Сочи** — эталон для кадров заставки: `https://media.weavy.ai/image/upload/v1793717032/uploads/7ZQgVKi51yYJC3KcmBaYq8XFcW23/mgx32nka2rzngxhcscjf.jpg`

## Промпты

### Стилизация места

Фото в «Направлениях» — виды, а не дороги. Их не переснимаем: пейзаж сохраняем, меняется только обработка. Меняется `[PLACE]`.

```
Keep the exact landscape, composition and viewpoint of the first image: [PLACE]. Only change the photographic treatment to match the color grading of the second image: late afternoon soft light, low sun from the side, gentle long shadows, muted natural palette, strongly muted greens, faded shadows, slightly lifted blacks, softer sky, visible film grain, Kodak Portra 400 look, documentary travel photography. Do not add any objects, people, cars or text.
```

Варианты:
- снег в кадре — `soft low winter sun`, плюс `Keep the snow.`;
- ночь (сияние) — `Keep it a night scene.`, приглушить зелень сияния и добавить зерно, свет не менять;
- осенний или голый исходник — `Make it a warm late summer afternoon: trees in soft green leaf, grass green, low sun from the side.` Только с согласия пользователя;
- здание вместо пейзажа — `Keep the exact building…`.

### Кадр дороги для заставки

По одному на город, 16:9. Нижняя треть спокойная: поверх неё лежит текст. Первый кадр серии делается с эталоном Рица v2, остальные — с эталоном «Дорога Сочи» и фразой `same framing and color grading as the second image`.

```
Eye-level photograph from the side of an empty two-lane road, [PLACE].
The road leads from the lower foreground into the distance, slightly off-center.
No cars, no people, no text, no road signs with readable words.
Late afternoon soft light, low sun from the side, long gentle shadows.
Muted natural palette, slightly lifted blacks, fine film grain, Kodak Portra 400 look.
Shot on 35mm lens, f/5.6, deep focus, documentary travel photography, calm and spacious.
Quiet, uncluttered lower third (asphalt and roadside) for UI overlay.
```

Negative, если у модели есть такое поле: `cars, people, text, watermark, logo, HDR, oversaturated, fisheye, drone shot, aerial view, motion blur, illustration, 3d render`.

| Город | PLACE |
|---|---|
| Сочи | `a coastal serpentine near Sochi, Black Sea on one side, green subtropical mountains of the Caucasus rising behind, cypress trees along the road` |
| Петербург | `a road along the Gulf of Finland near Saint Petersburg, pine trees and granite boulders by the shore, pale northern sky` |
| Москва | `a country road outside Moscow through birch forest and open fields, a small dacha village in the distance` |
| Калининград | `a road through the Curonian Spit near Kaliningrad, tall pines and sand dunes, glimpse of the Baltic Sea` |
| Мурманск | `a road across the tundra near Murmansk, low rocky hills with patches of snow, sparse dwarf birches, cold clear light` |
| Казань | `a road above the Volga river near Kazan, wide water and gentle green hills, a white kremlin silhouette far on the horizon` |

### Видео заставки (Эльбрус, когда город не выбран)

Исходник — `public/hero/elbrus.jpg`. Утверждён v2: камера стоит, одна машина с переднего плана уезжает по дороге к горе. Модель не держит «машина скрывается» — машина уходит под нижний край вёрстки.

## Исходники и рефы

- Сначала спросить пользователя, есть ли у него исходник или реф. Его рефы — `img/references/photos/`.
- Порядок подбора: что уже на сайте → Unsplash / Pexels → Wikimedia Commons → веб.
- **Стилизовать ту картинку, которую видно на сайте.** `placeImage` в `src/App.jsx`: если `id` есть в `newPlacePhotos`, картинка берётся оттуда (4-й элемент), иначе из `public/places/<id>.webp`.
- **Критерии кадра** (из правок пользователя):
  - простор и «на что посмотреть»: море, долина, вид сверху;
  - объект целиком, а не кусок стены или развалины;
  - узнаваемая точка места (Танцующий лес, канатка Светлогорска);
  - смысл совпадает с карточкой: горнолыжка — склон и подъёмник, причём в Подмосковье холмы, а не горы;
  - без людей крупным планом.

| Источник | Как подать в Weave |
|---|---|
| `public/places/<id>.webp` (закоммичен) | `https://raw.githubusercontent.com/timurworkout/concepts-hero/main/public/places/<id>.webp` |
| Unsplash | URL как есть, `w=2000` |
| Wikimedia | не качается → `project/img/weave/src/<id>.jpg`, закоммитить, запушить, подать raw GitHub |
| `weave_upload_asset` | окно в этом клиенте не показывается |

## Нейминг и папки

- Сырые генерации: `project/img/weave/<id>-v<N>.jpg`. `<id>` — как в `src/data.js`, например `sochi-ritsa`.
- Дороги: `project/img/weave/road-<city>-v<N>.jpg`.
- Видео: `project/img/weave/hero-<name>-video-v<N>.mp4`.
- Исходники для raw-подачи: `project/img/weave/src/<id>.jpg`.

## Подключение

- **Места.** `cwebp -q 82 -resize 2000 0` → `public/places/<id>.webp`.
  - Если `id` есть в `newPlacePhotos`, 4-м элементом поставить `` `${import.meta.env.BASE_URL}places/<id>.webp` `` или удалить запись.
  - Подпись автора — в `placePhoto`: `[автор, лицензия, 'File:…']`.
- **Дороги.** `cwebp … -resize 2400 0` → `public/places/road-<city>.webp`, карта `roadPhotos` в `src/App.jsx`.
- **Видео.** Файл `public/hero/elbrus.mp4`.
  - Обрезка 7,5 с, crf 24, без звука, ~3,6 МБ.
  - Играет один раз после интро.
  - На десктопе нижние 20 % уходят за край.
- **Проверка.** Base path `/concepts-hero/`: картинки грузятся с `/concepts-hero/places/…`.

## Грабли проекта

- В `App.jsx` два словаря с одинаковыми ключами — `placePhoto` и `newPlacePhotos`. Замена по ключу через sed или perl заденет оба. Правь строку в нужной таблице.
- В рабочем дереве бывают чужие правки от параллельных сессий. Коммить только свои файлы, частично через `git update-index --cacheinfo`.

## Журнал

| Файл | Исходник | Промпт | Итог |
|---|---|---|---|
| `sochi-ritsa-v1.jpg` | `public/places/sochi-ritsa.webp` (raw GitHub) | стилизация, базовый | пейзаж сохранён, зелень сочная, зерна мало — отклонено |
| `sochi-ritsa-v2.jpg` | `public/places/sochi-ritsa.webp` (raw GitHub) | стилизация + `strongly muted greens, faded shadows, visible film grain` | утверждено, на сайте |
| `sochi-ski-v1.jpg` | Unsplash из `newPlacePhotos` (w=2000) + реф `sochi-ritsa-v2` | стилизация «match the color grading of the second image» | утверждено, на сайте |
| `sochi-lagonaki-v1.jpg` | `public/places/sochi-lagonaki.webp` (raw GitHub) + реф `sochi-ritsa-v2` | то же | утверждено, на сайте |
| `road-sochi-v1.jpg` | без исходника, реф `sochi-ritsa-v2` | дорога Сочи + «match the color grading» | утверждено, на заставке |
| `road-spb-v1.jpg` | без исходника, реф `road-sochi-v1` | дорога spb + «same framing and color grading» | утверждено, на заставке |
| `road-msk-v1.jpg` | без исходника, реф `road-sochi-v1` | дорога msk + «same framing and color grading» | утверждено, на заставке |
| `road-kgd-v1.jpg` | без исходника, реф `road-sochi-v1` | дорога kgd + «same framing and color grading» | утверждено, на заставке |
| `road-mmk-v1.jpg` | без исходника, реф `road-sochi-v1` | дорога mmk + «same framing and color grading» | утверждено, на заставке |
| `road-kzn-v1.jpg` | без исходника, реф `road-sochi-v1` | дорога kzn + «same framing and color grading» | утверждено, на заставке |
| `hero-elbrus-v1.jpg` | `public/hero/elbrus.jpg` (raw GitHub) + реф `road-sochi-v1` | стилизация, заставка без города | утверждено, на заставке (заменён `public/hero/elbrus.jpg`) |
| `kzn-sviyazhsk-v1.jpg` | `public/places/kzn-sviyazhsk.webp` (raw GitHub) + реф `sochi-ritsa-v2` | стилизация «match the color grading» | утверждено, на сайте |
| `kzn-raifa-v1.jpg` | `public/places/kzn-raifa.webp` (raw GitHub) + реф `sochi-ritsa-v2` | то же | утверждено, на сайте |
| `kzn-bolgar-v1.jpg` | Wikimedia → `project/img/weave/src/kzn-bolgar.jpg` (raw GitHub) + реф `sochi-ritsa-v2` | то же | утверждено, на сайте |
| `mmk-teriberka-v1.jpg` | `public/places/mmk-kola.webp` (raw GitHub) + реф `sochi-ritsa-v2` | то же, «keep the snow» (в исходнике лето — модель сохранила лето) | утверждено, на сайте |
| `mmk-khibiny-v1.jpg` | Unsplash из `newPlacePhotos` (w=2000) + реф `sochi-ritsa-v2` | то же, «keep the snow» | утверждено, на сайте |
| `mmk-aurora-v1.jpg` | Unsplash из `newPlacePhotos` (w=2000) + реф `sochi-ritsa-v2` | ночь оставить, только приглушить зелень и зерно | утверждено, на сайте |
| `spb-karelia-v1.jpg` | `public/places/spb-karelia.webp` (raw GitHub) + реф `sochi-ritsa-v2` | стилизация «match the color grading» | утверждено, на сайте |
| `spb-vyborg-v1.jpg` | новый исходник: Wikimedia `Vyborg_06-2012_Castle_06.jpg` (A.Savin) → `src/spb-vyborg.jpg` + реф `sochi-ritsa-v2` | то же | утверждено, на сайте |
| `spb-ladoga-v1.jpg` | Unsplash из `newPlacePhotos` (w=2000) + реф `sochi-ritsa-v2` | то же | утверждено, на сайте |
| `msk-ring-v1.jpg` | новый: Wikimedia `Suzdal._Kamenka_River_P7140082_2350.jpg` (Alexxx1979) → `src/msk-ring.jpg` + реф `sochi-ritsa-v2` | стилизация «match the color grading» | утверждено, на сайте |
| `msk-yakhroma-v1.jpg` | новый: Wikimedia `Sorochany_ski_resort_21.jpg` (Bigdoc81) → `src/msk-yakhroma.jpg` + реф | то же, «keep the snow», зимнее солнце | утверждено, на сайте |
| `msk-ikea-v1.jpg` | новый: Wikimedia `Private_russian_"dacha"_house_-_panoramio.jpg` (andreyss) → `src/msk-ikea.jpg` + реф | то же; карточка переименована в «На дачу на выходные» | утверждено, на сайте |
| `kgd-spit-v1.jpg` | новый: Wikimedia `Curonian_Spit_NP_05-2017_img04_aerial_view_at_Muellers_Height.jpg` (A.Savin) → `src/kgd-spit.jpg` + реф `sochi-ritsa-v2` | стилизация «match the color grading» | утверждено, на сайте |
| `kgd-castles-v1.jpg` | новый: Wikimedia `Замок_Прейсищ-Эйлау_(Багратионовск).jpg` (ИМгорь) → `src/kgd-castles.jpg` + реф | осенний исходник → «warm late summer afternoon, trees in leaf» | утверждено, на сайте |
| `kgd-coast-v1.jpg` | новый: Wikimedia `SvetlogorskRauschen_05-2017_img07_cableway.jpg` (A.Savin) → `src/kgd-coast.jpg` + реф | стилизация | утверждено, на сайте |
| `hero-elbrus-video-v1.mp4` | `public/hero/elbrus.jpg` (raw GitHub) | Kling Video 2.5 Turbo Pro, 5 с, 35 кредитов: dolly вперёд, одна машина уезжает к Эльбрусу | тест: кадр 1764×1172 (16:9 не применился), машина мелкая — на ревью |
| `hero-elbrus-video-v2.mp4` | `public/hero/elbrus.jpg` (raw GitHub) | Kling Video 2.5 Turbo Pro, 10 с, 70 кредитов: машина с переднего плана уезжает к горе и скрывается за холмом | машина крупно в начале, к концу ещё видна вдали — утверждено, на заставке (`public/hero/elbrus.mp4`, обрезан до 7,5 с, crf 24, 3,6 МБ; на десктопе низ 20% за краем — машина уезжает под него; играет раз после интро) |
| `hero-elbrus-video-v3.mp4` | `public/hero/elbrus.jpg` (raw GitHub) | Kling Video 2.5 Turbo Pro, 10 с, 70 кредитов: машина с первого кадра в среднем плане, к 7-й секунде скрывается | машина выезжает из-за гребня на ~2 с и к концу ещё видна — модель не держит «исчезновение»; на ревью |
