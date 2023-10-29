import styled, { css } from 'styled-components';

export const Wrapper = styled.div`
  position: relative;
  ${({ $style }) => $style === 'bigger' && css`
    ${Input} {
      border-radius: .5rem;
      padding: .25rem;
      background-color: ${({ theme }) => `rgb(${theme.palette.black})`};
      border-color: ${({ theme }) => `rgb(${theme.palette.secondary})`};
    }
    ${Select} {
      height: 1.5rem;
      font-size: 1rem;
      align-items: center;
      color: ${({ theme }) => `rgb(${theme.palette.white})`};
    }
    ${SelectButtons} {
      height: 1.25rem;
      color: ${({ theme }) => `rgb(${theme.palette.white})`};
    }
    ${OptionWrapper} {
      top: 1rem;
      padding: .5rem;
      background-color: ${({ theme }) => `rgb(${theme.palette.black})`};
      max-height: 50vh;
    }
    ${Option} {
      color: ${({ theme }) => `rgb(${theme.palette.white})`};
      font-size: 1rem;
    }
  `}
`;

export const Input = styled.div`
  display: flex;
  border: 1px solid rgb(${({ theme }) => theme.palette.gray});
  border-radius: .2rem;
  width: 13rem;
  background-color: #fff;
`;
export const Select = styled.button`
  border: 0;
  height: 1.2rem;
  background: none;
  text-align: left;
  display: flex;
  width: 100%;
  cursor: pointer;
  color: rgb(${({ theme }) => theme.palette.primary});
  overflow: hidden;
`;

export const SelectButtons = styled.div`
  display: flex;
  height: 1.2rem;
  cursor: pointer;
  height: 1rem;
  color: rgb(${({ theme }) => theme.palette.black});
`;

export const OptionWrapper = styled.ul`
  list-style: none;
  position: absolute;
  background-color: rgb(${({ theme }) => theme.palette.white});
  padding: 0;
  width: 12rem;
  max-height: 19.5rem;
  overflow-y: scroll;
  overflow-x: hidden;
  top: .5rem;
  border: 1px solid rgb(${({ theme }) => theme.palette.lightgray});
  border-radius: .2rem;
  z-index: 10;
`;

export const Option = styled.li`
  padding: .25rem .1rem;
  cursor: pointer;
  font-size: .75rem;
  color: #000;

  &:hover {
    background-color: rgb(${({ theme }) => theme.palette.lightergray});
  }
`;