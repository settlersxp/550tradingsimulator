/**
 * Business Logic: 
 * The portfolio simulation tracks multiple positions for each asset instead of a single position count.
 * Each position records its opening price when created. When price thresholds are met,
 * new positions are added to the list rather than incrementing a count value.
 * 
 * Implementation Logic:
 * - Asset objects now store positions as an array of position objects
 * - Each position object contains 'openingPrice' and 'quantity'
 * - New positions are pushed to the array when thresholds are crossed
 */
import { addPositionWhenThresholdCrossed } from './positionLogic.js';

let assets = [];

const wordList = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta", "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron", "Pi", "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega"];

/**
 * Business Logic:
 * Generates random words from a predefined list to name assets.
 * 
 * Implementation Logic:
 * - Uses Math.random() to select a word from the wordList array
 * - Returns a randomly selected asset name
 */
function generateRandomWord() {
  return wordList[Math.floor(Math.random() * wordList.length)];
}

/**
 * Business Logic:
 * Generates or updates portfolio assets based on user inputs.
 * When new assets are created, they start with one position at $100.
 * When updating existing assets, if price thresholds are crossed, a new position is added.
 * 
 * Implementation Logic:
 * - Checks if assets array is empty to initialize new assets
 * - For initialization: creates assets with positions array containing one initial position
 * - For updates: calculates percentage change and adds new position when thresholds are met
 * - Updates asset prices and previous prices for all assets
 */
function generatePortfolio() {
  const numAssets = parseInt(document.getElementById('numAssets').value);
  const upThreshold = parseFloat(document.getElementById('upThreshold').value);
  const downThreshold = parseFloat(document.getElementById('downThreshold').value);

  // Initialize assets if not already initialized
  if (assets.length === 0) {
    assets = [];
    for (let i = 0; i < numAssets; i++) {
      assets.push({
        name: generateRandomWord(),
        price: 100,
        prevPrice: 100,
        positions: [{
          openingPrice: 100,
          quantity: 1,
          stopLossPrice: 105, // 5% higher than opening price
          isActive: false
        }]
      });
    }
  } else {
    // Update existing assets
    assets.forEach(asset => {
      const percentageChange = (Math.random() * 200) - 100; // -100% to +100%
      const newPrice = asset.prevPrice * (1 + percentageChange / 100);
      const changePercentage = ((newPrice - asset.prevPrice) / asset.prevPrice) * 100;

      addPositionWhenThresholdCrossed(asset, upThreshold, downThreshold, changePercentage, newPrice);

      // Update prevPrice to be the previous price before updating price
      // Store the current price as the previous price, then update to new price
      const oldPrice = asset.price;  // Save the old price for clarity
      asset.prevPrice = oldPrice;
      asset.price = newPrice;
      
      // Check if current price is higher than any stop loss price and update accordingly
      if (asset.positions && asset.positions.length > 0) {
        asset.positions.forEach(position => {
          if (position.stopLossPrice !== undefined && asset.price > position.stopLossPrice) {
            position.stopLossPrice = asset.price;
          }
        });
      }
    });
  }

  renderPortfolio();
}

/**
 * Business Logic:
 * Renders the portfolio by creating HTML elements for each asset.
 * 
 * Implementation Logic:
 * - Clears existing portfolio content
 * - Creates a div element for each asset
 * - Sets the innerHTML of each asset div using generateAssetHTML
 * - Appends each asset div to the portfolio container
 * - Calls calculateTotalValue to update the portfolio total
 */
function renderPortfolio() {
  const portfolioDiv = document.getElementById('portfolio');
  portfolioDiv.innerHTML = '';

  assets.forEach(asset => {
    const assetDiv = document.createElement('div');
    assetDiv.className = 'asset';
    
    assetDiv.innerHTML = generateAssetHTML(asset);

    portfolioDiv.appendChild(assetDiv);
  });

  calculateTotalValue();
}

/**
 * Business Logic:
 * Generates HTML for displaying individual asset information including its positions.
 * 
 * Implementation Logic:
 * - Creates a string with the asset name, current price, and previous price
 * - Calls generatePositionsHTML to display all positions for this asset
 * - Returns the complete HTML string for the asset
 */
function generateAssetHTML(asset) {
  return `
    <strong>${asset.name}</strong><br>
    Price: $${(asset.price || 0).toFixed(2)}<br>
    ${generatePositionsHTML(asset.positions)}<br>
    Prev Price: $${(asset.prevPrice || 0).toFixed(2)}
  `;
}

/**
 * Business Logic:
 * Displays all positions for an asset, showing opening prices.
 * 
 * Implementation Logic:
 * - Checks if positions array is empty or undefined
 * - If empty, returns "Positions: 0"
 * - Otherwise, iterates through positions and displays each with its opening price
 * - Uses HTML line breaks for proper formatting
 */
function generatePositionsHTML(positions) {
  if (!positions || positions.length === 0) {
    return '<span style="font-weight: bold; color: #2c3e50;">Positions: 0</span>';
  }
  
  let html = '<span style="font-weight: bold; color: #2c3e50;">Positions:<br>';
  positions.forEach((position, index) => {
    html += `&nbsp;&nbsp;Position ${index + 1}: $${(position.openingPrice || 0).toFixed(2)}<br>`;
    // Safely handle stop loss properties that might not exist in older positions
    if (position.stopLossPrice !== undefined && position.isActive !== undefined) {
      html += `&nbsp;&nbsp;&nbsp;&nbsp;Stop Loss: $${(position.stopLossPrice || 0).toFixed(2)} (${position.isActive ? 'Active' : 'Inactive'})<br>`;
    } else {
      html += `&nbsp;&nbsp;&nbsp;&nbsp;Stop Loss: Not set<br>`;
    }
  });
  html += '</span>';
  
  return html;
}

/**
 * Business Logic:
 * Calculates the total value of all assets in the portfolio based on current prices and positions.
 * 
 * Implementation Logic:
 * - Uses reduce() to iterate through all assets
 * - For each asset, sums up the value of all its positions (price * quantity)
 * - Returns the total portfolio value
 */
function calculateTotalValue() {
  const total = assets.reduce((sum, asset) => {
    // Calculate total value based on all positions
    let assetTotal = 0;
    if (asset.positions && asset.positions.length > 0) {
      asset.positions.forEach(position => {
        assetTotal += (asset.price || 0) * position.quantity;
      });
    }
    return sum + assetTotal;
  }, 0);
  document.getElementById('totalValue').textContent = total.toFixed(2);
}

// Initial generation
generatePortfolio();
