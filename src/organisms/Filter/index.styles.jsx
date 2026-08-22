import React from 'react';
import styled, { css } from 'styled-components';

export const Wrapper = styled.div`
  z-index: 100;
  background-color: rgb(${({ theme }) => theme.palette.black});
  position: fixed;
  top: 3.5rem;
  right: 0rem;
  width: 100vw;
  max-width: 30rem;
  border-radius: 0px 0px 0px 10px;
  color: #fff;
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
  color: rgb(${({ theme }) => theme.palette.white});
  ${({ note }) => note && css`font-size: .8rem`}
`;

export const FormValue = styled.div`
  display: flex;
`;

export const FormButton = styled(({ invert, ...rest }) => <button {...rest} />)`
  ${({ theme, invert }) => theme.elements.form.button(theme, invert)};
`;

/* checkbox is visually hidden but stays focusable/labelable; the span is the track */
export const Toggle = styled.label`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  width: 13rem;

  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: relative;
    display: inline-block;
    width: 2.5rem;
    height: 1.25rem;
    border-radius: 1rem;
    background-color: rgb(${({ theme }) => theme.palette.gray});
    transition: background-color 200ms ease-in-out;
  }

  span::after {
    content: '';
    position: absolute;
    top: .15rem;
    left: .15rem;
    width: .95rem;
    height: .95rem;
    border-radius: 50%;
    background-color: rgb(${({ theme }) => theme.palette.white});
    transition: transform 200ms ease-in-out;
  }

  input:checked + span {
    background-color: rgb(${({ theme }) => theme.palette.primary});
  }

  input:checked + span::after {
    transform: translateX(1.25rem);
  }

  input:focus-visible + span {
    outline: 2px solid rgb(${({ theme }) => theme.palette.secondary});
    outline-offset: 2px;
  }
`;
