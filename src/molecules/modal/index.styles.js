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
  ModalWrapper: styled.div`
    display: flex;
    flex-direction: column;
  `,
  Modal: styled.div`
    ${({ theme }) => theme.elements.modal};
    width: 80vw;
    max-width: 60rem;
    min-height: 50vh;
    max-height: 40rem;
    border-radius: 5vh;
    padding-bottom: 3vw;
    overflow: scroll;
    position: relative;
  `,
  Close: styled.img`
    ${({ theme }) => theme.elements.modalClose};
    display: flex;
    cursor: pointer;
    width: 30px;
    align-self: flex-end;
    background-color: rgba(200,200,200,0.8);
    border-radius: 10px;
    padding: 3px;
  `
};