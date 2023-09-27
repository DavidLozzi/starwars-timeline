import React from 'react';

import * as Styled from './index.styles';
import { useTheme } from 'styled-components';

const SeenIn = ({ seen, character }) => {
  const theme = useTheme();

  return <>
    {seen
      .events
      .sort((a, b) => a.index < b.index ? 1 : -1)
      .map(movie => <Styled.SeenIn
        key={`${character.title}${movie.title}`}
        style={{
          top: `${theme.layout.elements.year.height * seen.yearIndex + theme.layout.topMargin + (movie.index * theme.layout.elements.year.height)}rem`,
          left: `${(theme.layout.elements.character.width + theme.layout.elements.character.spacer) * character.index + theme.layout.elements.character.leftPageMargin}rem`
        }}
      >
        <Styled.Circle
          seen={seen}
          character={character}
        >
          <Styled.ToolTip>
            {character.title} in&nbsp;
            <Styled.SeenInEvent>{movie.title}</Styled.SeenInEvent>
          </Styled.ToolTip>
        </Styled.Circle>
      </Styled.SeenIn>
      )}
  </>;
};

export default React.memo(SeenIn);