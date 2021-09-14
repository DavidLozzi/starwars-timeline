import React from 'react';
import Styled from './index.styles';

const CharacterDetail = ({ character }) => {
  const convertYear = (year) => {
    if (year <= 0) return `${year * -1} BBY`;
    if (year > 0) return `${year} ABY`;
    return 'none';
  };

  return <Styled.Wrapper>
    <Styled.Header>
      {character.imageUrl && <Styled.Image src={character.imageUrl} alt={character.title} />}
      <Styled.Body>
        <Styled.H1>{character.title}</Styled.H1>
        <Styled.H2>{character.altTitle}</Styled.H2>
        <Styled.Note>Born {convertYear(character.startYear)}, Died {convertYear(character.endYear)} ({character.endYear - character.startYear} years old)</Styled.Note>
      </Styled.Body>
    </Styled.Header>
    <Styled.Body>
      {character.description && <Styled.Description>{character.description}</Styled.Description>}
      {character.metadata && character.metadata.length > 0 && 
        <Styled.MetadataWrapper>
          {character.metadata.map(m => <Styled.Metadata key={m.name}>
            <Styled.MetadataLabel>{m.name}</Styled.MetadataLabel>
            <Styled.MetadataValue>{m.value}</Styled.MetadataValue>
          </Styled.Metadata>)}
        </Styled.MetadataWrapper>
      }
      {character.wookiepedia && <Styled.Wookiepedia href={character.wookiepedia} target="_blank">Learn more on Wookiepedia.com</Styled.Wookiepedia>}
    </Styled.Body>
  </Styled.Wrapper>;
}
;

export default CharacterDetail;