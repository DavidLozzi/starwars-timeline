import React from 'react';
import Styled from './index.styles';
import CloseIcon from '../../assets/close.svg';


const Modal = ({ children, onClickBg, onClickModal, fill }) => {

  return <Styled.Wrapper onClick={onClickBg}>
    <Styled.ModalWrapper>
      {onClickBg && <Styled.Close onClick={onClickBg} src={CloseIcon} />}
      <Styled.Modal
        $fill={fill}
        onClick={(e) => { e.stopPropagation(); onClickModal && onClickModal(); }}
      >
        {children}
      </Styled.Modal>
    </Styled.ModalWrapper>
  </Styled.Wrapper>;
};

export default Modal;