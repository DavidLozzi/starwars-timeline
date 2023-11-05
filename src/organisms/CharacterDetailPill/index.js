import React from 'react';

import * as HomeStyled from '../../pages/Home/index.styles';
import * as Styled from './index.styles';

const CharacterDetailPill = ({ character, currentYear, currentCharacter, onPillPress }) => {
  const startYear = character.birthYear || character.startYear;
  let imageUrl = character.imageUrl || '/images/starwars.jpg';
  const endYearImage = character?.imageYears ? character.imageYears.sort((a, b) => a.endYear < b.endYear ? 1 : -1)[0] : null;
  if (currentYear && character.imageYears?.some(y => y.startYear <= currentYear.year && y.endYear >= currentYear.year)) {
    imageUrl = character.imageYears.find(y => y.startYear <= currentYear.year && y.endYear >= currentYear.year).imageUrl;
  } else if (endYearImage && endYearImage.endYear <= currentYear.year) {
    imageUrl = character.imageYears.sort((a, b) => a.endYear < b.endYear ? 1 : -1)[0].imageUrl;
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
        {currentYear?.year >= startYear && <HomeStyled.AltTitle>Age: {currentYear.year - startYear}{character.startYearUnknown ? '?' : ''}</HomeStyled.AltTitle>}
      </Styled.CharacterDetail>
    </HomeStyled.Sticky>
  </Styled.CharacterPill>;
};

export default React.memo(CharacterDetailPill);