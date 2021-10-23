import React from 'react';
import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  z-index: 100;
`;

export const MenuButton = styled.button`
  padding: .75rem;
  cursor: pointer;
  border: 0;
  background: none;
`;

export const MenuWrapper = styled.div`
  position: fixed;
  top: 3.5rem;
  right: 0rem;
  width: 50vw;
  max-width: 20rem;
`;

export const Menu = styled.ul`
  ${({ theme }) => theme.elements.menu.ul};
  width: 100%;
  list-style: none;
  padding: 0;
`;

export const MenuItem = styled(({ note, ...rest }) => <li {...rest} />)`
  ${({ theme }) => theme.elements.menu.li};
  ${({ note }) => note && 'font-size: .8rem;'}
  padding: .5rem;
`;
