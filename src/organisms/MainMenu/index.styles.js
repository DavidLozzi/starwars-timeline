import styled from "styled-components";

export default {
  MenuButton: styled.div`
    padding: 1rem
  `,
  MenuWrapper: styled.div`
    position: fixed;
    top: 4rem;
    right: 0rem;
    width: 50vw;
  `,
  Menu: styled.ul`
    ${({ theme }) => theme.elements.menu.ul};
    width: 100%;
    list-style: none;
    padding: 0;
  `,
  MenuItem: styled(({ note, ...rest }) => <li {...rest} />)`
    ${({ theme }) => theme.elements.menu.li};
    ${({ note }) => note && `font-size: .8rem;`}
    padding: 1rem;
  `
};