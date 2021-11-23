import React from 'react';

import * as Styled from './index.styles';

const SeenIn = ({ seen, character}) => {

  return <Styled.SeenIn
    seen={seen}
    character={character}
  >
    <Styled.Circle>
      <Styled.ToolTip>
        {character.title} is in&nbsp;
        {seen.events.map(e => 
          <Styled.SeenInEvent key={`${character.title}${e.title}`}>{e.title}</Styled.SeenInEvent>
        )}
      </Styled.ToolTip>
    </Styled.Circle>
  </Styled.SeenIn>;
};

export default React.memo(SeenIn);