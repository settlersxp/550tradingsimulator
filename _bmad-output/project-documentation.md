# Project Documentation: 550 Trading Simulator

## Project Overview

The 550 Trading Simulator is a Vue.js-based application that simulates portfolio trading with multiple assets, each tracking multiple positions for price movements. The system implements sophisticated threshold crossing logic for adding new positions and stop loss management.

## Technology Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest with Vue Test Utils
- **Styling**: CSS Scoped in Components
- **Architecture**: Component-based with reactive state management

## Project Structure

```
550tradingsimulator/
├── vue-project/                 # Main application
│   ├── src/
│   │   ├── components/          # UI Components
│   │   ├── types/               # TypeScript interfaces
│   │   ├── history/             # Action tracking system
│   │   ├── __tests__/           # Test files
│   │   ├── portfolioLogic.ts    # Core business logic
│   │   └── main.ts              # Application entry point
│   ├── package.json             # Dependencies and scripts
│   └── README.md                # Project documentation
├── simulation/                  # Simulation scripts
│   ├── portfolio-simulation.js  # Main simulation logic
│   ├── process-simulations.js   # Results processing
│   └── README.md                # Simulation documentation
└── _bmad-output/                # Documentation output
```

## Core Components

### PortfolioSimulation.vue
The main application component that orchestrates the portfolio simulation. It manages:
- Asset generation and updates
- Threshold crossing logic
- Stop loss management
- User interface controls for asset count, thresholds, and actions

### portfolioLogic.ts
Contains all core business logic including:
- `generateRandomWord()`: Generates random asset names from a predefined list
- `addPositionWhenThresholdCrossed()`: Adds new positions based on price threshold crossing
- `openNewPosition()`: Creates new positions when thresholds are met
- `applyStopLossLogic()`: Updates stop loss prices and closes positions based on price changes
- Portfolio value calculations

### ActionHistory.ts
A centralized system to track all actions performed on assets for debugging purposes, replacing console.log with structured history tracking.

## Key Features

1. **Multi-position Asset Management**: Each asset maintains an array of positions instead of a single position count
2. **Threshold Crossing Logic**: 
   - Upward threshold: When price increases by X% from highest opening price, new position is created
   - Downward threshold: When price decreases by Y% from highest opening price, new position is created
3. **Stop Loss Management**:
   - Stop loss prices are dynamically updated when asset prices rise
   - Positions are closed when prices drop below stop loss levels
4. **Trend Reversal Protection**: Prevents new positions during trend reversal periods unless specific reset conditions are met

## Business Logic

### Position Management
- Positions store opening price, quantity, stop loss price, and active status
- Stop loss prices are initialized to -1 for new positions (uninitialized)
- When a new position is created, it has `isActive = true` by default

### Threshold Crossing Logic
The system uses the highest opening price among all positions (active and inactive) to calculate percentage differences. This allows for sophisticated trend analysis.

### Stop Loss Implementation
- **Price Increase**: Stop loss prices are increased for all active positions by applying threshold percentage to current price
- **Price Decrease**: Only positions opened at higher prices than current price are closed

## Data Flow

1. User inputs number of assets, upward threshold, downward threshold, and stop loss threshold
2. Portfolio is initialized with random asset names and one initial position each
3. On each update cycle:
   - Percentage change is calculated for each asset (-100% to +100%)
   - If thresholds are crossed, new positions are added via `addPositionWhenThresholdCrossed()`
   - Asset prices are updated
   - Stop loss prices are adjusted if current price exceeds previous stop loss levels
4. Portfolio is rendered with updated information
5. Total portfolio value is calculated and displayed

## Testing Strategy

The application uses Vitest for testing with comprehensive test coverage including:
- Threshold crossing logic
- Stop loss behavior
- Position creation and closing
- Edge cases with uninitialized stop loss values
- Portfolio value calculations
- Asset name generation

## Simulation Capabilities

The project includes a simulation framework that can run multiple iterations to analyze portfolio performance:
1. `portfolio-simulation.js`: Main simulation script generating 50 runs of 100 iterations each
2. `process-simulations.js`: Processes results and generates HTML visualization using Chart.js
3. Results are saved in JSON format for analysis

## Configuration and Environment

The project uses standard Node.js configuration with:
- package.json scripts for common tasks (dev, build, test, preview)
- TypeScript configuration for type safety
- ESLint and Prettier for code quality and formatting

## Deployment and Build

- Development server via `npm run dev`
- Production build via `npm run build`
- Preview of production build via `npm run preview`
- Testing with hot-reload via `npm run test` or headless via `npm run test:run`

## Next Steps

This documentation provides a comprehensive overview of the 550 Trading Simulator project. It serves as a foundation for AI-assisted development and brownfield PRD workflow implementation.
