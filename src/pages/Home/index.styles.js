import React from 'react';
import styled from 'styled-components';

const topMargin = 6;
const gridHeight = 2; //rem
const gridWidth = 2; //rem

export const Header = styled.div`

`;

export const Wrapper = styled.div`
  width: 100vw;
  display: flex;
  flex-flow: column wrap;
  margin: ${gridWidth}rem;
`;

export const Era = styled(({ era, ...rest }) => <div {...rest} />)`
  position: absolute;
  top: ${({ era }) => gridHeight * era.yearIndex + topMargin}rem;
  left: ${gridWidth}rem;
  width: 200vw; // TODO calculate from # chars
  height: ${({ era }) => gridHeight * era.years}rem;
  border-top: solid 2px #fff;
  background: ${({ era }) => era.background};
  z-index: 1;
`;

export const Sticky = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  display: inline-block;
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
  width: 200vw; // TODO calculate from # chars
  position: absolute;
  border-top: solid 1px #eee;
  left: ${gridWidth * 2}rem;
  top: ${({ year }) => gridHeight * year.yearIndex + topMargin}rem;
  z-index: 2;

  ${Sticky} {
    left: 3rem;
  }
`;

export const Movie = styled(({ movie, index, ...rest }) => <div {...rest} />)`
  position: absolute;
  top: ${({ movie, index }) => gridHeight * movie.yearIndex + topMargin + index}rem;
  left: ${({ index }) => gridWidth * 4 + index}rem;
  width: 200vw; // TODO calculate from # chars
  height: ${({ movie }) => gridHeight * (movie.years + 1)}rem;
  background-color: rgba(200,200,200,0.4);
  z-index: 3;

  ${Sticky} {
    left: 7rem;
  }
`;

export const Character = styled(({ character, ...rest }) => <div {...rest} />)`
  position: absolute;
  top: ${({ character }) => gridHeight * character.yearIndex + topMargin}rem;
  left: ${({ character }) => gridWidth * 8 + character.index * (gridWidth + .5) * 2}rem;
  width: ${gridWidth * 2}rem;
  height: ${({ character }) => gridHeight * (character.years + 1)}rem;
  background: linear-gradient(rgba(200,200,0,0.5), rgba(200,200,0,0.7)) no-repeat center/8px 100%;
  z-index: 6;
  border-radius: 50%;

  ${Sticky} {
    top: 1rem;
  }
`;

export const CharacterDetail = styled(({ ...rest }) => <div {...rest} />)`
  background-color: rgba(50,50,50,0.8);
  border-radius: ${gridWidth}rem; //${gridWidth}rem ${gridWidth * 0.25}rem ${gridWidth * 0.25}rem;
  font-size: .8rem;
  color: #fff;
  text-align: center;
  min-height: 9rem;
`;

export const SeenIn = styled(({ seen, ...rest }) => <div {...rest} />)`
  position: absolute;
  top: ${({ seen }) => gridHeight * seen.seenInYear.yearIndex + topMargin + seen.seenInEvent.index}rem;
  left: ${({ seen }) => gridWidth * 8 + seen.character.index * (gridWidth + .5) * 2}rem;
  z-index: 6;
  width: ${gridWidth * 2}rem;
  height: ${({ seen }) => gridWidth * seen.seenInEvent.years}rem;
  display: flex;
  justify-content: center;
  align-content: center;
`;

export const ToolTip = styled.div`
  display: none;
  position: relative;
  top: 1.5rem;
  left: 1rem;
  z-index: 7;
  width: 12rem;
  background-color: #fff;
  font-size: .7rem;
  border-radius: 1rem;
  padding: .5rem;
`;

export const Circle = styled.div`
  background-color: rgba(100,100,255,0.8);
  border-radius: 50%;
  border: 3px solid rgba(200,200,0,0.8);;
  width: ${gridWidth * .75}rem;
  height: ${gridWidth * .75}rem;
  position: relative;
  transition: all ease-in-out 200ms;

  &:hover {
    width: ${gridWidth}rem;
    height: ${gridWidth}rem;
    background-color: rgba(100,100,255,1);

    ${ToolTip} {
      display: block;
    }
  }
`;


export const Image = styled.img`
  width: ${gridWidth * 2}rem;
  height: ${gridWidth * 2}rem;
  border-radius: 50%;
`;

export const AltTitle = styled.div`
  font-size: .7rem;
  font-style: italic;
`;