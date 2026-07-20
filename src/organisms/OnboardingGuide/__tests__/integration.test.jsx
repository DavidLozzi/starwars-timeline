import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { getOnboardingState, setOnboardingState } from '../../../utils';
import OnboardingGuide from '../index';
import jediTheme from '../../../themes/jedi';

// Mirrors the real Modal's structure: the backdrop handles onClickBg, but
// children sit inside an inner wrapper that stops propagation. Without that
// inner layer, any click on a child also counts as a backdrop click.
vi.mock('../../../molecules/modal', () => ({
  default: function MockModal({ children, onClickBg }) {
    return (
      <div data-testid="modal" onClick={onClickBg}>
        <div onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    );
  },
}));

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={jediTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('OnboardingGuide Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('First-visit auto-display flow', () => {
    it('should appear on mount when localStorage indicates first visit', () => {
      // Ensure no state exists
      localStorage.removeItem('starwars_timeline_onboarding_dismissed');

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(() => {
          const state = getOnboardingState();
          return !state || !state.hasSeenGuide;
        });

        return <OnboardingGuide isOpen={isOpen} onDismiss={() => setIsOpen(false)} />;
      };

      renderWithTheme(<TestComponent />);
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('should not appear when user has already seen guide', () => {
      setOnboardingState(true);

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(() => {
          const state = getOnboardingState();
          return !state || !state.hasSeenGuide;
        });

        return <OnboardingGuide isOpen={isOpen} onDismiss={() => setIsOpen(false)} />;
      };

      const { container } = renderWithTheme(<TestComponent />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Dismissal and persistence flow', () => {
    it('should update localStorage when dismissed', () => {
      const mockOnDismiss = vi.fn(() => {
        setOnboardingState(true, new Date().toISOString());
      });

      renderWithTheme(<OnboardingGuide isOpen={true} onDismiss={mockOnDismiss} />);
      
      const dismissButton = screen.getByText('Got it');
      fireEvent.click(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalled();
      
      const state = getOnboardingState();
      expect(state).not.toBeNull();
      expect(state.hasSeenGuide).toBe(true);
    });

    it('should prevent re-display after dismissal', async () => {
      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(true);

        const handleDismiss = () => {
          setOnboardingState(true, new Date().toISOString());
          setIsOpen(false);
        };

        React.useEffect(() => {
          const state = getOnboardingState();
          if (state && state.hasSeenGuide) {
            setIsOpen(false);
          }
        }, []);

        return <OnboardingGuide isOpen={isOpen} onDismiss={handleDismiss} />;
      };

      const { unmount } = renderWithTheme(<TestComponent />);
      expect(screen.getByTestId('modal')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Got it'));

      // The guide closes and the dismissal is persisted.
      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      });
      expect(getOnboardingState().hasSeenGuide).toBe(true);

      // A fresh mount reads that persisted state and stays closed. This must be
      // a single render outside waitFor -- waitFor re-invokes its callback on a
      // poll, so rendering inside it mounts a new tree every tick until the
      // heap is exhausted.
      unmount();
      const { container } = renderWithTheme(<TestComponent />);
      expect(container.firstChild).toBeNull();
    });
  });
});
