import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './pages/Home';
import GlobalStyles from './globalStyles';
import AppProvider from './AppContext';

function App() {
  return (
    <AppProvider>
      <GlobalStyles />
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/character/:character" component={Home} />
        </Switch>
      </Router>
    </AppProvider>
  );
}

export default App;
