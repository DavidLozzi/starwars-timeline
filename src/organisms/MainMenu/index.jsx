import React from 'react';
import analytics, { ACTIONS } from '../../analytics';
import MenuImg from '../../assets/menu.svg?react';
import SearchImg from '../../assets/search.svg?react';
import HelpImg from '../../assets/help.svg?react';
import BellImg from '../../assets/bell.svg?react';
import Filter from '../Filter';
import News from '../News';

import * as Styled from './index.styles';
import FilterCharacterDropdown from '../Filter/Character';
import { useAppContext } from '../../AppContext';
import { useTheme } from 'styled-components';
import useNewsFeed from '../../hooks/useNewsFeed';
import { getLastNewsDate, setLastNewsDate } from '../../utils';

const MENUS = {
  MAIN: 'main',
  FILTER: 'filter'
};

const MainMenu = ({ onShowOnboardingGuide }) => {
  const theme = useTheme();
  const { addFilter } = useAppContext();
  const [selectedCharacter, setSelectedCharacter] = React.useState(null);

  const [openedMenu, setOpenedMenu] = React.useState('');

  // News opens a modal, not one of the anchored panels, so it gets its own flag
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

  const openCredit = React.useCallback((e) => {
    analytics.event(ACTIONS.MENU_ITEM, null, 'Created By');
    analytics.selectContent('credit');
  });

  const openFeedback = React.useCallback((e) => {
    analytics.event(ACTIONS.MENU_ITEM, null, 'Share Feedback');
  });

  const openAbout = React.useCallback((e) => {
    analytics.event(ACTIONS.MENU_ITEM, null, 'About');
    analytics.selectContent('hub_link');
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
      {/* News gets its own header button (the bell Clone Defense uses) rather than a
          row inside the menu: with it in the menu, 1.5% of users ever opened the menu
          and fewer reached news. No feed, no button -- same rule as Clone Defense. */}
      {newsItems.length > 0 &&
        <Styled.MenuButton onClick={openNews} aria-label={hasUnreadNews ? 'News (unread)' : 'News'}>
          <Styled.IconBadge hasBadge={hasUnreadNews}>
            <BellImg alt="open news" />
          </Styled.IconBadge>
        </Styled.MenuButton>
      }
      <Styled.MenuButton onClick={toggleMenu} aria-label="Open menu">
        <MenuImg alt="open menu" />
      </Styled.MenuButton>
      {openedMenu === MENUS.MAIN &&
        <Styled.MenuWrapper>
          <Styled.Menu>
            {/* <Styled.MenuItem hr><ThemeSwitcher /></Styled.MenuItem> */}
            {/* The brand address the hub publishes on /about/, not a personal one. */}
            <Styled.MenuItem>
              <a href="mailto:aurebeshfiles@gmail.com?subject=Ultimate%20Star%20Wars%20Timeline%20feedback" onClick={openFeedback}>Share Feedback</a>
            </Styled.MenuItem>
            {/* Trailing slash: every top-level hub page canonicalises to one and the
                bare form 301s. No UTM -- the credit link below is the documented
                exception to the hub's no-UTMs rule, not every outbound link. */}
            <Styled.MenuItem>
              <a href="https://starwars.guide/star-wars-timeline/" target="_blank" onClick={openAbout} rel="noreferrer">About</a>
            </Styled.MenuItem>
            {/* The hub credit every app and game carries (starwars-guide/CLAUDE.md). The app is
                what gets shared and bookmarked, not its landing page, so this is the only path
                from the timeline back to the brand — it points at the hub, never at a social
                handle. UTM-tagged because it leaves the app; internal hub links never are. */}
            <Styled.MenuItem note>
              Created By: <a href="https://starwars.guide/?utm_source=timeline&utm_medium=app&utm_campaign=credit" target="_blank" onClick={openCredit} rel="noreferrer">AurebeshFiles</a></Styled.MenuItem>
          </Styled.Menu>
        </Styled.MenuWrapper>
      }
      <News
        isOpen={showNews}
        onClose={() => setShowNews(false)}
        items={newsItems}
        products={newsProducts}
      />
      <Styled.MenuButton
        onClick={onShowOnboardingGuide || (() => {
          analytics.selectContent('hub_link');
          window.open('https://starwars.guide/star-wars-timeline/', '_blank');
        })}
        aria-label="Show help and onboarding guide"
      >
        <HelpImg alt="show the how to window" style={{ width: '22px' }} />
      </Styled.MenuButton>
    </Styled.Wrapper>
  );
};

export default MainMenu;
