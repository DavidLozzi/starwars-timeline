// Ordered theme list for the Star Wars pack. AppContext (src/AppContext.jsx,
// WU-12) reads this instead of importing ./themes/jedi + ./themes/sith
// directly, and ThemeSwitcher (src/organisms/ThemeSwitcher, WU-12) maps it
// for its buttons.
//
// Not importable until WU-5 relocates src/themes/{jedi,sith}.js and
// src/assets/{jedi,sith}.svg into this pack (./jedi, ./sith, ../assets/*.svg
// below) -- that is expected at this point in the plan, not a bug.
import jediTheme from './jedi';
import sithTheme from './sith';
import jediIcon from '../assets/jedi.svg';
import sithIcon from '../assets/sith.svg';

export default {
  defaultId: 'jedi',
  themes: [
    { id: 'jedi', label: 'Jedi', icon: jediIcon, theme: jediTheme },
    { id: 'sith', label: 'Sith', icon: sithIcon, theme: sithTheme },
  ],
};
