import React from 'react';
import styled from 'styled-components';

import links from '../../data/hubLinks.json';
import analytics, { ACTIONS } from '../../analytics';

// A character's Homeworld or Species, linked to its page on starwars.guide when the
// hub publishes one. data/hubLinks.json is written by `swkg stage timeline` in the
// archives repo (metadata name -> value -> URL); never hand-edit it.
export const hubLink = (name, value) => links[name]?.[value] || null;

// The hub page for a Timeline character, keyed by character title.
export const hubCharacter = (title) => links.Character?.[title] || null;

const Link = styled.a`
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
`;

const HubValue = ({ name, value }) => {
  const href = hubLink(name, value);
  if (!href) return value;
  return <Link
    href={href}
    target="_blank"
    rel="noopener"
    onClick={(e) => {
      // The focus panel sits inside a clickable pill; a link click must not toggle it.
      e.stopPropagation();
      analytics.event(ACTIONS.HUB_LINK, name, value);
      analytics.selectContent('hub_link');
    }}
  >{value}</Link>;
};

export default HubValue;
