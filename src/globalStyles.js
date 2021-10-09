import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
  body {
    ${({ theme }) => theme.elements.body};
  }
  * {
    transition: all 150ms ease-in-out;
  }
`;