import React from 'react';
import Styled from './index.styles';


const Modal = ({children, onClickBg, onClickModal}) => {
  return <Styled.Wrapper onClick={onClickBg}><Styled.Modal onClick={(e) => { e.stopPropagation(); onClickModal && onClickModal(); }}>{children}</Styled.Modal></Styled.Wrapper>;
};

export default Modal;