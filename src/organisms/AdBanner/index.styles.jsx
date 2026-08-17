import styled from 'styled-components';

/* Fixed 320x50 AdSense unit. Mobile: pinned across the bottom of the viewport,
   centered. Desktop (md and up): tucked into the bottom-right corner.

   `overflow: hidden` + the explicit height are a backstop: an anchor/auto-ad
   format renders position:fixed by design and would otherwise cover the page,
   so the unit is clipped to the box we intend it to occupy.

   z-index sits below the modal layer (100) so dialogs still cover it. */
export const Wrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 90;
  height: 50px;
  overflow: hidden;
  text-align: center;
  line-height: 0;
  background: rgba(0, 0, 0, 0.5);
  padding-bottom: env(safe-area-inset-bottom);

  ${({ theme }) => theme.breakpoints.md} {
    left: auto;
    right: 0;
    width: 320px;
    background: transparent;
  }
`;
