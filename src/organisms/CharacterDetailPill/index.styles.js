import React from 'react';
import styled, { css, keyframes } from 'styled-components';

import * as HomeStyled from '../../pages/Home/index.styles';

export const CharacterPill = styled(({ ...rest }) => <HomeStyled.CharacterColumn {...rest} data-testid="characterpill"/>)`
  background: none;
  z-index: 50;
  pointer-events: none; 

  ${HomeStyled.Sticky} {
    top: 6rem;
    z-index: 60;
  }
`;

const wiggle = (theme) => keyframes`
  ${theme.elements.characterDetailCurrentAnimation}
`;

export const CharacterDetail = styled(({ isActive, isCurrent, ...rest }) => <div {...rest} data-testid="characterdetail" />)`
  min-height: 9.5rem;
  cursor: pointer;
  pointer-events: auto; 
  ${({ theme }) => theme.elements.characterDetail};
  ${({ theme, isActive }) => isActive && theme.elements.characterDetailActive};
  ${({ theme, isCurrent }) => isCurrent && css`
    ${theme.elements.characterDetailCurrent};
    animation: ${wiggle(theme)} 1s 1500ms linear 2;
  `
};
`;

export const CharacterImage = styled(({ isActive, ...rest }) => <img {...rest} />)`
  ${({ theme }) => theme.elements.characterImage};
  ${({ theme, isActive }) => isActive && theme.elements.characterImageActive};
`;