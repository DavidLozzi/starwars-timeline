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
    z-index: 100;
  `,
  Modal: styled.div`
    ${({ theme }) => theme.elements.modal};
    width: 80vw;
    max-width: 60rem;
    min-height: 50vh;
    max-height: 40rem;
    border-radius: 5vw;
    padding-bottom: 3vw;
    overflow: scroll;
  `
};