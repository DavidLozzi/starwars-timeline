import styled from 'styled-components';

export default {
  Wrapper: styled.div`
    ${({ theme }) => theme.elements.characterDetailModal};
    display: flex;
    flex-direction: column;
    padding: 2vh;
  `
  
};