# Technical Architecture Documentation: 550 Trading Simulator

## System Overview

The 550 Trading Simulator is a Vue.js-based application that implements a sophisticated portfolio simulation system with multi-position asset management, threshold crossing logic, and stop loss mechanisms. The architecture follows modern web development practices with clear separation of concerns and reactive programming principles.

## Architecture Layers

### Presentation Layer
- **Vue Components**: UI components built with Vue 3 Composition API
- **Component Hierarchy**:
  - PortfolioSimulation.vue (main application component)
  - AssetCard.vue (individual asset display)
  - PriceControls.vue (user interaction controls)
  - Layout.vue (application layout)

### Business Logic Layer
- **portfolioLogic.ts**: Core business logic implementation
- **ActionHistory.ts**: Debugging and tracking system
- **Type Definitions**: TypeScript interfaces for data structures

### Data Layer
- **Reactive State Management**: Vue's reactivity system for managing portfolio state
- **Asset Objects**: Complex data structures containing positions and historical data
- **Position Objects**: Detailed tracking of individual trading positions

## Component Architecture

### PortfolioSimulation.vue (Main Component)
**Responsibilities**:
- Orchestrates the entire simulation flow
- Manages reactive portfolio state
- Handles user interactions through PriceControls
- Processes asset updates with debouncing
- Exports debugging information via ActionHistory

**Data Flow**:
1. User input via PriceControls
2. Portfolio initialization or update
3. Asset price calculation and threshold checking
4. Position management (creation, closure)
5. Value calculation and UI rendering

### AssetCard.vue
**Responsibilities**:
- Display individual asset information
- Show current and previous prices
- Render position details for each asset

**Data Flow**:
1. Receives asset object as prop
2. Displays formatted asset information
3. Renders position details through generatePositionsHTML

### PriceControls.vue
**Responsibilities**:
- Provide user interface controls for simulation parameters
- Handle threshold adjustments (upward, downward, stop loss)
- Manage asset count changes
- Trigger simulation actions

## Data Flow Architecture

### Simulation Cycle
1. **Initialization Phase**:
   - Generate random asset names from word list
   - Create initial positions for each asset
   - Set baseline prices and previous prices

2. **Update Phase**:
   - Calculate percentage change for each asset
   - Apply threshold crossing logic (addPositionWhenThresholdCrossed)
   - Apply stop loss logic (applyStopLossLogic)
   - Update display prices with debouncing

3. **Rendering Phase**:
   - Update UI components with new data
   - Recalculate portfolio values
   - Display updated information to user

### State Management
The application uses Vue's reactive system for state management:
- Portfolio is a reactive object containing assets array and thresholds
- Assets are reactive objects with positions arrays
- Positions are reactive objects with opening price, quantity, stop loss, and active status
- Prices are tracked through current price and previous price properties

## Business Logic Architecture

### Threshold Crossing Logic
The system implements sophisticated threshold crossing detection:
- Uses highest opening price among all positions (active and inactive) for calculations
- Supports both upward and downward threshold mechanisms
- Implements trend reversal protection with reset conditions
- Handles edge cases and special scenarios properly

### Stop Loss Implementation
The stop loss mechanism follows these principles:
- **Price Increase**: Dynamically increases stop loss prices for active positions
- **Price Decrease**: Closes positions that were opened at higher prices than current price
- **Edge Case Handling**: Special handling for uninitialized stop loss values (-1)
- **Position Filtering**: Only closes positions with specific criteria met

### Position Management
Positions are managed through:
- Creation with proper initialization (opening price, quantity, stop loss, active status)
- Update of stop loss prices based on price movements
- Closure when price drops below stop loss levels
- Tracking of position lifecycle from open to closed state

## Technology Stack Architecture

### Frontend Technologies
- **Vue 3**: Component-based framework with Composition API
- **TypeScript**: Static typing for better code reliability and developer experience
- **Vite**: Modern build tool with fast development server
- **CSS Modules**: Scoped styling for component isolation

