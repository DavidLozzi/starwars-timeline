import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './pages/Home';
import HyperspaceTimeline from './pages/HyperspaceTimeline';
import GlobalStyles from './globalStyles';
import AppProvider from './AppContext';
import AdBanner from './organisms/AdBanner';

function App() {
  return (
    <AppProvider>
      <GlobalStyles />
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/character/:character" component={Home} />
          <Route exact path="/hyperspace" component={HyperspaceTimeline} />
        </Switch>
      </Router>
      <AdBanner />
    </AppProvider>
  );
}

export default App;
