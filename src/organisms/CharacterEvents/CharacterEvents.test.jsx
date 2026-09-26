import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';

import CharacterEvents from './index';
import { buildCharacterEvents } from './events';
import jediTheme from '../../themes/jedi';
import yearsData from '../../data/years.json';
import charactersData from '../../data/characters.json';

describe('CharacterEvents', () => {
  const luke = charactersData.find(c => c.title === 'Luke Skywalker');
  const { dots, cards } = buildCharacterEvents(luke, yearsData, jediTheme);

  it('renders one dot per dots entry and one card per cards entry', () => {
    render(
      <ThemeProvider theme={jediTheme}>
        <CharacterEvents character={luke} dots={dots} cards={cards} />
      </ThemeProvider>
    );

    expect(screen.getAllByTestId('focus-event-dot')).toHaveLength(dots.length);
    expect(screen.getAllByTestId('focus-event-card')).toHaveLength(cards.length);
  });

  it('renders a known Luke event title with the "• " bullet', () => {
    render(
      <ThemeProvider theme={jediTheme}>
        <CharacterEvents character={luke} dots={dots} cards={cards} />
      </ThemeProvider>
    );

    expect(screen.getByText(/•\s*Birth on Polis Massa/)).toBeInTheDocument();
  });

  it('marks every card as data-focus-keep', () => {
    render(
      <ThemeProvider theme={jediTheme}>
        <CharacterEvents character={luke} dots={dots} cards={cards} />
      </ThemeProvider>
    );

    screen.getAllByTestId('focus-event-card').forEach(card => {
      expect(card).toHaveAttribute('data-focus-keep', 'true');
    });
  });
});
