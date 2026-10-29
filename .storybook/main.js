/** Storybook: react-vite + доки (Autodocs, MDX) и a11y-панель. */
export default {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.jsx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  // Локально Storybook живёт в корне, на Pages — в /concepts-hero/storybook/.
  // Без своего base шрифты и ассеты не находятся: у приложения base другой.
  viteFinal: (config) => ({ ...config, base: process.env.SB_BASE || '/' }),
}
