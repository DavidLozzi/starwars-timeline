# Data Model: Onboarding Helper UI

**Feature**: Onboarding Helper UI  
**Date**: 2025-01-27  
**Phase**: 1 - Design

## Entities

### OnboardingState

**Purpose**: Tracks whether a user has seen and dismissed the onboarding guide

**Storage**: Browser localStorage (client-side only)

**Attributes**:
- `hasSeenGuide` (boolean, required): Whether user has dismissed the onboarding guide
  - Default: `false` (first-time visitor)
  - Set to `true` when user dismisses guide
- `dismissedDate` (string ISO 8601 timestamp, optional): When the guide was dismissed
  - Used for analytics/future features
  - Optional - can be omitted for minimal storage

**Storage Key**: `starwars_timeline_onboarding_dismissed`

**Storage Format**:
```json
{
  "hasSeenGuide": true,
  "dismissedDate": "2025-01-27T10:30:00Z"
}
```

**Validation Rules**:
- `hasSeenGuide` must be boolean
- `dismissedDate` must be valid ISO 8601 string if present
- Graceful handling if localStorage unavailable (returns `null`, treated as first visit)

**State Transitions**:
1. **Initial State**: `hasSeenGuide: false` (or localStorage key missing)
2. **After Dismissal**: `hasSeenGuide: true`, `dismissedDate: <current timestamp>`
3. **Storage Cleared**: Returns to initial state (guide shows again)

### OnboardingContent

**Purpose**: Defines the instructional content displayed in the guide

**Storage**: Static configuration (not persisted, defined in component)

**Structure**:
```javascript
{
  steps: [
    {
      id: 'navigation',
      title: 'Navigate Through Time',
      content: 'Scroll horizontally to explore different years in the Star Wars timeline...',
      highlightElement?: 'timeline-container' // Optional: element to highlight
    },
    {
      id: 'characters',
      title: 'Explore Characters',
      content: 'Click on any character to view their detailed information...',
      highlightElement?: 'character-pod'
    },
    {
      id: 'filters',
      title: 'Filter Your View',
      content: 'Use the search icon to filter by character, movie, or metadata...',
      highlightElement?: 'filter-button'
    },
    {
      id: 'layout',
      title: 'Understanding the Layout',
      content: 'Years run horizontally, characters run vertically. Each intersection shows when a character appeared...'
    }
  ]
}
```

**Attributes**:
- `steps` (array, required): Array of guide steps/sections
  - Each step has: `id` (string), `title` (string), `content` (string)
  - Optional: `highlightElement` (string) - CSS selector or ref for element highlighting

**Content Requirements**:
- Must cover: timeline navigation, character interactions, filtering, layout understanding (per FR-006 through FR-009)
- Content is static (no dynamic data)
- Can be internationalized in future (not in scope for this feature)

## Component Interface (Pseudo-Contract)

Since this is a client-side React component (no API), the "contract" is the component's props interface:

### OnboardingGuide Component Props

```typescript
interface OnboardingGuideProps {
  // Control visibility
  isOpen: boolean;                    // Whether guide is currently visible
  onDismiss: () => void;              // Callback when user dismisses guide
  
  // Content configuration (optional - uses defaults if not provided)
  content?: OnboardingContent;        // Custom content (defaults to standard steps)
  
  // Behavior options
  showOnFirstVisit?: boolean;         // Auto-show on first visit (default: true)
  allowKeyboardDismiss?: boolean;     // Allow Escape key to dismiss (default: true)
  showProgress?: boolean;             // Show step progress indicator (default: true)
}
```

### MainMenu Integration (Enhanced)

Existing MainMenu component will be enhanced to trigger onboarding:

```typescript
// New callback prop or context method
const showOnboardingGuide = () => {
  // Opens onboarding guide on-demand
  // Can be called from help icon click handler
};
```

## Data Flow

1. **Component Mount**: Check localStorage for `hasSeenGuide`
2. **First Visit**: If `hasSeenGuide === false` (or missing), show guide automatically
3. **User Dismisses**: Call `onDismiss()` → Update localStorage → Set `hasSeenGuide: true`
4. **Subsequent Visits**: Check localStorage → If `hasSeenGuide === true`, don't auto-show
5. **On-Demand Access**: User clicks help icon → Manually trigger guide (ignores localStorage state)
6. **Storage Error**: If localStorage unavailable, show guide but don't persist dismissal

## Error Handling

- **localStorage unavailable**: Graceful degradation - guide shows but dismissal doesn't persist
- **Invalid stored data**: Parse error → Treat as first visit (reset state)
- **Storage quota exceeded**: Catch error → Log warning, continue without persistence
