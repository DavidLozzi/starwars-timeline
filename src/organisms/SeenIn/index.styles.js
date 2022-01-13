import React from 'react';
import styled from 'styled-components';


export const SeenIn = styled(({ seen, character, movie, ...rest }) => <div {...rest}  data-testid="seenin"/>)`
  position: absolute;
  top: ${({ seen, theme, movie }) => (theme.layout.elements.year.height) * seen.yearIndex + theme.layout.topMargin + (movie.index * theme.layout.elements.year.height)}rem;
  left: ${({ character, theme }) => (theme.layout.elements.character.width + theme.layout.elements.character.spacer) * character.index + theme.layout.elements.character.leftPageMargin}rem;; 
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

export const Circle = styled(({ seen, character, ...rest }) => <div {...rest}  data-testid="circle"/>)`
  ${({ theme }) => theme.elements.seenInCircle};
  position: relative;

  &:hover {
    ${ToolTip} {
      display: block;
    }
  }
`;