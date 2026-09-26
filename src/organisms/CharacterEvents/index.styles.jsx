import styled from 'styled-components';

export const Dot = styled.div`
  position: absolute;
  z-index: 45;
  width: ${({ theme }) => theme.layout.elements.focus.dotSize}rem;
  height: ${({ theme }) => theme.layout.elements.focus.dotSize}rem;
  ${({ theme }) => theme.elements.focusEventDot};
  pointer-events: none;
`;

// Sized to its text, capped at cardWidth: buildCharacterEvents estimates card
// heights assuming CHARS_PER_LINE characters per line at that cap, and a card
// only ever narrows below it when its titles are short enough not to wrap,
// so the estimate stays valid.
export const Card = styled.div`
  position: absolute;
  z-index: 55;
  width: max-content;
  max-width: min(
    ${({ theme }) => theme.layout.elements.focus.cardWidth}rem,
    calc(100vw - ${({ theme }) => theme.layout.elements.focus.leftInset + 3.5}rem)
  );
  ${({ theme }) => theme.elements.focusEventCard};
  pointer-events: auto;
  cursor: pointer;
`;

export const CardYear = styled.div`
  ${({ theme }) => theme.elements.focusEventYear};
`;

export const CardLine = styled.div`
  overflow-wrap: anywhere;
`;
