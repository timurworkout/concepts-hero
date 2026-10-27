import '../public/fonts/fonts.css'
import '../src/styles.css'

/** Фон — бумага «Табло», как в приложении. */
export default {
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      options: {
        paper: { name: 'Бумага', value: '#f2efe8' },
        ink: { name: 'Чернила', value: '#15181c' },
      },
    },
  },
  initialGlobals: { backgrounds: { value: 'paper' } },
}
