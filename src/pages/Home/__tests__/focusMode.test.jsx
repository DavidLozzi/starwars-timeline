import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../../App';

// window.scrollTo is called both by AppContext's scrollTo helper (on mount)
// and by Home's enterFocus (see the "Character focus mode" plan) -- jsdom
// does not implement it and logs a "Not implemented" error without this.
beforeAll(() => {
  window.scrollTo = vi.fn();
});

beforeEach(() => {
  window.scrollTo.mockClear();
  // Keep the onboarding overlay out of the way.
  localStorage.setItem('starwars_timeline_onboarding_dismissed', JSON.stringify({ hasSeenGuide: true }));
  window.history.pushState({}, '', '/character/Luke%20Skywalker?year=0');
});

// jsdom has no window.visualViewport, so Home's isCharacterInView short-circuits
// to "in view" for every character -- every pill/column renders.
const findPill = (nameSubstring) => screen.getAllByTestId('characterdetail')
  .find((el) => el.textContent.includes(nameSubstring));

const findLukePill = () => findPill('Luke Skywalker');

// The outer scaled <div> in Home that owns the background-click handler --
// located via a sibling "year" testid rather than its inline transform style,
// so this does not depend on styled-components' (disabled) CSS.
const getScaledContainer = () => screen.getAllByTestId('year')[0].parentElement;

describe('Home focus mode', () => {
  it('clicking a pill enters focus mode: panel, scroll, dimming, event dots', () => {
    render(<App />);

    const lukePill = findLukePill();
    expect(lukePill).toBeTruthy();
    fireEvent.click(lukePill);

    const panel = screen.getByTestId('focus-panel');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute('aria-label', 'Luke Skywalker');

    // window.scrollTo was called with the object form (enterFocus), not just
    // the two-arg form AppContext's scrollTo uses on mount.
    const objectCall = window.scrollTo.mock.calls.find(
      (args) => typeof args[0] === 'object' && args[0] !== null
    );
    expect(objectCall).toBeTruthy();
    expect(typeof objectCall[0].left).toBe('number');

    const allColumns = document.querySelectorAll('[data-testid="character"]');
    const dimmedColumns = document.querySelectorAll('[data-testid="character"][data-dimmed="true"]');
    expect(dimmedColumns.length).toBeGreaterThan(0);
    // Every character but the focused one (Luke) is dimmed. The pill's
    // container is a CharacterColumn too (same testid), so Luke contributes
    // two undimmed elements: his line and his expanded pill.
    expect(allColumns.length - dimmedColumns.length).toBe(2);
    // Luke's own line is focus-keep, so clicking it doesn't exit.
    expect(document.querySelectorAll('[data-testid="character"][data-focus-keep="true"]')).toHaveLength(1);
    // The expanded pill is the dialog, inside Luke's own (still-rendered) pill.
    expect(findLukePill()).toContainElement(panel);

    expect(screen.getAllByTestId('focus-event-dot').length).toBeGreaterThan(0);
  });

  it('Escape exits focus mode', () => {
    render(<App />);
    fireEvent.click(findLukePill());
    expect(screen.getByTestId('focus-panel')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('focus-panel')).not.toBeInTheDocument();
  });

  it('See More opens the modal over the panel; Escape closes the modal first, then the panel', () => {
    render(<App />);
    fireEvent.click(findLukePill());
    expect(screen.getByTestId('focus-panel')).toBeInTheDocument();

    fireEvent.click(screen.getByText('See More'));
    expect(screen.getByText(/on the timeline:/)).toBeInTheDocument();
    // The panel is still open behind the modal.
    expect(screen.getByTestId('focus-panel')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText(/on the timeline:/)).not.toBeInTheDocument();
    expect(screen.getByTestId('focus-panel')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('focus-panel')).not.toBeInTheDocument();
  });

  it('a click on a focus-keep card does not exit; a plain background click does', () => {
    render(<App />);
    fireEvent.click(findLukePill());
    expect(screen.getByTestId('focus-panel')).toBeInTheDocument();

    const cards = screen.queryAllByTestId('focus-event-card');
    expect(cards.length).toBeGreaterThan(0);
    fireEvent.click(cards[0]);
    expect(screen.getByTestId('focus-panel')).toBeInTheDocument();

    // window.curXPos/curYPos default to 0/0 (set in Home's mount effect, and
    // never moved since no mousedown fires in this test), so a click at 0/0
    // is not treated as a drag.
    fireEvent.click(getScaledContainer(), { pageX: 0, pageY: 0 });
    expect(screen.queryByTestId('focus-panel')).not.toBeInTheDocument();
  });

  it('clicking an event card opens the modal scrolled to that card\'s first event', () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    render(<App />);
    fireEvent.click(findLukePill());

    const card = screen.getAllByTestId('focus-event-card')[1];
    const firstTitle = [...card.children].find((el) => el.textContent.startsWith('• ')).textContent.slice(2);
    fireEvent.click(card);

    expect(screen.getByText(/on the timeline:/)).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    const heading = scrollIntoView.mock.contexts[0];
    expect(heading.tagName).toBe('H3');
    expect(heading.textContent).toContain(firstTitle);
    // Focus mode stays on behind the modal.
    expect(screen.getByTestId('focus-panel')).toBeInTheDocument();
    delete Element.prototype.scrollIntoView;
  });

  it('clicking another pill while focused switches focus to that character', () => {
    render(<App />);
    fireEvent.click(findLukePill());
    expect(screen.getByTestId('focus-panel')).toHaveAttribute('aria-label', 'Luke Skywalker');

    const otherPill = screen.getAllByTestId('characterdetail')
      .find((el) => !el.textContent.includes('Luke Skywalker'));
    expect(otherPill).toBeTruthy();
    fireEvent.click(otherPill);

    const updatedPanel = screen.getByTestId('focus-panel');
    expect(updatedPanel).toBeInTheDocument();
    expect(updatedPanel).not.toHaveAttribute('aria-label', 'Luke Skywalker');
  });
});
