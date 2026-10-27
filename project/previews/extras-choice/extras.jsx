import React, {useState} from 'react'
import {createRoot} from 'react-dom/client'
import {cars, extras, plans, carDetails, rub, rentTerms, locations} from '../../../src/data.js'

const car = cars.find(c => c.id === 'tank-300')
const goal = plans.find(p => p.id === 'sochi-ski')
const location = locations.find(l => l.id === 'aer')
const suggested = goal.extraIds
const days = 4
const cost = x => x.price * (x.per === 'day' ? days : 1)
const price = x => x.price === 0 ? 'Бесплатно' : `${rub(x.price)} ${x.per === 'day' ? '/ сутки' : 'за поездку'}`
const img = src => `${import.meta.env.BASE_URL}${src}`
function Logo(){return <a href="./index.html" className="logo" aria-label="ON MOVE — варианты"><span>ON<i/></span> MOVE</a>}
function Chevron(){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>}
function App(){
 const variant=document.body.dataset.variant
 const [selected,setSelected]=useState([...suggested])
 const [more,setMore]=useState(false)
 const [breakdown,setBreakdown]=useState(false)
 const [notice,setNotice]=useState('')
 const [mobileSummary,setMobileSummary]=useState(false)
 const selectedExtras=extras.filter(x=>selected.includes(x.id))
 const total=car.pricePerDay*days+selectedExtras.reduce((sum,x)=>sum+cost(x),0)
 const toggle=id=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id])
 const suggestedExtras=extras.filter(x=>suggested.includes(x.id))
 const others=extras.filter(x=>!suggested.includes(x.id))
 const showNotice=message=>setNotice(message)
 const context=<div className="context-tiles">
   <button className="context-tile car-tile" onClick={()=>showNotice('В основном сценарии отсюда вернёмся к выбору машины. Выбранные допы сохранятся.')}><img src={img(car.heroImage)} alt=""/><span><small>Твоя машина</small><b>{car.model}</b></span><Chevron/></button>
   <button className="context-tile" onClick={()=>showNotice('Здесь можно изменить цель поездки в основном сценарии.')}><span className="tile-icon">↗</span><span><small>Цель поездки</small><b>Горнолыжка в Красной Поляне</b></span><Chevron/></button>
   <button className="context-tile" onClick={()=>showNotice('Место и даты редактируются в основном сценарии.')}><span className="tile-icon">⌁</span><span><small>Где и когда</small><b>Аэропорт Сочи · 12–16 ноября</b></span><Chevron/></button>
  </div>
 const summary=<div className="summary"><div className="summary-title"><span>За поездку · {days} суток</span><strong>{rub(total)}</strong></div><button className="summary-toggle" onClick={()=>setBreakdown(!breakdown)} aria-expanded={breakdown}>{breakdown?'Скрыть расчёт':'Показать расчёт'} <span>{breakdown?'−':'+'}</span></button>{breakdown && <dl><div><dt>Машина, 4 суток</dt><dd>{rub(car.pricePerDay*days)}</dd></div>{selectedExtras.map(x=><div key={x.id}><dt>{x.name}</dt><dd>{rub(cost(x))}</dd></div>)}<div><dt>Подача и возврат</dt><dd>включено</dd></div><div><dt>Залог, вернём после поездки</dt><dd>{rub(carDetails[car.id].deposit)}</dd></div></dl>}<button className="primary" onClick={()=>showNotice('Это превью. Бронирование откроется в основном сценарии.')}>Забронировать <Chevron/></button><small>Бесплатная отмена за 48 ч</small></div>
 const extraRow=(x,style='row')=><label className={`extra ${style} ${selected.includes(x.id)?'on':''}`} key={x.id}><span className="extra-copy"><b>{x.name}</b>{x.note && <small>{x.note}</small>}<span>{price(x)}</span></span><input type="checkbox" role="switch" checked={selected.includes(x.id)} onChange={()=>toggle(x.id)} aria-label={`${x.name}, ${price(x)}`}/></label>
 return <><header className="site-header"><Logo/><span>Подбор для поездки</span><a href="./index.html">Все варианты</a></header><main className={`page ${variant}`}><a href="../car-selection/index.html" className="back">← Сменить машину</a>
 <div className="mobile-context">{context}</div>
 <div className="layout"><div className="content">
 {variant==='list' && <><div className="intro"><h1>Что возьмём<br/>в поездку?</h1><p>Подобрали допы под твои планы. Оставь только то, что пригодится.</p></div><section className="featured"><div className="section-top"><div><h2>Для горнолыжки</h2><p>По твоему плану: Красная Поляна</p></div><span className="tag">{suggestedExtras.filter(x=>selected.includes(x.id)).length} из {suggestedExtras.length} выбрано</span></div><div className="extra-list">{suggestedExtras.map(x=>extraRow(x))}</div></section><section className="more-section"><h2>Ещё может пригодиться</h2><div className="extra-list">{others.map(x=>extraRow(x))}</div></section></>}
 {variant==='route' && <><div className="intro"><h1>Соберёмся<br/>в горы</h1><p>Машина подобрана. Теперь добавим всё, что сделает поездку удобнее.</p></div><div className="route-heading"><div><span>ТВОЙ ПЛАН</span><h2>Горнолыжка<br/>в Красной Поляне</h2></div><p>Бокс и лыжи для горнолыжки. Выбери, что понадобится.</p></div><section className="route-extras"><div className="extra-list">{suggestedExtras.map(x=>extraRow(x))}</div></section><section className="more-section"><div className="section-top"><div><h2>Допы для дороги</h2><p>Выбирай, что понадобится именно тебе</p></div></div><div className="extra-list">{others.map(x=>extraRow(x))}</div></section></>}
 {variant==='kit' && <><div className="intro"><h1>Всё для поездки<br/>в горы</h1><p>Собрали под твою горнолыжку. Можно поменять каждую деталь.</p></div><section className="kit-panel"><div className="kit-heading"><div><h2>Собрали для тебя</h2><p>Красная Поляна · на 4 суток</p></div><span className="kit-count">{suggestedExtras.filter(x=>selected.includes(x.id)).length} из {suggestedExtras.length} выбрано</span></div><div className="kit-grid">{suggestedExtras.map(x=>extraRow(x,'kit-card'))}</div></section><section className="more-section"><div className="section-top"><div><h2>Дополнить поездку</h2><p>Другие допы к машине и поездке</p></div><button className="text-button" onClick={()=>setMore(!more)} aria-expanded={more}>{more?'Свернуть':'Посмотреть все'} {more?'−':'+'}</button></div>{more && <div className="extra-list">{others.map(x=>extraRow(x))}</div>}</section></>}
 <section className="terms"><h2>Как всё устроено</h2><details><summary>Как заберёшь машину</summary><p>{location.name}: {location.meet}. Встречает сотрудник — около 10 минут.</p></details><details><summary>Возврат и залог</summary><p>{rentTerms.fuel}. Залог {rub(carDetails[car.id].deposit)} — блокировка на карте до возврата машины.</p></details><details><summary>Условия поездки</summary><p>{rentTerms.mileage}. Водитель: {rentTerms.driver}. {rentTerms.insurance}</p></details></section>
 </div><aside className="aside">{context}{summary}</aside></div>
 </main><div className="mobile-bar"><button className="mobile-total" onClick={()=>{setBreakdown(true);setMobileSummary(true)}}><b>{rub(total)}</b><small>за {days} суток · расчёт</small></button><button onClick={()=>showNotice('Это превью. Бронирование откроется в основном сценарии.')}>Забронировать</button></div>
 {mobileSummary && <div className="overlay" onClick={()=>setMobileSummary(false)}><div className="dialog mobile-summary-dialog" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><button className="dialog-close" onClick={()=>setMobileSummary(false)}>Закрыть</button>{summary}</div></div>}
 {notice && <div className="overlay" onClick={()=>setNotice('')}><div className="dialog" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><p>{notice}</p><button onClick={()=>setNotice('')}>Понятно</button></div></div>}</>
}
createRoot(document.getElementById('root')).render(<App/>)
