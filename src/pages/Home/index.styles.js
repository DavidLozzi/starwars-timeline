import React from 'react';
import styled from 'styled-components';

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

export const Era = styled(({ era, ...rest }) => <div {...rest} />)`
  ${({ theme }) => theme.elements.era};
  position: absolute;
  top: ${({ era, theme }) => theme.layout.gridHeight * era.yearIndex + theme.layout.topMargin}rem;
  left: ${({ theme }) => theme.layout.gridWidth}rem;
  width: 200vw; // TODO calculate from # chars
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

export const Year = styled(({ year, ...rest }) => <div {...rest} />)`
  ${({ theme }) => theme.elements.year};
  width: 200vw; // TODO calculate from # chars
  position: absolute;
  left: ${({ theme }) => theme.layout.gridWidth * theme.layout.elements.year.leftMultiplier}rem;
  top: ${({ year, theme }) => theme.layout.gridHeight * year.yearIndex + theme.layout.topMargin}rem;
  z-index: 2;

  ${Sticky} {
    left: 3rem;
  }
`;

export const Movie = styled(({ movie, index, ...rest }) => <div {...rest} />)`
  ${({ theme }) => theme.elements.movie};
  position: absolute;
  top: ${({ movie, index, theme }) => theme.layout.gridHeight * movie.yearIndex + theme.layout.topMargin + index}rem;
  left: ${({ index, theme }) => theme.layout.gridWidth * theme.layout.elements.movie.leftMultiplier + index}rem;
  width: 200vw; // TODO calculate from # chars
  height: ${({ movie, theme }) => theme.layout.gridHeight * (movie.years + 1)}rem;
  z-index: 3;

  ${Sticky} {
    left: 7rem;
  }
`;

export const Character = styled(({ character, ...rest }) => <div {...rest} />)`
  ${({ theme }) => theme.elements.character};
  position: absolute;
  top: ${({ character, theme }) => theme.layout.gridHeight * character.yearIndex + theme.layout.topMargin}rem;
  left: ${({ character, theme }) => theme.layout.gridWidth * theme.layout.elements.character.leftMultiplier + character.index * (theme.layout.gridWidth + .5) * 2}rem;
  width: ${({ theme }) => theme.layout.gridWidth * 2}rem;
  height: ${({ character, theme }) => theme.layout.gridHeight * (character.years + 1)}rem;
  z-index: 6;

  ${Sticky} {
    top: 6rem;
  }
`;

export const CharacterDetail = styled(({ ...rest }) => <div {...rest} />)`
  ${({ theme }) => theme.elements.characterDetail};
  min-height: 9rem;
`;

export const CharacterImage = styled.img`
  ${({ theme }) => theme.elements.characterImage};
`;

export const SeenIn = styled(({ seen, ...rest }) => <div {...rest} />)`
  position: absolute;
  top: ${({ seen, theme }) => theme.layout.gridHeight * seen.seenInYear.yearIndex + theme.layout.topMargin + seen.seenInEvent.index}rem;
  left: ${({ seen, theme }) => theme.layout.gridWidth * theme.layout.elements.seenIn.leftMultiplier + seen.character.index * (theme.layout.gridWidth + .5) * 2}rem;
  z-index: 6;
  width: ${({ theme }) => theme.layout.gridWidth * 2}rem;
  height: ${({ seen, theme }) => theme.layout.gridWidth * seen.seenInEvent.years}rem;
  display: flex;
  justify-content: center;
  align-content: center;
`;

export const ToolTip = styled.div`
  ${({ theme }) => theme.elements.toolTip};
  display: none;
  position: relative;
  top: 1.5rem;
  left: 1rem;
  z-index: 100;
`;

export const Circle = styled.div`
  ${({ theme }) => theme.elements.seenInCircle};
  position: relative;
  transition: all ease-in-out 200ms;

  &:hover {
    ${ToolTip} {
      display: block;
    }
  }
`;

export const AltTitle = styled.div`
  ${({ theme }) => theme.elements.altTitle};
`;