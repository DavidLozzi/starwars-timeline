import styled, { css } from 'styled-components';

// Width of the content revealed to the right of the pill's own column: the
// expanded pill is panelWidth wide (clamped on phones so it never runs past
// the viewport once the column sits `leftInset` from the left edge), minus
// the collapsed pill's width, which stays put on the left.
const detailsWidth = (theme) => `calc(min(${theme.layout.elements.focus.panelWidth}px, 100vw - ${theme.layout.elements.focus.leftInset + 0.5}rem) - ${theme.layout.elements.character.width}rem)`;

const openMaxHeight = ({ $contentHeight }) => ($contentHeight > 0
  ? `min(${$contentHeight}px, calc(100vh - 8rem))`
  : 'calc(100vh - 8rem)');

const reducedMotion = css`
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// The growing region. `max-width: 0` also zeroes its intrinsic-size
// contribution, so while collapsed the pill sizes exactly as it always has.
export const Expand = styled.div`
  flex: 0 0 auto;
  align-self: flex-start;
  overflow: hidden;
  text-align: left;
  max-width: 0;
  max-height: ${({ theme }) => theme.layout.elements.character.pillHeight}rem;
  transition:
    max-width ${({ theme }) => theme.layout.elements.focus.expandMs}ms cubic-bezier(.22, .8, .24, 1),
    max-height ${({ theme }) => theme.layout.elements.focus.expandMs}ms cubic-bezier(.22, .8, .24, 1);
  ${({ $open, theme }) => $open && css`
    max-width: ${detailsWidth(theme)};
    max-height: ${openMaxHeight};
  `}
  ${reducedMotion};
`;

// Fixed width (the region's open width) so text never re-wraps mid-animation;
// the region clips it while it grows. Fades/slides in after the width has
// started moving, and fades out first on exit.
export const Inner = styled.div`
  position: relative;
  box-sizing: border-box;
  width: ${({ theme }) => detailsWidth(theme)};
  max-height: calc(100vh - 8rem);
  overflow-y: auto;
  padding: .9rem 2.2rem .9rem .6rem;
  opacity: 0;
  transform: translateX(-.75rem);
  transition: opacity 150ms ease-in, transform 150ms ease-in;
  ${({ $open, theme }) => $open && css`
    opacity: 1;
    transform: none;
    transition:
      opacity 300ms ease-out ${theme.layout.elements.focus.contentDelayMs}ms,
      transform 300ms ease-out ${theme.layout.elements.focus.contentDelayMs}ms;
  `}
  ${reducedMotion};
`;

export const Close = styled.button`
  position: absolute;
  top: .6rem;
  right: 1rem;
  width: 1.4rem;
  height: 1.4rem;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, .12);
  font-size: 1rem;
  line-height: 1.4rem;
  padding: 0;
  cursor: pointer;
  color: inherit;

  &:hover {
    background: rgba(0, 0, 0, .22);
  }
`;

export const Facts = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: .2rem .6rem;
  margin: 0 0 .5rem;
  font-size: .8rem;

  dt {
    margin: 0;
    font-weight: bold;
  }

  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }
`;

export const Description = styled.p`
  margin: 0 0 .6rem;
  font-size: .8rem;
  line-height: 1.15rem;
`;

export const SeeMore = styled.button`
  ${({ theme }) => theme.elements.form.button(theme)};
  margin: 0;
`;
