import React from 'react';
import parse from 'html-react-parser';
import ListView from '../../molecules/listview';
import Styled from './index.styles';
import { useAppContext } from '../../AppContext';
import analytics, { ACTIONS } from '../../analytics';

const CharacterDetailModal = ({ character, onClose, currentYear }) => {
  const [imageUrl, setImageUrl] = React.useState('/images/starwars.jpg');
  const [birthYear, setBirthYear] = React.useState(0);
  const [seenInListData, setSeenInListData] = React.useState([]);
  const { scrollTo } = useAppContext();

  const convertYear = (year) => {
    if (year <= 0) return `${year * -1} BBY`;
    if (year > 0) return `${year} ABY`;
    return 'none';
  };

  const goToSeenIn = (seenIn) => {
    scrollTo(seenIn.year, character);
    onClose();
    analytics.event(ACTIONS.GO_TO_EVENT, 'character', seenIn.event.title);
  };

  React.useEffect(() => {
    let _imageUrl = character.imageUrl;
    if (currentYear && character.imageYears?.some(y => y.startYear <= currentYear.year && y.endYear >= currentYear.year)) {
      _imageUrl = character.imageYears.filter(y => y.startYear <= currentYear.year && y.endYear >= currentYear.year)[0].imageUrl;
    }
    if (_imageUrl && _imageUrl !== imageUrl) {
      setImageUrl(_imageUrl);
    }
  }, [currentYear]);


  React.useEffect(() => {
    let _birthYear = character.startYear;
    if (character.birthYear) {
      _birthYear = character.birthYear;
    }
    setBirthYear(_birthYear);
    const seenInData = [];
    character.seenIn.sort((a, b) => a.year > b.year ? 1 : -1).forEach(y => y.events.forEach(e => { seenInData.push({ text: `${e.title}, ${convertYear(e.startYear)} (${y.year - _birthYear} years old)`, year: y, event: e }); }));
    setSeenInListData(seenInData);
  }, []);

  return <Styled.Wrapper>
    <Styled.Header>
      <Styled.Image src={imageUrl} alt={character.title} />
      <Styled.Right>
        <Styled.H1>{character.title}</Styled.H1>
        <Styled.H2>{character.altTitle}</Styled.H2>
        <Styled.Note>Born {convertYear(birthYear)}{character.startYearUnknown ? ' (this is a guess)' : ''} {!character.endYearUnknown ? `, Died ${convertYear(character.endYear)} (${character.endYear - birthYear} years old)` : ''}</Styled.Note>
      </Styled.Right>
    </Styled.Header>
    <Styled.Body>
      {character.metadata && character.metadata.length > 0 &&
        <Styled.MetadataWrapper>
          {character.metadata.map(m => <Styled.Metadata key={m.name}>
            <Styled.MetadataLabel>{m.name}</Styled.MetadataLabel>
            <Styled.MetadataValue>{m.value}</Styled.MetadataValue>
          </Styled.Metadata>)}
        </Styled.MetadataWrapper>
      }
      {character.description && <Styled.Description>{parse(character.description)}</Styled.Description>}
      {character.timeline && character.timeline.trim() && <Styled.Timeline>{parse(character.timeline)}</Styled.Timeline>}
      <Styled.ListViewWrapper>
        <Styled.ListViewTitle>{character.title} on the timeline:</Styled.ListViewTitle>
        <ListView data={seenInListData} onClick={(item) => goToSeenIn(item)} />
      </Styled.ListViewWrapper>
      {character.wookiepedia && <Styled.Wookiepedia href={character.wookiepedia} target="_blank">Learn more on Wookiepedia.com</Styled.Wookiepedia>}
    </Styled.Body>
  </Styled.Wrapper>;
}
  ;

export default CharacterDetailModal;