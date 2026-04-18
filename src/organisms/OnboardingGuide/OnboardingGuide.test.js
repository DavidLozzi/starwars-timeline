import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import OnboardingGuide from './index';
import { DEFAULT_ONBOARDING_CONTENT } from './content';
import jediTheme from '../../themes/jedi';

// Mock the Modal component
jest.mock('../../molecules/modal', () => {
  return function MockModal({ children, onClickBg }) {
    return (
      <div data-testid="modal" onClick={onClickBg}>
        {children}
      </div>
    );
  };
});

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={jediTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('OnboardingGuide', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    mockOnDismiss.mockClear();
  });

  describe('Component props and basic rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = renderWithTheme(<OnboardingGuide isOpen={false} onDismiss={mockOnDismiss} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      renderWithTheme(<OnboardingGuide isOpen={true} onDismiss={mockOnDismiss} />);
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button is clicked', () => {
      renderWithTheme(<OnboardingGuide isOpen={true} onDismiss={mockOnDismiss} />);
      const dismissButton = screen.getByText('Got it');
      fireEvent.click(dismissButton);
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('should call onDismiss when modal backdrop is clicked', () => {
      renderWithTheme(<OnboardingGuide isOpen={true} onDismiss={mockOnDismiss} />);
      const modal = screen.getByTestId('modal');
      fireEvent.click(modal);
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Onboarding content configuration', () => {
    it('should have all 4 required steps', () => {
      expect(DEFAULT_ONBOARDING_CONTENT.steps).toHaveLength(4);
    });

    it('should have navigation step with required fields', () => {
      const navigationStep = DEFAULT_ONBOARDING_CONTENT.steps.find(s => s.id === 'navigation');
      expect(navigationStep).toBeDefined();
      expect(navigationStep.title).toBeDefined();
      expect(navigationStep.content).toBeDefined();
      expect(typeof navigationStep.title).toBe('string');
      expect(typeof navigationStep.content).toBe('string');
    });

    it('should have characters step with required fields', () => {
      const charactersStep = DEFAULT_ONBOARDING_CONTENT.steps.find(s => s.id === 'characters');
      expect(charactersStep).toBeDefined();
      expect(charactersStep.title).toBeDefined();
      expect(charactersStep.content).toBeDefined();
    });

    it('should have filters step with required fields', () => {
      const filtersStep = DEFAULT_ONBOARDING_CONTENT.steps.find(s => s.id === 'filters');
      expect(filtersStep).toBeDefined();
      expect(filtersStep.title).toBeDefined();
      expect(filtersStep.content).toBeDefined();
    });

    it('should have layout step with required fields', () => {
      const layoutStep = DEFAULT_ONBOARDING_CONTENT.steps.find(s => s.id === 'layout');
      expect(layoutStep).toBeDefined();
      expect(layoutStep.title).toBeDefined();
      expect(layoutStep.content).toBeDefined();
    });
  });
});
