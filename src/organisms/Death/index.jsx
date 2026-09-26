import React from 'react';
import { useTheme } from 'styled-components';

import * as Styled from './index.styles';
import { CharacterColumn } from '../../pages/Home/index.styles';

const Death = ({ character, isDimmed = false, isFocused = false }) => {
  const theme = useTheme();

  return <>
    <Styled.SeenIn
      $dimmed={isDimmed}
      data-dimmed={isDimmed ? 'true' : undefined}
      data-focus-keep={isFocused ? 'true' : undefined}
      style={{
        top: `${theme.layout.elements.year.height * character.deathEvent.yearIndex + theme.layout.topMargin + (character.deathEvent.index * theme.layout.elements.year.height)}rem`,
        left: `${(theme.layout.elements.character.width + theme.layout.elements.character.spacer) * character.index + theme.layout.elements.character.leftPageMargin}rem`
      }}
    >
      <Styled.Circle
        character={character}
      >
        <Styled.ToolTip>
          {character.title} died {character.endYearDisplay} in {character.endYearEvent}
        </Styled.ToolTip>
        💀
      </Styled.Circle>
    </Styled.SeenIn>
  </>;
};

export default React.memo(Death);