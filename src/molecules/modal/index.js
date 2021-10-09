import React from 'react';
import Styled from './index.styles';


const Modal = ({ children, onClickBg, onClickModal }) => {
  const ModalWindow = React.useRef();
  // const [showMoreButton, setShowMoreButton] = React.useState(false);

  // React.useEffect(() => {
  //   setShowMoreButton(ModalWindow.current.scrollHeight > ModalWindow.current.offsetHeight);
  // }, [ModalWindow.current]);
  
  return <Styled.Wrapper onClick={onClickBg}>
    <Styled.Modal onClick={(e) => { e.stopPropagation(); onClickModal && onClickModal(); }} ref={ModalWindow}>
      {children}
    </Styled.Modal>
  </Styled.Wrapper>;
};

export default Modal;