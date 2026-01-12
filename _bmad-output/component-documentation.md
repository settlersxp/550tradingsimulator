# Component-Level Documentation: 550 Trading Simulator

## PortfolioSimulation.vue

### Overview
The main application component that orchestrates the portfolio simulation. It manages asset generation, threshold crossing logic, stop loss management, and user interface controls.

### Props
None

### Data Properties
- `portfolio`: Reactive object containing assets array and threshold settings
- `numberOfAssets`: Ref for tracking number of assets to generate
- `portfolio.assets`: Array of Asset objects
- `portfolio.upwardThreshold`: Percentage threshold for upward price movement
- `portfolio.downwardThreshold`: Percentage threshold for downward price movement  
- `portfolio.stopLossThreshold`: Percentage threshold for stop loss calculations

### Methods
- `generatePortfolio()`: Generates or updates portfolio assets based on user inputs
- `getTotalValue()`: Calculates total portfolio value
- `getClosedPositionsValue()`: Calculates closed positions value
- `getActivePositionsValue()`: Calculates active positions value
- `processAssetUpdates(asset)`: Processes individual asset updates including threshold crossing and stop loss logic
- `reinitialize()`: Reinitializes the entire portfolio
- `onPricesChanged()`: Handles price changes with debouncing
- `handleAssetCountChange(newCount)`: Updates number of assets from PriceControls component
- `exportHistory()`: Exports action history for debugging

### Lifecycle Hooks
- `generatePortfolio()` called on component mount to initialize portfolio
- `watch(numberOfAssets)` to regenerate portfolio when asset count changes

### Template Structure
The component renders:
1. PriceControls - UI for adjusting thresholds and asset count
2. Portfolio information display (closed positions, active positions, total value)
3. AssetCard components for each asset in the portfolio
4. Export History button for debugging purposes

## AssetCard.vue

### Overview
Component responsible for displaying individual asset information including name, price, previous price, and position details.

### Props
- `asset`: Asset object containing all necessary data for display

### Data Properties
None

### Methods
None

### Template Structure
Displays:
1. Asset name
2. Current price and previous price 
3. Position information using generatePositionsHTML
4. Proper formatting with CSS styling

## PriceControls.vue

### Overview
UI component providing controls for adjusting portfolio parameters including asset count, thresholds, and actions.

### Props
- `portfolio`: Portfolio object containing threshold settings

### Data Properties
None

### Methods
- `onGenerate()`: Triggers portfolio regeneration
- `onReinitialize()`: Reinitializes the entire portfolio
- `onAssetCountChange()`: Handles asset count changes
- `onUpwardThresholdChange()`: Updates upward threshold
- `onDownwardThresholdChange()`: Updates downward threshold
- `onStopLossThresholdChange()`: Updates stop loss threshold

### Template Structure
Provides controls for:
1. Asset count adjustment (+, - buttons)
2. Upward threshold input
3. Downward threshold input
4. Stop loss threshold input
5. Generate button
6. Reinitialize button
7. Export History button

## ActionHistory.ts

### Overview
Centralized system to track all actions performed on assets for debugging purposes, replacing console.log with structured history tracking.

### Singleton Pattern
- Implements singleton pattern to ensure single instance throughout application
- Uses static getInstance() method for access

### Methods
- `recordAction(actionType, assetName, params, result)`: Records an action with its parameters and context
- `getActions()`: Returns all recorded actions
- `clear()`: Clears all recorded actions
- `exportAsJson()`: Exports history as JSON string
- `exportAsText()`: Exports history as formatted text
- `exportAsCsv()`: Exports history as CSV format

## portfolioLogic.ts

### Overview
Contains all core business logic for the portfolio simulation including asset management, threshold crossing detection, and stop loss implementation.

### Functions

#### generateRandomWord()
**Purpose**: Generates random words from a predefined list to name assets  
**Implementation**: Uses Math.random() to select a word from the wordList array

#### addPositionWhenThresholdCrossed(asset, upwardThreshold, downwardThreshold)
**Purpose**: Adds a new position to an asset when price thresholds are crossed
**Implementation**:
- Checks if we have any positions at all
- Gets the highest opening price among ALL positions (active and inactive)
- Calculates the percentage difference between current price and highest opening price
- If the difference is significant enough based on the upward or downward threshold, adds a new position with current price
- Sets stopLossPrice to -1 for new positions (uninitialized)
- Sets quantity to 1 and isActive to true for new positions

#### openNewPosition(asset)
**Purpose**: Creates a new position when thresholds are crossed  
**Implementation**:
- Creates a new position object with current asset price as opening price
- Sets quantity to 1
- Sets stopLossPrice to -1 (uninitialized)
- Sets isActive to true

#### applyStopLossLogic(asset, changePercentage, stopLossThreshold)
**Purpose**: Updates stop loss prices and closes positions based on price changes  
**Implementation**:
- When price increases: increases stop loss for all positions by applying the stop loss threshold percentage to current price
- When price decreases: closes active positions that were opened at higher prices than current price, unless stop loss is uninitialized (-1) and current price is less than opening price

#### calculateTotalValue(portfolioAssets)
**Purpose**: Calculates the total value of all assets in the portfolio based on current prices and positions  
**Implementation**:
- Uses reduce() to iterate through all assets
- For each asset, sums up the value of all its positions (price * quantity)
- Returns the total portfolio value

#### calculateActivePositionsValue(portfolioAssets)
**Purpose**: Calculates value of only active positions  
**Implementation**:
- Uses reduce() to iterate through all assets
- For each asset, sums up the value of only active positions
- Returns the active positions value

#### calculateClosedPositionsValue(portfolioAssets)
**Purpose**: Calculates value of only closed positions  
**Implementation**:
- Uses reduce() to iterate through all assets
- For each asset, sums up the value of only closed positions
- Returns the closed positions value

## Types Definitions

### Asset
```typescript
interface Asset {
  name: string
  price: number
  displayPrice: number
  previousPrice: number
  positions: Position[]
  highestOpeningPrice: number
  trendReversed: boolean
  trendReversalPercentage: number
  reverseTrendTriggerValue?: number
  initialReverseTrendTriggerValue?: number
  initialUptrendValue?:number
}
```

### Position
```typescript
interface Position {
  openingPrice: number
  quantity: number
  stopLossPrice: number
  isActive: boolean
}
```

### Portfolio
```typescript
interface Portfolio {
  assets: Asset[]
  upwardThreshold: number
  downwardThreshold: number
  stopLossThreshold: number
}
```

## Architecture Patterns

1. **Reactive State Management**: Uses Vue's reactive system for managing portfolio state
2. **Component-Based Architecture**: Clear separation of concerns between components
3. **Singleton Pattern**: ActionHistory uses singleton pattern for centralized logging
4. **Functional Programming**: Business logic is implemented as pure functions
5. **Event-Driven Updates**: Component updates through reactive data binding

## Testing Approach

The application follows a comprehensive testing strategy using Vitest:
- Unit tests for individual functions in portfolioLogic.ts
- Component tests for UI elements 
- Integration tests for business logic flows
- Edge case testing for stop loss scenarios
- Threshold crossing validation
