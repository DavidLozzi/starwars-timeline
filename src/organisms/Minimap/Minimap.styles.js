import React from 'react';
import styled from 'styled-components';

export const Wrapper = styled(({ elementToMap, ...rest }) => <div {...rest} />)`
  display: flex;
  flex-direction: column;
  position: fixed;
  right: 0;
  bottom: 0;
  z-index: 200;
  background: rgba(255,255,255,0.7);
  border-radius: 13px 0px 0px 0px;
  padding: 5px;
  canvas {
    width: 200px;
    height: 300px;
  }
`;

export const ShowButton = styled.button`
  border: 0;
  background: transparent;
`;