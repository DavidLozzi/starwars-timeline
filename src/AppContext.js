import React from 'react';
import { ThemeProvider } from 'styled-components';
import theme from './themes/aNewHope';

const appContext = React.createContext({ filters: {}, addFilter: () => { }, removeFilter: () => {}});

const AppProvider = ({ children }) => {
  const [filters, setFilters] = React.useState({});

  const addFilter = (filterName, value) => setFilters(f => ({ ...f, [filterName]: value }));
  const removeFilter = (filterName) => setFilters(f => delete f[filterName]);

  /* scroll to
    _year: the year object
    _character: the character object
  */
  const scrollTo = (_year, _character) => {
    let scrollToY = window.scrollY;
    if (_year) {
      scrollToY = (_year.yearIndex - 5) * theme.layout.elements.year.height * theme.layout.pxInRem + theme.layout.topMargin;
    }
    let scrollToX = window.scrollX;
    if (_character) {
      scrollToX = _character.index * 80;
    }
    window.scrollTo(scrollToX, scrollToY);
  };
  
  return (
    <appContext.Provider value={{ filters, addFilter, removeFilter, scrollTo }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </appContext.Provider>
  );
};

export const useAppContext = () => React.useContext(appContext);

export default AppProvider;