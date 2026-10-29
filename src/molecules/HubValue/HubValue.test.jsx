import React from 'react';
import { render, screen } from '@testing-library/react';

import HubValue, { hubLink, hubCharacter } from './index';
import links from '../../data/hubLinks.json';

describe('HubValue', () => {
  it('links a value the hub publishes a page for', () => {
    const [value, href] = Object.entries(links.Homeworld)[0];
    render(<HubValue name="Homeworld" value={value} />);
    expect(screen.getByRole('link', { name: value })).toHaveAttribute('href', href);
  });

  it('renders plain text when there is no page', () => {
    render(<HubValue name="Homeworld" value="Nowhere At All" />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Nowhere At All')).toBeInTheDocument();
    expect(hubLink('Force Sensitive', 'Yes')).toBeNull();
  });

  it('finds the hub page for a Timeline character, or null', () => {
    const [title, href] = Object.entries(links.Character || {})[0] || [];
    if (title) expect(hubCharacter(title)).toBe(href);
    expect(hubCharacter('Nobody At All')).toBeNull();
  });
});
