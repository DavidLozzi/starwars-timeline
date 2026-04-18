# Tasks: Onboarding Helper UI

**Input**: Design documents from `/specs/001-onboarding-helper/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED per Constitution Principle II (Test-Driven Development NON-NEGOTIABLE). All test tasks must be completed before implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below follow single project structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create OnboardingGuide component directory structure at `src/organisms/OnboardingGuide/`
- [x] T002 [P] Create placeholder files `src/organisms/OnboardingGuide/index.js` and `src/organisms/OnboardingGuide/index.styles.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Implement localStorage helper functions in `src/utils.js` for onboarding state management (hasLocalStorage, getOnboardingState, setOnboardingState with error handling)
- [x] T004 [P] Create OnboardingGuide component scaffold in `src/organisms/OnboardingGuide/index.js` with basic props interface (isOpen, onDismiss)
- [x] T005 [P] Create OnboardingGuide styled components scaffold in `src/organisms/OnboardingGuide/index.styles.js` with basic modal styling structure
- [x] T006 Create default onboarding content configuration constant in `src/organisms/OnboardingGuide/index.js` with 4 steps (navigation, characters, filters, layout) per FR-006 through FR-009

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 + User Story 3 - First-Time Visitor Sees Onboarding Guide with Full Content (Priority: P1) 🎯 MVP

**Goal**: First-time visitors automatically see onboarding guide on page load. Guide displays comprehensive content covering timeline navigation, character interactions, filtering, and layout understanding. Users can dismiss guide, and dismissal state persists in localStorage.

**Independent Test**: Visit site for first time in new browser session → verify guide appears automatically → verify guide shows all 4 content sections → dismiss guide → refresh page → verify guide does not reappear → verify localStorage contains dismissal state

### Tests for User Story 1 + User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T007 [P] [US1] [US3] Write unit test for localStorage helpers in `src/utils.test.js` (test hasLocalStorage, getOnboardingState, setOnboardingState with error cases)
- [x] T008 [P] [US1] [US3] Write unit test for OnboardingGuide component props and basic rendering in `src/organisms/OnboardingGuide/OnboardingGuide.test.js` (test isOpen prop, onDismiss callback)
- [x] T009 [P] [US1] [US3] Write unit test for onboarding content configuration in `src/organisms/OnboardingGuide/OnboardingGuide.test.js` (test all 4 steps are present and contain required fields)
- [x] T010 [P] [US1] [US3] Write integration test for first-visit auto-display flow in `src/organisms/OnboardingGuide/__tests__/integration.test.js` (test guide appears on mount when localStorage indicates first visit)
- [x] T011 [P] [US1] [US3] Write integration test for dismissal and persistence flow in `src/organisms/OnboardingGuide/__tests__/integration.test.js` (test dismiss button updates localStorage and prevents re-display)

### Implementation for User Story 1 + User Story 3

- [x] T012 [US1] [US3] Implement localStorage state check on component mount in `src/organisms/OnboardingGuide/index.js` (check hasSeenGuide from localStorage, set initial isOpen state)
- [x] T013 [US1] [US3] Implement onDismiss handler in `src/organisms/OnboardingGuide/index.js` that updates localStorage and closes guide (call setOnboardingState, update isOpen to false)
- [x] T014 [US1] [US3] Integrate OnboardingGuide with existing Modal component in `src/organisms/OnboardingGuide/index.js` (compose Modal molecule, pass isOpen and onDismiss)
- [x] T015 [US1] [US3] Implement guide content rendering in `src/organisms/OnboardingGuide/index.js` (display all 4 steps: navigation, characters, filters, layout per OnboardingContent structure)
- [x] T016 [US1] [US3] Implement dismiss button UI in `src/organisms/OnboardingGuide/index.js` (add "Got it" button that calls onDismiss)
- [x] T017 [US1] [US3] Implement Escape key dismissal handler in `src/organisms/OnboardingGuide/index.js` (add keyboard event listener for Escape key per FR-003)
- [x] T018 [US1] [US3] Add OnboardingGuide component to Home page in `src/pages/Home/index.js` (import component, add state management for isOpen, check localStorage on mount)
- [x] T019 [US1] [US3] Implement styled components for guide content in `src/organisms/OnboardingGuide/index.styles.js` (style guide container, step content, buttons, ensure WCAG AA contrast)
- [x] T020 [US1] [US3] Implement responsive styling for mobile (320px+) in `src/organisms/OnboardingGuide/index.styles.js` (use theme breakpoints, stack content vertically, ensure touch targets 44x44px minimum per FR-011)
- [x] T021 [US1] [US3] Implement ARIA attributes for accessibility in `src/organisms/OnboardingGuide/index.js` (add role="dialog", aria-labelledby, aria-describedby, aria-modal per research.md)
- [x] T022 [US1] [US3] Implement focus trap and keyboard navigation in `src/organisms/OnboardingGuide/index.js` (trap focus within modal, support Tab/Shift+Tab, Enter/Space for buttons per FR-010)
- [x] T023 [US1] [US3] Implement z-index management to ensure guide appears above character modals in `src/organisms/OnboardingGuide/index.styles.js` (set z-index higher than existing modals per research.md)

