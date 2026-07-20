import React from 'react';

import * as Styled from './index.styles';

const ListView = ({ data, onClick }) => {

  return (
    <Styled.Wrapper>
      {data.map(d => 
        <Styled.ListItem key={d.text} onClick={() => onClick(d)}>{d.text}</Styled.ListItem>
      )}      
    </Styled.Wrapper>
  );
};

export default ListView;