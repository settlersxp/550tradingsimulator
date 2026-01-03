// Portfolio Simulation Script
// This script simulates pressing the "Generate" button 10000 times and saves portfolio data

const fs = require('fs');
const path = require('path');

// Word list for generating random asset names (copied from portfolioLogic.ts)
const wordList = [
  'Apple', 'Banana', 'Cherry', 'Dragon', 'Elephant', 'Flower', 'Guitar', 'Harmony',
  'Iris', 'Jungle', 'Kite', 'Lion', 'Mountain', 'Night', 'Ocean', 'Piano',
  'Queen', 'River', 'Sun', 'Tree', 'Umbrella', 'Violin', 'Water', 'Xylophone',
  'Yacht', 'Zebra', 'Air', 'Beam', 'Cloud', 'Dance', 'Eagle', 'Fire'
]

// Generate a random word from the word list
function generateRandomWord() {
  const randomIndex = Math.floor(Math.random() * wordList.length)
  return wordList[randomIndex] || ""
}

// Add a new position when price thresholds are crossed
function addPositionWhenThresholdCrossed(asset, upwardThreshold, downwardThreshold) {
  // Check if we have any positions at all
  const allPositions = asset.positions;
  const uptrend = asset.price > asset.previousPrice;
  
  if (allPositions.length === 0) {
    // If no positions exist at all, we can create a new one
    openNewPosition(asset);
    return;
  }
  
  // Get the highest opening price among ALL positions (active and inactive)
  const highestOpeningPrice = Math.max(...allPositions.map(p => p.openingPrice));
  
  // Calculate the percentage difference between current price and highest opening price
  // This represents how much the price has dropped from the highest position
  const differencePercentage = Math.abs(((highestOpeningPrice - asset.price) / highestOpeningPrice) * 100);

  if(differencePercentage == 0){
    return;
  }
  
  // Price is going up significantly enough to open a new uptrend position
  if(uptrend && differencePercentage > upwardThreshold){
    openNewPosition(asset);
    return;
  }

  // Only create new positions if we're dealing with a significant drop (based on downward threshold)
  // The logic should be: when price drops significantly from the highest opening price, 
  // we want to add more positions to increase exposure
  if (!uptrend && differencePercentage > downwardThreshold) {
    openNewPosition(asset);
    return;
  }
}

// Create a new position when thresholds are crossed
function openNewPosition(asset) {
  const newPosition = {
    openingPrice: asset.price,
    quantity: 1,
    stopLossPrice: -1, // For new positions, set stop loss price to -1 as default
    isActive: true
  };
  asset.positions.push(newPosition);
}

// Apply stop loss logic based on price changes
function applyStopLossLogic(asset, changePercentage, stopLossThreshold) {
  // When the price of an asset increases, increase stop loss for all positions
  // as long as the calculated stop loss is higher than the current stop loss
  if (changePercentage > 0) { // Price increased
    asset.positions.forEach(position => {
      // Do not update the stop loss for positions just opened or with no change
      if(asset.price == position.openingPrice){
        return;
      }

      const stopLossMultiplier = 1 - (stopLossThreshold / 100);
      const calculatedStopLoss = asset.price * stopLossMultiplier;
      
      // Keep the better (higher) stop loss value - either the calculated one or existing one
      if (calculatedStopLoss >= position.openingPrice) {
        position.stopLossPrice = Math.max(calculatedStopLoss, position.stopLossPrice);
      }
    })
  } 
  // When the price of an asset decreases, close active positions that were opened at higher prices
  else if (changePercentage < 0) { // Price decreased
    asset.positions.forEach(position => {
      // Special case: don't close position if stop loss is uninitialized (-1)
      // and current price is less than opening price
      // Early return if position should NOT be closed
      
      // First, check if position is active
      if (!position.isActive) {
        return; // Don't process inactive positions
      }
      
      // Second, check if opening price is higher than current asset price
      if (!(position.openingPrice > asset.price)) {
        return; // Don't close positions that weren't opened at a higher price
      }
      
      // Third, special case: don't close position if stop loss is uninitialized (-1)
      // and current price is less than opening price
      if (position.stopLossPrice === -1 && asset.price < position.openingPrice) {
        return; // Don't close positions with uninitialized stop loss when price is below opening price
      }
      
      // If we reach here, all conditions are met to close the position
      // Only close positions that were opened at a higher price than current price
      position.isActive = false; // Close active positions
    })
  }
}

// Function to generate a portfolio with default settings
function generatePortfolio(numberOfAssets = 15) {
  const portfolio = {
    assets: [],
    upwardThreshold: 5,
    downwardThreshold: 50,
    stopLossThreshold: 3
  };
  
  // Generate initial assets
  for (let i = 0; i < numberOfAssets; i++) {
    const assetName = generateRandomWord();
    const initialPrice = 100;
    
    const newAsset = {
      name: assetName,
      price: initialPrice,
      previousPrice: initialPrice,
      positions: []
    };
    
    portfolio.assets.push(newAsset);
    openNewPosition(newAsset);
  }
  
  return portfolio;
}

// Function to update portfolio with new prices (simulating "Generate" button)
function updatePortfolio(portfolio) {
  // Update prices for all assets
  portfolio.assets.forEach(asset => {
    // Store previous price before updating
    asset.previousPrice = asset.price;
    
    // Simulate price change with random fluctuation
    const fluctuation = (Math.random() * 20) - 10; // Random number between -10 and 10
    asset.price = Math.max(0.01, asset.price + fluctuation); // Ensure price doesn't go below 0.01
    
    // Calculate percentage change
    const changePercentage = ((asset.price - asset.previousPrice) / asset.previousPrice) * 100;
    
    // Apply threshold crossing logic to add new positions when thresholds are crossed
    addPositionWhenThresholdCrossed(asset, portfolio.upwardThreshold, portfolio.downwardThreshold);
    
    // Apply stop loss logic based on price changes
    applyStopLossLogic(asset, changePercentage, portfolio.stopLossThreshold);
  });
}

// Function to run the simulation for a specified number of iterations
function runSimulation(iterations, runNumber) {
  console.log(`Starting simulation run #${runNumber} with ${iterations} iterations...`);
  
  // Initialize portfolio with default settings
  const portfolio = generatePortfolio(5); // Default 5 assets
  
  // Run the specified number of iterations (simulating Generate button presses)
  for (let i = 0; i < iterations; i++) {
    updatePortfolio(portfolio);
  }
  
  // Create timestamp for filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `portfolio-simulation-${runNumber}-${timestamp}.json`;
  
  // Save portfolio data to JSON file
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(portfolio, null, 2));
  
  console.log(`Simulation run #${runNumber} completed. Data saved to ${filename}`);
  
  return {
    fileName: filename,
    portfolio: portfolio
  };
}

// Main execution function
function main() {
  const iterations = 100; // assumes 1 new price per working day
  const totalRuns = 50;
  
  console.log(`Starting portfolio simulation: ${totalRuns} runs of ${iterations} iterations each`);
  
  const results = [];
  
  for (let i = 1; i <= totalRuns; i++) {
    const result = runSimulation(iterations, i);
    results.push(result);
  }
  
  console.log(`All ${totalRuns} simulation runs completed successfully!`);
  console.log('Results:');
  results.forEach((result, index) => {
    console.log(`  Run ${index + 1}: ${result.fileName}`);
  });
}

// Run the simulation
main();
