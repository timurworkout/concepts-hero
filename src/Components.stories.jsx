import { useState } from 'react'
import { ActionIcon, Header, FavToggle } from './App.jsx'
import { cars } from './data.js'

/** Базовые компоненты: кнопки, вкладки, иконки, шапка, избранное. Рендерят настоящие классы и компоненты приложения. */
export default { title: 'Компоненты/Базовые' }

const Shell = ({ title, children }) => (
  <div style={{ background: 'var(--paper)', color: 'var(--ink)', padding: 32, minHeight: '100vh' }}>
    <p className="kicker">{title}</p>
    {children}
  </div>
)

export const Кнопки = () => (
  <Shell title="Контролы">
    <h2 style={{ fontFamily: 'var(--display)', textTransform: 'uppercase', marginBottom: 20 }}>Кнопки</h2>
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 28 }}>
      <button type="button" className="btn-primary">Основная</button>
      <button type="button" className="btn-primary btn-accent">Подобрать машину</button>
      <button type="button" className="btn-secondary">Вторичная</button>
      <button type="button" className="filter">Фильтр</button>
      <button type="button" className="filter active">Фильтр включён</button>
      <span className="chip">Чип</span>
      <span className="badge">Бейдж</span>
    </div>
    <p style={{ fontFamily: 'var(--text)', fontSize: 14, color: 'var(--body)', maxWidth: 520 }}>
      Панели и рамки — угловатые, контролы — круглые. Сброс кнопок обнуляет border и background,
      иначе строки-кнопки получают браузерную заливку.
    </p>
  </Shell>
)

export const ВкладкиГородов = () => (
  <Shell title="Направления">
    <div className="dir-tabs" role="tablist">
      {['Сочи', 'Петербург', 'Москва', 'Калининград', 'Мурманск', 'Казань'].map((c, i) => (
        <button key={c} type="button" role="tab" aria-selected={i === 0} className={'dir-tab' + (i === 0 ? ' on' : '')}>{c}</button>
      ))}
    </div>
  </Shell>
)

export const АкцентныеКнопки = () => (
  <Shell title="Акцентные кнопки">
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
      <button type="button" className="btn-primary btn-accent">Подобрать машину</button>
      <button type="button" className="btn-primary btn-accent btn-with-icon">Открыть <ActionIcon /></button>
      <button type="button" className="btn-primary btn-accent btn-with-icon">Добавить <ActionIcon kind="add" /></button>
      <button type="button" className="btn-primary btn-accent" disabled>Подобрать машину</button>
    </div>
  </Shell>
)

export const ИконкиДействий = () => (
  <Shell title="Иконки действий · единая толщина 1,5 px">
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      <button type="button" className="pick-suggestion"><span>Открыть направление</span><ActionIcon /></button>
      <button type="button" className="pick-suggestion"><span>Добавить параметр</span><ActionIcon kind="add" /></button>
    </div>
    <p style={{ marginTop: 24 }}>Стрелка вверх-вправо — переход или новое окно. Плюс — добавление параметра или выбор опции.</p>
  </Shell>
)

const noop = () => {}
export const ШапкаГость = () => (
  <Header user={null} favs={[]} bookingsCount={0} onHome={noop} onFavs={noop} onLogin={noop} onLogout={noop} onBookings={noop} />
)
ШапкаГость.storyName = 'Шапка · гость'

export const ШапкаЗалогинен = () => (
  <Header user={{ name: 'Иван', phone: '+7 999 123-45-67' }} favs={[cars[0].id, cars[1].id]} bookingsCount={1}
    onHome={noop} onFavs={noop} onLogin={noop} onLogout={noop} onBookings={noop} />
)
ШапкаЗалогинен.storyName = 'Шапка · вошёл, есть избранное и бронь'

export const Избранное = () => {
  const [favs, setFavs] = useState([cars[0].id])
  const fav = { favs, toggleFav: (id) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [id, ...f])) }
  return (
    <Shell title="Избранное · клик переключает">
      <div style={{ display: 'flex', gap: 16 }}>
        <FavToggle id={cars[0].id} fav={fav} />
        <FavToggle id={cars[1].id} fav={fav} />
      </div>
    </Shell>
  )
}
