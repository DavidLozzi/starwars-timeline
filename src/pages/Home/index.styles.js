import styled from 'styled-components';

const yearHeight = 40;
export const Wrapper = styled.div`
  width: 100vh;
  display: flex;
  flex-flow: column wrap;
  margin-left: 20px;
`;

export const Year = styled.div`
  width: 100%;
  height: ${({ count }) => (count * yearHeight)}px;
  position: relative;
  border-top: solid 1px #eee;
`;

export const Image = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
`;

export const AltTitle = styled.div`
  font-size: 13px;
  font-style: italic;
`;

export const SpanningEvent = styled.div`
  height: ${({ years }) => years * yearHeight}px;
  position: absolute;
  top: 0;
  width: 100px;
  border-top: solid 2px #fff;
  margin-left: ${({ count }) => (count * 105) + 100}px;
  z-index: 10;

  ${({ type }) => type === 'era' && `
    background-color: #fee;
    margin-left: 100px;
  `}

  ${({ type }) => type === 'character' && `
    background-color: #eff;
  `}

  ${({ type, count }) => type === 'tv' && `
    background-color: rgba(255,75,255,0.2);
    margin-left: 230px;
    margin-top: ${yearHeight * 2}px;
  `}
`;

export const CrossEvent = styled.div`
  margin-left: ${({ count }) => (count * 105) + 100}px;
  background-color: rgba(100,255,255,0.3);
  width: 100px;
  position: absolute;
  z-index: 30;
`;

export const Movie = styled.div`
  position: absolute;
  top: 0;
  width: 800px;
  height: ${yearHeight}px;
  margin-top: ${({ count }) => (count * yearHeight)}px;
  background-color: rgba(100,100,255,0.2);
  margin-left: 210px;
  z-index: 20;
`;

export const Tv = styled.div`
  position: absolute;
  top: 0;
  width: 780px;
  height: ${yearHeight}px;
  margin-top: ${({ count }) => (count * yearHeight)}px;
  background-color: rgba(100,75,255,0.2);
  margin-left: 230px;
  z-index: 20;
`;