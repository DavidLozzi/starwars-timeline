import React from 'react';
import { Link } from 'react-router-dom';
import analytics, { ACTIONS } from '../../analytics';
import MenuImg from '../../assets/menu.svg?react';
import SearchImg from '../../assets/search.svg?react';
import HelpImg from '../../assets/help.svg?react';
import AnnouncementImg from '../../assets/announcement.svg?react';
import Filter from '../Filter';
import News from '../News';

import * as Styled from './index.styles';
import FilterCharacterDropdown from '../Filter/Character';
import { useAppContext } from '../../AppContext';
import { useTheme } from 'styled-components';
import useNewsFeed from '../../hooks/useNewsFeed';
import { getLastNewsDate, setLastNewsDate } from '../../utils';
import site from '../../site';

const MENUS = {
  MAIN: 'main',
  FILTER: 'filter'
};

const MainMenu = ({ onShowOnboardingGuide }) => {
  const theme = useTheme();
  const { addFilter } = useAppContext();
  const [selectedCharacter, setSelectedCharacter] = React.useState(null);

  const [openedMenu, setOpenedMenu] = React.useState('');

  // News lives in a modal, not one of the anchored panels, so it gets its own flag
  const { items: newsItems, products: newsProducts } = useNewsFeed();
  const [showNews, setShowNews] = React.useState(false);
  const [lastReadNews, setLastReadNews] = React.useState(() => getLastNewsDate());

  // items arrive newest first, so the first one is what "read everything" means
  const newestNewsDate = newsItems[0]?.date;
  const hasUnreadNews = !!newestNewsDate && (!lastReadNews || newestNewsDate > lastReadNews);

  const openNews = React.useCallback(() => {
    closeMenus();
    setShowNews(true);
    if (newestNewsDate) {
      setLastNewsDate(newestNewsDate);
      setLastReadNews(newestNewsDate);
    }
    analytics.event(ACTIONS.OPEN_NEWS);
  }, [newestNewsDate]);

  const openDonate = React.useCallback((e) => {
    analytics.event(ACTIONS.MENU_ITEM, null, site.menu.supportLabel);
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
            {site.features.hyperspace &&
              <Styled.MenuItem><Link to="/hyperspace">Hyperspace Timeline</Link></Styled.MenuItem>
            }
            {site.menu.issuesUrl &&
              <Styled.MenuItem><a href={site.menu.issuesUrl} target="_blank" rel="noreferrer">Request an Update</a></Styled.MenuItem>
            }
            {site.menu.supportUrl && site.menu.supportLabel &&
              <Styled.MenuItem><a href={site.menu.supportUrl} target="_blank" onClick={openDonate} rel="noreferrer">{site.menu.supportLabel}</a></Styled.MenuItem>
            }
            {site.menu.gamesUrl && site.menu.gamesLabel &&
              <Styled.MenuItem><a href={site.menu.gamesUrl} target="_blank" rel="noreferrer">{site.menu.gamesLabel}</a></Styled.MenuItem>
            }
            {site.social.creatorUrl && site.social.creatorLabel &&
              <Styled.MenuItem note>
                Created By: <a href={site.social.creatorUrl} target="_blank" rel="noreferrer">{site.social.creatorLabel}</a></Styled.MenuItem>
            }
          </Styled.Menu>
        </Styled.MenuWrapper>
      }
      <Styled.MenuButton onClick={openNews} aria-label="Show news and announcements">
        <Styled.IconBadge hasBadge={hasUnreadNews}>
          <AnnouncementImg />
        </Styled.IconBadge>
      </Styled.MenuButton>
      <News
        isOpen={showNews}
        onClose={() => setShowNews(false)}
        items={newsItems}
        products={newsProducts}
      />
      {(onShowOnboardingGuide || site.menu.helpUrl) &&
        <Styled.MenuButton
          onClick={onShowOnboardingGuide || (() => window.open(site.menu.helpUrl, '_blank'))}
          aria-label="Show help and onboarding guide"
        >
          <HelpImg alt="show the how to window" style={{ width: '22px' }} />
        </Styled.MenuButton>
      }
    </Styled.Wrapper>
  );
};

export default MainMenu;
