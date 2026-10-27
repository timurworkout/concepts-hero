import React, { useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Wizard } from '../../src/App.jsx'
import EntryIntroPreview from './entry-intro-scene.jsx'
import '../../src/styles.css'
import './entry-intro.css'

const initialQuery = {cityId:'',locationId:'',mode:'days',dateFrom:'',dateTo:'',timeFrom:'12:00',timeTo:'12:00',start:'now',hours:4,planIds:[],companion:'',prefs:[],extraIds:[],address:'',returnMode:'same',returnId:''}
function Preview() {
  const [query,setQuery]=useState(initialQuery)
  const [step,setStep]=useState(null)
  const [placeType,setPlaceType]=useState(null)
  const [scene,setScene]=useState(null)
  const [reduced,setReduced]=useState(false)
  const [hold,setHold]=useState(false)
  const finish=useCallback(()=>setScene(null),[])
  const play=()=>{setStep(null);setScene(Date.now())}
  return <>
    <div id="root">
      <header className="header header-dark">
        <button className="logo" aria-label="ON MOVE"><span className="logo-on">ON</span>MOVE</button>
        <nav className="header-nav" aria-label="Навигация"><span>Машина под твою поездку</span></nav>
      </header>
      <main className="landing"><section className="hero"><div className="hero-inner">
        <h1 className="hero-title"><span className="hero-title-line">Скажи,</span><span className="hero-title-line">куда <em>едешь</em></span></h1>
        <p className="hero-sub">Одна машина под твою поездку. С объяснением, почему она.</p>
        <div className="hero-kicker"><b>Подбор, не каталог</b><span>Машину подберём сами — без 50 вкладок и сравнений.</span></div>
        <Wizard query={query} setQuery={setQuery} step={step} setStep={setStep} placeType={placeType} setPlaceType={setPlaceType} onSubmit={()=>setStep(null)}/>
      </div></section></main>
    </div>
    {scene && <EntryIntroPreview key={scene} full onDone={finish} reduced={reduced} hold={hold}/>}
    <aside className="preview-tools" aria-label="Управление превью">
      <span className="preview-name">Входная заставка · 5 с</span>
      <button onClick={play}>Смотреть ещё раз</button>
      <button onClick={finish} disabled={!scene}>Пропустить</button>
      <label><input type="checkbox" checked={reduced} onChange={e=>{setReduced(e.target.checked);setScene(null)}}/> Меньше движения</label>
      <label><input type="checkbox" checked={hold} onChange={e=>{setHold(e.target.checked);setScene(null)}}/> Задержать кадр сетки</label>
      <span className="preview-status" role="status">{scene?'Просмотр':'Превью · не внедрено'}</span>
    </aside>
  </>
}
// На узком экране открываем этот же файл: настоящий визард переключится на шторки.
createRoot(document.getElementById('preview-app')).render(<Preview/>)
