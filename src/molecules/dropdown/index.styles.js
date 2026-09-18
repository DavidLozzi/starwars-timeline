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
      font-size: 1rem;
      color: ${({ theme }) => `rgb(${theme.palette.white})`};
    }
    ${SelectButtons} {
      color: ${({ theme }) => `rgb(${theme.palette.white})`};
    }
    ${OptionWrapper} {
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
  align-items: center;
  /* The control's own padding: without it the label sat on the bottom border. */
  padding: .25rem .4rem;
  gap: .25rem;
  border: 1px solid rgb(${({ theme }) => theme.palette.gray});
  border-radius: .2rem;
  width: 13rem;
  background-color: #fff;
`;
export const Select = styled.button`
  border: 0;
  padding: 0;
  background: none;
  text-align: left;
  /* block, not flex: a long option has to ellipsize, and text-overflow needs a
     block box to apply to. */
  display: block;
  width: 100%;
  min-width: 0;
  cursor: pointer;
  font-size: .8rem;
  line-height: 1.3;
  color: rgb(${({ theme }) => theme.palette.primary});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const SelectButtons = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  cursor: pointer;
  color: rgb(${({ theme }) => theme.palette.black});

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

export const OptionWrapper = styled.ul`
  list-style: none;
  position: absolute;
  background-color: rgb(${({ theme }) => theme.palette.white});
  padding: 0;
  /* Matches the control it hangs from rather than a hardcoded 12rem. */
  width: 100%;
  max-height: 19.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  /* Below the control, not on top of it. */
  top: calc(100% + .15rem);
  border: 1px solid rgb(${({ theme }) => theme.palette.lightgray});
  border-radius: .2rem;
  z-index: 10;
`;

export const Option = styled.li`
  padding: .3rem .4rem;
  cursor: pointer;
  font-size: .75rem;
  color: #000;

  &:hover {
    background-color: rgb(${({ theme }) => theme.palette.lightergray});
  }
`;