import React from 'react';

import * as Styled from './index.styles';
import { truncateDescription } from './text';

// The right-hand half of an expanded character pill (focus mode). It is
// rendered *inside* CharacterDetailPill's yellow pill, beside the unchanged
// portrait/name/age block, so the pill itself is what grows into the panel --
// see the "Character focus mode" plan, Revision 1.
//
// - `isOpen`: focus mode is on for this character. Drives the dialog
//   semantics; while the pill is collapsing after exit the content is still
//   rendered (so it can fade out) but is no longer the dialog.
// - `isExpanded`: the animated state. It turns on a frame after mount so the
//   width/height/opacity transitions have a collapsed start to run from.
const CharacterFocusPanel = ({ character, plottedCount, onSeeMore, onClose, isOpen = true, isExpanded = true }) => {
  const innerRef = React.useRef(null);
  const [contentHeight, setContentHeight] = React.useState(0);

  // The inner box has a fixed width, so its scrollHeight is already its
  // final height while the region around it is still 0 wide. That lets the
  // region animate max-height to exactly the content height (a generous
  // fixed max-height would make the grow finish early and the collapse lag).
  React.useLayoutEffect(() => {
    if (innerRef.current) setContentHeight(innerRef.current.scrollHeight);
  }, [character]);

  return <Styled.Expand $open={isExpanded} $contentHeight={contentHeight} aria-hidden={isOpen ? undefined : true}>
    <Styled.Inner
      ref={innerRef}
      $open={isExpanded}
      data-testid={isOpen ? 'focus-panel' : undefined}
      data-focus-keep="true"
      role={isOpen ? 'dialog' : undefined}
      aria-label={isOpen ? character.title : undefined}
    >
      <Styled.Close type="button" aria-label="Close" onClick={onClose} tabIndex={isOpen ? 0 : -1}>×</Styled.Close>
      <Styled.Facts>
        <dt>Born</dt>
        <dd>{character.birthYearDisplay || character.startYearDisplay}{character.startYearUnknown ? ' (estimated)' : ''}</dd>
        {!character.endYearUnknown && <>
          <dt>Died</dt>
          <dd>{character.endYearDisplay}</dd>
        </>}
        {character.metadata?.map((m) => <React.Fragment key={m.name}>
          <dt>{m.name}</dt>
          <dd>{m.value}</dd>
        </React.Fragment>)}
        <dt>Events</dt>
        <dd>{plottedCount}</dd>
      </Styled.Facts>
      <Styled.Description>{truncateDescription(character.description)}</Styled.Description>
      <Styled.SeeMore type="button" onClick={() => onSeeMore(character)} tabIndex={isOpen ? 0 : -1}>See More</Styled.SeeMore>
    </Styled.Inner>
  </Styled.Expand>;
};

export default React.memo(CharacterFocusPanel);
