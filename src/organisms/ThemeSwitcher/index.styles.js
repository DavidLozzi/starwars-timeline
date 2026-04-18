import React from 'react';
import styled, { css } from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  svg {
    color: #f0f
  }
`;

export const Title = styled.div`
  margin-right: 1rem;
`;
export const ImageButton = styled(({ isActive, ...rest }) => <img {...rest} />)`
  height: 1.5rem;
  cursor: pointer;
  margin-right: 1rem;
  filter: grayscale(1);

  ${({ isActive }) => isActive && css`
    filter: grayscale(0);
  `}

  :hover {
    filter: grayscale(0);
  }
`;

export const Note = styled.div`
  font-size: .75rem;
  color: ${({ theme }) => `rgb(${theme.palette.primary})`};
`;