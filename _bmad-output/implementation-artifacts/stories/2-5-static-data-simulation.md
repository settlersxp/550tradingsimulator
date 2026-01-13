# Story 2.5: Static Data Simulation

As a system,
I want to process multiple days of OHLC data for extended simulation,
So that I can evaluate trading strategies over longer time periods.

## Acceptance Criteria

**Given** an OHLC file with multiple days of historical data
**When** the simulation processes each day's data
**Then** the system should simulate price movements for all days sequentially
**And** the portfolio should maintain state between days
**And** threshold crossing and stop loss logic should be applied to each simulated price movement

## Implementation Details

### UI Components Required
- Enhanced OHLC file-based simulation interface
- Multi-day simulation controls (start, pause, reset)
- Progress tracking for multi-day simulations
- Portfolio value trend visualization over time
- Simulation status indicators

### Technical Requirements
- The component should be able to process multiple days of OHLC data sequentially
- Each day's price movement should be simulated from open to close in 0.5 increments for granular movement
- Portfolio state must be maintained between consecutive days
- Threshold crossing logic should be applied after each price update during multi-day simulations
- Stop loss logic should be applied after each price update during multi-day simulations
- The system should support simulation of multiple assets over time periods
- Component should integrate with existing portfolio logic functions (threshold crossing, stop loss management)
- Error handling for invalid data across multiple days

### File Format Specification
The OHLC file should have the following format:
- Column 1: Date (format: YYYY-MM-DD or MM/DD/YYYY)
- Column 2: Open price (numeric value)
- Column 3: High price (numeric value) 
- Column 4: Low price (numeric value)
- Column 5: Close price (numeric value)
- Each row represents one trading day

### Simulation Logic
1. Parse OHLC file and validate data for all days
2. Process each day's OHLC data sequentially
3. For each day, simulate price movements from open to close in 0.5 increments
4. Apply existing threshold crossing logic after each price movement
5. Apply stop loss logic after each price movement
6. Maintain portfolio state between days
7. Continue processing until all days are simulated

## Tasks/Subtasks

### Task 1: Implement Multi-Day OHLC Processing
- [ ] Create logic to process multiple days of OHLC data sequentially
- [ ] Add date validation and error handling for multi-day files
- [ ] Ensure proper parsing of CSV/TSV OHLC data with multiple entries

### Task 2: Maintain Portfolio State Across Days
- [ ] Implement state persistence between consecutive days
- [ ] Ensure portfolio values and positions are maintained correctly
- [ ] Test that portfolio calculations work across multiple days

### Task 3: Apply Threshold Crossing and Stop Loss Logic
- [ ] Integrate existing threshold crossing logic with multi-day simulation
- [ ] Integrate existing stop loss management with multi-day simulation
- [ ] Verify that all existing logic works correctly during extended simulations

### Task 4: Enhance Simulation Controls
- [ ] Add controls for multi-day simulation (start, pause, reset)
- [ ] Implement progress tracking and status indicators
- [ ] Create visualization of portfolio value trends over time

## Dev Notes

This story builds upon the existing OHLC file-based simulation component (Story 2.4) to extend its functionality to process multiple days. The key differences from Story 2.4 are:
1. Extended simulation capability for multi-day OHLC files
2. Portfolio state management between consecutive days
3. Enhanced controls and visualization for extended simulations

## Dev Agent Record

### Implementation Plan
This story requires extending the existing OHLC file-based simulation to support multi-day processing. The implementation will:
1. Enhance the existing OHLC processing logic to handle multiple days
2. Implement portfolio state persistence between days
3. Apply threshold crossing and stop loss logic to each price movement in the sequence
4. Add enhanced controls for multi-day simulations

### File List
- vue-project/src/components/OHLCFileSimulation.vue (enhanced implementation)
- vue-project/src/utils/OHLCProcessor.ts (data processing utilities)
- vue-project/src/router/index.ts (for new route if needed)

## Change Log

- Initial story creation on 13/01/2026

## Status: ready-for-dev

## Validation Findings
This story has been validated and is ready for development. It clearly builds upon the previous OHLC File-Based Simulation story, with well-defined enhancements for multi-day processing. The acceptance criteria are specific and measurable, and the tasks are comprehensive. The story shows good continuity with the existing implementation plan.
