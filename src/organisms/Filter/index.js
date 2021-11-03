import React from 'react';
import analytics, { ACTIONS } from '../../analytics';
import { getKeyCount } from '../../utils';
import filterData from '../../data/filters.json';
import { useAppContext } from '../../AppContext';
import charactersData from '../../data/characters.json';
import Dropdown from '../../molecules/dropdown';
import searchSvg from '../../assets/search.svg';
import filtersSvg from '../../assets/filters.svg';

import * as Styled from './index.styles';

const Filter = ({ onClose }) => {
  const { addFilter, removeFilter, filters } = useAppContext();
  const [selectedCharacter, setSelectedCharacter] = React.useState(null);
  const [selectedFilter, setSelectedFilter] = React.useState({});
  const [selectedFilterCount, setSelectedFilterCount] = React.useState(0);
  const [characterOptions, setCharacterOptions] = React.useState([]);
  const [characterCount, setCharacterCount] = React.useState(0);

  const applyFilter = () => {
    if (selectedCharacter) {
      addFilter('character', selectedCharacter.text);
      analytics.event(ACTIONS.APPLY_FILTER, 'search', selectedCharacter.text);
    }
    if (selectedFilterCount > 0) {
      addFilter('metadata', selectedFilter);
      const selectedFilterString = Object.keys(selectedFilter).map(k => `${k}=${selectedFilter[k]}`).join(';');
      analytics.event(ACTIONS.APPLY_FILTER, 'filter', selectedFilterString);
    }
    onClose();
  };

  const clearFilters = () => {
    setSelectedCharacter(null);
    setSelectedFilter({});
    removeFilter('character');
    removeFilter('metadata');
    analytics.event(ACTIONS.CLEAR_FILTER);
    onClose();
  };

  const selectFilter = (filter, value) => {
    const selFilter = { ...selectedFilter, [filter.name]: value.value };
    setSelectedFilter(selFilter);
    setSelectedFilterCount(getKeyCount(selFilter));
  };

  const clearSelectedFilter = (filter) => {
    delete selectedFilter[filter.name];
    setSelectedFilter(selectedFilter);
    setSelectedFilterCount(getKeyCount(selectedFilter));
  };

  React.useEffect(() => {
    if (selectedFilter && getKeyCount(selectedFilter) > 0) {
      let filtChars = charactersData;
      Object.keys(selectedFilter).forEach(key => {
        const filterValue = selectedFilter[key];
        filtChars = filtChars.filter(c =>
          c.metadata.some(m => m.name === key && m.value === filterValue)
        );
      });
      setCharacterCount(filtChars.length);
    } else {
      setCharacterCount(charactersData.length);
    }
  }, [selectedFilter, selectedFilterCount]);

  React.useEffect(() => {
    setCharacterOptions(charactersData
      .sort((a, b) => a.title > b.title ? 1 : -1)
      .map(c => ({ text: c.title, value: c.title })));
    
    if (filters?.metadata) {
      setSelectedFilter(filters.metadata);
      setSelectedFilterCount(getKeyCount(filters.metadata));
    } 
  }, []);
  
  return (
    <Styled.Wrapper>
      <Styled.H1>Search</Styled.H1>
      <Styled.FormRow>
        <Styled.FormLabel><Styled.Icon src={searchSvg} alt="Find a character icon" /> Find a character: </Styled.FormLabel>
        <Styled.FormValue>
          <Dropdown
            values={characterOptions}
            defaultText="Select Character"
            selectedText={selectedCharacter?.text}
            onSelect={(v) => setSelectedCharacter(v)}
            onClear={() => setSelectedCharacter(null)}
          />
        </Styled.FormValue>
      </Styled.FormRow>
      <Styled.FormRow>
        <Styled.FormLabel><Styled.Icon src={filtersSvg} alt="Filter characters icon" /> Filter characters:</Styled.FormLabel>
      </Styled.FormRow>
      {
        filterData.sort((a,b) => a.name > b.name ? 1 : -1).map(filter => <Styled.FormRow key={filter.name}>
          <Styled.FormLabel>{filter.name}</Styled.FormLabel>
          <Styled.FormValue>
            <Dropdown
              values={filter.values.map(v => ({ text: `${v.name} (${v.count})`, value: v.name }))}
              defaultText={`Filter by ${filter.name}`}
              selectedText={selectedFilter[filter.name]}
              onSelect={(v) => selectFilter(filter, v)}
              onClear={() => clearSelectedFilter(filter)}
            />
          </Styled.FormValue>

        </Styled.FormRow>)
      }
      <Styled.FormRow justifyFlexEnd>
        <Styled.FormLabel note>{selectedFilterCount} filters applied will display {characterCount} characters</Styled.FormLabel>
      </Styled.FormRow>

      <Styled.FormRow justifyFlexEnd>
        <Styled.FormButton onClick={applyFilter}>Apply</Styled.FormButton>
        <Styled.FormButton onClick={clearFilters} invert>Clear</Styled.FormButton>
      </Styled.FormRow>
    </Styled.Wrapper>
  );
};

export default Filter;