import React from 'react';
import Styled from './index.styles';
import parse from 'html-react-parser';

const CharacterDetail = ({ character, onClose, currentYear }) => {
  const [imageUrl, setImageUrl] = React.useState('/images/starwars.jpg');

  React.useEffect(() => {
    let _imageUrl = character.imageUrl;
    if (currentYear && character.imageYears?.some(y => y.startYear <= currentYear.year && y.endYear >= currentYear.year)) {
      _imageUrl = character.imageYears.filter(y => y.startYear <= currentYear.year && y.endYear >= currentYear.year)[0].imageUrl;
    }
    if (_imageUrl && _imageUrl !== imageUrl) {
      setImageUrl(_imageUrl);
    }
  }, [currentYear]);

  const convertYear = (year) => {
    if (year <= 0) return `${year * -1} BBY`;
    if (year > 0) return `${year} ABY`;
    return 'none';
  };

  return <Styled.Wrapper>
    <Styled.Header>
      <Styled.Image src={imageUrl} alt={character.title} />
      <Styled.Body>
        <Styled.H1>{character.title}</Styled.H1>
        <Styled.H2>{character.altTitle}</Styled.H2>
        <Styled.Note>Born {convertYear(character.startYear)}{character.startYearUnknown ? '?' : ''}, Died {convertYear(character.endYear)}{character.endYearUnknown ? '?' : ''} ({character.endYear - character.startYear} years old)</Styled.Note>
        {(character.startYearUnknown || character.endYearUnknown) && <Styled.Note>Actual birth and/or death dates are unknown.</Styled.Note>}
      </Styled.Body>
      <Styled.Close onClick={onClose}>X</Styled.Close>
    </Styled.Header>
    <Styled.Body>
      {character.description && <Styled.Description>{parse(character.description)}</Styled.Description>}
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