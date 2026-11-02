import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { animate } from 'motion'
import { cars } from './data.js'

const sessionKey = 'onmove:entry-intro:v1'
let seenInMemory = false

export function hasSeenEntryIntro() {
  try { return seenInMemory || sessionStorage.getItem(sessionKey) === '1' }
  catch { return seenInMemory }
}

function rememberEntryIntro() {
  seenInMemory = true
  try { sessionStorage.setItem(sessionKey, '1') } catch { /* работает и без хранилища */ }
}

// Утверждённая сцена, разбор по шагам — project/animations.md: видоискатель ищет машину в сетке,
// берёт её в фокус и превращает в move из лого, под лого — тезис. Около 15 секунд, один раз за сессию.
export default function EntryIntro({ full, onDone }) {
  const overlayRef = useRef(null)

  useLayoutEffect(() => {
    const overlay = overlayRef.current
    const app = document.getElementById('root')
    const targetLogo = document.querySelector('.header > .logo')
    const lines = [...document.querySelectorAll('.hero-title-line')]
    const wizard = document.querySelector('.hero .wizard')
    const nav = document.querySelector('.header-nav')
    if (!overlay || !app || !targetLogo || !lines.length || !wizard || !nav) {
      onDone()
      return
    }

    const logo = overlay.querySelector('.entry-intro-logo')
    const tiles = [...overlay.querySelectorAll('.entry-intro-tile')]
    const backdrop = overlay.querySelector('.entry-intro-backdrop')
    const veil = overlay.querySelector('.entry-intro-veil')
    const skip = overlay.querySelector('.entry-intro-skip')
    const thesis = overlay.querySelector('.entry-intro-thesis')
    const corners = [...overlay.querySelectorAll('.entry-intro-vf i')]
    const moveBox = logo.querySelector('.logo-move')
    const moveText = logo.querySelector('.entry-intro-move-text')
    const logoCorners = [...moveBox.querySelectorAll('i')]
    const focusEase = 'cubic-bezier(.16, 1, .3, 1)'
    const reduce = matchMedia('(prefers-reduced-motion: reduce)')
    const ease = [.3, .7, .2, 1]
    const content = [...lines, wizard, nav, targetLogo]
    const savedStyles = content.map((element) => ({ element, opacity: element.style.opacity, transform: element.style.transform }))
    const wasInert = app.inert
    const previousOverflow = document.body.style.overflow
    const previousPadding = document.body.style.paddingRight
    const scrollbar = innerWidth - document.documentElement.clientWidth
    const padding = parseFloat(getComputedStyle(document.body).paddingRight) || 0
    let animations = []
    let timers = []
    let settled = false
    let revealing = false
    let released = false
    let restoreKeyboardFocus = false

    rememberEntryIntro()
    // Portal находится вне #root: во время сцены сайт нельзя нажать или обойти клавиатурой.
    app.inert = true
    document.body.style.overflow = 'hidden'
    if (scrollbar) document.body.style.paddingRight = `${padding + scrollbar}px`

    const motion = (element, keyframes, options) => {
      const playback = animate(element, keyframes, options)
      animations.push(playback)
      return playback
    }
    // Уголки и CSS-переменные ведём через WAAPI: состояние держится до отмены сцены
    const play = (elements, keyframes, options) => [elements].flat().forEach((element) => {
      const animation = element.animate(keyframes, { fill: 'forwards', ...options })
      animations.push({ stop: () => animation.cancel() })
    })
    const later = (fn, ms) => { timers.push(setTimeout(() => { if (!settled) fn() }, ms)) }
    const stop = () => {
      timers.forEach(clearTimeout)
      timers = []
      animations.forEach((animation) => animation.stop())
      animations = []
    }
    const restoreContent = () => savedStyles.forEach(({ element, opacity, transform }) => {
      element.style.opacity = opacity
      element.style.transform = transform
    })
    const release = () => {
      if (released) return
      released = true
      app.inert = wasInert
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPadding
    }
    const finish = () => {
      if (settled) return
      settled = true
      const focusInside = overlay.contains(document.activeElement)
      stop()
      restoreContent()
      release()
      if (focusInside && restoreKeyboardFocus) targetLogo.focus({ preventScroll: true })
      onDone()
    }
    const hideContent = () => content.forEach((element) => { element.style.opacity = '0' })

    // На повторном заходе, при пропуске и reduced motion сразу открываем настоящий хиро.
    const reveal = (reduced = reduce.matches) => {
      if (settled) return
      revealing = true
      stop()
      restoreContent()
      hideContent()
      const focusInside = overlay.contains(document.activeElement)
      overlay.hidden = true
      overlay.dataset.phase = 'revealing'
      if (focusInside) overlay.blur()
      lines.forEach((line, i) => motion(line,
        reduced ? { opacity: [0, 1] } : { opacity: [0, 1], y: [10, 0] },
        { duration: reduced ? .2 : .24, delay: reduced ? 0 : i * .08, ease }))
      motion(wizard, reduced ? { opacity: [0, 1] } : { opacity: [0, 1], y: [16, 0] },
        { duration: .2, delay: reduced ? 0 : .2, ease })
      motion([nav, targetLogo], { opacity: [0, 1] }, { duration: .2 })
      later(() => {
        finish()
        if (focusInside && restoreKeyboardFocus) targetLogo.focus({ preventScroll: true })
      }, reduced ? 200 : 400)
    }

    const skipScene = (event) => {
      event.preventDefault()
      event.stopPropagation()
      restoreKeyboardFocus = event.type === 'keydown' || event.detail === 0
      if (!revealing) reveal()
    }
    const onKey = (event) => {
      if (event.key === 'Escape' && !revealing) skipScene(event)
      if (event.key === 'Tab' && !overlay.hidden) {
        restoreKeyboardFocus = true
        event.preventDefault()
        skip.focus({ preventScroll: true })
      }
    }
    const onReducedMotion = () => reveal(true)
    overlay.addEventListener('click', skipScene)
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('resize', finish)
    reduce.addEventListener('change', onReducedMotion)

    hideContent()
    if (!full || reduce.matches) reveal()
    else {
      window.scrollTo(0, 0)
      overlay.hidden = false
      overlay.dataset.phase = 'opening'
      overlay.focus({ preventScroll: true })
      // Центрирование в процентах остаётся точным и при позднем появлении веб-шрифта.
      const scale = Math.min(3.5, innerWidth * .62 / logo.offsetWidth)
      const centered = `translate(-50%, -50%) scale(${scale})`
      logo.style.transform = centered
      // Лого в начале не показываем: сразу сетка и поиск, вуаль нужна только под лого
      veil.style.opacity = '0'

      const mobile = innerWidth < 744
      const cols = mobile ? 4 : 10
      const count = mobile ? 24 : 30
      const rows = Math.ceil(count / cols)
      const gap = mobile ? 6 : 12
      const ratio = 1.5
      const width = Math.min((innerWidth * .92 - gap * (cols - 1)) / cols,
        (innerHeight * .64 - gap * (rows - 1)) / rows * ratio)
      const height = width / ratio
      const ox = (innerWidth - cols * width - (cols - 1) * gap) / 2
      const oy = (innerHeight - rows * height - (rows - 1) * gap) / 2
      const rectOf = (i) => ({ x: ox + (i % cols) * (width + gap), y: oy + Math.floor(i / cols) * (height + gap), w: width, h: height })
      tiles.forEach((tile, i) => {
        tile.hidden = i >= count
        tile.style.opacity = '0'
        if (tile.hidden) return
        tile.style.width = `${width}px`
        tile.style.height = `${height}px`
        const { x, y } = rectOf(i)
        const from = `translate(${(innerWidth - width) / 2}px, ${(innerHeight - height) / 2}px) scale(.5)`
        const to = `translate(${x}px, ${y}px) scale(1)`
        tile.style.transform = from
        motion(tile, { opacity: [0, .4], transform: [from, to] },
          { duration: 1.05, delay: .1 + (i * 7 % 11) * .04, ease: 'easeInOut' })
      })

      // Видоискатель: четыре уголка, каждый двигается своим transform.
      // Размер, толщина и скругление — зарегистрированные CSS-переменные, их тоже можно анимировать.
      let arm = 22
      let at = null
      const spots = (r, pad) => [
        [r.x - pad, r.y - pad], [r.x + r.w + pad - arm, r.y - pad],
        [r.x + r.w + pad - arm, r.y + r.h + pad - arm], [r.x - pad, r.y + r.h + pad - arm],
      ]
      const tr = ([x, y]) => `translate(${x}px, ${y}px)`
      const glide = (r, pad, duration, from) => {
        const to = spots(r, pad)
        const start = from || at
        corners.forEach((corner, i) => play(corner, { transform: [tr(start[i]), tr(to[i])] }, { duration, easing: focusEase }))
        at = to
      }

      // Поиск: на каждой машине примеряется к фокусу, но не берёт; третья — в фокус.
      // Неспешно, чтобы зритель успел гадать, на какой остановится.
      const path = mobile ? [8, 22, 1] : [12, 23, 7]
      const pad = mobile ? 4 : 6
      const loose = pad + 12
      const first = rectOf(path[0])
      const target = rectOf(path[2])
      const car = tiles[path[2]]
      later(() => {
        corners.forEach((corner) => play(corner, { opacity: [0, 1] }, { duration: 300 }))
        glide(first, loose, 700, spots({ x: first.x - 60, y: first.y - 60, w: first.w + 120, h: first.h + 120 }, 0))
      }, 1200)
      later(() => glide(first, pad + 4, 450), 1900)
      later(() => glide(rectOf(path[1]), loose, 700), 2500)
      later(() => glide(rectOf(path[1]), pad + 4, 450), 3200)
      later(() => glide(target, loose, 800), 3800)
      later(() => glide(target, pad, 700), 4600)
      // Взял в фокус: уголки дожимаются, машина проявляется полностью
      later(() => {
        glide(target, pad - 4, 120)
        play(car, { opacity: [.4, 1] }, { duration: 500, easing: 'ease-out' })
      }, 5300)
      later(() => glide(target, pad, 200), 5420)

      // После захвата — по шагу за раз, без наложений: каждый этап успевает прочитаться.
      // 1. Остальные машины гаснут, пойманная остаётся одна в рамке
      later(() => {
        tiles.slice(0, count).forEach((tile, i) => { if (i !== path[2]) play(tile, { opacity: [.4, 0] }, { duration: 600, easing: 'ease-in-out' }) })
        play(car, { backgroundColor: [getComputedStyle(car).backgroundColor, 'transparent'] }, { duration: 600 })
      }, 6000)
      // 2. Машина с рамкой встаёт в центр; по дороге рамка становится рамкой move из лого
      let box, k, carAt
      const carTo = (cx, cy) => `translate(${cx - width / 2}px, ${cy - height / 2}px) scale(${k})`
      later(() => {
        box = moveBox.getBoundingClientRect()
        // У фото в плитке поля сверху и снизу: машина занимает примерно 60% высоты плитки
        k = Math.min(box.width * .8 / width, box.height * .78 / (height * .6))
        carAt = carTo(innerWidth / 2, innerHeight / 2)
        play(car, { transform: [`translate(${target.x}px, ${target.y}px) scale(1)`, carAt] }, { duration: 1100, easing: focusEase })
        const em = parseFloat(getComputedStyle(moveBox).fontSize) * scale
        corners.forEach((corner) => play(corner, { '--intro-arm': ['22px', `${.38 * em}px`], '--intro-w': ['2px', `${.07 * em}px`], '--intro-r': ['12px', `${.2 * em}px`] },
          { duration: 1100, easing: focusEase }))
        arm = .38 * em
        glide({ x: (innerWidth - box.width) / 2, y: (innerHeight - box.height) / 2, w: box.width, h: box.height }, 0, 1100)
      }, 6800)
      // 3. Пауза, потом машина отъезжает на своё место в лого
      later(() => {
        play(car, { transform: [carAt, carTo(box.left + box.width / 2, box.top + box.height / 2)] }, { duration: 800, easing: focusEase })
        glide({ x: box.left, y: box.top, w: box.width, h: box.height }, 0, 800)
      }, 8500)
      // 4. Включается on — как лампа: короткое мерцание и ровный свет
      later(() => {
        overlay.dataset.phase = 'holding'
        play(logo, { opacity: [0, .7, .15, 1], offset: [0, .3, .5, 1] }, { duration: 500, easing: 'linear' })
      }, 9600)
      // 5. Машина уходит, затем в рамке появляется move — по очереди, без наплыва
      later(() => play(car, { opacity: [1, 0] }, { duration: 300, easing: 'ease-in' }), 10700)
      later(() => play(moveText, { opacity: [0, 1] }, { duration: 400, easing: 'ease-out' }), 11050)
      // Рамка видоискателя остаётся рамкой лого вокруг move
      later(() => {
        corners.forEach((corner) => play(corner, { opacity: [1, 0] }, { duration: 1 }))
        play(logoCorners, { opacity: [0, 1] }, { duration: 1 })
      }, 11500)

      // 6. Под лого — что значит название; держим, пока читается
      thesis.style.top = `${innerHeight / 2 + logo.offsetHeight * scale / 2 + (mobile ? 24 : 40)}px`
      later(() => play(thesis, { opacity: [0, 1], transform: ['translate(-50%, 8px)', 'translate(-50%, 0)'] }, { duration: 500, easing: focusEase }), 11700)
      later(() => play(thesis, { opacity: [1, 0] }, { duration: 300, easing: 'ease-in' }), 13300)

      const fly = 13.6
      later(() => {
        overlay.dataset.phase = 'flying'
        // Цель измеряем перед перелётом: шрифты за время заставки могли догрузиться.
        const target = targetLogo.getBoundingClientRect()
        motion(logo, { transform: [centered,
          `translate(${target.left - innerWidth / 2}px, ${target.top - innerHeight / 2}px) scale(1)`,
        ] }, { duration: .8, ease: 'easeInOut' })
      }, fly * 1000)
      motion(backdrop, { opacity: [1, 0] }, { duration: .8, delay: fly, ease: 'easeInOut' })
      motion(skip, { opacity: [1, 0] }, { duration: .3, delay: fly })
      later(() => {
        overlay.dataset.phase = 'revealing'
        play(logo, { opacity: [1, 0] }, { duration: 1 })
        targetLogo.style.opacity = '1'
      }, (fly + .8) * 1000)
      lines.forEach((line, i) => motion(line, { opacity: [0, 1], y: [10, 0] },
        { duration: .45, delay: fly + .7 + i * .12, ease }))
      motion(wizard, { opacity: [0, 1], y: [16, 0] }, { duration: .55, delay: fly + 1.1, ease })
      motion(nav, { opacity: [0, 1] }, { duration: .4, delay: fly + .8 })
      later(finish, (fly + 1.65) * 1000)
    }

    // StrictMode повторяет setup/cleanup: каждый запуск полностью отменяет свою сцену.
    return () => {
      settled = true
      stop()
      restoreContent()
      release()
      overlay.removeEventListener('click', skipScene)
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('resize', finish)
      reduce.removeEventListener('change', onReducedMotion)
    }
  }, [full, onDone])

  return createPortal(
    <div ref={overlayRef} className="entry-intro" role="dialog" aria-modal="true" aria-label="Входная заставка ON MOVE" tabIndex={-1}>
      <div className="entry-intro-backdrop" />
      <div className="entry-intro-grid" aria-hidden="true">
        {full && cars.slice(0, 30).map((car) => (
          <div key={car.id} className="entry-intro-tile">
            <img src={`${import.meta.env.BASE_URL}${car.image}`} alt="" decoding="async"
              onError={(event) => { event.currentTarget.hidden = true }} />
          </div>
        ))}
      </div>
      <div className="entry-intro-veil" />
      <div className="entry-intro-vf" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="logo entry-intro-logo" aria-hidden="true">
        <span className="logo-on">on</span><span className="logo-move"><i /><i /><i /><i /><span className="entry-intro-move-text">move</span></span>
      </div>
      <p className="entry-intro-thesis" aria-hidden="true">На муве — значит в движении: собрался и поехал, куда захотел.</p>
      <button type="button" className="entry-intro-skip">Пропустить <small>Esc</small></button>
    </div>,
    document.body,
  )
}
