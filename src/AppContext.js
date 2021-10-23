import React from 'react';
import { ThemeProvider } from 'styled-components';
import theme from './themes/aNewHope';

const appContext = React.createContext({ filters: {}, addFilter: () => { }, removeFilter: () => {}});

const AppProvider = ({ children }) => {
  const [filters, setFilters] = React.useState({});

  const addFilter = (filterName, value) => setFilters(f => ({ ...f, [filterName]: value }));
  const removeFilter = (filterName) => setFilters(f => delete f[filterName]);

  return (
    <appContext.Provider value={{ filters, addFilter, removeFilter }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </appContext.Provider>
  );
};

export const useAppContext = () => React.useContext(appContext);

export default AppProvider;