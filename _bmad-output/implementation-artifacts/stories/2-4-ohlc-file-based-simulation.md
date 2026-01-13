# Story 2.4: OHLC File-Based Simulation

As a system,
I want to load historical price data from an OHLC file,
So that I can simulate realistic price movements based on actual market data.

## Acceptance Criteria

**Given** a user uploads an OHLC file with date, open, high, low, close columns
**When** the simulation runs
**Then** price movements should be simulated from open to close in increments of 0.5 for each day
**And** only one asset should be visible at a time during simulation
**And** the system should use real historical data instead of random numbers
**And** the file upload interface should be accessible as a standalone web page

## Implementation Details

### UI Components Required
- OHLC file upload interface
- Price movement simulation controls (start, pause, reset)
- Single asset display with price history
- File format validation and error handling
- Simulation progress indicators

### Technical Requirements
- The component should accept OHLC files in CSV/TSV format with columns: date, open, high, low, close
- Each day's price movement should be simulated from open to close in 0.5 increments for granular movement
- The simulation should maintain portfolio state between days
- Only one asset should be displayed at a time during simulation
- Component should integrate with existing portfolio logic functions (threshold crossing, stop loss management)
- Error handling for invalid file formats and data

### File Format Specification
The OHLC file should have the following format:
- Column 1: Date (format: YYYY-MM-DD or MM/DD/YYYY)
- Column 2: Open price (numeric value)
- Column 3: High price (numeric value) 
- Column 4: Low price (numeric value)
- Column 5: Close price (numeric value)
- Each row represents one trading day

### Simulation Logic
1. Parse OHLC file and validate data
2. Process each day's OHLC data sequentially
3. For each day, simulate price movements from open to close in 0.5 increments
4. Apply existing threshold crossing logic after each price update
5. Apply stop loss logic after each price update
6. Maintain portfolio state between days

## Tasks/Subtasks

### Task 1: Create OHLC File Upload Component
- [ ] Implement file upload interface with drag-and-drop support
- [ ] Add file validation for OHLC format
- [ ] Create parsing logic for CSV/TSV OHLC data
- [ ] Add error handling and user feedback for invalid files

### Task 2: Implement Price Movement Simulation
- [ ] Create simulation logic to move from open to close in 0.5 increments
- [ ] Process multiple days sequentially with proper state management
- [ ] Apply threshold crossing logic after each price movement
- [ ] Apply stop loss logic after each price movement

### Task 3: Integrate with Existing Portfolio Logic
- [ ] Connect simulation to existing addPositionWhenThresholdCrossed function
- [ ] Connect simulation to existing applyStopLossLogic function  
- [ ] Ensure proper integration with portfolio state management
- [ ] Test that existing threshold and stop loss parameters work correctly

### Task 4: Create Standalone Web Page
- [ ] Add new route for OHLC simulation page
- [ ] Implement standalone page layout
- [ ] Ensure only one asset is visible during simulation
- [ ] Add proper navigation to main dashboard

## Dev Notes

This story will create a new component that leverages existing portfolio logic while providing a different data input method. The key differences from the current FileBasedSimulation component are:
1. New interface accessible as standalone web page
2. OHLC file parsing and processing with date, open, high, low, close columns
3. Granular price movement simulation (0.5 increments instead of 1)
4. Single asset display during simulation

## Dev Agent Record

### Implementation Plan
This story requires creating a new component that processes OHLC data files for simulation. The implementation will:
1. Create a new Vue component for OHLC file-based simulation
2. Implement file parsing and validation logic
3. Build price movement simulation from open to close in 0.5 increments
4. Integrate with existing portfolio logic functions
5. Provide a standalone web page interface

### File List
- vue-project/src/components/OHLCFileSimulation.vue (new implementation)
- vue-project/src/utils/OHLCProcessor.ts (data processing utilities)
- vue-project/src/router/index.ts (for new route)

## Change Log

- Initial story creation on 13/01/2026

## Status: ready-for-dev

## Validation Findings
This story has been validated and is ready for development. All acceptance criteria are clearly defined, tasks are comprehensive, and implementation details are provided. The story follows the project's structure and requirements.
