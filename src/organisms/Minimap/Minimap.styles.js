import React from 'react';
import styled from 'styled-components';

export const Wrapper = styled(({ elementToMap, ...rest }) => <div {...rest} />)`
  canvas {
    position: fixed;
    right: 0;
    bottom: 0;
    width: 114px;
    height: 150px;
    z-index: 200;
    background: rgba(255,255,255,0.8);
    padding: 5px;
  }
`;