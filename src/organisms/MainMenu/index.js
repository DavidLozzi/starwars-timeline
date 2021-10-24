import React from 'react';
import analytics, { ACTIONS } from '../../analytics';
import menuSvg from '../../assets/menu.svg';
import searchSvg from '../../assets/search.svg';
import Donate from '../Donate';
import Filter from '../Filter';
import ThemeSwitcher from '../ThemeSwitcher';

import * as Styled from './index.styles';

const MainMenu = () => {
  const MENUS = {
    MAIN: 'main',
    DONATE: 'donate',
    FILTER: 'filter'
  };
  const [openedMenu, setOpenedMenu] = React.useState('');

  const openDonate = React.useCallback((e) => {
    e.stopPropagation();
    setOpenedMenu(MENUS.DONATE);
    analytics.event(ACTIONS.MENU_ITEM,null,'Donate');
  });

  const toggleMenu = React.useCallback(() => {
    if (openedMenu === MENUS.MAIN) {
      closeMenus();
    } else {
      setOpenedMenu(MENUS.MAIN);
    }
    analytics.event(ACTIONS.OPEN_MENU);
  });

  const toggleFilter = React.useCallback(() => {
    if (openedMenu === MENUS.FILTER) {
      closeMenus();
    } else {
      setOpenedMenu(MENUS.FILTER);
    }
    analytics.event(ACTIONS.OPEN_FILTER);
  });

  const closeMenus = () => {
    setOpenedMenu('');
  };

  return (
    <Styled.Wrapper>
      <Styled.MenuButton onClick={toggleFilter}><img src={searchSvg} alt="open filter menu" /></Styled.MenuButton>
      {openedMenu === MENUS.FILTER &&
        <Filter onClose={() => setOpenedMenu('') } />
      }
      <Styled.MenuButton onClick={toggleMenu}><img src={menuSvg} alt="Open the menu"/></Styled.MenuButton>
      {openedMenu === MENUS.MAIN &&
        <Styled.MenuWrapper>
          <Styled.Menu>
            <Styled.MenuItem hr><ThemeSwitcher /></Styled.MenuItem>
            <Styled.MenuItem><a href="https://github.com/DavidLozzi/starwars-timeline/issues" target="_blank" rel="noreferrer">Request an Update</a></Styled.MenuItem>
            <Styled.MenuItem><a href="#" onClick={openDonate}>No Ads - Donate</a></Styled.MenuItem>
            <Styled.MenuItem><a href="https://twitter.com/UltStarWarsTime" target="_blank" rel="noreferrer">@UltStarWarsTime</a></Styled.MenuItem>
            <Styled.MenuItem note>
            Created By: <a href="https://twitter.com/aurebeshfiles" target="_blank" rel="noreferrer">@AurebeshFiles</a></Styled.MenuItem>
          </Styled.Menu>
        </Styled.MenuWrapper>
      }
      {openedMenu === MENUS.DONATE &&
        <Donate onClose={closeMenus} />}
    </Styled.Wrapper>
  );
};

export default MainMenu;