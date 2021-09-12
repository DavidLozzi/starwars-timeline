import React from 'react';
import styled from 'styled-components';

const topMargin = 6;
const gridHeight = 2; //rem
const gridWidth = 2; //rem
export const Wrapper = styled.div`
  width: 100vh;
  display: flex;
  flex-flow: column wrap;
  margin: ${gridWidth}rem;
`;

export const Era = styled(({ era, ...rest }) => <div {...rest} />)`
  position: absolute;
  top: ${({ era }) => gridHeight * era.yearIndex + topMargin}rem;
  left: ${gridWidth}rem;
  width: ${gridWidth * 5}rem;
  height: ${({ era }) => gridHeight * era.years}rem;
  border-top: solid 2px #fff;
  background-color: rgba(100,255,255,0.5);
  z-index: 1;
`;

export const Sticky = styled.div`
  position: sticky;
  top: 0;
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
  width: 100vh;
  position: absolute;
  border-top: solid 1px #eee;
  left: ${gridWidth * 2}rem;
  top: ${({ year }) => gridHeight * year.yearIndex + topMargin}rem;
  z-index: 2;
`;

export const Movie = styled(({ movie, index, ...rest }) => <div {...rest} />)`
  position: absolute;
  top: ${({ movie, index }) => gridHeight * movie.yearIndex + topMargin + index}rem;
  left: ${({ index }) => gridWidth * 4 + index}rem;
  width: 100vh;
  height: ${({ movie }) => gridHeight * movie.years}rem;
  background-color: rgba(100,100,255,0.2);
  z-index: 3;
  padding: 0.25rem;
`;

export const Character = styled(({ character, ...rest }) => <div {...rest} />)`
  position: absolute;
  top: ${({ character }) => gridHeight * character.yearIndex + topMargin}rem;
  left: ${({ character }) => gridWidth * 8 + character.index * (gridWidth + .5) * 2}rem;
  width: ${gridWidth * 2}rem;
  height: ${({ character }) => gridHeight * character.years}rem;
  background: linear-gradient(#990, #990) no-repeat center/10px 100%;
  border-radius: ${gridWidth + .5}rem;
  z-index: 4;
  padding: 0.25rem;
  padding: 0;

  ${Sticky} & {
    z-index: 6;
  }
`;

export const SeenIn = styled(({ seen, ...rest }) => <div {...rest} />)`
  position: absolute;
  top: ${({ seen }) => gridHeight * seen.seenInYear.yearIndex + topMargin + seen.seenInEvent.index}rem;
  left: ${({ seen }) => gridWidth * 8 + seen.character.index * (gridWidth + .5) * 2}rem;
  z-index: 5;
  width: ${gridWidth * 1.5}rem;
  height: ${gridWidth * 1.5}rem;
  text-align: center;
  background-color: #009;
  border-radius: 50%;
  border: 5px solid #990;
`;

export const Image = styled.img`
  width: ${gridWidth * 2}rem;
  height: ${gridWidth * 2}rem;
  border-radius: 50%;
`;

export const AltTitle = styled.div`
  font-size: 13px;
  font-style: italic;
`;

export const CrossEvent = styled.div`
  margin-left: ${({ count }) => (count * 105) + 100}px;
  background-color: rgba(100,255,255,0.3);
  width: 100px;
  position: absolute;
  z-index: 30;
`;