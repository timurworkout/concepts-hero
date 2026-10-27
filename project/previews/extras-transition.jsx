import React,{useLayoutEffect,useRef,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {E2,E3} from '../../src/App.jsx'
import '../../src/styles.css'
import './extras-transition.css'
const initial={cityId:'sochi',locationId:'aer',mode:'days',dateFrom:'2026-11-12',dateTo:'2026-11-16',timeFrom:'12:00',timeTo:'12:00',start:'now',hours:4,planIds:['mountains'],companion:'',prefs:[],extraIds:[],address:'',returnMode:'same',returnId:''}
function Preview(){
  const [query,setQuery]=useState(initial),[screen,setScreen]=useState('e2'),[carId,setCarId]=useState('tank-300'),[reduced,setReduced]=useState(false),[key,setKey]=useState(0)
  const outgoing=useRef(null), animation=useRef(null)
  const go=(next,id)=>{
    animation.current?.cancel()
    window.scrollTo({top:0,behavior:'instant'})
    const source=document.querySelector(next==='e3'?'#stage-e2 .pick-photo':'#stage-e3 .e3-photo')
    if(source){const rect=source.getBoundingClientRect();outgoing.current={rect,image:source.tagName==='IMG'?`url("${source.currentSrc||source.src}")`:getComputedStyle(source).backgroundImage}}
    if(id)setCarId(id)
    setScreen(next)
  }
  useLayoutEffect(()=>{
    const from=outgoing.current
    if(!from)return
    outgoing.current=null
    const target=document.querySelector(screen==='e3'?'#stage-e3 .e3-photo':'#stage-e2 .pick-photo')
    if(!target)return
    const to=target.getBoundingClientRect(),prev=target.style.visibility
    if(reduced||matchMedia('(prefers-reduced-motion: reduce)').matches){const fade=target.animate([{opacity:0},{opacity:1}],{duration:200});animation.current=fade;return ()=>fade.cancel()}
    if(!from.rect.width||!to.width)return
    const clone=document.createElement('div');clone.className='extras-flying';Object.assign(clone.style,{left:`${from.rect.left}px`,top:`${from.rect.top}px`,width:`${from.rect.width}px`,height:`${from.rect.height}px`,backgroundImage:from.image})
    document.body.appendChild(clone);target.style.visibility='hidden'
    const move=clone.animate([{transform:'translate(0,0) scale(1,1)'},{transform:`translate(${to.left-from.rect.left}px,${to.top-from.rect.top}px) scale(${to.width/from.rect.width},${to.height/from.rect.height})`}],{duration:screen==='e3'?550:350,easing:'cubic-bezier(.3,.7,.2,1)',fill:'forwards'})
    animation.current=move
    const cleanup=()=>{target.style.visibility=prev;clone.remove();if(animation.current===move)animation.current=null}
    move.finished.then(cleanup,cleanup)
    return ()=>{move.cancel();cleanup()}
  },[screen])
  const reset=()=>{animation.current?.cancel();outgoing.current=null;setQuery({...initial});setCarId('tank-300');setScreen('e2');setKey(k=>k+1);window.scrollTo(0,0)}
  const fav={favs:[],toggleFav:()=>{}}
  return <><div id="root"><header className="header header-dark"><button className="logo"><span className="logo-on">ON</span>MOVE</button></header>
    <div id="stage-e2" style={{display:screen==='e2'?'block':'none'}}><E2 key={key} query={query} setQuery={setQuery} fav={fav} onBack={()=>{}} onPick={id=>go('e3',id)} openPicker={()=>{}}/></div>
    {screen==='e3'&&<div id="stage-e3"><E3 key={carId} query={query} setQuery={setQuery} carId={carId} cameFrom="e2" fav={fav} onBack={()=>go('e2')} onPickOther={()=>go('e2')} openPicker={()=>{}} onBook={()=>{}}/></div>}
  </div><aside className="preview-tools"><span className="preview-name">Машина → допы</span><span>Нажми «Подобрать допы», затем вернись назад</span><button onClick={reset}>Начать заново</button><label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/> Меньше движения</label><span className="preview-status">Превью · не внедрено</span></aside></>
}
createRoot(document.getElementById('preview-app')).render(<Preview/>)
