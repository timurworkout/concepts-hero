import { Directions, WhereYouAre, Promises, Faq } from './App.jsx'

/** Блоки лендинга — те же компоненты, что на сайте, в том же порядке. */
export default { title: 'Блоки/Лендинг' }

const noop = () => {}
const Page = ({ children }) => <div style={{ background: 'var(--canvas)', minHeight: '100vh' }}>{children}</div>

export const Направления = () => <Page><Directions onPick={noop} /></Page>
export const ГдеТы = () => <Page><WhereYouAre onPick={noop} /></Page>
ГдеТы.storyName = 'Машина там, где ты'
export const Обещания = () => <Page><Promises /></Page>
export const Вопросы = () => <Page><Faq /></Page>