**Checkpoint**: At this point, User Story 1 + User Story 3 should be fully functional and testable independently. First-time visitors see guide automatically with full content, can dismiss it, and state persists.

---

## Phase 4: User Story 2 - Returning Users Can Access Help On-Demand (Priority: P2)

**Goal**: Returning users who have dismissed the guide can access it again on-demand via the help icon in MainMenu.

**Independent Test**: Dismiss guide from Phase 3 → verify guide does not auto-show on refresh → click help icon in MainMenu → verify guide reappears → dismiss again → verify can reopen via help icon

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T024 [P] [US2] Write unit test for MainMenu help icon click handler in `src/organisms/MainMenu/MainMenu.test.js` (test help icon triggers onboarding guide)
- [x] T025 [P] [US2] Write integration test for on-demand guide access flow in `src/organisms/OnboardingGuide/__tests__/integration.test.js` (test guide opens when triggered manually, ignores localStorage state)

### Implementation for User Story 2

- [x] T026 [US2] Add state management for manual guide trigger in `src/pages/Home/index.js` (add showOnboardingGuide function that sets isOpen to true regardless of localStorage)
- [x] T027 [US2] Enhance MainMenu component to trigger onboarding guide in `src/organisms/MainMenu/index.js` (replace external link with onClick handler that calls showOnboardingGuide callback)
- [x] T028 [US2] Pass showOnboardingGuide callback from Home to MainMenu in `src/pages/Home/index.js` (add prop or context method to trigger guide)
- [x] T029 [US2] Update OnboardingGuide to support manual trigger mode in `src/organisms/OnboardingGuide/index.js` (allow isOpen to be controlled externally, don't auto-close based on localStorage when manually triggered)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Returning users can access guide on-demand via help icon.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T030 [P] Implement lazy loading for OnboardingGuide component in `src/pages/Home/index.js` (use React.lazy to code-split guide, ensure <500ms load impact per SC-003)
- [x] T031 [P] Add React.memo optimization for guide step components in `src/organisms/OnboardingGuide/index.js` (memoize step rendering to prevent unnecessary re-renders)
- [x] T032 [P] Implement smooth animations for guide open/close in `src/organisms/OnboardingGuide/index.styles.js` (use CSS transforms/opacity for 60fps animations)
- [x] T033 [P] Add error boundary for OnboardingGuide component in `src/organisms/OnboardingGuide/index.js` (handle render errors gracefully)
- [x] T034 [P] Add analytics tracking for guide interactions in `src/organisms/OnboardingGuide/index.js` (track guide displayed, dismissed, on-demand accessed per analytics patterns)
- [x] T035 [P] Verify theme compatibility (jedi/sith) in `src/organisms/OnboardingGuide/index.styles.js` (ensure guide works with both themes)
- [x] T036 [P] Add unit tests for edge cases in `src/organisms/OnboardingGuide/OnboardingGuide.test.js` (test localStorage unavailable, invalid data, storage quota exceeded)
- [x] T037 [P] Add integration test for modal conflict handling in `src/organisms/OnboardingGuide/__tests__/integration.test.js` (test guide behavior when character modal opens)
- [x] T038 Run quickstart.md validation scenarios from `specs/001-onboarding-helper/quickstart.md` (verify all 8 test scenarios pass)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed sequentially in priority order (P1 → P2)
  - Phase 3 (US1+US3) must complete before Phase 4 (US2) since US2 enhances US1
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 + User Story 3 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 completion - Enhances existing guide with on-demand trigger

### Within Each User Story

- Tests (REQUIRED per Constitution) MUST be written and FAIL before implementation
- Component structure before content rendering
- Core functionality before enhancements
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- All tests for a user story marked [P] can run in parallel
- Polish phase tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1 + User Story 3

```bash
# Launch all tests for User Story 1 + User Story 3 together:
Task: "Write unit test for localStorage helpers in src/utils.test.js"
Task: "Write unit test for OnboardingGuide component props and basic rendering"
Task: "Write unit test for onboarding content configuration"
Task: "Write integration test for first-visit auto-display flow"
Task: "Write integration test for dismissal and persistence flow"

# Launch foundational implementation tasks together:
Task: "Implement localStorage state check on component mount"
Task: "Implement guide content rendering"
Task: "Implement styled components for guide content"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 + User Story 3 (tests first, then implementation)
4. **STOP and VALIDATE**: Test User Story 1 + User Story 3 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 + User Story 3 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add Polish improvements → Test → Deploy/Demo
5. Each increment adds value without breaking previous functionality

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 + User Story 3 (tests + implementation)
   - Developer B: Can prepare User Story 2 tests (but wait for US1 completion)
3. After US1+US3 complete:
   - Developer A: User Story 2
   - Developer B: Polish tasks
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **CRITICAL**: Tests MUST be written first and FAIL before implementation (TDD red-green-refactor cycle per Constitution)
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- localStorage key: `starwars_timeline_onboarding_dismissed`
- Component location: `src/organisms/OnboardingGuide/` (organism-level per atomic design)
- Reuse existing Modal molecule from `src/molecules/modal/`
