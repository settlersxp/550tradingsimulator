# Story 1.1: Dashboard Layout

As a user,
I want to see a dashboard with key metrics,
So that I can quickly assess my portfolio performance.

## Acceptance Criteria

**Given** I am on the dashboard page
**When** I view the page
**Then** I should see key portfolio metrics displayed prominently
**And** I should see a list of assets

## Implementation Details

### UI Components Required
- Portfolio summary section with key metrics:
  - Total portfolio value
  - Active positions value  
  - Closed positions value
- Asset list/grid showing all assets in the portfolio
- Each asset card should display:
  - Asset name
  - Current price
  - Position count
  - Overall performance

### Technical Requirements
- The dashboard should be responsive and visually appealing
- All metrics should update in real-time as asset prices change
- Asset cards should be displayed in a grid layout
- Navigation between different views should be smooth

### Test Cases
1. Dashboard loads successfully with default assets
2. Portfolio metrics update correctly when prices change
3. Asset cards display all required information
4. Grid layout adjusts appropriately for different screen sizes

## Tasks/Subtasks

### Task 1: Create Portfolio Summary Section
- [ ] Implement portfolio summary cards (total value, active positions, closed positions)
- [ ] Add proper styling for the summary section
- [ ] Ensure metrics update in real-time

### Task 2: Implement Asset Grid Display  
- [ ] Create asset grid container
- [ ] Display asset cards in responsive grid layout
- [ ] Ensure grid adjusts to different screen sizes

### Task 3: Verify Dashboard Loading and Metrics
- [ ] Confirm dashboard loads with default assets
- [ ] Verify all metrics update correctly when prices change
- [ ] Validate that all required information displays on asset cards

## Dev Notes

This story has already been partially implemented in the PortfolioSimulation.vue component. The implementation includes:
- Main dashboard layout with summary section
- Asset grid display
- Price controls
- Responsive design

The remaining work involves ensuring all acceptance criteria are fully met and addressing any failing tests from the test suite.

## Dev Agent Record

### Implementation Plan
The existing PortfolioSimulation.vue component already implements most of the dashboard layout functionality. The main focus should be on:
1. Running the full test suite to identify what still needs to be completed
2. Addressing any failing tests specifically related to this story
3. Ensuring all acceptance criteria are met

### File List
- vue-project/src/components/PortfolioSimulation.vue (main implementation)
- vue-project/src/components/AssetCard.vue (asset display)
- vue-project/src/components/PriceControls.vue (controls)

## Change Log

- Initial story creation on 12/01/2026

## Status: ready-for-dev
