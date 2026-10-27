import React, {useEffect, useRef, useState} from 'react'
import {createRoot} from 'react-dom/client'
import {createPortal} from 'react-dom'
import {E2} from '../../src/App.jsx'
import {selectCars} from '../../src/fleet.js'
import {cars, carDetails, inCity, plans, companions, prefOptions} from '../../src/data.js'
import '../../src/styles.css'
import './picking-motion.css'

const initial={cityId:'sochi',locationId:'aer',mode:'days',dateFrom:'2026-11-12',dateTo:'2026-11-16',timeFrom:'12:00',timeTo:'12:00',start:'now',hours:4,planIds:['mountains'],companion:'',prefs:[],extraIds:[],address:'',returnMode:'same',returnId:''}
function Scene({query,onDone,reduced}) {
  const eligible=c=>c.stock!==0 && !carDetails[c.id].unavailableAt.includes(query.locationId) && inCity(c,query.cityId)
  const pool=cars.filter(eligible), result=selectCars(query,plans,prefOptions,companions,eligible)
  const winner=result.car, top=winner?[winner,...result.fit.filter(c=>c.id!==winner.id)].slice(0,9):[]
  const [stage,setStage]=useState(0), [fly,setFly]=useState(false), tiles=useRef({})
  // Подписи повторяют реальные критерии выбранной цели и данные найденной машины.
  const caps = result.goal?.id === 'mountains' ? [
    ['Едешь в горы', 'Смотрим, что есть в Сочи'],
    ['Для гор нужен полный привод', 'Проверяем, у каких машин он есть'],
    ['Сверяем клиренс', `От 180 мм — подойдут ${result.count} из ${pool.length} машин`],
    [winner ? 'Нашли. Вот она' : 'Подходящих машин не нашлось', winner ? `${winner.model} · полный привод · клиренс ${winner.clearance} мм` : 'Попробуй изменить параметры поездки'],
  ] : [
    ['Смотрим машины для поездки', `Доступно ${pool.length} вариантов`],
    [result.goal?.label || 'Учитываем твои планы', result.goal?.hint || 'Смотрим подходящие характеристики'],
    ['Сверяем характеристики', `Подходят ${result.count} из ${pool.length} машин`],
    [winner ? 'Нашли. Вот она' : 'Подходящих машин не нашлось', winner?.model || 'Попробуй изменить параметры поездки'],
  ]
  useEffect(()=>{
    const W=innerWidth,H=innerHeight,cols=W<744?6:10, rows=Math.max(1,Math.ceil(pool.length/cols)),gap=W<744?4:8
    const rect=document.querySelector('.pick-photo')?.getBoundingClientRect(), ratio=rect?rect.width/rect.height:1.5
    const tw=Math.min((W*.9-gap*(cols-1))/cols,((H*.60-gap*(rows-1))/rows)*ratio),th=tw/ratio, ox=(W-(cols*tw+(cols-1)*gap))/2
    const place=(el,x,y,k=1)=>{if(el)el.style.transform=`translate(${x}px,${y}px) scale(${k})`}
    pool.forEach((c,i)=>{let el=tiles.current[c.id];el.style.width=tw+'px';el.style.height=th+'px';place(el,ox+(i%cols)*(tw+gap),(W<744?H*.34:H*.31)+Math.floor(i/cols)*(th+gap))})
    const timers=[]; const later=(fn,ms)=>timers.push(setTimeout(fn,ms)); const key=e=>{if(e.key==='Escape')onDone()}; addEventListener('keydown',key)
    if(reduced || matchMedia('(prefers-reduced-motion: reduce)').matches){later(onDone,200)}
    else if(!winner){later(()=>setStage(3),700);later(onDone,1800)}
    else {
      later(()=>{setStage(1);pool.filter(c=>!top.some(t=>t.id===c.id)).forEach((c,i)=>{let el=tiles.current[c.id];el.style.transitionDelay=(i%8)*60+'ms';el.classList.add('gone')})},1100)
      later(()=>{setStage(2);let n=Math.min(3,top.length),k=Math.min(W*.8/(n*tw),H*.6/(3*th))/1.04,g=10,cw=tw*k,ch=th*k,x=(W-(n*cw+(n-1)*g))/2;top.forEach((c,i)=>place(tiles.current[c.id],x+(i%n)*(cw+g),(W<744?H*.35:H*.31)+Math.floor(i/n)*(ch+g),k))},2400)
      later(()=>{setStage(3);top.forEach(c=>tiles.current[c.id]?.classList.add(c.id===winner.id?'win':'dim'))},3500)
      later(()=>{setFly(true);let el=tiles.current[winner.id],target=document.querySelector('.pick-photo')?.getBoundingClientRect();top.filter(c=>c.id!==winner.id).forEach(c=>tiles.current[c.id]?.classList.add('gone'));if(el&&target)place(el,target.left,target.top,target.width/tw)},4400)
      later(onDone,5300)
    }
    return ()=>{timers.forEach(clearTimeout);removeEventListener('keydown',key)}
  },[])
  return createPortal(<div className={`pickgrid preview-picking ${fly?'fly':''}`} role="status" aria-live="polite" onClick={onDone}><div className="pickgrid-bg"/><div className="pickgrid-head"><strong>{stage<2?pool.length:stage===3?winner?1:0:result.count}</strong><div className="picking-caption" key={stage}><span>{caps[stage][0]}</span><small>{caps[stage][1]}</small></div></div>{pool.map(c=><div key={c.id} ref={el=>{tiles.current[c.id]=el}} className="pickgrid-tile photo-car" style={{backgroundImage:`url(${import.meta.env.BASE_URL}${c.id===winner?.id?c.heroImage:c.image})`}}/>)}<button className="pickgrid-skip" onClick={e=>{e.stopPropagation();onDone()}}>Пропустить <small>Esc</small></button></div>,document.body)
}
function Preview(){const [query,setQuery]=useState(initial),[show,setShow]=useState(false),[reduced,setReduced]=useState(false);const done=()=>setShow(false);return <><div id="root"><header className="header header-dark"><button className="logo"><span className="logo-on">ON</span>MOVE</button></header><E2 query={query} setQuery={setQuery} fav={{favs:[],toggleFav:()=>{}}} onBack={()=>{}} onPick={()=>{}} openPicker={()=>{}}/></div>{show&&<Scene query={query} reduced={reduced} onDone={done}/>}<aside className="preview-tools"><span className="preview-name">Подбор · около 5 с</span><span>Пример: Сочи, в горы</span><button onClick={()=>{window.scrollTo(0,0);setShow(true)}}>Посмотреть подбор</button><label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/> Меньше движения</label><span className="preview-status">Превью · не внедрено</span></aside></>}
createRoot(document.getElementById('preview-app')).render(<Preview/>)
