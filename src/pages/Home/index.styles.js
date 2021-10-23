import React from 'react';
import styled, { css, keyframes } from 'styled-components';

const getCharacterTop = (theme, character) => theme.layout.gridHeight *
  character.yearIndex +
  theme.layout.topMargin -
  theme.layout.elements.character.topOffset;

const getFullWidth = (theme, characterCount) =>
  theme.layout.elements.character.leftPageMargin +
  characterCount *
  (theme.layout.elements.character.width + theme.layout.elements.character.spacer);

export const Header = styled.div`
  ${({ theme }) => theme.elements.header};
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const H1 = styled.h1`
  margin-left: 2rem;
  font-size: 1.6rem;
`;

export const Wrapper = styled.div`
  width: 100vw;
  display: flex;
  flex-flow: column wrap;
  margin: ${({ theme }) => theme.layout.gridWidth}rem;
`;

export const Sticky = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  display: inline-block;
`;

export const Era = styled(({ era, characterCount, ...rest }) => <div data-testid="era" {...rest} />)`
  ${({ theme }) => theme.elements.era};
  position: absolute;
  top: ${({ era, theme }) => theme.layout.gridHeight * era.yearIndex + theme.layout.topMargin}rem;
  left: 0;
  width: ${({ theme, characterCount }) => `${getFullWidth(theme, characterCount)}rem`};
  height: ${({ era, theme }) => theme.layout.gridHeight * era.years}rem;
  z-index: 1;

  ${Sticky} {
    top: 6rem;
  }
`;

export const EraLabel = styled.div`
  transform: rotate(-90deg);
  width: 10rem;
  position: relative;
  top: 10rem;
  left: 0rem;
  transform-origin: top left;
`;

export const EraPill = styled((props) => <Era data-testid="era-pill" {...props} />)`
  background: none;
  z-index: 70;
  pointer-events: none;

  ${EraLabel} {
    ${({ theme }) => theme.elements.eraPill};
  }
`;

export const Year = styled(({ year, isCurrentYear, characterCount, ...rest }) => <div data-testid="year" {...rest}/>)`
  ${({ theme }) => theme.elements.year};
  width: ${({ theme, characterCount }) => `${getFullWidth(theme, characterCount) - (theme.layout.elements.year.leftPageMargin)}rem`};
  position: absolute;
  left: ${({ theme }) => theme.layout.elements.year.leftPageMargin}rem;
  top: ${({ year, theme }) => theme.layout.elements.year.height * year.yearIndex + theme.layout.topMargin}rem;
  z-index: 20;
  border-radius: 1rem;

  ${Sticky} {
    left: 3rem;
    ${({ isCurrentYear, theme }) => isCurrentYear ? theme.elements.currentYearText : ''};
  }

  ${({ isCurrentYear, theme }) => isCurrentYear ? theme.elements.currentYear : ''};
`;

export const YearPill = styled(({ isCurrentYear, ...rest }) => <Year {...rest} data-testid="year-pill" />)`
    left: ${({ theme }) => theme.layout.elements.year.leftPageMargin}rem;
    top: ${({ year, theme }) => (theme.layout.elements.year.height) * year.yearIndex + theme.layout.topMargin}rem;
    z-index: 60;
    border-top: 0;
    margin-top: .1rem;
    pointer-events: none; 

    ${Sticky} {
      left: ${({ theme }) => theme.layout.elements.year.leftPageMargin}rem;
      ${({ theme }) => theme.elements.yearPill};
      ${({ isCurrentYear, theme }) => isCurrentYear ? theme.elements.yearPillCurrent : ''};
    }
`;

export const Movie = styled(({ movie, index, characterCount, isCurrentYear, ...rest }) => <div {...rest} data-testid="movie"/>)`
  ${({ theme }) => theme.elements.movie};
  position: absolute;
  top: ${({ movie, index, theme }) => theme.layout.gridHeight * movie.yearIndex + theme.layout.topMargin + index}rem;
  left: ${({ index, theme }) => theme.layout.elements.movie.leftPageMargin + (index * theme.layout.elements.movie.nextMoviePad)}rem;
  width: ${({ theme, index, characterCount }) => `${getFullWidth(theme, characterCount) - (theme.layout.elements.movie.leftPageMargin + (index * theme.layout.elements.movie.nextMoviePad) + 1)}rem`};
  height: ${({ movie, theme }) => theme.layout.gridHeight * (movie.years + 1)}rem;
  z-index: 30;

  ${({ isCurrentYear, theme }) => isCurrentYear ? theme.elements.currentMovie : ''};

  ${Sticky} {
    left: 7rem;
  }
`;

export const MovieTitle = styled.div`
  display: inline-block;
  margin-right: .2rem;
  ::after {
    content: ' & ';
  }
  :last-child::after {
    content: '';
  }
`;

export const Character = styled(({ character, ...rest }) => <div {...rest} data-testid="character"/>)`
  ${({ theme }) => theme.elements.character};
  position: absolute;
  top: ${({ character, theme }) => getCharacterTop(theme, character)}rem;
  left: ${({ character, theme }) => (theme.layout.elements.character.width + theme.layout.elements.character.spacer) * character.index + theme.layout.elements.character.leftPageMargin}rem;
  width: ${({ theme }) => theme.layout.elements.character.width}rem;
  height: ${({ character, theme }) => theme.layout.gridHeight * (character.years + 5)}rem;
  z-index: 50;
  pointer-events: auto;

  ${Sticky} {
    top: 6rem;
    z-index: 60;
  }
`;

const wiggle = (theme) => keyframes`
  ${theme.elements.characterDetailCurrentAnimation}
`;

export const CharacterDetail = styled(({ isActive, isCurrent, ...rest }) => <div {...rest}  data-testid="characterdetail"/>)`
  min-height: 9.5rem;
  cursor: pointer;
  ${({ theme }) => theme.elements.characterDetail};
  ${({ theme, isActive }) => isActive && theme.elements.characterDetailActive};
  ${({ theme, isCurrent }) => isCurrent && css`
    ${theme.elements.characterDetailCurrent};
    animation: ${wiggle(theme)} 1s 1500ms linear 2;
  `
};
`;

export const CharacterImage = styled(({ isActive, src, ...rest }) => <div {...rest} />)`
  background-image: url(${({ src }) => src});
  background-size: contain;
  transition: all 300ms ease-in-out;
  ${({ theme }) => theme.elements.characterImage};
  ${({ theme, isActive }) => isActive && theme.elements.characterImageActive};
`;

export const SeenIn = styled(({ seen, ...rest }) => <div {...rest}  data-testid="seenin"/>)`
  position: absolute;
  top: ${({ seen, theme }) => (theme.layout.gridHeight * seen.seenInYear.yearIndex) - getCharacterTop(theme, seen.character) + theme.layout.topMargin + seen.seenInEvent.index}rem;
  left: 0; 
  z-index: 60;
  width: ${({ theme }) => theme.layout.gridWidth * 2}rem;
  display: flex;
  justify-content: center;
  align-content: center;
`;

export const ToolTip = styled.div`
  ${({ theme }) => theme.elements.toolTip};
  display: none;
  position: absolute;
  z-index: 70;
  top: 1.5rem;
  left: -2.5rem;
  width: 6rem;
`;

export const Circle = styled.div`
  ${({ theme }) => theme.elements.seenInCircle};
  position: relative;

  &:hover {
    ${ToolTip} {
      display: block;
    }
  }
`;

export const AltTitle = styled.div`
  ${({ theme }) => theme.elements.altTitle};
`;
