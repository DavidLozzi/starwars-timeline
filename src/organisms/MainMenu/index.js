import React from 'react';
import menuSvg from '../../assets/menu.svg';
import Styled from './index.styles';

const MainMenu = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Styled.MenuButton onClick={() => setIsOpen(!isOpen)}><img src={menuSvg} /></Styled.MenuButton>
      {isOpen && <Styled.MenuWrapper>
        <Styled.Menu>
          <Styled.MenuItem><a href="https://github.com/DavidLozzi/starwars-timeline/issues" target="_blank">Request an Update</a></Styled.MenuItem>
          <Styled.MenuItem><a href="https://twitter.com/UltStarWarsTime" target="_blank">@UltStarWarsTime</a></Styled.MenuItem>
          <Styled.MenuItem note>
            Created By: <a href="https://twitter.com/davidlozzi" target="_blank">@DavidLozzi</a> / <a href="https://twitter.com/aurebeshfiles" target="_blank">@AurebeshFiles</a></Styled.MenuItem>
        </Styled.Menu>
      </Styled.MenuWrapper>
      }
    </>
  );
};

export default MainMenu;