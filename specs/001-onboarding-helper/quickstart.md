# Quickstart: Onboarding Helper UI

**Feature**: Onboarding Helper UI  
**Date**: 2025-01-27  
**Purpose**: Test scenarios and validation steps

## Test Scenarios

### Scenario 1: First-Time Visitor Experience

**Goal**: Verify onboarding guide appears automatically on first visit

**Steps**:
1. Clear browser localStorage (or use incognito/private browsing)
2. Navigate to `https://timeline.starwars.guide/` (or local dev server)
3. Observe page load

**Expected Result**:
- Onboarding guide overlay appears automatically after page loads
- Guide displays first step explaining timeline navigation
- Guide is visible above timeline content (z-index correct)
- Backdrop/dark overlay is visible behind guide

**Validation**:
- ✅ Guide appears within 500ms of page load (performance check)
- ✅ Guide content is readable and properly formatted
- ✅ Guide does not block timeline content completely (allows some visibility)

---

### Scenario 2: Dismiss Guide and Persist State

**Goal**: Verify guide can be dismissed and state persists across sessions

**Steps**:
1. Complete Scenario 1 (guide is displayed)
2. Click "Got it" or "Skip" button (or press Escape key)
3. Verify guide closes
4. Refresh page (F5 or reload)
5. Navigate away and return to site

**Expected Result**:
- Guide closes immediately when dismissed
- Guide does not reappear on page refresh
- Guide does not reappear on subsequent visits
- localStorage contains `starwars_timeline_onboarding_dismissed: {"hasSeenGuide": true}`

**Validation**:
- ✅ Dismissal is immediate (<100ms response time)
- ✅ State persists in localStorage
- ✅ Guide does not auto-show on return visits

---

### Scenario 3: On-Demand Access for Returning Users

**Goal**: Verify returning users can access guide via help icon

**Steps**:
1. Complete Scenario 2 (guide dismissed, user is returning visitor)
2. Locate help icon in MainMenu (top right area)
3. Click help icon
4. Verify guide reappears

