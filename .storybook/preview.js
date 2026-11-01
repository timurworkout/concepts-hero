import '../public/fonts/fonts.css'
import '../src/styles.css'

/** Фон — White палитры «Север», как в приложении. */
export default {
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    options: {
      storySort: { order: ['Введение', 'Основы', 'Компоненты', 'Блоки', 'Экраны'] },
    },
    viewport: {
      options: {
        mobile: { name: 'Мобильный 375', styles: { width: '375px', height: '812px' } },
        tablet: { name: 'Планшет 768', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Десктоп 1440', styles: { width: '1440px', height: '900px' } },
      },
    },
    backgrounds: {
      options: {
        paper: { name: 'White', value: '#f9f6f6' },
        ink: { name: 'Lazur', value: '#001f26' },
      },
    },
  },
  initialGlobals: { backgrounds: { value: 'paper' } },
}
