import React,{useState} from 'react'
import {createRoot} from 'react-dom/client'
import {E3,Final} from '../../src/App.jsx'
import '../../src/styles.css'
import './booking-confirmation.css'
const initial={cityId:'sochi',locationId:'aer',mode:'days',dateFrom:'2026-11-12',dateTo:'2026-11-16',timeFrom:'12:00',timeTo:'12:00',start:'now',hours:4,planIds:['mountains'],companion:'',prefs:[],extraIds:['child-seat'],address:'',returnMode:'same',returnId:''}
function Preview(){
  const [query,setQuery]=useState(initial),[screen,setScreen]=useState('e3'),[reduced,setReduced]=useState(false),[key,setKey]=useState(0)
  const reset=()=>{setQuery({...initial});setScreen('e3');setKey(k=>k+1);window.scrollTo(0,0)}
  const showFinal=()=>{window.scrollTo({top:0,behavior:'instant'});setScreen('final')}
  const fav={favs:[],toggleFav:()=>{}}
  const booking={id:'2026',carId:'tank-300',query,createdAt:Date.now(),cancelled:false}
  return <><div id="root"><header className="header header-dark"><button className="logo" onClick={reset}><span className="logo-on">ON</span>MOVE</button></header>
    {screen==='e3'?<E3 key={key} query={query} setQuery={setQuery} carId="tank-300" cameFrom="e2" fav={fav} onBack={reset} onPickOther={reset} openPicker={()=>{}} onBook={showFinal}/>:<div className={`confirmation-preview ${reduced?'is-reduced':''}`}><Final booking={booking} animate onHome={reset} onBookings={reset}/></div>}
  </div><aside className="preview-tools"><span className="preview-name">Подтверждение брони</span><span>Нажми «Забронировать», чтобы увидеть финал</span><button onClick={reset}>Начать заново</button><label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/> Меньше движения</label><span className="preview-status">Превью · без бронирования</span></aside></>
}
createRoot(document.getElementById('preview-app')).render(<Preview/>)
