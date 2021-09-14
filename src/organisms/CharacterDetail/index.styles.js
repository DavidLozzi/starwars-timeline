import React from 'react';
import styled from 'styled-components';

export default {
  Wrapper: styled.div`
    display: flex;
    width: 100%;
    justify-content: center;
    align-content: center;
    align-items: center;
    flex-direction: column;
  `,
  Header: styled.div`
    width: 100%;
    display: flex;
  `,
  Image: styled.img`
    width: 30vw;
    height: 30vw;
    border-radius: 50%;
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
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 2vh;
  `,
  Note: styled.div`
    font-size: 1.5vh;
  `,
  Description: styled.div`
    font-size: 1.6vh;
    padding: 2vh;
  `,
  MetadataWrapper: styled.div`
    font-size: 1.6vh;
    padding: 2vh;
    display: flex;
  `,
  Metadata: styled.div`
    min-width: 30%;
  `,
  MetadataLabel: styled.div`
    font-weight: bold;
  `,
  MetadataValue: styled.div`
  `,
  Wookiepedia: styled.a`
  `
};