import React from 'react';
import { useTheme } from 'styled-components';

import * as HomeStyled from '../../pages/Home/index.styles';
import * as Styled from './index.styles';
import { entryShowsLabel } from './events';

// Renders the yellow event dots (behind the expanded pill, z-index-wise) and their "• Title" cards down one
// character's line, in focus mode. Positions/grouping come precomputed from
// `buildCharacterEvents` (events.js) -- this component only lays them out
// horizontally against the character's column.
const CharacterEvents = ({ character, dots, cards, onEventClick }) => {
  const theme = useTheme();

  const left = HomeStyled.getCharacterLeft(theme, character);
  const colCenter = left + theme.layout.elements.character.width / 2;
  const dotSize = theme.layout.elements.focus.dotSize;

  return <>
    {dots.map(dot => (
      <Styled.Dot
        key={`dot-${dot.year}`}
        data-testid="focus-event-dot"
        style={{
          left: `${colCenter - dotSize / 2}rem`,
          top: `${dot.top}rem`
        }}
      />
    ))}
    {cards.map((card, cardIndex) => (
      <Styled.Card
        key={`card-${cardIndex}`}
        data-testid="focus-event-card"
        data-focus-keep="true"
        onClick={() => onEventClick && onEventClick(character, card.entries[0].events[0].order)}
        style={{
          left: `${colCenter + 1}rem`,
          top: `${card.top}rem`
        }}
      >
        {card.entries.map(entry => (
          <React.Fragment key={`year-${entry.year}-${entry.key}`}>
            {entryShowsLabel(entry, card.entries.length) && <Styled.CardYear>{entry.display}</Styled.CardYear>}
            {entry.events.map((event, eventIndex) => (
              <Styled.CardLine
                key={`event-${entry.year}-${entry.key}-${eventIndex}`}
                title={event.label || undefined}
              >
                • {event.title}
              </Styled.CardLine>
            ))}
          </React.Fragment>
        ))}
      </Styled.Card>
    ))}
  </>;
};

export default React.memo(CharacterEvents);
