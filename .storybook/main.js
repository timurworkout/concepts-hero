/** Минимальный Storybook: только react-vite, без аддонов — расширим потом. */
export default {
  stories: ['../src/**/*.stories.jsx'],
  framework: { name: '@storybook/react-vite', options: {} },
  // В приложении base = '/concepts-hero/', Storybook живёт в корне — иначе шрифты не найдутся
  viteFinal: (config) => ({ ...config, base: '/' }),
}
