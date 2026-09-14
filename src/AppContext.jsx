import React from 'react';
import { ThemeProvider } from 'styled-components';
import analytics, { ACTIONS } from './analytics';
import themeList from '@site/themes';
import { getKeyCount } from './utils';

const appContext = React.createContext({ filters: {}, addFilter: () => { }, removeFilter: () => { } });

const findTheme = (id) => themeList.themes.find(t => t.id === id) || themeList.themes.find(t => t.id === themeList.defaultId);

const AppProvider = ({ children }) => {
  const [filters, setFilters] = React.useState({});
  const [filterCount, setFilterCount] = React.useState(0);
  const [selectedTheme, setSelectedTheme] = React.useState(findTheme(themeList.defaultId).theme);
  const [scale, setScale] = React.useState(1.0);
  // not a `filters` entry: it re-evaluates against the scrolled-to year, not once on apply
  const [hideDeceased, setHideDeceased] = React.useState(false);

  const addFilter = (filterName, value) => {
    const _filters = { ...filters, [filterName]: value };
    setFilters(_filters);
    setFilterCount(getKeyCount(_filters));
  };
  const removeFilter = (filterName) => {
    delete filters[filterName];
    setFilters(filters);
    setFilterCount(getKeyCount(filters));
  };

  /* scroll to
    _year: the year object
    _character: the character object
  */
  const scrollTo = (_year, _character) => {
    let scrollToY = window.scrollY;
    if (_year) {
      scrollToY = (_year.yearIndex - 5) * selectedTheme.layout.elements.year.height * selectedTheme.layout.pxInRem + selectedTheme.layout.topMargin;
    }
    let scrollToX = window.scrollX;
    if (_character) {
      scrollToX = _character.index * 80;
    }
    console.log(`scrolling to ${scrollToX}, ${scrollToY} for year:${_year ? `${_year.year} (${_year.yearIndex})` : ''} character:${_character ? `${_character.title} (${_character.index})` : ''}, current window position: ${window.scrollX}, ${window.scrollY}`);
    window.scrollTo(scrollToX, scrollToY);
  };

  const setTheme = (themeId) => {
    setSelectedTheme(findTheme(themeId).theme);
    analytics.event(ACTIONS.THEME, '', themeId);
  };


  return (
    <appContext.Provider value={{ filters, filterCount, addFilter, removeFilter, scrollTo, setTheme, hideDeceased, setHideDeceased, scale: { scale, setScale } }}>
      <ThemeProvider theme={selectedTheme}>
        {children}
      </ThemeProvider>
    </appContext.Provider>
  );
};

export const useAppContext = () => React.useContext(appContext);

export default AppProvider;