import React from 'react';
import styled from 'styled-components';


export default {
  Wrapper: styled.div`
    ${({ theme }) => theme.elements.modalWrapper};
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0rem;
    left: 0rem;
    justify-content: center;
    align-items: center;
    display: flex;
    z-index: 20;
  `,
  Modal: styled.div`
    ${({ theme }) => theme.elements.modal};
    width: 80vw;
    min-height: 50vh;
    max-height: 80vh;
    border-radius: 5vw;
    padding-bottom: 3vw;
  `
};