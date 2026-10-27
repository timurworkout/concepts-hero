import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Wizard } from '../../src/App.jsx'
import '../../src/styles.css'
import './wizard-motion.css'

const initial = {cityId:'',locationId:'',mode:'days',dateFrom:'',dateTo:'',timeFrom:'12:00',timeTo:'12:00',start:'now',hours:4,planIds:[],companion:'',prefs:[],extraIds:[],address:'',returnMode:'same',returnId:''}
function Preview() {
  const [query,setQuery]=useState(initial), [step,setStep]=useState(null), [placeType,setPlaceType]=useState(null), [reduced,setReduced]=useState(false)
  const previous=useRef(null), animations=useRef([])
  useEffect(()=>{
    animations.current.forEach(a=>a.cancel()); animations.current=[]
    const from=previous.current; previous.current=step
    const reducedNow=reduced || matchMedia('(prefers-reduced-motion: reduce)').matches
    if(from && from!==step) {
      const segment=document.querySelector(`.wz-seg[data-seg="${from}"]`)
      if(segment && !reducedNow) animations.current.push(segment.animate([{backgroundColor:'var(--surface-strong)'},{backgroundColor:'transparent'}],{duration:260,easing:'ease-out'}))
    }
    if(step && from!==step){
      const panel=document.querySelector('.wz-panel, .sheet')
      if(panel) animations.current.push(panel.animate([{opacity:0},{opacity:1}],{duration:reducedNow?150:220,easing:'ease-out'}))
    }
    return ()=>{animations.current.forEach(a=>a.cancel());animations.current=[]}
  },[step,reduced])
  const reset=()=>{setStep(null);setPlaceType(null);setQuery({...initial})}
  return <><div id="root"><header className="header header-dark"><button className="logo" onClick={reset}><span className="logo-on">ON</span>MOVE</button><nav className="header-nav">Машина под твою поездку</nav></header><main className="landing"><section className="hero"><div className="hero-inner"><h1 className="hero-title"><span className="hero-title-line">Скажи,</span><span className="hero-title-line">куда <em>едешь</em></span></h1><p className="hero-sub">Одна машина под твою поездку. С объяснением, почему она.</p><div className="hero-kicker"><b>Подбор, не каталог</b><span>Машину подберём сами — без 50 вкладок и сравнений.</span></div><Wizard query={query} setQuery={setQuery} step={step} setStep={setStep} placeType={placeType} setPlaceType={setPlaceType} onSubmit={()=>setStep(null)} /></div></section></main></div><aside className="preview-tools" aria-label="Управление превью"><span className="preview-name">Визард · переходы шагов</span><span>Выбери место и даты, чтобы увидеть переходы</span><button onClick={reset}>Начать заново</button><label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/> Меньше движения</label><span className="preview-status">Превью · не внедрено</span></aside></>
}
createRoot(document.getElementById('preview-app')).render(<Preview/>)
