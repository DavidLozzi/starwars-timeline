import React from 'react';
import { useTheme } from 'styled-components';
import sithSvg from '../../assets/sith.svg';
import jediSvg from '../../assets/jedi.svg';
import { useAppContext } from '../../AppContext';
import * as Styled from './index.styles';

const ThemeSwitcher = () => {
  const theme = useTheme();
  const { setTheme } = useAppContext();

  return (
    <Styled.Wrapper>
      <Styled.Title>Theme:</Styled.Title>
      <Styled.ImageButton src={jediSvg} alt="Switch to Jedi Theme" onClick={() => setTheme('jedi')} isActive={theme.name === 'jedi'} />
      <Styled.ImageButton src={sithSvg} alt="Switch to Sith Theme" onClick={() => setTheme('sith')} isActive={theme.name === 'sith'} />
      <Styled.Note>(beta)</Styled.Note>
    </Styled.Wrapper>
  );
};

export default ThemeSwitcher;