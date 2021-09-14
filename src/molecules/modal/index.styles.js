import React from 'react';
import styled from 'styled-components';


export default {
  Wrapper: styled.div`
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0rem;
    left: 0rem;
    z-index: 100;
    background-color: rgba(100,100,100,0.8);
    justify-content: center;
    align-items: center;
    display: flex;
  `,
  Modal: styled.div`
    background-color: rgba(225,225,225,0.8);
    width: 80vw;
    height: 60vh;
    border-radius: 15vw;
  `
};