import React from 'react';

import * as Styled from './index.styles';

const SeenIn = ({ seen, character}) => {

  return <>
    {seen
      .events
      .sort((a, b) => a.index < b.index ? 1 : -1)
      .map(e => <Styled.SeenIn
        seen={seen}
        character={character}
        movie={e}
        key={`${character.title}${e.title}`}
      >
        <Styled.Circle
          seen={seen}
          character={character}
        >
          <Styled.ToolTip>
            {character.title} in&nbsp;
            <Styled.SeenInEvent>{e.title}</Styled.SeenInEvent>
          </Styled.ToolTip>
        </Styled.Circle>
      </Styled.SeenIn>
      )}
  </>;
};

export default React.memo(SeenIn);