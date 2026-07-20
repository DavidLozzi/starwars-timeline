import { render, screen } from '@testing-library/react';
import App from './App';

// window.scrollTo is called by AppContext's scrollTo helper on mount; jsdom
// does not implement it and logs a "Not implemented" error without this.
beforeAll(() => {
  window.scrollTo = vi.fn();
});

test('renders the timeline heading', () => {
  render(<App />);
  expect(screen.getByText(/Ultimate Star Wars Timeline/i)).toBeInTheDocument();
});
