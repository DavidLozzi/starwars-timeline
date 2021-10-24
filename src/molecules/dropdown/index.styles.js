import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  border: 1px solid rgb(${({ theme }) => theme.palette.gray});
  border-radius: .2rem;
  width: 12rem;
  justify-content: space-between;
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
`;

export const SelectButtons = styled.div`
  display: flex;
  height: 1.2rem;
  cursor: pointer;

  img {
    height: 1rem;
  }
`;

export const OptionWrapper = styled.ul`
  list-style: none;
  position: absolute;
  background-color: rgb(${({ theme }) => theme.palette.white});
  padding: 0;
  width: 12rem;
  max-height: 20rem;
  overflow-y: scroll;
  overflow-x: hidden;
  top: 3.4rem;
  border: 1px solid rgb(${({ theme }) => theme.palette.lightgray});
  border-radius: .2rem;
`;

export const Option = styled.li`
  padding: .25rem .1rem;
  cursor: pointer;
  font-size: .75rem;

  &:hover {
    background-color: rgb(${({ theme }) => theme.palette.lightergray});
  }
`;