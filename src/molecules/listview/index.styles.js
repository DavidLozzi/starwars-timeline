import styled from 'styled-components';

export const Wrapper = styled.div`

`;

export const ListItem = styled.button`
  border: 0;
  background: transparent;
  width: 100%;
  height: 1.6rem;
  font-size: .8rem;
  display: block;
  padding: 0;
  text-align: left;
  cursor: pointer;
  text-decoration: underline;

  :hover {
    color: rgb(${({ theme }) => theme.palette.primary});

  }
`;