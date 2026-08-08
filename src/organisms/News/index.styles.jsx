import styled from 'styled-components';

export const Wrapper = styled.div`
  /* theme.elements.modal sets an unwrapped color value, so set ours explicitly */
  color: rgb(${({ theme }) => theme.palette.black});
  padding: 0 2rem;
`;

export const H1 = styled.h1`
  font-size: 1.2rem;
  margin: 1.5rem 0 1rem;
`;

export const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const Item = styled.li`
  padding: 1rem 0;
  border-top: 1px solid rgb(${({ theme }) => theme.palette.lightergray});
`;

export const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

/* The icon + name + hex pairing is the shared visual language across every
   AurebeshFiles app - the color comes from the feed, not from our theme. */
export const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  font-size: .75rem;
  font-weight: bold;
  text-transform: uppercase;
`;

export const Date = styled.span`
  font-size: .75rem;
  color: rgb(${({ theme }) => theme.palette.gray});
`;

export const Title = styled.h2`
  font-size: 1rem;
  margin: .5rem 0;
`;

export const Message = styled.div`
  font-size: .9rem;
  line-height: 1.4;

  a {
    color: rgb(${({ theme }) => theme.palette.primary});
  }
`;

export const ReadMore = styled.a`
  display: inline-block;
  margin-top: .5rem;
  font-size: .85rem;
  color: rgb(${({ theme }) => theme.palette.primary});
`;

export const Footer = styled.div`
  padding: 1rem 0 .5rem;
  border-top: 1px solid rgb(${({ theme }) => theme.palette.lightergray});
  font-size: .85rem;

  a {
    color: rgb(${({ theme }) => theme.palette.primary});
  }
`;
