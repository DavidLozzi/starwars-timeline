import { ThemeProvider } from 'styled-components';
import Home from './pages/Home';
import theme from './themes/anewHope';
import GlobalStyles from './globalStyles';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Home />
    </ThemeProvider>
  );
}

export default App;