### Testing Framework
- **Vitest**: Fast test runner for JavaScript/TypeScript
- **Vue Test Utils**: Official testing utilities for Vue components
- **Test Coverage**: Comprehensive tests for all business logic functions

### Data Management
- **Reactive Properties**: Vue's reactivity system for state management
- **Object Structures**: Well-defined TypeScript interfaces for data consistency
- **Data Validation**: Input validation and error handling throughout the system

## Design Patterns

### Singleton Pattern
- **ActionHistory.ts**: Ensures single instance for centralized logging
- Provides methods for recording, retrieving, and exporting action history

### Functional Programming
- **Pure Functions**: Most business logic functions are pure with predictable inputs/outputs
- **Immutability**: Data structures are manipulated through well-defined functions
- **Composition**: Complex operations built from simpler, reusable functions

### Reactive Programming
- **Vue Reactivity**: Automatic updates when underlying data changes
- **Event Handling**: Component interactions handled through reactive state updates
- **Debouncing**: Performance optimization for frequent updates

## Performance Considerations

### Optimization Techniques
1. **Debouncing**: Price change processing is debounced to prevent excessive computation
2. **Efficient Data Structures**: Use of arrays and reduce operations for calculations
3. **Selective Updates**: Only update necessary UI components based on state changes
4. **Memory Management**: Proper cleanup of unused data structures

### Scalability Factors
- **Component-Based Design**: Easy to extend with additional features
- **Modular Architecture**: Business logic separated from UI concerns
- **Testable Code**: Well-defined functions support comprehensive testing
- **Clear Separation**: Each component has a single responsibility

## Error Handling and Logging

### Debugging System
The ActionHistory.ts provides comprehensive debugging capabilities:
- Records all actions with parameters and context
- Supports multiple export formats (JSON, text, CSV)
- Centralized logging for better traceability
- Timestamped entries for chronological analysis

### Input Validation
- Threshold values validated to be non-negative
- Asset count constrained to reasonable range (1-50)
- Price calculations include edge case handling
- Data integrity maintained throughout operations

## Security Considerations

### Input Sanitization
- User inputs are validated and sanitized before processing
- Asset names generated from predefined list to prevent injection
- Threshold values properly bounded

### Data Protection
- No external data is accessed or stored
- All calculations happen client-side
- History data is only available for debugging purposes

## Deployment Architecture

### Build Process
1. **Development**: Vite development server with hot-reload
2. **Production**: Optimized build with minification and tree-shaking
3. **Preview**: Local preview of production build

### Testing Integration
- Development: Continuous testing during development
- CI/CD: Automated test execution in pipeline
- Coverage: Comprehensive test suite for all functionality

## Future Extension Points

### Scalability Improvements
1. **State Persistence**: Add local storage or database persistence
2. **Multi-user Support**: Add user accounts and session management
3. **Advanced Analytics**: Add more detailed simulation results analysis
4. **Export Capabilities**: Add data export to various formats

### Feature Enhancements
1. **Portfolio Comparison**: Compare multiple simulation runs
2. **Advanced Strategies**: Add more sophisticated trading strategies
3. **Visualization Improvements**: Enhanced charting and graphing capabilities
4. **Simulation Parameters**: More configurable parameters for testing

## Integration Points

### External Dependencies
- **Vite**: Build tool and development server
- **Vue 3**: Core framework
- **TypeScript**: Type checking and compilation
- **Vitest**: Testing framework

### Internal Components
- **ActionHistory**: Centralized logging system
- **Portfolio Logic**: Core business logic functions
- **UI Components**: User interface elements
- **Type Definitions**: Data structure specifications

## Monitoring and Maintenance

### Health Checks
- Unit tests for all core functionality
- Integration tests for component interactions
- Performance tests for simulation runs
- Regression testing to prevent breaking changes

### Maintenance Considerations
- Clear separation of concerns facilitates easy maintenance
- Comprehensive documentation supports future development
- Well-defined interfaces enable safe refactoring
- Test coverage ensures stability during modifications

This architecture provides a solid foundation for the 550 Trading Simulator while maintaining flexibility for future enhancements and extensions.
