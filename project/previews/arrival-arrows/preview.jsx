import React from 'react'
import { createRoot } from 'react-dom/client'
import App from '../../../src/App.jsx'
import '../../../src/styles.css'
import './preview.css'

createRoot(document.getElementById('root')).render(<><nav className="arrival-preview-nav"><span>Превью стрелок Arrival</span><a href="#directions">Направления</a><a href="#delivery">Доставка</a></nav><App /></>)
