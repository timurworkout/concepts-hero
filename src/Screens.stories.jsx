import App from './App.jsx'

/** Настоящее приложение: актуальные экраны и переходы без копирования разметки. */
export default { id: 'on-move-screens', title: 'Табло/Экраны' }

export const Mobile = () => (
  <iframe title="ON MOVE — экран 390 px"
    src={`${window.location.pathname}?id=on-move-screens--full-flow&viewMode=story`}
    style={{ display: 'block', width: 390, maxWidth: '100%', height: 844, border: 0, margin: '0 auto' }} />
)
Mobile.storyName = 'Мобильный · 390 px'
export const FullFlow = () => <App />
FullFlow.storyName = 'Лендинг → подбор → допы → бронь'
