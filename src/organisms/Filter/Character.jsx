import React from 'react';
import Dropdown from '../../molecules/dropdown';
import charactersData from '../../data/characters.json';

const FilterCharacterDropdown = ({ label = 'Select Character', setSelectedCharacter, selectedCharacter, style }) => {
  const [characterOptions, setCharacterOptions] = React.useState([]);

  React.useEffect(() => {

    setCharacterOptions(charactersData
      .sort((a, b) => a.title > b.title ? 1 : -1)
      .map(c => ({ text: c.title, value: c.title })));
  }, []);

  return <Dropdown
    values={characterOptions}
    defaultText={label}
    selectedText={selectedCharacter?.text}
    onSelect={(v) => setSelectedCharacter(v)}
    onClear={() => setSelectedCharacter(null)}
    style={style}
  />;
};

export default FilterCharacterDropdown;