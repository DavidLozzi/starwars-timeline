import React from 'react';
import { useTheme } from 'styled-components';

import * as HomeStyled from '../../pages/Home/index.styles';
import * as Styled from './index.styles';
import CharacterFocusPanel from '../CharacterFocusPanel';

const prefersReducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

// Runs `cb` after the browser has painted the current frame, so a style
// change made in it transitions from what was just painted.
const afterNextPaint = (cb) => {
  if (!window.requestAnimationFrame) {
    const t = setTimeout(cb, 16);
    return () => clearTimeout(t);
  }
  let inner;
  const outer = window.requestAnimationFrame(() => { inner = window.requestAnimationFrame(cb); });
  return () => {
    window.cancelAnimationFrame(outer);
    if (inner) window.cancelAnimationFrame(inner);
  };
};

// In focus mode this same pill grows to the right into the character panel
// (see CharacterFocusPanel): the portrait/name/age block stays where it is and
// the details fill the new space. On exit it collapses back the same way.
const CharacterDetailPill = ({
  character, currentYear, currentCharacter, onPillPress, isDimmed = false,
  isFocused = false, focusTop, plottedCount = 0, onSeeMore, onClose
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const hasOpened = React.useRef(false);

  React.useEffect(() => {
    if (isFocused) {
      hasOpened.current = true;
      setClosing(false);
      return afterNextPaint(() => setExpanded(true));
    }
    if (!hasOpened.current) return undefined;
    hasOpened.current = false;
    setExpanded(false);
    setClosing(true);
    const t = setTimeout(() => setClosing(false), prefersReducedMotion() ? 0 : theme.layout.elements.focus.expandMs);
    return () => clearTimeout(t);
  }, [isFocused]);

  const showDetails = isFocused || closing;

  const startYear = character.birthYear || character.startYear;
  let imageUrl = character.imageUrl || '/images/starwars.jpg';
  const endYearImage = character?.imageYears ? character.imageYears.sort((a, b) => a.endYear < b.endYear ? 1 : -1)[0] : null;
  if (currentYear && character.imageYears?.some(y => y.startYear <= currentYear.year && y.endYear >= currentYear.year)) {
    imageUrl = character.imageYears.find(y => y.startYear <= currentYear.year && y.endYear >= currentYear.year).imageUrl;
  } else if (endYearImage && endYearImage.endYear <= currentYear.year) {
    imageUrl = character.imageYears.sort((a, b) => a.endYear < b.endYear ? 1 : -1)[0].imageUrl;
  }
  // The expanded pill stays in full colour even when the scrolled-to year is
  // outside the character's life.
  const isActive = showDetails || (currentYear?.year >= startYear && (currentYear.year <= character.endYear || character.endYearUnknown));
  return <Styled.CharacterPill
    character={character}
    $dimmed={isDimmed}
    $focused={showDetails}
    $focusTop={showDetails ? focusTop : undefined}
    data-dimmed={isDimmed ? 'true' : undefined}
  >
    <HomeStyled.Sticky>
      <Styled.CharacterDetail
        onClick={isFocused ? undefined : () => onPillPress(character)}
        isActive={isActive}
        isCurrent={!showDetails && currentCharacter === character.title}
        $focused={isFocused}
      >
        <Styled.PillMain>
          <Styled.CharacterImage src={imageUrl} alt={character.title} isActive={isActive} />
          {character.title}
          {character.altTitle && <HomeStyled.AltTitle>{character.altTitle}</HomeStyled.AltTitle>}
          {currentYear?.year >= startYear && <HomeStyled.AltTitle>Age: {currentYear.year - startYear}{character.startYearUnknown ? '?' : ''}</HomeStyled.AltTitle>}
        </Styled.PillMain>
        {showDetails && <CharacterFocusPanel
          character={character}
          plottedCount={plottedCount}
          onSeeMore={onSeeMore}
          onClose={onClose}
          isOpen={isFocused}
          isExpanded={isFocused && expanded}
        />}
      </Styled.CharacterDetail>
    </HomeStyled.Sticky>
  </Styled.CharacterPill>;
};

export default React.memo(CharacterDetailPill);
