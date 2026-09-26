import React from 'react';
import styled, { css, keyframes } from 'styled-components';

import * as HomeStyled from '../../pages/Home/index.styles';

export const CharacterPill = styled(({ ...rest }) => <HomeStyled.CharacterColumn {...rest} data-testid="characterpill"/>)`
  background: none;
  z-index: 50;
  pointer-events: none;

  /* Lift the sticky container a pill-height above the character's line so the
     pill's bottom rests on the start year instead of covering the first years.
     In focus mode Home passes $focusTop, which lifts it by the expanded
     panel's height instead, so the taller pill still ends above the first
     event dot. (No transition override here: theme.elements.character's
     'all 300ms' already animates opacity, top and left.) */
  top: ${({ character, theme, $focusTop }) => typeof $focusTop === 'number' ? $focusTop : HomeStyled.getCharacterTop(theme, character) - theme.layout.elements.character.pillHeight}rem;
  height: ${({ character, theme, $focusTop }) => typeof $focusTop === 'number'
    ? HomeStyled.getCharacterTop(theme, character) + HomeStyled.getCharacterHeight(theme, character) - $focusTop
    : HomeStyled.getCharacterHeight(theme, character) + theme.layout.elements.character.pillHeight}rem;
  ${({ $focused }) => $focused && 'z-index: 65;'}
  ${({ $dimmed, theme }) => $dimmed && `opacity: ${theme.layout.elements.focus?.dimOpacity ?? .15};`}

  ${HomeStyled.Sticky} {
    top: 6rem;
    z-index: 60;
  }
`;

const wiggle = (theme) => keyframes`
  ${theme.elements.characterDetailCurrentAnimation}
`;

export const CharacterDetail = styled(({ isActive, isCurrent, ...rest }) => <div {...rest} data-testid="characterdetail" data-focus-keep="true" />)`
  min-height: ${({ theme }) => theme.layout.elements.character.pillHeight}rem;
  cursor: pointer;
  pointer-events: auto; 
  display: flex;
  align-items: stretch;
  ${({ theme }) => theme.elements.characterDetail};
  ${({ theme, isActive }) => isActive && theme.elements.characterDetailActive};
  ${({ theme, isCurrent }) => isCurrent && css`
    ${theme.elements.characterDetailCurrent};
    animation: ${wiggle(theme)} 1s 1500ms linear 2;
  `
};
  ${({ $focused }) => $focused && 'cursor: default;'}
`;

// The collapsed pill's content (portrait, name, age). Shrinks to the pill's
// width exactly as the bare content used to; when the pill expands it keeps
// that width and the details region grows beside it.
export const PillMain = styled.div`
  flex: 0 1 auto;
`;

export const CharacterImage = styled(({ isActive, ...rest }) => <img {...rest} />)`
  ${({ theme }) => theme.elements.characterImage};
  ${({ theme, isActive }) => isActive && theme.elements.characterImageActive};
`;