**Expected Result**:
- Help icon is visible and accessible
- Clicking help icon opens onboarding guide
- Guide displays same content as first visit
- Guide can be dismissed again (doesn't affect persisted state)

**Validation**:
- ✅ Help icon is clearly visible
- ✅ Guide opens on help icon click
- ✅ Guide content matches first-visit content
- ✅ Dismissal works normally (guide closes, can reopen via help icon)

---

### Scenario 4: Keyboard Accessibility

**Goal**: Verify full keyboard navigation support

**Steps**:
1. Open onboarding guide (first visit or via help icon)
2. Press Tab key repeatedly
3. Press Shift+Tab to navigate backwards
4. Press Enter/Space on buttons
5. Press Escape key

**Expected Result**:
- Tab moves focus through interactive elements (buttons, links)
- Shift+Tab navigates backwards correctly
- Enter/Space activates focused buttons
- Escape dismisses guide
- Focus is trapped within guide (cannot tab to background content)

**Validation**:
- ✅ All interactive elements are keyboard accessible
- ✅ Focus indicators are visible (outline/highlight)
- ✅ Escape key dismisses guide
- ✅ Focus trap prevents escaping modal boundaries

---

### Scenario 5: Mobile Responsiveness

**Goal**: Verify guide works on small screens (320px+)

**Steps**:
1. Open browser DevTools
2. Set viewport to 320px width (mobile device size)
3. Navigate to site (first visit or trigger via help)
4. Open onboarding guide
5. Scroll through guide content
6. Test touch interactions (tap buttons)

**Expected Result**:
- Guide displays correctly at 320px width
- Content is readable without horizontal scrolling
- Buttons are touch-friendly (minimum 44x44px)
- Text is readable (minimum 16px font size)
- Guide can be dismissed via touch

**Validation**:
- ✅ Guide fits within 320px viewport
- ✅ No horizontal scrolling required
- ✅ Touch targets meet minimum size (44x44px)
- ✅ Text is readable without zooming

---

### Scenario 6: Integration with Existing Modals

**Goal**: Verify guide doesn't conflict with character detail modals

**Steps**:
1. Open onboarding guide (first visit)
2. While guide is open, click on a character in timeline
3. Observe modal behavior

**Expected Result**:
- Character modal opens (or guide closes to allow character modal)
- No z-index conflicts (one modal visible at a time)
- Focus management handles modal switching correctly

**Validation**:
- ✅ Character modal can open (guide doesn't block)
- ✅ No visual conflicts (overlapping modals)
- ✅ Focus management works correctly

---

### Scenario 7: localStorage Unavailable (Graceful Degradation)

**Goal**: Verify graceful handling when localStorage is disabled

**Steps**:
1. Disable localStorage in browser (or use private browsing with restrictions)
2. Navigate to site
3. Dismiss onboarding guide
4. Refresh page

**Expected Result**:
- Guide still displays on first visit
- Guide can be dismissed
- Guide reappears on refresh (dismissal not persisted)
- No JavaScript errors in console

**Validation**:
- ✅ Guide functions normally despite localStorage failure
- ✅ No errors thrown
- ✅ User experience degrades gracefully (guide shows but doesn't persist)

---

### Scenario 8: Content Completeness

**Goal**: Verify guide covers all required features

**Steps**:
1. Open onboarding guide
2. Read through all steps/sections
3. Verify each required topic is covered

**Expected Result**:
- Step 1: Timeline navigation (scrolling through years) ✅
- Step 2: Character interactions (clicking to view details) ✅
- Step 3: Filtering (by character, movie, metadata) ✅
- Step 4: Layout understanding (years horizontal, characters vertical) ✅

**Validation**:
- ✅ All four required topics are covered (FR-006 through FR-009)
- ✅ Content is clear and understandable
- ✅ Content matches actual site functionality

---

## Performance Validation

### Load Time Impact Test

**Steps**:
1. Open browser DevTools → Network tab
2. Clear cache and reload page
3. Measure time to interactive (TTI)
4. Compare with baseline (page without onboarding guide)

**Expected Result**:
- Onboarding guide adds <500ms to initial page load time
- Guide content loads after main timeline renders (lazy loaded)

### Render Performance Test

**Steps**:
1. Open DevTools → Performance tab
2. Record page load with onboarding guide
3. Check frame rate during guide animation

**Expected Result**:
- Animations maintain 60fps
- No jank or stuttering during guide open/close
- Render time <100ms for guide content

---

## Success Criteria Validation

- **SC-001**: 80% dismissal rate - Track via analytics (guide displayed vs dismissed)
- **SC-002**: <2 minutes to complete - Measure average time users spend viewing guide
- **SC-003**: <500ms load impact - Performance test above
- **SC-004**: 70% helpful metric - Track feature usage after viewing guide
- **SC-005**: 320px compatibility - Mobile responsiveness test above
- **SC-006**: 95% persistence accuracy - Track localStorage success rate

---

## Manual Testing Checklist

- [ ] First visit shows guide automatically
- [ ] Guide can be dismissed via button
- [ ] Guide can be dismissed via Escape key
- [ ] Guide can be dismissed via clicking backdrop (if implemented)
- [ ] Dismissal persists across page refreshes
- [ ] Help icon triggers guide on-demand
- [ ] Guide content covers all 4 required topics
- [ ] Keyboard navigation works (Tab, Shift+Tab, Enter, Escape)
- [ ] Mobile responsive (320px width)
- [ ] No conflicts with character modals
- [ ] Graceful degradation when localStorage unavailable
- [ ] Performance meets <500ms load impact
- [ ] Accessibility: Screen reader announces guide content
- [ ] Theme compatibility: Guide works with jedi and sith themes
