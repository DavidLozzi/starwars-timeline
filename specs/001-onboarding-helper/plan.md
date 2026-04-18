# Implementation Plan: Onboarding Helper UI

**Branch**: `001-onboarding-helper` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-onboarding-helper/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add an onboarding helper UI that automatically displays on first visit to guide users through the Star Wars Timeline site. The guide explains timeline navigation, character interactions, filtering capabilities, and layout understanding. Users can dismiss the guide, and it persists dismissal state in localStorage. Returning users can access the guide on-demand via the help icon. Implementation uses React components following atomic design principles, integrates with existing Modal component, and leverages localStorage for state persistence.

## Technical Context

**Language/Version**: JavaScript (ES6+), React 17.0.1  
**Primary Dependencies**: React, React DOM, styled-components 5.2.1, react-router-dom 5.3.0  
**Storage**: Browser localStorage (client-side only, no backend required)  
**Testing**: Jest, React Testing Library (@testing-library/react 11.1.0, @testing-library/user-event 12.1.10)  
**Target Platform**: Web browsers (modern browsers supporting ES6+, localStorage)  
**Project Type**: Web application (single-page React app)  
**Performance Goals**: Onboarding guide must not increase initial page load time by more than 500ms (per SC-003), guide completion in under 2 minutes (per SC-002)  
**Constraints**: Must work on screens as small as 320px width (mobile), must be keyboard accessible (Tab, Enter, Escape), must not interfere with existing modals/filters, must meet WCAG AA contrast standards  
**Scale/Scope**: Client-side feature affecting all site visitors, no server-side changes required

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Component-Based Architecture ✅
- **Compliance**: Onboarding guide will be built as a reusable React component following atomic design principles
- **Location**: New component will be placed in `src/organisms/OnboardingGuide/` (organism-level as it orchestrates multiple UI elements)
- **Props**: Component will accept props for configuration (onDismiss callback, content configuration)
- **State**: Will use React hooks for local state management, minimal reliance on global context

### II. Test-Driven Development (NON-NEGOTIABLE) ✅
- **Compliance**: Tests MUST be written before implementation following TDD red-green-refactor cycle
- **Test Coverage**: Unit tests for component logic, integration tests for user journeys (first visit, dismissal, on-demand access)
- **Focus Areas**: Component contract tests, localStorage interaction tests, keyboard accessibility tests, modal interaction tests

### III. Performance & Accessibility ✅
- **Performance**: Guide content will be lazy-loaded, use React.memo for optimization, ensure <500ms load impact
- **Accessibility**: Full keyboard navigation support (Tab, Enter, Escape), ARIA labels for screen readers, WCAG AA color contrast, mobile responsive (320px+)
- **Lazy Loading**: Guide component can be code-split if needed to minimize initial bundle impact

### IV. Data Integrity & Consistency ✅
- **Compliance**: localStorage state will be validated (check for localStorage availability, handle errors gracefully)
- **Data Structure**: Simple boolean/timestamp structure, no complex data transformations required
- **Error Handling**: Graceful degradation if localStorage unavailable (guide shows but doesn't persist dismissal)

### V. User Experience First ✅
- **Compliance**: Guide provides immediate value, clear dismissal options, non-intrusive overlay design
- **Feedback**: Visual feedback on interactions, smooth animations/transitions
- **Mobile**: Fully responsive, touch-friendly interactions
- **Integration**: Works seamlessly with existing theme system (jedi/sith themes)

**Gate Status**: ✅ PASS - All principles satisfied. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── organisms/
│   └── OnboardingGuide/
│       ├── index.js
│       └── index.styles.js
├── molecules/
│   └── modal/          # Existing modal component (reused)
│       ├── index.js
│       └── index.styles.js
├── organisms/
│   └── MainMenu/       # Existing menu (enhanced with on-demand trigger)
│       ├── index.js
│       └── index.styles.js
└── utils.js            # Existing utilities (may add localStorage helpers)

tests/
└── (existing test structure)
    ├── OnboardingGuide.test.js
    └── integration/
        └── onboarding-flow.test.js
```

**Structure Decision**: Single-page React web application. New OnboardingGuide component will be added as an organism in `src/organisms/OnboardingGuide/` following existing atomic design pattern. Component will reuse existing Modal molecule for overlay functionality. MainMenu component will be enhanced to trigger onboarding guide on-demand via help icon. No backend changes required - all state managed client-side via localStorage.

## Complexity Tracking

No constitution violations. All principles satisfied. Implementation follows existing patterns and component structure.
