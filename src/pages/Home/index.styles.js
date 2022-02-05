import React from 'react';
import styled, { keyframes } from 'styled-components';

const getCharacterTop = (theme, character) => theme.layout.elements.year.height *
  character.yearIndex +
  theme.layout.topMargin;

const getFullWidth = (theme, characterCount) =>
  theme.layout.elements.character.leftPageMargin +
  characterCount *
  (theme.layout.elements.character.width + theme.layout.elements.character.spacer);

const fadeIn = () => keyframes`
  0% {
    opacity: 0;
  }  
	30% { 
    opacity: 1; 
  }
  100% {
    opacity: 1;
  }
`;

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

export const Wrapper = styled.div`
  width: 100vw;
  display: flex;
  flex-flow: column wrap;
  margin: ${({ theme }) => theme.layout.gridWidth}rem;
`;

export const Crawl = styled.div`
  display: flex;
  justify-items: center;
  text-align: center;
  flex-direction: column;
  padding-top: 10rem;
  margin: -3rem;
  color: rgb(75, 213, 238);
  font: 700 8vw "News Cycle", sans-serif;
  background-color: ${({ theme }) => `rgb(${theme.palette.black})`};
  width: 100vw;
  height: 100vh;
`;

export const Long = styled.div`
  opacity: 0;
  padding: 3rem;
  animation: ${fadeIn} 6s linear forwards;
`;

export const Note = styled.div`
  opacity: 0;
  font-size: 1rem;
  animation: ${fadeIn} 6s linear 2s forwards;
`;

export const Sticky = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  display: inline-block;
`;

export const Era = styled(({ era, characterCount, endYear, ...rest }) => <div data-testid="era" {...rest} />)`
  ${({ theme }) => theme.elements.era};
  position: absolute;
  top: ${({ era, theme }) => theme.layout.gridHeight * era.yearIndex + theme.layout.topMargin}rem;
  left: 0;
  min-width: 100vw;
  width: ${({ theme, characterCount }) => `${getFullWidth(theme, characterCount)}rem`};
  height: ${({ era, endYear, theme }) => theme.layout.gridHeight * (endYear?.yearIndex - era.yearIndex)}rem;
  z-index: 1;
  transition: all 500ms ease-in-out;

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
  min-width: calc(100vw - ${({ theme }) => theme.layout.elements.year.leftPageMargin}rem);
  width: ${({ theme, characterCount }) => `${getFullWidth(theme, characterCount) - (theme.layout.elements.year.leftPageMargin)}rem`};
  position: absolute;
  left: ${({ theme }) => theme.layout.elements.year.leftPageMargin}rem;
  top: ${({ year, theme }) => theme.layout.elements.year.height * year.yearIndex + theme.layout.topMargin}rem;
  z-index: 20;
  border-radius: 1rem;
  transition: all 300ms ease-in-out;

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
      width: 4rem;
      left: ${({ theme }) => theme.layout.elements.year.leftPageMargin}rem;
      ${({ theme }) => theme.elements.yearPill};
      ${({ isCurrentYear, theme }) => isCurrentYear ? theme.elements.yearPillCurrent : ''};
    }
`;

export const Movie = styled(({ movie, characterCount, isCurrentYear, ...rest }) => <div {...rest} data-testid="movie"/>)`
  ${({ theme }) => theme.elements.movie};
  position: absolute;
  top: ${({ movie, theme }) => theme.layout.gridHeight * movie.yearIndex + (movie.index * theme.layout.gridHeight) + theme.layout.topMargin}rem;
  left: ${({ theme }) => theme.layout.elements.movie.leftPageMargin}rem;
  min-width: calc(100vw - ${({ movie, theme }) => theme.layout.elements.movie.leftPageMargin + (movie.index * theme.layout.elements.movie.nextMoviePad) + 1}rem);
  width: ${({ theme, movie, characterCount }) => `${getFullWidth(theme, characterCount) - theme.layout.elements.movie.leftPageMargin}rem`};
  height: ${({ movie, theme }) => theme.layout.gridHeight * (movie.years + 1)}rem;
  z-index: 30;
  transition: all 500ms ease-in-out;

  ${({ isCurrentYear, theme }) => isCurrentYear ? theme.elements.currentMovie : ''};

  ${Sticky} {
    left: 8rem;
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

export const CharacterColumn = styled(({ character, ...rest }) => <div {...rest} data-testid="character"/>)`
  ${({ theme }) => theme.elements.character};
  position: absolute;
  top: ${({ character, theme }) => getCharacterTop(theme, character)}rem;
  left: ${({ character, theme }) => (theme.layout.elements.character.width + theme.layout.elements.character.spacer) * character.index + theme.layout.elements.character.leftPageMargin}rem;
  width: ${({ theme }) => theme.layout.elements.character.width}rem;
  height: ${({ character, theme }) => theme.layout.elements.year.height * (character.endYearIndex - character.yearIndex)}rem;
  z-index: 30;
  pointer-events: auto;
`;

export const AltTitle = styled.div`
  ${({ theme }) => theme.elements.altTitle};
`;
