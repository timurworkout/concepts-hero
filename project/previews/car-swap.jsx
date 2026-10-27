import React,{useState} from 'react'
import {createRoot} from 'react-dom/client'
import {E2} from '../../src/App.jsx'
import '../../src/styles.css'
import './car-swap.css'
const initial={cityId:'sochi',locationId:'aer',mode:'days',dateFrom:'2026-11-12',dateTo:'2026-11-16',timeFrom:'12:00',timeTo:'12:00',start:'now',hours:4,planIds:['mountains'],companion:'',prefs:[],extraIds:[],address:'',returnMode:'same',returnId:''}
function Preview(){
  const [query,setQuery]=useState(initial),[key,setKey]=useState(0)
  const reset=()=>{setQuery({...initial});setKey(k=>k+1);window.scrollTo(0,0)}
  return <><div id="root"><header className="header header-dark"><button className="logo"><span className="logo-on">ON</span>MOVE</button></header><E2 key={key} query={query} setQuery={setQuery} fav={{favs:[],toggleFav:()=>{}}} onBack={()=>{}} onPick={()=>{}} openPicker={()=>{}}/></div><aside className="preview-tools"><span className="preview-name">Смена машины · около 3 с</span><span>Выбери машину в «Или глянь»</span><button onClick={reset}>Начать заново</button><span className="preview-status">Одобрено и внедрено</span></aside></>
}
createRoot(document.getElementById('preview-app')).render(<Preview/>)
