import React from 'react';
import styled from 'styled-components';


export const SeenIn = styled((props) => <div {...props} data-testid="seenin" />)`
  position: absolute;
  z-index: 40;
  width: ${({ theme }) => theme.layout.gridWidth * 2}rem;
  display: flex;
  justify-content: center;
  align-content: center;
`;

export const SeenInEvent = styled.span`
  font-style: italic;

  ::after {
    content: ' & ';
  }
  :last-child::after {
    content: '';
  }
`;

export const ToolTip = styled.div`
  ${({ theme }) => theme.elements.toolTip};
  display: none;
  position: absolute;
  z-index: 80;
  top: 1.5rem;
  left: -3rem;
  width: 7rem;
`;

export const Circle = styled(({ character, ...rest }) => <div {...rest} data-testid="circle" />)`
  ${({ theme }) => theme.elements.deathCircle};
  position: relative;

  &:hover {
    ${ToolTip} {
      display: block;
    }
  }
`;