import site from '../../site';

// Default onboarding content configuration
export const DEFAULT_ONBOARDING_CONTENT = {
  steps: [
    {
      id: 'navigation',
      title: 'Navigation',
      content:
        'Scroll left and right to explore characters.\n\nScroll up and down to move through time.'
    },
    {
      id: 'characters',
      title: 'Characters',
      content:
        'Click on any character to view their information and their own personal timeline.'
    },
    {
      id: 'search',
      title: 'Find a specific character, movie, or TV show.',
      content: site.onboarding.filterHelp
    }
  ]
};
