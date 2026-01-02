# Portfolio Simulation Application

This application simulates a portfolio with multiple assets, each tracking multiple positions for price movements.

## Business Logic

The portfolio simulation tracks multiple positions for each asset instead of a single position count. Each position records its opening price when created. When price thresholds are met, new positions are added to the list rather than incrementing a count value.

### Asset Management
- Assets are generated with random names from a predefined word list
- Each asset starts with one initial position at $100
- When updating existing assets, if price thresholds are crossed, a new position is added

### Threshold Logic
- Upward threshold: When price increases by X% or more, a new position is created
- Downward threshold: When price decreases by Y% or more, a new position is created
- New positions are only added when thresholds are crossed (inclusive of threshold values)

### Position Tracking
- Each position records its opening price when created
- Positions include quantity and stop loss price information
- Stop loss prices are set at 5% higher than the opening price for new positions
- Stop loss prices are updated dynamically when asset prices rise above previous stop loss levels

## Implementation Logic

### Core Data Structure
- Asset objects store positions as an array of position objects
- Each position object contains:
  - `openingPrice`: The price at which the position was opened
  - `quantity`: The number of units in the position (always 1 in this implementation)
  - `stopLossPrice`: The stop loss price set at 5% above opening price
  - `isActive`: Boolean flag indicating if the position is active

### Key Functions

#### generateRandomWord()
- **Purpose**: Generates random words from a predefined list to name assets
- **Implementation**: Uses Math.random() to select a word from the wordList array

#### generatePortfolio()
- **Purpose**: Generates or updates portfolio assets based on user inputs
- **Implementation**:
  - Checks if assets array is empty to initialize new assets
  - For initialization: creates assets with positions array containing one initial position
  - For updates: calculates percentage change and adds new position when thresholds are met
  - Updates asset prices and previous prices for all assets

#### addPositionWhenThresholdCrossed()
- **Purpose**: Adds a new position to an asset when price thresholds are crossed
- **Implementation**:
  - Checks if changePercentage >= upThreshold OR changePercentage <= -downThreshold
  - If threshold is crossed, adds a new position with current price
  - Sets stopLossPrice at 5% higher than new price (newPrice * 1.05)
  - Sets quantity to 1 and isActive to false for new positions

#### renderPortfolio()
- **Purpose**: Renders the portfolio by creating HTML elements for each asset
- **Implementation**:
  - Clears existing portfolio content
  - Creates a div element for each asset
  - Sets the innerHTML of each asset div using generateAssetHTML
  - Appends each asset div to the portfolio container
  - Calls calculateTotalValue to update the portfolio total

#### generateAssetHTML()
- **Purpose**: Generates HTML for displaying individual asset information including its positions
- **Implementation**:
  - Creates a string with the asset name, current price, and previous price
  - Calls generatePositionsHTML to display all positions for this asset
  - Returns the complete HTML string for the asset

#### generatePositionsHTML()
- **Purpose**: Displays all positions for an asset, showing opening prices
- **Implementation**:
  - Checks if positions array is empty or undefined
  - If empty, returns "Positions: 0"
  - Otherwise, iterates through positions and displays each with its opening price
  - Uses HTML line breaks for proper formatting

#### calculateTotalValue()
- **Purpose**: Calculates the total value of all assets in the portfolio based on current prices and positions
- **Implementation**:
  - Uses reduce() to iterate through all assets
  - For each asset, sums up the value of all its positions (price * quantity)
  - Returns the total portfolio value

### Data Flow
1. User inputs number of assets, upward threshold, and downward threshold
2. Portfolio is initialized with random asset names and one initial position each
3. On each update cycle:
   - Percentage change is calculated for each asset (-100% to +100%)
   - If thresholds are crossed, new positions are added via addPositionWhenThresholdCrossed()
   - Asset prices are updated
   - Stop loss prices are adjusted if current price exceeds previous stop loss levels
4. Portfolio is rendered with updated information
5. Total portfolio value is calculated and displayed

### Threshold Handling
- Thresholds are checked using inclusive comparison (>= for upward, <= for downward)
- When a threshold is crossed, a new position is created with:
  - Opening price = current asset price
  - Quantity = 1
  - Stop loss price = opening price * 1.05 (5% higher than opening price)
  - Active status = false

### Position Management
- Positions are stored as an array for each asset
- Each position tracks its opening price, quantity, and stop loss price
- Stop loss prices are dynamically updated when asset prices rise above previous stop loss levels
