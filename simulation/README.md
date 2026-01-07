# Portfolio Simulation Application

This application simulates a portfolio with multiple assets, each tracking multiple positions for price movements.

## Business Logic

The portfolio simulation tracks multiple positions for each asset instead of a single position count. Each position records its opening price when created. When price thresholds are met, new positions are added to the list rather than incrementing a count value.

## Project Setup

Before running the application, make sure you have Node.js installed (version 20.19.0 or >=22.12.0 as specified in package.json). 

To set up the project:

1. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Server
To start the development server with hot-reload:
```bash
npm run dev
```
The application will be available at http://localhost:5173

### Building for Production
To build the application for production:
```bash
npm run build
```

### Previewing the Build
To preview the built application:
```bash
npm run preview
```

### Running Tests
To run the test suite with hotswap:
```bash
npm run test
```

When running tests with vitest, the console may get stuck in a hotswap state. To prevent this, use the `--run` flag or the dedicated test script:

```bash
# Run all tests without watch mode
npm run test:run

# Run specific test file without watch mode  
npm run test:run src/__tests__/downwardThreshold.spec.ts

# Alternative using npx
npx vitest --run
```


### Asset Management
- Assets are generated with random names from a predefined word list
- Each asset starts with one initial position at $100
- When updating existing assets, if price thresholds are crossed, a new position is added

### Threshold Logic
- Upward threshold: When price increases by X% or more from the highest opening price among all positions, a new position is created
- Downward threshold: When price decreases by Y% or more from the highest opening price among all positions, a new position is created
- New positions are only added when thresholds are crossed (inclusive of threshold values)

### Position Tracking
- Each position records its opening price when created
- Positions include quantity and stop loss price information
- Stop loss prices are set to -1 for new positions (uninitialized)
- Stop loss prices are updated dynamically when asset prices rise above previous stop loss levels

## Implementation Logic

### Core Data Structure
- Asset objects store positions as an array of position objects
- Each position object contains:
  - `openingPrice`: The price at which the position was opened
  - `quantity`: The number of units in the position (always 1 in this implementation)
  - `stopLossPrice`: The stop loss price set to -1 for new positions (uninitialized)
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
  - Checks if we have any positions at all
  - Gets the highest opening price among ALL positions (active and inactive)
  - Calculates the percentage difference between current price and highest opening price
  - If the difference is significant enough based on the upward or downward threshold, adds a new position with current price
  - Sets stopLossPrice to -1 for new positions (uninitialized)
  - Sets quantity to 1 and isActive to true for new positions

#### openNewPosition()
- **Purpose**: Creates a new position when thresholds are crossed
- **Implementation**:
  - Creates a new position object with current asset price as opening price
  - Sets quantity to 1
  - Sets stopLossPrice to -1 (uninitialized)
  - Sets isActive to true

#### applyStopLossLogic()
- **Purpose**: Updates stop loss prices and closes positions based on price changes
- **Implementation**:
  - When price increases: increases stop loss for all positions by applying the stop loss threshold percentage to current price
  - When price decreases: closes active positions that were opened at higher prices than current price, unless stop loss is uninitialized (-1) and current price is less than opening price
  - Special handling for newly created positions with stopLossPrice = -1

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
  - Stop loss price = -1 (uninitialized)
  - Active status = true

### Position Management
- Positions are stored as an array for each asset
- Each position tracks its opening price, quantity, and stop loss price
- Stop loss prices are dynamically updated when asset prices rise above previous stop loss levels
- When a new position is created, it has isActive=true by default
- When asset prices decrease significantly, only positions opened at higher prices than current price are closed
- Special handling for positions with uninitialized stop loss (-1) to prevent premature closing

### Key Implementation Details
- The application uses a word list from `vue-project/src/portfolioLogic.ts` containing 40 words for generating random asset names
- The portfolio includes a stop loss threshold that can be adjusted by users
- The stop loss logic works by calculating stop loss prices using the formula: price * (1 - threshold_percentage)
- When price drops below stop loss levels, positions may be closed
- Special edge case handling for newly created positions with uninitialized stop loss (-1) values
- Only positions opened at higher prices than current price are eligible to be closed when price decreases

### User Interface Components
- The main UI is in `vue-project/src/App.vue` 
- Interactive controls allow users to adjust:
  - Number of assets (1-50)
  - Upward threshold percentage (0% and above)
  - Downward threshold percentage (0% and above) 
  - Stop loss threshold percentage (0% and above)
- The UI updates in real-time with portfolio information including:
  - Closed positions value
  - Active positions value  
  - Total portfolio value
  - Individual asset details including prices and position information
- Position information is displayed using the `PositionDisplay` component

### Testing
- Comprehensive tests are located in `vue-project/src/__tests__/`
- Tests cover various scenarios including:
  - Threshold crossing logic
  - Stop loss behavior
  - Position creation and closing
  - Edge cases with uninitialized stop loss values
  - Portfolio value calculations
  - Asset name generation

Generate simulation-results.html using:
```
node portfolio-simulation.js
node process-simulations.js
```

Open simulation-results.html in a browser
