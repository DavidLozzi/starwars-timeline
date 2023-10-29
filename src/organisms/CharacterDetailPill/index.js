import React from 'react';

import * as HomeStyled from '../../pages/Home/index.styles';
import * as Styled from './index.styles';

const CharacterDetailPill = ({ character, currentYear, currentCharacter, onPillPress }) => {
  const startYear = character.birthYear || character.startYear;
  let imageUrl = character.imageUrl || '/images/starwars.jpg';
  if (currentYear && character.imageYears?.some(y => y.startYear <= currentYear.year && y.endYear >= currentYear.year)) {
    imageUrl = character.imageYears.filter(y => y.startYear <= currentYear.year && y.endYear >= currentYear.year)[0].imageUrl;
  }
  const isActive = currentYear?.year >= startYear && (currentYear.year <= character.endYear || character.endYearUnknown);
  return <Styled.CharacterPill
    character={character}
  >
    <HomeStyled.Sticky>
      <Styled.CharacterDetail
        onClick={() => onPillPress(character)}
        isActive={isActive}
        isCurrent={currentCharacter === character.title}
      >
        <Styled.CharacterImage src={imageUrl} alt={character.title} isActive={isActive} />
        {character.title}
        {character.altTitle && <HomeStyled.AltTitle>{character.altTitle}</HomeStyled.AltTitle>}
        {currentYear?.year >= startYear && <HomeStyled.AltTitle>{currentYear.year - startYear} yo{character.startYearUnknown ? '?' : ''}</HomeStyled.AltTitle>}
      </Styled.CharacterDetail>
    </HomeStyled.Sticky>
  </Styled.CharacterPill>;
};

export default React.memo(CharacterDetailPill);