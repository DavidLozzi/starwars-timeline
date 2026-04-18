# Research: Onboarding Helper UI

**Feature**: Onboarding Helper UI  
**Date**: 2025-01-27  
**Phase**: 0 - Research

## Research Tasks

### 1. React Onboarding/Tour Component Patterns

**Decision**: Implement custom onboarding component using existing Modal molecule rather than external library

**Rationale**: 
- Existing codebase already has Modal component that handles overlay, backdrop, and close interactions
- External tour libraries (react-joyride, reactour) add significant bundle size and may conflict with existing modal system
- Custom implementation allows full control over styling, animations, and integration with existing theme system (jedi/sith themes)
- Simpler maintenance - one less dependency to manage

**Alternatives Considered**:
- **react-joyride**: Popular but adds ~50KB to bundle, may conflict with existing modals
- **reactour**: Lighter weight but still adds dependency, less flexible styling
- **react-helmet + custom**: Too complex for this use case
- **Custom with Modal**: Best fit - leverages existing patterns, full control, minimal bundle impact

### 2. localStorage Patterns and Error Handling

**Decision**: Use localStorage with try-catch error handling and feature detection

**Rationale**:
- localStorage is standard for client-side persistence, supported in all modern browsers
- Simple key-value storage sufficient for boolean dismissal state
- Must handle cases where localStorage unavailable (private browsing, disabled storage)
- Graceful degradation: if localStorage fails, guide shows but dismissal doesn't persist (acceptable UX)

**Implementation Pattern**:
```javascript
// Feature detection + error handling
const hasLocalStorage = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Safe get/set with fallbacks
const getOnboardingState = () => {
  if (!hasLocalStorage()) return null;
  try {
    return JSON.parse(localStorage.getItem('onboarding_dismissed') || 'false');
  } catch {
    return false;
  }
};
```

**Alternatives Considered**:
- **sessionStorage**: Doesn't persist across sessions (violates requirement FR-004)
- **Cookies**: Overkill for simple boolean, requires server handling
- **IndexedDB**: Overkill for simple state, async complexity unnecessary
- **localStorage with error handling**: Best fit - simple, persistent, graceful degradation

### 3. Accessibility Patterns for Modal Overlays

**Decision**: Follow ARIA modal dialog pattern with focus management and keyboard navigation

**Rationale**:
- WCAG 2.1 Level AA compliance required (Constitution Principle III)
- Modal overlays must trap focus, manage focus return, support Escape key
- Existing Modal component already handles some patterns - extend rather than replace
- Screen reader announcements needed for guide content

**Implementation Requirements**:
- `role="dialog"` with `aria-labelledby` and `aria-describedby`
- Focus trap: prevent tabbing outside modal
- Focus management: move focus to modal on open, return to trigger on close
- Keyboard support: Escape to close, Tab/Shift+Tab for navigation, Enter/Space for actions
- ARIA live regions for dynamic content updates

**Alternatives Considered**:
- **aria-live regions only**: Insufficient for modal interaction patterns
- **Full ARIA modal pattern**: Required for accessibility compliance
- **Skip accessibility**: Violates Constitution Principle III (NON-NEGOTIABLE)

### 4. Integration with Existing Modal System

**Decision**: Create OnboardingGuide as wrapper around existing Modal molecule, ensuring z-index and focus management don't conflict

**Rationale**:
- Existing Modal component handles overlay, backdrop, close button patterns
- OnboardingGuide can compose Modal but add guide-specific content and multi-step navigation
- Must ensure z-index higher than character detail modals (if both open)
- Focus management must handle case where character modal opens during onboarding

**Integration Pattern**:
- OnboardingGuide uses Modal molecule internally
- Z-index: OnboardingGuide (highest) > CharacterModal > FilterMenu
- If character modal opens during onboarding, onboarding pauses/closes (edge case handling)
- OnboardingGuide can be triggered independently of other modals

**Alternatives Considered**:
- **Separate overlay system**: Would duplicate Modal logic, violates DRY principle
- **Replace Modal**: Too risky, affects existing character modal functionality
- **Compose Modal**: Best approach - reuse existing patterns, add guide-specific features

### 5. Performance Optimization for Overlay Components

**Decision**: Lazy load OnboardingGuide component, use React.memo for content sections, defer non-critical animations

**Rationale**:
- Performance budget: <500ms load time impact (SC-003)
- Guide content is text-heavy but lightweight - main concern is initial render
- Can code-split onboarding component to load after main timeline renders
- Use React.memo for guide step components to prevent unnecessary re-renders

**Optimization Strategies**:
- Code splitting: `React.lazy(() => import('./OnboardingGuide'))`
- Memoization: `React.memo` for guide step components
- Deferred rendering: Render guide after initial timeline paint
- CSS animations: Use transform/opacity for 60fps animations

**Alternatives Considered**:
- **Eager loading**: Violates performance budget
- **No optimization**: May exceed 500ms budget on slower devices
- **Lazy load + memoization**: Best balance of performance and UX

### 6. Mobile Responsiveness Patterns

**Decision**: Responsive design using existing styled-components theme breakpoints, touch-friendly targets (44x44px minimum)

**Rationale**:
- Must work on screens as small as 320px (SC-005)
- Existing codebase uses styled-components with theme breakpoints
- Touch targets must meet accessibility guidelines (minimum 44x44px)
- Content must be readable without horizontal scrolling

**Implementation Approach**:
- Use existing theme breakpoints from `src/themes/jedi.js` and `src/themes/sith.js`
- Stack content vertically on mobile (<768px)
- Larger touch targets for buttons (minimum 44x44px)
- Font sizes scale appropriately (minimum 16px for readability)
- Modal takes full viewport on mobile, centered with padding on desktop

**Alternatives Considered**:
- **Fixed desktop layout**: Violates mobile requirement
- **Separate mobile component**: Unnecessary complexity
- **Responsive with theme breakpoints**: Best approach - leverages existing patterns

## Summary

All research tasks completed. Key decisions:
1. Custom component using existing Modal (no external dependencies)
2. localStorage with error handling and graceful degradation
3. Full ARIA modal pattern for accessibility
4. Compose existing Modal, manage z-index hierarchy
5. Lazy loading + memoization for performance
6. Responsive design using existing theme system

No blocking issues identified. Ready for Phase 1 design.
