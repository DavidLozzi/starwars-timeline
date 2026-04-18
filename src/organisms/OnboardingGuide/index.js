import React, { useEffect, useRef, memo, useCallback } from 'react';
import Modal from '../../molecules/modal';
import { setOnboardingState } from '../../utils';
import { DEFAULT_ONBOARDING_CONTENT } from './content';
import analytics, { ACTIONS } from '../../analytics';
import * as Styled from './index.styles';

// Export content for tests
export { DEFAULT_ONBOARDING_CONTENT };

// Memoize step content component for performance
const StepContentMemo = memo(({ step }) => (
  <Styled.StepContent>
    <Styled.StepTitle>{step.title}</Styled.StepTitle>
    <Styled.StepText>{step.content}</Styled.StepText>
  </Styled.StepContent>
));

StepContentMemo.displayName = 'StepContentMemo';

const OnboardingGuideComponent = ({ isOpen, onDismiss, allowKeyboardDismiss = true }) => {
  const dismissButtonRef = useRef(null);
  const guideRef = useRef(null);

  const handleDismiss = useCallback(() => {
    // Save dismissal state to localStorage
    setOnboardingState(true, new Date().toISOString());
    analytics.event(ACTIONS.MENU_ITEM, null, 'Onboarding Guide Dismissed');
    onDismiss();
  }, [onDismiss]);

  // Handle Escape key dismissal
  useEffect(() => {
    if (!isOpen || !allowKeyboardDismiss) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, allowKeyboardDismiss, handleDismiss]);

  // Focus management: move focus to guide when opened
  useEffect(() => {
    if (isOpen && dismissButtonRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        dismissButtonRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Focus trap: prevent tabbing outside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = guideRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    const guideElement = guideRef.current;
    guideElement?.addEventListener('keydown', handleTab);
    return () => guideElement?.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Track guide display
  useEffect(() => {
    if (isOpen) {
      analytics.event(ACTIONS.MENU_ITEM, null, 'Onboarding Guide Displayed');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal onClickBg={handleDismiss} onClickModal={() => {}}>
      <Styled.GuideContainer
        ref={guideRef}
        role="dialog"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-description"
        aria-modal="true"
      >
        <Styled.Title id="onboarding-title">Welcome to the Star Wars Timeline</Styled.Title>
        <Styled.Description id="onboarding-description">
          Let's get you started with a quick guide to using the timeline.
        </Styled.Description>

        {DEFAULT_ONBOARDING_CONTENT.steps.map((step) => (
          <StepContentMemo key={step.id} step={step} />
        ))}

        <Styled.ButtonContainer>
          <Styled.DismissButton
            ref={dismissButtonRef}
            onClick={handleDismiss}
            aria-label="Dismiss onboarding guide"
          >
            Got it
          </Styled.DismissButton>
        </Styled.ButtonContainer>
      </Styled.GuideContainer>
    </Modal>
  );
};

// Memoize main component for performance
const OnboardingGuide = memo(OnboardingGuideComponent);
OnboardingGuide.displayName = 'OnboardingGuide';

export default OnboardingGuide;
