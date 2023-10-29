import React from 'react';
import { useTheme } from 'styled-components';

import * as Styled from './index.styles';
import { CharacterColumn } from '../../pages/Home/index.styles';

const Death = ({ character }) => {
  const theme = useTheme();

  return <>
    <Styled.SeenIn
      style={{
        top: `${theme.layout.elements.year.height * character.endYearIndex + theme.layout.topMargin}rem`,
        left: `${(theme.layout.elements.character.width + theme.layout.elements.character.spacer) * character.index + theme.layout.elements.character.leftPageMargin}rem`
      }}
    >
      <Styled.Circle
        character={character}
      >
        <Styled.ToolTip>
          {character.title} died {character.endYearDisplay}
        </Styled.ToolTip>
        💀
      </Styled.Circle>
    </Styled.SeenIn>
  </>;
};

export default React.memo(Death);