import React from 'react';
import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  z-index: 100;
  align-items: center;
  /* The anchor for the menu and filter panels, which hang off the bottom of
     this row (top: 100%) instead of a fixed offset from the top of the page --
     the header is two rows tall on mobile and one on desktop. */
  position: relative;
  /* Mobile: this row is the header's second line, so it owns the full width --
     the buttons stay grouped at the right edge rather than spreading across it. */
  justify-content: flex-end;
`;

export const MenuButton = styled.button`
  /* Tighter on mobile, where this row is the header's second line and both rows
     have to stay inside theme.layout.topMargin. */
  padding: .5rem;
  ${({ theme }) => theme.breakpoints.md} {
    padding: .75rem;
  }
  cursor: pointer;
  border: 0;
  background: none;
  color: ${({ theme }) => `rgb(${theme.palette.white})`};
`;

export const IconBadge = styled(({ hasBadge, ...rest }) => <span {...rest} />)`
  position: relative;
  display: flex;

  ${({ hasBadge, theme }) => hasBadge && `
    ::after {
      content: '';
      position: absolute;
      top: -2px;
      right: -2px;
      width: .5rem;
      height: .5rem;
      border-radius: 50%;
      background-color: rgb(${theme.palette.secondary});
    }
  `}
`;

export const MenuLink = styled.a`
  padding: .75rem;
  color: ${({ theme }) => `rgb(${theme.palette.white})`};
`;

/* A menu row that acts rather than navigates (News opens a modal). Styled to
   match the anchors the theme's menu block draws, so the row reads the same
   whether it is a link or a button. */
export const MenuAction = styled.button`
  display: flex;
  align-items: center;
  gap: .4rem;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  text-align: left;
  cursor: pointer;
  color: inherit;
  /* A button carries no underline of its own; the rest of the menu is anchors,
     so it has to draw one to sit in the same list. The dot is a flex sibling,
     so the rule lands on the label only. */
  text-decoration: underline;

  &:hover {
    color: rgb(${({ theme }) => theme.palette.secondary});
  }
`;

/* The same unread mark the menu button carries, inline after the News label.
   Its color comes from the theme's menu block -- the header badge's yellow
   disappears against the Jedi menu's near-white panel. */
export const Dot = styled.span`
  flex-shrink: 0;
  width: .5rem;
  height: .5rem;
  border-radius: 50%;
  background-color: rgb(${({ theme }) => theme.elements.menu.badge});
`;

export const MenuWrapper = styled.div`
  /* Anchored to the button row rather than a fixed 2.5rem from the top: the
     header is taller on mobile, where the buttons are on their own line. */
  position: absolute;
  top: 100%;
  right: 0rem;
  width: 100vw;
  max-width: 20rem;
  `;

/* Same panel as the search dialog: solid dark surface, one rounded inner
   corner, .9rem rows. See src/organisms/Filter/index.styles.jsx. */
export const Menu = styled.ul`
  ${({ theme }) => theme.elements.menu.ul};
  border-radius: 0px 0px 0px 10px;
  width: 100%;
  list-style: none;
  margin: 0;
  padding: .5rem 0;
  font-size: .9rem;
`;

export const MenuItem = styled(({ note, hr, ...rest }) => <li {...rest} />)`
  ${({ theme }) => theme.elements.menu.li};
  ${({ note }) => note && 'font-size: .8rem;'}
  padding: .5rem 1rem;
  ${({ hr, theme }) => hr && `border-bottom: rgb(${theme.palette.lightergray}) solid 1px;`}
`;
