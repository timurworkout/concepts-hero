/** Минимальный Storybook: только react-vite, без аддонов — расширим потом. */
export default {
  stories: ['../src/**/*.stories.jsx'],
  framework: { name: '@storybook/react-vite', options: {} },
  // Локально Storybook живёт в корне, на Pages — в /concepts-hero/storybook/.
  // Без своего base шрифты и ассеты не находятся: у приложения base другой.
  viteFinal: (config) => ({ ...config, base: process.env.SB_BASE || '/' }),
}
