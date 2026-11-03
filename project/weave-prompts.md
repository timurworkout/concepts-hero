# Промпты для Figma Weave — кадры городов

По `plan.md` §5: по одному кадру на город. В кадре дорога в этом месте, снятая с уровня глаз. Этот же кадр идёт широко на интро и кропом в «Направления». Шаблон общий, меняется только блок `PLACE`. Порядок работы: сначала Сочи до результата, потом остальные пять.

## Настройки

- Формат **16:9**, на выходе от 2560 px по ширине. Важное держать в центральной трети: для «Направлений» кроп идёт до 4:3.
- Нижняя треть кадра спокойная: асфальт, обочина. Поверх интро лежит визард.
- Удачный первый кадр (Сочи) подать как style reference для остальных, если модель это умеет. Так серия соберётся в одну съёмку.

## Шаблон

```
Eye-level photograph from the side of an empty two-lane road, [PLACE].
The road leads from the lower foreground into the distance, slightly off-center.
No cars, no people, no text, no road signs with readable words.
Late afternoon soft light, low sun from the side, long gentle shadows.
Muted natural palette, slightly lifted blacks, fine film grain, Kodak Portra 400 look.
Shot on 35mm lens, f/5.6, deep focus, documentary travel photography, calm and spacious.
Quiet, uncluttered lower third (asphalt and roadside) for UI overlay.
```

Negative (если есть поле):

```
cars, people, text, watermark, logo, HDR, oversaturated, fisheye, drone shot, aerial view, motion blur, illustration, 3d render
```

## PLACE по городам

| Город | PLACE |
|---|---|
| **Сочи** (первым) | `a coastal serpentine near Sochi, Black Sea on one side, green subtropical mountains of the Caucasus rising behind, cypress trees along the road` |
| Петербург | `a road along the Gulf of Finland near Saint Petersburg, pine trees and granite boulders by the shore, pale northern sky` |
| Москва | `a country road outside Moscow through birch forest and open fields, a small dacha village in the distance` |
| Калининград | `a road through the Curonian Spit near Kaliningrad, tall pines and sand dunes, glimpse of the Baltic Sea` |
| Мурманск | `a road across the tundra near Murmansk, low rocky hills with patches of snow, sparse dwarf birches, cold clear light` |
| Казань | `a road above the Volga river near Kazan, wide water and gentle green hills, a white kremlin silhouette far on the horizon` |

## Если не выходит

- Получилась открытка, слишком ярко → добавить `overcast hazy light, understated` и убрать `low sun`.
- Модель рисует машину → в начало: `completely empty road`.
- Кадр не получается за 3–4 прогона → берём настоящее фото дороги и прогоняем его через ту же обработку (image-to-image, сила ~0.4 с этим же промптом).

## Стилизация мест

Для фото в `public/places/`. Это виды, а не дороги, поэтому их не переснимаем: сохраняем пейзаж и меняем только обработку. Модель — Nano Banana 2.1 (edit), 2K, Default aspect. Исходник подаём по ссылке `raw.githubusercontent.com/.../public/places/<id>.webp`: Wikimedia Weave не скачивает. Меняется только `[PLACE]`.

```
Keep this exact landscape, composition and viewpoint: [PLACE]. Only change the photographic treatment: late afternoon soft light, low sun from the side, gentle long shadows. Muted natural palette, less saturated greens, slightly lifted blacks, softer sky, fine film grain, Kodak Portra 400 look, documentary travel photography, calm and spacious. Do not add any objects, people, cars or text.
```

Первый прогон: `sochi-ritsa` → `project/img/weave/sochi-ritsa-v1.jpg`. Пейзаж сохранён, свет тёплый, но зелень сочная, зерна почти нет. Если нужно сильнее — добавить `strongly muted greens, faded shadows, visible film grain`.

## Порядок работы (для агента)

### 1. Откуда брать исходник

Фото места на сайте берётся так (`placeImage` в `src/App.jsx`): если `id` есть в `newPlacePhotos`, то берётся оттуда (4-й элемент — URL), иначе `public/places/<id>.webp`. **Стилизовать надо ту картинку, которую видно на сайте**, — сначала проверь `newPlacePhotos`.

| Источник | Как подать в Weave |
|---|---|
| `public/places/<id>.webp` (закоммичен) | `https://raw.githubusercontent.com/timurworkout/concepts-hero/main/public/places/<id>.webp` — работает |
| Unsplash (`images.unsplash.com/...`) | URL из `newPlacePhotos` как есть, `w=2000` вместо `w=1400` |
| Wikimedia (`upload.wikimedia.org`, `commons...`) | **Не работает** — Weave падает с «Could not generate images». Скачать к себе, положить в `project/img/weave/src/<id>.jpg`, закоммитить и запушить, подать raw-ссылкой GitHub |
| Окно загрузки `weave_upload_asset` | В этом клиенте не показывается — не использовать |

Не закоммиченный файл raw-ссылкой не достать: сначала push.

### 2. Запуск

1. `weave_find_model` не нужен: Nano Banana 2.1 — `id bebebed5-50c1-4701-98b3-86929db21585`. Параметры: `resolution: 2K`, `output_format: jpeg`; места — `aspect_ratio: Default`, дороги — `16:9`.
2. Вызов без `acknowledgedCost` — бесплатная цена (2K = 10 кредитов). Каждый запуск — одобрение пользователя через AskUserQuestion, даже повтор.
3. Опрос `weave_get_model_run_output` повторными вызовами (`sleep` в Bash заблокирован). Генерация ~1–2 минуты. Упавшие запуски кредиты, похоже, не списывают.

### 3. Куда класть и как называть

- Сырые генерации: `project/img/weave/<id>-v<N>.jpg` — `<id>` как в `src/data.js` / `App.jsx` (`sochi-ritsa`), `N` — номер попытки. Дороги: `project/img/weave/road-<city>-v<N>.jpg` (`road-sochi-v1`). Исходники для GitHub: `project/img/weave/src/<id>.jpg`.
- После каждой генерации — дописать строку в журнал ниже и отправить картинку пользователю (SendUserFile).
- Утверждённое в сайт: сжать в webp ширина 2000 (`cwebp -q 82 -resize 2000 0`) → `public/places/<id>.webp` (дороги — `public/places/road-<city>.webp`); если `id` был в `newPlacePhotos` — убрать оттуда запись, чтобы брался локальный файл, и обновить автора в `placePhoto` на «Weave по фото <автор>». Проверить в браузере.

### Журнал

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
