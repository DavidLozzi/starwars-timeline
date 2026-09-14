// Ordered theme list for the Marvel pack. AppContext (src/AppContext.jsx)
// reads this via the `@site/themes` alias, and ThemeSwitcher maps it for its
// buttons -- but Marvel ships exactly one theme, so ThemeSwitcher's own
// `themeList.themes.length < 2` guard renders it as `null`. The single entry
// is still written in the same shape a multi-theme pack would use, so
// nothing here is special-cased.
import mcuTheme from './mcu';
import mcuIcon from '../assets/mcu.svg';

export default {
  defaultId: 'mcu',
  themes: [
    { id: 'mcu', label: 'MCU', icon: mcuIcon, theme: mcuTheme },
  ],
};
