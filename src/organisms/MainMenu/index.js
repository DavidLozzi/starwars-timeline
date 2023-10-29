import React, { useEffect } from 'react';
import analytics, { ACTIONS } from '../../analytics';
import { ReactComponent as MenuImg } from '../../assets/menu.svg';
import { ReactComponent as SearchImg } from '../../assets/search.svg';
import { ReactComponent as HelpImg } from '../../assets/help.svg';
import Filter from '../Filter';
import ThemeSwitcher from '../ThemeSwitcher';

import * as Styled from './index.styles';
import Modal from '../../molecules/modal';
import HowTo from '../HowTo';
import FilterCharacterDropdown from '../Filter/Character';
import { useAppContext } from '../../AppContext';
import { useTheme } from 'styled-components';

const MENUS = {
  MAIN: 'main',
  DONATE: 'donate',
  FILTER: 'filter'
};

const MainMenu = () => {
  const theme = useTheme();
  const { addFilter } = useAppContext();
  const [showHowTo, setShowHowTo] = React.useState(false);
  const [selectedCharacter, setSelectedCharacter] = React.useState(null);

  const [openedMenu, setOpenedMenu] = React.useState('');

  const openDonate = React.useCallback((e) => {
    analytics.event(ACTIONS.MENU_ITEM, null, 'Support the Timeline');
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

  const toggleHowTo = React.useCallback(() => {
    setShowHowTo(!showHowTo);
    analytics.event(ACTIONS.OPEN_HOWTO);
  });

  const closeMenus = () => {
    setOpenedMenu('');
  };

  const applyCharacterFilter = (character) => {
    setSelectedCharacter(character);
    addFilter('character', character.text);
    analytics.event(ACTIONS.APPLY_FILTER, 'header', character.text);
  };

  return (
    <Styled.Wrapper>
      {window.innerWidth > theme.windowWidths.lg && <FilterCharacterDropdown
        label="Find by character"
        setSelectedCharacter={applyCharacterFilter}
        selectedCharacter={selectedCharacter}
        style="bigger"
      />}
      <Styled.MenuButton onClick={toggleFilter}><SearchImg alt="search the timeline" /></Styled.MenuButton>
      {openedMenu === MENUS.FILTER &&
        <Filter onClose={() => setOpenedMenu('')} />
      }
      <Styled.MenuButton onClick={toggleMenu}><MenuImg alt="open menu" /></Styled.MenuButton>
      {openedMenu === MENUS.MAIN &&
        <Styled.MenuWrapper>
          <Styled.Menu>
            {/* <Styled.MenuItem hr><ThemeSwitcher /></Styled.MenuItem> */}
            <Styled.MenuItem><a href="https://github.com/DavidLozzi/starwars-timeline/issues" target="_blank" rel="noreferrer">Request an Update</a></Styled.MenuItem>
            <Styled.MenuItem><a href="https://starwars-guide/support-aurebesh-files.html" target="_blank" onClick={openDonate} rel="noreferrer">Support the Timeline</a></Styled.MenuItem>
            <Styled.MenuItem><a href="https://wordle.starwars.guide" target="_blank" rel="noreferrer">Play SWordle - Wordle for Star Wars</a></Styled.MenuItem>
            <Styled.MenuItem><a href="https://twitter.com/UltStarWarsTime" target="_blank" rel="noreferrer">@UltStarWarsTime</a></Styled.MenuItem>
            <Styled.MenuItem note>
              Created By: <a href="https://twitter.com/aurebeshfiles" target="_blank" rel="noreferrer">@AurebeshFiles</a></Styled.MenuItem>
          </Styled.Menu>
        </Styled.MenuWrapper>
      }
      {openedMenu === MENUS.DONATE &&
        <Donate onClose={closeMenus} />}
      <Styled.MenuButton onClick={toggleHowTo}><HelpImg alt="show the how to window" style={{ width: '22px' }} /></Styled.MenuButton>
      {showHowTo && <Modal onClickBg={() => setShowHowTo(false)}><HowTo /></Modal>}
    </Styled.Wrapper>
  );
};

export default MainMenu;