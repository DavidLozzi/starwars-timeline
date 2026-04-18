# Component Interface Contract: OnboardingGuide

**Feature**: Onboarding Helper UI  
**Date**: 2025-01-27  
**Type**: React Component Interface (Client-Side)

## Overview

Since this is a client-side React component feature with no backend API, the "contract" is defined as the component's public interface (props, callbacks, and expected behavior).

## Component: OnboardingGuide

**Location**: `src/organisms/OnboardingGuide/index.js`

### Props Interface

```typescript
interface OnboardingGuideProps {
  /**
   * Controls visibility of the onboarding guide
   * When true, guide is displayed as overlay
   */
  isOpen: boolean;
  
  /**
   * Callback invoked when user dismisses the guide
   * Should update parent state to set isOpen=false
   * Also handles localStorage persistence
   */
  onDismiss: () => void;
  
  /**
   * Optional: Custom content configuration
   * If not provided, uses default onboarding steps
   */
  content?: OnboardingContent;
  
  /**
   * Optional: Whether to auto-show on first visit
   * Default: true
   */
  showOnFirstVisit?: boolean;
  
  /**
   * Optional: Allow keyboard dismissal (Escape key)
   * Default: true
   */
  allowKeyboardDismiss?: boolean;
  
  /**
   * Optional: Show step progress indicator
   * Default: true
   */
  showProgress?: boolean;
}
```

### Content Structure

```typescript
interface OnboardingContent {
  steps: OnboardingStep[];
}

interface OnboardingStep {
  id: string;                    // Unique identifier (e.g., 'navigation', 'characters')
  title: string;                 // Step title/heading
  content: string;               // Step description/content
  highlightElement?: string;     // Optional: CSS selector for element to highlight
}
```

## Component: MainMenu (Enhanced)

**Location**: `src/organisms/MainMenu/index.js`

### New Behavior

The existing MainMenu component will be enhanced to support triggering the onboarding guide on-demand.

**Integration Pattern**:
- Help icon click handler will trigger onboarding guide
- Can use React context or callback prop to communicate with parent
- Existing help icon (`HelpImg`) already present in MainMenu

### Expected Integration

```typescript
// In MainMenu component
const handleHelpClick = () => {
  // Trigger onboarding guide display
  // Implementation: either via context callback or prop callback
  showOnboardingGuide();
};
```

## State Management Contract

### localStorage Contract

**Key**: `starwars_timeline_onboarding_dismissed`

**Value Format**:
```json
{
  "hasSeenGuide": boolean,
  "dismissedDate": string  // ISO 8601 timestamp, optional
}
```

**Operations**:
- **Read**: `localStorage.getItem('starwars_timeline_onboarding_dismissed')`
- **Write**: `localStorage.setItem('starwars_timeline_onboarding_dismissed', JSON.stringify(state))`
- **Error Handling**: Must handle localStorage unavailable (private browsing, disabled)

## Accessibility Contract

### ARIA Attributes

- `role="dialog"` on modal container
- `aria-labelledby` pointing to guide title
- `aria-describedby` pointing to guide content
- `aria-modal="true"` to indicate modal behavior

### Keyboard Navigation

- **Tab**: Navigate through interactive elements within guide
- **Shift+Tab**: Navigate backwards
- **Enter/Space**: Activate buttons (Next, Skip, Got it)
- **Escape**: Dismiss guide (if `allowKeyboardDismiss === true`)

### Focus Management

- **On Open**: Focus moves to first interactive element in guide (or guide container)
- **On Close**: Focus returns to element that triggered guide (or help icon)
- **Focus Trap**: Tab navigation must not escape modal boundaries

## Performance Contract

### Load Time Impact

- **Maximum Impact**: <500ms additional load time (per SC-003)
- **Strategy**: Lazy load component, defer non-critical rendering

### Render Performance

- Guide content should render within 100ms of component mount
- Animations must maintain 60fps (use CSS transforms/opacity)
- No layout shifts when guide opens/closes

## Error Handling Contract

### localStorage Errors

- **Unavailable**: Graceful degradation - guide shows but dismissal doesn't persist
- **Quota Exceeded**: Log warning, continue without persistence
- **Invalid Data**: Parse error → Treat as first visit (reset state)

### Component Errors

- **Missing Props**: Default to safe values (isOpen=false, showOnFirstVisit=true)
- **Render Errors**: Error boundary should catch and display fallback UI
