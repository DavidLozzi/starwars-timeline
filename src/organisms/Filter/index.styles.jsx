import React from 'react';
import styled, { css } from 'styled-components';

export const Wrapper = styled.div`
  z-index: 100;
  background-color: rgb(${({ theme }) => theme.palette.black});
  /* Hangs off the bottom of MainMenu's button row (which is position: relative)
     rather than a fixed offset from the top of the page -- the header is two
     rows tall on mobile, where the buttons are on their own line. */
  position: absolute;
  top: 100%;
  right: 0rem;
  width: 100vw;
  max-width: 30rem;
  border-radius: 0px 0px 0px 10px;
  color: #fff;
`;

/* An h2, not an h1: the page's only h1 is the timeline's title. The panel
   renders inside the header, so this heading also used to inherit the wordmark
   face from theme.elements.header until those rules were scoped to > h1. */
export const H1 = styled.h2`
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
