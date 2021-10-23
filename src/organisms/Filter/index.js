import React from 'react';
import analytics, { ACTIONS } from '../../analytics';
import { useAppContext } from '../../AppContext';
import charactersData from '../../data/characters.json';
import Dropdown from '../../molecules/dropdown';

import * as Styled from './index.styles';

const Filter = ({ onClose }) => {
  const [selectedCharacter, setSelectedCharacter] = React.useState(null);
  const { addFilter, removeFilter } = useAppContext();
  const [characterOptions, setCharacterOptions] = React.useState([]);

  const applyFilter = () => {
    addFilter('character', selectedCharacter.text);
    analytics.event(ACTIONS.APPLY_FILTER, 'filter', selectedCharacter.text);
    onClose();
  };

  const clearFilter = () => {
    setSelectedCharacter(null);
    removeFilter('character');
    analytics.event(ACTIONS.CLEAR_FILTER);
    onClose();
  };

  React.useEffect(() => {
    setCharacterOptions(charactersData
      .sort((a, b) => a.title > b.title ? 1 : -1)
      .map(c => ({ text: c.title, value: c.title })));
  }, []);
  
  return (
    <Styled.Wrapper>
      <Styled.H1>Search</Styled.H1>
      <Styled.FormRow>
        <Styled.FormLabel>Find a Character: </Styled.FormLabel>
        <Styled.FormValue>
          <Dropdown
            values={characterOptions}
            defaultText="Select Character"
            selectedText={selectedCharacter?.text}
            onSelect={(v) => setSelectedCharacter(v)}
          />
        </Styled.FormValue>
      </Styled.FormRow>
      <Styled.FormRow justifyFlexEnd>
        <Styled.FormButton onClick={applyFilter}>Apply</Styled.FormButton>
        <Styled.FormButton onClick={clearFilter} invert>Clear</Styled.FormButton>
      </Styled.FormRow>
    </Styled.Wrapper>
  );
};

export default Filter;