import { useState } from 'react'
import { ActionIcon, Header, FavToggle } from './App.jsx'
import { cars } from './data.js'

/** Базовые компоненты: кнопки, выбор, шапка, избранное. Рендерят настоящие классы и компоненты приложения. */
export default { title: 'Компоненты/Базовые' }

const Shell = ({ title, children }) => (
  <div style={{ background: 'var(--paper)', color: 'var(--ink)', padding: 32, minHeight: '100vh' }}>
    {children}
  </div>
)

// Ряд образцов с подписью размера: одна строка — один вид контрола
const Row = ({ label, children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--line)' }}>
    <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)' }}>{label}</span>
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
  </div>
)

export const Кнопки = () => (
  <Shell title="Кнопки">
    <Row label="Главная L 56 · .btn-accent — главное действие экрана">
      <button type="button" className="btn-primary btn-accent">Подобрать машину</button>
      <button type="button" className="btn-primary btn-accent btn-with-icon">Добавить <ActionIcon kind="add" /></button>
      <button type="button" className="btn-primary btn-accent" disabled>Подобрать машину</button>
    </Row>
    <Row label="Главная M 48 — действие в модалке и шаге визарда">
      <button type="button" className="btn-primary">Готово</button>
      <button type="button" className="btn-primary" disabled>Готово</button>
    </Row>
    <Row label="Вторичная M 48">
      <button type="button" className="btn-secondary">Выбрать другую</button>
    </Row>
    <Row label="S 36 · .btn-sm — в строках списков">
      <button type="button" className="btn-primary btn-sm">Где машина</button>
      <button type="button" className="btn-secondary btn-sm">Повторить поездку</button>
    </Row>
    <Row label="Иконка-кнопка 40">
      <button type="button" className="icon-btn" aria-label="Закрыть">×</button>
    </Row>
  </Shell>
)

export const Выбор = () => {
  const [on, setOn] = useState(['sea'])
  const toggle = (id) => setOn((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))
  return (
    <Shell title="Выбор · клик переключает">
      <Row label="Чип — цели и попутчики в визарде">
        <div className="chips">
          {[['sea', 'Море'], ['mountains', 'Горы'], ['city', 'Город']].map(([id, label]) => (
            <button key={id} type="button" className={`chip ${on.includes(id) ? 'active' : ''}`} onClick={() => toggle(id)}>{label}</button>
          ))}
        </div>
      </Row>
      <Row label="Фильтр — переключатели на подборе">
        <button type="button" className="filter">Автомат</button>
        <button type="button" className="filter active">Полный привод</button>
      </Row>
      <Row label="Бейдж — метка на фото">
        <span className="badge">Хит в Сочи</span>
      </Row>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--body)', maxWidth: 520, marginTop: 16 }}>
        Все контролы на --r-ctl 12. Выбранное — лазурью, второго акцента нет.
      </p>
    </Shell>
  )
}

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
