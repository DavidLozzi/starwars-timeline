import React from 'react';
import styled from 'styled-components';

export default {
  Wrapper: styled.div`
    width: 100%;
  `,
  Close: styled.div`
    color: #fff;
  `,
  Header: styled.div`
    width: 100%;
    display: flex;
  `,
  Image: styled.img`
    width: 30vw;
    height: 30vw;
    border-radius: 50% 0;

    &:hover {
      border-radius: 0;
    }
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
    padding: 2vh;
  `,
  Note: styled.div`
    font-size: 1.5vh;
  `,
  Description: styled.div`
    font-size: 1.6vh;
    margin: 2vh 0;
  `,
  MetadataWrapper: styled.div`
    font-size: 1.6vh;
    display: flex;
    margin: 2vh 0;
  `,
  Metadata: styled.div`
    min-width: 33%;
  `,
  MetadataLabel: styled.div`
    font-weight: bold;
  `,
  MetadataValue: styled.div`
  `,
  Wookiepedia: styled.a`
    font-size: 1.4vh;
    display: inline-block;
  `
};