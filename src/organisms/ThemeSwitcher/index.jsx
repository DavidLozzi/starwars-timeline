import React from 'react';
import { useTheme } from 'styled-components';
import themeList from '@site/themes';
import { useAppContext } from '../../AppContext';
import * as Styled from './index.styles';

const ThemeSwitcher = () => {
  const theme = useTheme();
  const { setTheme } = useAppContext();

  // A pack with fewer than two themes has nothing to switch between.
  if (themeList.themes.length < 2) return null;

  return (
    <Styled.Wrapper>
      <Styled.Title>Theme:</Styled.Title>
      {themeList.themes.map(t => (
        <Styled.ImageButton
          key={t.id}
          src={t.icon}
          alt={`Switch to ${t.label} Theme`}
          onClick={() => setTheme(t.id)}
          isActive={theme.name === t.id}
        />
      ))}
      <Styled.Note>(beta)</Styled.Note>
    </Styled.Wrapper>
  );
};

export default ThemeSwitcher;