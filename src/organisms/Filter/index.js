import React from 'react';
import { useTheme } from 'styled-components';
import analytics, { ACTIONS } from '../../analytics';
import { getKeyCount } from '../../utils';
import filterData from '../../data/filters.json';
import { useAppContext } from '../../AppContext';
import charactersData from '../../data/characters.json';
import seenInData from '../../data/seenIn.json';
import Dropdown from '../../molecules/dropdown';
import searchSvg from '../../assets/search.svg';
import filtersSvg from '../../assets/filters.svg';

import * as Styled from './index.styles';
import FilterCharacterDropdown from './Character';

const Filter = ({ onClose }) => {
  const theme = useTheme();
  const { addFilter, removeFilter, filters } = useAppContext();
  const [selectedCharacter, setSelectedCharacter] = React.useState(null);
  const [selectedFilter, setSelectedFilter] = React.useState({});
  const [selectedFilterCount, setSelectedFilterCount] = React.useState(0);
  const [selectedMovie, setSelectedMovie] = React.useState('');
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
    if (selectedMovie) {
      addFilter('movie', selectedMovie);
      analytics.event(ACTIONS.APPLY_FILTER, 'filter', selectedMovie);
    }
    onClose();
  };

  const clearFilters = () => {
    setSelectedCharacter(null);
    setSelectedFilter({});
    setSelectedMovie('');
    removeFilter('character');
    removeFilter('metadata');
    removeFilter('movie');
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
    if (filters?.metadata) {
      setSelectedFilter(filters.metadata);
      setSelectedFilterCount(getKeyCount(filters.metadata));
    }
    if (filters?.movie) {
      setSelectedMovie(filters.movie);
      setSelectedFilterCount(s => s + 1);
    }
  }, []);

  return (
    <Styled.Wrapper>
      <Styled.H1>Search</Styled.H1>
      {window.innerWidth < theme.windowWidths.lg && <Styled.FormRow>
        <Styled.FormLabel><Styled.Icon src={searchSvg} alt="Find a character icon" /> Find a character: </Styled.FormLabel>
        <Styled.FormValue>
          <FilterCharacterDropdown setSelectedCharacter={setSelectedCharacter} selectedCharacter={selectedCharacter} />
        </Styled.FormValue>
      </Styled.FormRow>}
      <Styled.FormRow>
        <Styled.FormLabel><Styled.Icon src={filtersSvg} alt="Filter characters icon" /> Filter characters:</Styled.FormLabel>
      </Styled.FormRow>
      <Styled.FormRow>
        <Styled.FormLabel>Seen in Movie or TV Show:</Styled.FormLabel>
        <Styled.FormValue>
          <Dropdown
            values={seenInData.map(s => ({ text: `${s.name} (${s.count})`, value: s.name }))}
            defaultText="Filter by Movie/TV Show"
            selectedText={selectedMovie}
            onSelect={(v) => setSelectedMovie(v.value)}
            onClear={() => setSelectedMovie('')}
          />
        </Styled.FormValue>
      </Styled.FormRow>
      {
        filterData.sort((a, b) => a.name > b.name ? 1 : -1).map(filter => <Styled.FormRow key={filter.name}>
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