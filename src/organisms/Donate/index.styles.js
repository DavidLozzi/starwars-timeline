import styled from 'styled-components';

export default {
  Wrapper: styled.div`
    width: 100%
  `,
  Close: styled.img`
    cursor: pointer;
    padding-right: 1rem;
  `,
  Header: styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 2vh 0;
  `,
  H1: styled.h1`
    margin: 0;
    font-size: 3vh;
  `,
  H2: styled.h2`
    margin: 1vh 0;
    font-size: 2vh;
  `,
  Body: styled.div`
    display: flex;
    flex-direction: column;
    padding: 0 3vh;
  `,
  Note: styled.div`
    font-size: 1.5vh;
  `,
  Description: styled.div`
    font-size: 1.6vh;
    margin: 2vh 0;
  `,
  Coffee: styled.img`
    width: 50vw;
    max-width: 300px;
  `
};