# Story: Asset Price Movement Logging for Unit Testing

## Story ID
1.1

## Story Key  
1-1-asset-price-movement-logging

## User Story Statement
As a developer, I want to implement comprehensive logging of price movements and asset reactions so that I can copy-paste the logs into unit tests to verify behavior.

## Detailed Acceptance Criteria
- [ ] Implement logging system that captures all price movements for each asset
- [ ] Log asset reactions to price movements (position creation, closure, stop loss updates)
- [ ] Format logs in a way that can be easily copied and transformed into unit test assertions
- [ ] Include timestamp, asset name, price change details, and action taken
- [ ] Support logging for all threshold crossing events
- [ ] Ensure logs are structured to support debugging of complex scenarios

## Technical Requirements
- Add logging functionality to `portfolioLogic.ts` 
- Capture price movements with percentage changes
- Log position creation events with opening prices and quantities
- Record stop loss updates and position closures
- Include current portfolio value in logs for validation
- Make log output easily transformable into test assertions

## Business Context and Value
This logging system will enable developers to:
1. Quickly verify that price movements trigger correct asset reactions
2. Debug complex scenarios by examining the sequence of events
3. Create comprehensive unit tests based on actual execution traces
4. Validate edge cases without manually constructing test data

## Success Criteria
- Logs are generated for all price movement scenarios 
- Each log entry contains sufficient context to reproduce the scenario in a unit test
- Log format is consistent and structured
- No performance impact on the main application logic

## Developer Context
This story builds upon existing threshold crossing logic, stop loss management, and position creation/deletion functions. The logging system should integrate seamlessly with existing code paths without changing core business logic behavior.

## File Structure Requirements
The logging functionality should be implemented in:
- `vue-project/src/portfolioLogic.ts` - Core business logic with logging additions
- `vue-project/src/history/ActionHistory.ts` - May need to be extended for comprehensive logging

## Testing Approaches
- Unit tests should verify that log entries are generated correctly
- Integration tests should validate that logs contain expected information
- Existing functionality must remain intact during logging implementation

## Previous Story Intelligence
None - This is a new feature to enhance debugging capabilities.

## Git Intelligence Summary
None - No previous work patterns to analyze.

## Latest Technical Information
- TypeScript 4.x with Vue 3 Composition API
- Vitest for testing framework
- Component-based architecture with reactive state management
- Existing portfolio simulation logic with complex threshold crossing behavior

## Project Context Reference
This feature integrates with the existing trading simulator that:
1. Manages multiple assets with multiple positions each
2. Implements upward and downward threshold crossing logic
3. Uses stop loss mechanisms to manage risk
4. Tracks position lifecycle from open to closed states
5. Calculates portfolio values based on asset prices and positions

## Story Completion Status
- [x] Story created with comprehensive context
- [x] Status set to: ready-for-dev
