# Story 1.2: Asset Details View

As a user,
I want to see detailed information about each asset when I click on it,
So that I can analyze individual asset performance and position details.

## Acceptance Criteria

**Given** I am viewing the dashboard
**When** I click on an asset card
**Then** I should be taken to a detailed view page for that specific asset
**And** the detailed view should display all relevant information about that asset

## Implementation Details

### UI Components Required
- Detailed asset view page with comprehensive information
- Asset overview section showing:
  - Current price and previous price
  - Highest opening price
  - Trend reversal status and related values
- Positions section showing:
  - All positions for the asset (active and closed)
  - Position details including opening price, quantity, stop loss price
  - Portfolio value calculations for this asset
- Navigation back to dashboard

### Technical Requirements
- The detailed view should be accessible from the dashboard via a click on any asset card
- Component should receive asset data as props
- All information displayed should come from the existing asset model
- Component should properly handle assets with no positions
- Component should display all relevant position details for both active and closed positions

### Test Cases
1. Asset details view loads successfully when clicking on an asset card
2. All asset properties are displayed correctly (current price, previous price, highest opening price)
3. Trend reversal information is displayed properly
4. Positions section shows all positions with correct details
5. Portfolio value calculations work for both active and closed positions
6. Component handles assets with no positions gracefully
7. Navigation back to dashboard works correctly

## Tasks/Subtasks

### Task 1: Create Detailed Asset View Component
- [ ] Implement detailed asset view component with comprehensive layout
- [ ] Add proper styling for the detailed view section
- [ ] Ensure all asset properties are displayed in organized sections

### Task 2: Implement Position Display Logic
- [ ] Create position display logic for both active and closed positions
- [ ] Show position details including opening price, quantity, stop loss price
- [ ] Add calculations for total, active, and closed positions values

### Task 3: Integrate with Dashboard Navigation
- [ ] Ensure the component can be navigated to from the dashboard
- [ ] Verify proper prop passing of asset data
- [ ] Test navigation works correctly

## Dev Notes

This story builds upon the existing AssetDetailView.vue component which already provides a basic implementation. The enhancement should:
1. Add more comprehensive information display
2. Improve the layout and styling for better readability
3. Ensure all relevant information from the asset model is shown
4. Handle edge cases like assets with no positions

## Dev Agent Record

### Implementation Plan
The existing AssetDetailView.vue component provides a basic implementation but needs enhancement to show more detailed information. The main focus should be:
1. Improving the layout and information display
2. Adding better organization of the information
3. Ensuring all asset properties are shown properly
4. Enhancing the position display with more details

### File List
- vue-project/src/components/AssetDetailView.vue (main implementation)
- vue-project/src/types/asset.ts (for reference on available properties)
- vue-project/src/types/position.ts (for reference on position properties)

## Change Log

- Initial story creation on 13/01/2026

## Status: ready-for-dev
