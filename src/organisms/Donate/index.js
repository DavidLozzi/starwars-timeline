import React from 'react';
import Modal from '../../molecules/modal';
import CloseIcon from '../../assets/close.svg';

import Styled from './index.styles';

const Donate = ({ onClose }) => {

  return (
    <Modal onClickBg={onClose}>
      <Styled.Wrapper>
        <Styled.Header>
          <Styled.Body>
            <Styled.H1>No ads, please donate</Styled.H1>
          </Styled.Body>
          <Styled.Close src={CloseIcon} onClick={onClose} />
        </Styled.Header>
        <Styled.Body>
          <Styled.Description>
            <Styled.H2>No Ads</Styled.H2>
            <p>
              As you&apos;ll notice, there are <strong>no ads</strong> on this site! I really hope and
              intend to keep it that way. I do have plans to continue building on this, which may require
              more costly hosting. Your donation will go a long way in saying &quot;Thank You&quot; and helping
              support the timeline!
            </p>
            <Styled.H2>Like what you see?</Styled.H2>
            <p>
              A great way to say thank you is to share the site with your friends, and donate! You can
              buy me a Bantha milk below!
            </p>
            <p>
              <a href="https://www.buymeacoffee.com/davidlozzi" target="_blank" rel="noreferrer">
                <Styled.Coffee src="https://img.buymeacoffee.com/button-api/?text=Buy me a bantha milk&emoji=&slug=davidlozzi&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=337CBA" alt="Buy Me A Coffee" />
              </a>
            </p>
          </Styled.Description>
        </Styled.Body>
      </Styled.Wrapper>
    </Modal>
  );
};

export default Donate;
