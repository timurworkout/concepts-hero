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

// Утверждённая сцена, разбор по шагам — project/animations.md: 5 секунд, с паузой перед раскрытием.
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
      motion(logo, { opacity: [0, 1] }, { duration: 1.1, delay: .25, ease: 'easeInOut' })

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
      tiles.forEach((tile, i) => {
        tile.hidden = i >= count
        tile.style.opacity = '0'
        if (tile.hidden) return
        tile.style.width = `${width}px`
        tile.style.height = `${height}px`
        const tx = ox + (i % cols) * (width + gap)
        const ty = oy + Math.floor(i / cols) * (height + gap)
        const from = `translate(${(innerWidth - width) / 2}px, ${(innerHeight - height) / 2}px) scale(.5)`
        const to = `translate(${tx}px, ${ty}px) scale(1)`
        tile.style.transform = from
        motion(tile, { opacity: [0, .4], transform: [from, to] },
          { duration: 1.05, delay: .95 + (i * 7 % 11) * .04, ease: 'easeInOut' })
      })

      // После появления сетки держим спокойный кадр перед началом.
      later(() => { overlay.dataset.phase = 'holding' }, 2450)
      later(() => motion(tiles.slice(0, count), { opacity: 0 }, { duration: .65, ease: 'easeInOut' }), 3150)
      later(() => {
        overlay.dataset.phase = 'flying'
        // Цель измеряем перед перелётом: шрифты за время заставки могли догрузиться.
        const target = targetLogo.getBoundingClientRect()
        motion(logo, { transform: [centered,
          `translate(${target.left - innerWidth / 2}px, ${target.top - innerHeight / 2}px) scale(1)`,
        ] }, { duration: .8, ease: 'easeInOut' })
      }, 3350)
      motion([backdrop, veil], { opacity: [1, 0] }, { duration: .8, delay: 3.35, ease: 'easeInOut' })
      motion(skip, { opacity: [1, 0] }, { duration: .3, delay: 3.35 })
      later(() => {
        overlay.dataset.phase = 'revealing'
        logo.style.opacity = '0'
        targetLogo.style.opacity = '1'
      }, 4150)
      lines.forEach((line, i) => motion(line, { opacity: [0, 1], y: [10, 0] },
        { duration: .45, delay: 4.05 + i * .12, ease }))
      motion(wizard, { opacity: [0, 1], y: [16, 0] }, { duration: .55, delay: 4.45, ease })
      motion(nav, { opacity: [0, 1] }, { duration: .4, delay: 4.15 })
      later(finish, 5000)
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
      <div className="logo entry-intro-logo" aria-hidden="true"><span className="logo-on">ON</span>MOVE</div>
      <button type="button" className="entry-intro-skip">Пропустить <small>Esc</small></button>
    </div>,
    document.body,
  )
}
