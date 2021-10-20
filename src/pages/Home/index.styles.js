import React from 'react';
import styled from 'styled-components';

const getCharacterTop = (theme, character) => theme.layout.gridHeight * character.yearIndex + theme.layout.topMargin;
const getFullWidth = (theme, characterCount) => theme.layout.gridWidth * theme.layout.elements.character.leftMultiplier + characterCount * theme.layout.elements.character.width * (theme.layout.gridWidth + .5);
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

export const Era = styled(({ era, characterCount, ...rest }) => <div {...rest} />)`
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

export const Year = styled(({ year, isCurrentYear, characterCount, ...rest }) => <div {...rest} data-testid="year" />)`
  ${({ theme }) => theme.elements.year};
  width: ${({ theme, characterCount }) => `${getFullWidth(theme, characterCount) - (theme.layout.gridWidth * theme.layout.elements.year.leftMultiplier)}rem`};
  position: absolute;
  left: ${({ theme }) => theme.layout.gridWidth * theme.layout.elements.year.leftMultiplier}rem;
  top: ${({ year, theme }) => theme.layout.gridHeight * year.yearIndex + theme.layout.topMargin}rem;
  z-index: 20;

  ${Sticky} {
    left: 3rem;
    ${({ isCurrentYear, theme }) => isCurrentYear ? theme.elements.currentYearText : ''};
  }

  ${({ isCurrentYear, theme }) => isCurrentYear ? theme.elements.currentYear : ''};
`;

export const Movie = styled(({ movie, index, characterCount, isCurrentYear, ...rest }) => <div {...rest} data-testid="movie"/>)`
  ${({ theme }) => theme.elements.movie};
  position: absolute;
  top: ${({ movie, index, theme }) => theme.layout.gridHeight * movie.yearIndex + theme.layout.topMargin + index}rem;
  left: ${({ index, theme }) => theme.layout.gridWidth * theme.layout.elements.movie.leftMultiplier + index}rem;
  width: ${({ theme, index, characterCount }) => `${getFullWidth(theme, characterCount) - (theme.layout.gridWidth * theme.layout.elements.movie.leftMultiplier + index + 1)}rem`};
  height: ${({ movie, theme }) => theme.layout.gridHeight * (movie.years + 1)}rem;
  z-index: 30;

  ${({ isCurrentYear, theme }) => isCurrentYear ? theme.elements.currentMovie : ''};

  ${Sticky} {
    left: 7rem;
  }
`;

export const Character = styled(({ character, ...rest }) => <div {...rest} data-testid="character"/>)`
  ${({ theme }) => theme.elements.character};
  position: absolute;
  top: ${({ character, theme }) => getCharacterTop(theme, character)}rem;
  left: ${({ character, theme }) => theme.layout.gridWidth * theme.layout.elements.character.leftMultiplier + character.index * (theme.layout.gridWidth + .5) * theme.layout.elements.character.width}rem;
  width: ${({ theme }) => theme.layout.gridWidth * theme.layout.elements.character.width}rem;
  height: ${({ character, theme }) => theme.layout.gridHeight * (character.years + 1)}rem;
  z-index: 50;

  ${Sticky} {
    top: 6rem;
    z-index: 60;
  }
`;

export const CharacterDetail = styled(({ ...rest }) => <div {...rest}  data-testid="characterdetail"/>)`
  ${({ theme }) => theme.elements.characterDetail};
  min-height: 9.5rem;
`;

export const CharacterImage = styled.img`
  ${({ theme }) => theme.elements.characterImage};
`;

export const SeenIn = styled(({ seen, ...rest }) => <div {...rest}  data-testid="seenin"/>)`
  position: absolute;
  top: ${({ seen, theme }) => (theme.layout.gridHeight * seen.seenInYear.yearIndex) - getCharacterTop(theme, seen.character) + theme.layout.topMargin + seen.seenInEvent.index}rem;
  left: 0; // ${({ seen, theme }) => theme.layout.gridWidth * theme.layout.elements.seenIn.leftMultiplier + seen.character.index * 2}rem;
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
