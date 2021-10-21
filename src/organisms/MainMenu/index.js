import React from 'react';
import menuSvg from '../../assets/menu.svg';
import twitterSvg from '../../assets/twitter.svg';
import Styled from './index.styles';
import Donate from '../Donate';
import analytics, { ACTIONS } from '../../analytics';

const MainMenu = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showDonate, setShowDonate] = React.useState(false);

  const openDonate = React.useCallback((e) => {
    e.stopPropagation();
    setShowDonate(true);
    setIsOpen(false);
    analytics.event(ACTIONS.MENU_ITEM,null,"Donate");
  });

  const openMenu = React.useCallback(() => {
    setIsOpen(!isOpen);
    analytics.event(ACTIONS.OPEN_MENU);
  });

  return (
    <>
      <Styled.MenuButton onClick={openMenu}><img src={menuSvg} alt="Open the menu"/></Styled.MenuButton>
      {isOpen && <Styled.MenuWrapper>
        <Styled.Menu>
          <Styled.MenuItem><a href="https://github.com/DavidLozzi/starwars-timeline/issues" target="_blank">Request an Update</a></Styled.MenuItem>
          <Styled.MenuItem><a href="#" onClick={openDonate}>No Ads - Donate</a></Styled.MenuItem>
          <Styled.MenuItem><a href="https://twitter.com/UltStarWarsTime" target="_blank">@UltStarWarsTime</a></Styled.MenuItem>
          <Styled.MenuItem note>
            Created By: <a href="https://twitter.com/aurebeshfiles" target="_blank">@AurebeshFiles</a></Styled.MenuItem>
        </Styled.Menu>
      </Styled.MenuWrapper>
      }
      {showDonate && <Donate onClose={() => setShowDonate(false)} />}
    </>
  );
};

export default MainMenu;