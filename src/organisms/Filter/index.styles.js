import React from 'react';
import styled, { css } from 'styled-components';

export const Wrapper = styled.div`
  z-index: 100;
  background-color: #fff;
  position: fixed;
  top: 3.5rem;
  right: 0rem;
  width: 100vw;
  max-width: 30rem;
`;

export const H1 = styled.h1`
  font-size: 1rem;
  margin: 1rem;
`;

export const Icon = styled.img`
  height: 1rem;
  margin-right: .3rem;
`;

export const FormRow = styled(({ justifyFlexEnd, ...rest }) => <div {...rest} />)`
  display: flex;
  margin: 1rem;
  justify-content: ${({ justifyFlexEnd }) => justifyFlexEnd ? 'flex-end' : 'space-between'};
  font-size: .9rem;
`;

export const FormLabel = styled(({ note, ...rest }) => <label {...rest} />)`
  display: flex;
  align-items: center;
  ${({ note }) => note && css`font-size: .8rem`}
`;

export const FormValue = styled.div`
  display: flex;
`;

export const FormButton = styled(({ invert, ...rest }) => <button {...rest} />)`
  ${({ theme, invert }) => theme.elements.form.button(theme, invert)};
`;