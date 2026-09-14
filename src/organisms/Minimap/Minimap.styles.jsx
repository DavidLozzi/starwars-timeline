import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  right: 0;
  bottom: 0;
  z-index: 200;
  background: rgba(${({ theme }) => theme.palette.black}, 0.85);
  border-radius: 13px 0px 0px 0px;
  padding: 5px;
  canvas {
    display: block;
    width: 200px;
    height: 300px;
    cursor: crosshair;
  }
`;

export const ShowButton = styled.button`
  border: 0;
  background: transparent;
  color: rgb(${({ theme }) => theme.palette.white});
  cursor: pointer;
`;
