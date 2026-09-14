import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './pages/Home';
import GlobalStyles from './globalStyles';
import AppProvider from './AppContext';
import AdBanner from './organisms/AdBanner';
import site from './site';

// Lazy: this pulls in the Star Wars-only demo content (timelineData.js,
// MovieEvent.jsx, CharacterPod.jsx) that a pack with the feature gated off
// should not have to ship in its main bundle.
const HyperspaceTimeline = React.lazy(() => import('./pages/HyperspaceTimeline'));

function App() {
  return (
    <AppProvider>
      <GlobalStyles />
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/character/:character" component={Home} />
          {site.features.hyperspace &&
            <Route exact path="/hyperspace" render={() => (
              <React.Suspense fallback={null}>
                <HyperspaceTimeline />
              </React.Suspense>
            )} />
          }
        </Switch>
      </Router>
      <AdBanner />
    </AppProvider>
  );
}

export default App;
