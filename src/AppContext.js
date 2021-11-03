import React from 'react';
import { ThemeProvider } from 'styled-components';
import analytics, { ACTIONS } from './analytics';
import jediTheme from './themes/jedi';
import sithTheme from './themes/sith';
import { getKeyCount } from './utils';

const appContext = React.createContext({ filters: {}, addFilter: () => { }, removeFilter: () => {}});

const AppProvider = ({ children }) => {
  const [filters, setFilters] = React.useState({});
  const [filterCount, setFilterCount] = React.useState(0);
  const [selectedTheme, setSelectedTheme] = React.useState(jediTheme);

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
    window.scrollTo(scrollToX, scrollToY);
  };
  
  const setTheme = (themeName) => {
    switch (themeName) {
    case 'sith':
      setSelectedTheme(sithTheme);
      break;
    default:
      setSelectedTheme(jediTheme);
      break;
    }
    analytics.event(ACTIONS.THEME, '', themeName);
  };
  return (
    <appContext.Provider value={{ filters, filterCount, addFilter, removeFilter, scrollTo, setTheme }}>
      <ThemeProvider theme={selectedTheme}>
        {children}
      </ThemeProvider>
    </appContext.Provider>
  );
};

export const useAppContext = () => React.useContext(appContext);

export default AppProvider;