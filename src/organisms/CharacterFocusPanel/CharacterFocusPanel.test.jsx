import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';

import CharacterFocusPanel from './index';
import { truncateDescription, getCharacterImageForYear } from './text';
import jediTheme from '../../themes/jedi';
import charactersData from '../../data/characters.json';

describe('CharacterFocusPanel', () => {
  const luke = charactersData.find(c => c.title === 'Luke Skywalker');

  const renderPanel = (props = {}) => render(
    <ThemeProvider theme={jediTheme}>
      <CharacterFocusPanel
        character={luke}
        plottedCount={5}
        onSeeMore={vi.fn()}
        onClose={vi.fn()}
        {...props}
      />
    </ThemeProvider>
  );

  it('is the labelled focus dialog while open', () => {
    renderPanel();

    const panel = screen.getByTestId('focus-panel');
    expect(panel).toHaveAttribute('role', 'dialog');
    expect(panel).toHaveAttribute('aria-label', 'Luke Skywalker');
    expect(panel).toHaveAttribute('data-focus-keep', 'true');
  });

  it('drops the dialog semantics while collapsing (isOpen false)', () => {
    renderPanel({ isOpen: false, isExpanded: false });

    expect(screen.queryByTestId('focus-panel')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows every metadata entry and the event count', () => {
    renderPanel();

    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Homeworld')).toBeInTheDocument();
    expect(screen.getByText('Tatooine')).toBeInTheDocument();
    expect(screen.getByText('Species')).toBeInTheDocument();
    expect(screen.getByText('Human')).toBeInTheDocument();
    expect(screen.getByText('Force Sensitive')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('truncates the description to at most 101 characters, ending in an ellipsis', () => {
    renderPanel();

    const description = screen.getByText(/…$/);
    expect(description.textContent.length).toBeLessThanOrEqual(101);
    expect(description.textContent.endsWith('…')).toBe(true);
  });

  it('calls onSeeMore with the character when See More is clicked', () => {
    const onSeeMore = vi.fn();
    renderPanel({ onSeeMore });

    fireEvent.click(screen.getByText('See More'));
    expect(onSeeMore).toHaveBeenCalledWith(luke);
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    renderPanel({ onClose });

    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('truncateDescription', () => {
  it('leaves short text unchanged', () => {
    expect(truncateDescription('<p>Short bio.</p>')).toBe('Short bio.');
  });

  it('returns an empty string for falsy input', () => {
    expect(truncateDescription(null)).toBe('');
    expect(truncateDescription(undefined)).toBe('');
    expect(truncateDescription('')).toBe('');
  });

  it('strips HTML tags before measuring/truncating', () => {
    const html = '<p>Luke <b>Skywalker</b> is the farm boy who became the galaxy’s most famous Jedi, the hero whose single torpedo shot destroyed the first Death Star.</p>';
    const result = truncateDescription(html);
    expect(result).not.toMatch(/<[^>]*>/);
    expect(result.length).toBeLessThanOrEqual(101);
  });

  it('never cuts a word in half', () => {
    const text = 'word '.repeat(40).trim();
    const result = truncateDescription(text, 20);
    const withoutEllipsis = result.replace(/…$/, '');
    expect(text.startsWith(withoutEllipsis)).toBe(true);
    expect(withoutEllipsis.endsWith('wor')).toBe(false);
  });
});

describe('getCharacterImageForYear', () => {
  const luke = charactersData.find(c => c.title === 'Luke Skywalker');

  it('picks the imageYears entry covering the given year (farmboy at year 0)', () => {
    expect(getCharacterImageForYear(luke, 0)).toBe('/images/skywalker-farmboy.jpg');
  });

  it('picks the covering entry at year 10 (jedi)', () => {
    expect(getCharacterImageForYear(luke, 10)).toBe('/images/skywalker-jedi.jpg');
  });

  it('falls back to imageUrl when no year is given', () => {
    expect(getCharacterImageForYear(luke, null)).toBe(luke.imageUrl);
    expect(getCharacterImageForYear(luke, undefined)).toBe(luke.imageUrl);
  });

  it('does not mutate the character\'s imageYears order', () => {
    const before = JSON.stringify(luke.imageYears);
    getCharacterImageForYear(luke, 0);
    getCharacterImageForYear(luke, 34);
    expect(JSON.stringify(luke.imageYears)).toBe(before);
  });
});
