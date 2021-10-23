import React from 'react';
import Home from './pages/Home';
import GlobalStyles from './globalStyles';
import AppProvider from './AppContext';

function App() {
  return (
    <AppProvider>
      <GlobalStyles />
      <Home />
    </AppProvider>
  );
}

export default App;
