import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming/create'

/** Оболочка Storybook в палитре «Север»: значения повторяют :root из src/styles.css. */
addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: '<span style="font: 700 20px Manrope, sans-serif; color: #001f26"><span style="color: #d9532b">on</span> move</span>',
    brandUrl: '/',
    brandTarget: '_self',
    fontBase: "Manrope, 'Golos Text', system-ui, sans-serif",
    colorPrimary: '#001f26',
    colorSecondary: '#001f26',
    appBg: '#f9f6f6',
    appContentBg: '#ffffff',
    appPreviewBg: '#f9f6f6',
    appBorderColor: '#d3dadb',
    appBorderRadius: 12,
    textColor: '#001f26',
    textMutedColor: '#4a5d62',
    barBg: '#ffffff',
    barTextColor: '#4a5d62',
    barSelectedColor: '#001f26',
    barHoverColor: '#001f26',
    inputBg: '#ffffff',
    inputBorder: '#d3dadb',
    inputTextColor: '#001f26',
    inputBorderRadius: 12,
  }),
})
