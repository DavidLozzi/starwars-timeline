import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import Minimap, { buildMinimapRects } from './Minimap';
import jediTheme from '../../themes/jedi';
import yearsData from '../../data/years.json';
import charactersData from '../../data/characters.json';

vi.mock('../../AppContext', () => ({
  useAppContext: () => ({ scale: { scale: 1 } })
}));

describe('buildMinimapRects', () => {
  it('includes every character, not just those rendered in the viewport', () => {
    const { rects } = buildMinimapRects(jediTheme, yearsData, charactersData);
    expect(rects.filter(r => r.kind === 'character')).toHaveLength(charactersData.length);
  });

  it('keeps character rects inside the map bounds', () => {
    const { bounds, rects } = buildMinimapRects(jediTheme, yearsData, charactersData);
    rects
      .filter(r => r.kind === 'character')
      .forEach(r => {
        expect(r.x).toBeGreaterThanOrEqual(0);
        expect(r.x + r.w).toBeLessThanOrEqual(bounds.w);
        expect(r.y + r.h).toBeLessThanOrEqual(bounds.h + 1e-9);
      });
  });

  it('includes eras and movies', () => {
    const { rects } = buildMinimapRects(jediTheme, yearsData, charactersData);
    expect(rects.some(r => r.kind === 'era')).toBe(true);
    expect(rects.some(r => r.kind === 'movie')).toBe(true);
  });
});

describe('Minimap', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is collapsed until toggled, then shows the canvas', () => {
    const { container } = render(
      <ThemeProvider theme={jediTheme}>
        <Minimap years={yearsData} characters={charactersData} />
      </ThemeProvider>
    );
    expect(container.querySelector('canvas')).toBeNull();

    fireEvent.click(screen.getByText('show map'));
    expect(container.querySelector('canvas')).not.toBeNull();
    expect(screen.getByText('hide map')).toBeInTheDocument();
  });
});
