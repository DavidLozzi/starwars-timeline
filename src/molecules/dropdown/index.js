import React from 'react';
import chevronDownSvg from '../../assets/chevron-down.svg';
import clearSvg from '../../assets/close.svg';
import * as Styled from './index.styles';

const Dropdown = ({ values, selectedText, defaultText, onSelect, onClear }) => {
  const [showOptions, setShowOptions] = React.useState(false);

  const selectOption = (option) => {
    onSelect(option);
    setShowOptions(false);
  };

  const clearOption = () => {
    onClear();
    setShowOptions(false);
  };
  
  return (
    <>
      <Styled.Wrapper>
        <Styled.Input>
          <Styled.Select onClick={() => setShowOptions(!showOptions)}>
            {selectedText || defaultText}
          </Styled.Select>
          <Styled.SelectButtons>
            {!!selectedText && <img src={clearSvg} alt="Select menu" onClick={clearOption} />}
            <img src={chevronDownSvg} alt="Select menu" onClick={() => setShowOptions(!showOptions)} />
          </Styled.SelectButtons>
        </Styled.Input>
        {showOptions &&
        <Styled.OptionWrapper>
          {values.map(v => <Styled.Option key={v.value} onClick={() => selectOption(v)}>{v.text}</Styled.Option>)}
        </Styled.OptionWrapper>
        }
      </Styled.Wrapper>
    </>
  );
};

export default Dropdown;