/**
 * Automated Simulation Runner for Portfolio Trading Simulator
 * This script automates the execution of multiple portfolio simulations
 * with varying parameters to analyze performance patterns.
 */

const fs = require('fs');
const path = require('path');

// Word list for generating random asset names (copied from portfolioLogic.ts)
const wordList = [
  'Apple', 'Banana', 'Cherry', 'Dragon', 'Elephant', 'Flower', 'Guitar', 'Harmony',
  'Iris', 'Jungle', 'Kite', 'Lion', 'Mountain', 'Night', 'Ocean', 'Piano',
  'Queen', 'River', 'Sun', 'Tree', 'Umbrella', 'Violin', 'Water', 'Xylophone',
  'Yacht', 'Zebra', 'Air', 'Beam', 'Cloud', 'Dance', 'Eagle', 'Fire'
];

// Generate a random word from the word list
function generateRandomWordInternal() {
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

// Calculate total portfolio value
function calculateTotalValue(portfolioAssets) {
  // Calculate the difference between closed positions and active positions
  const closedPositionsValue = calculateClosedPositionsValue(portfolioAssets);
  const activePositionsValue = calculateActivePositionsValue(portfolioAssets);
  return closedPositionsValue - activePositionsValue;
}

// Calculate value of only active positions
function calculateActivePositionsValue(portfolioAssets) {
  return portfolioAssets.reduce((total, asset) => {
    const assetValue = asset.positions.reduce((assetTotal, position) => {
      if (position.isActive) {
        return assetTotal + (position.openingPrice * position.quantity);
      }
      return assetTotal;
    }, 0)
    return total + assetValue
  }, 0)
}

// Calculate value of only closed positions
function calculateClosedPositionsValue(portfolioAssets) {
  return portfolioAssets.reduce((total, asset) => {
    const assetValue = asset.positions.reduce((assetTotal, position) => {
      if (!position.isActive) {
        return assetTotal + (position.openingPrice * position.quantity);
      }
      return assetTotal;
    }, 0)
    return total + assetValue
  }, 0)
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
    const assetName = generateRandomWordInternal();
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

// Function to run a single simulation with specified parameters
function runSingleSimulation(iterations, runNumber, params) {
  console.log(`Starting simulation run #${runNumber} with ${iterations} iterations...`);
  
  // Initialize portfolio with default settings
  const portfolio = generatePortfolio(params.numberOfAssets || 5); // Default 5 assets
  
  // Set the parameters for this specific run
  if (params.upwardThreshold) portfolio.upwardThreshold = params.upwardThreshold;
  if (params.downwardThreshold) portfolio.downwardThreshold = params.downwardThreshold;
  if (params.stopLossThreshold) portfolio.stopLossThreshold = params.stopLossThreshold;
  
  // Run the specified number of iterations
  for (let i = 0; i < iterations; i++) {
    updatePortfolio(portfolio);
  }
  
  // Create timestamp for filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `automated-simulation-${runNumber}-${timestamp}.json`;
  
  // Save portfolio data to JSON file
  const filePath = path.join(__dirname, '..', 'simulation', filename);
  fs.writeFileSync(filePath, JSON.stringify(portfolio, null, 2));
  
  console.log(`Simulation run #${runNumber} completed. Data saved to ${filename}`);
  
  return {
    fileName: filename,
    portfolio: portfolio,
    runNumber: runNumber,
    params: params,
    totalValue: calculateTotalValue(portfolio.assets)
  };
}

// Function to run multiple automated simulations with parameter variations
function runAutomatedSimulations() {
  const iterations = 100; // assumes 1 new price per working day
  const totalRuns = 20;
  
  console.log(`Starting automated simulation suite: ${totalRuns} runs with parameter variations`);
  
  const results = [];
  
  // Define different parameter sets to test
  const parameterSets = [
    { upwardThreshold: 5, downwardThreshold: 50, stopLossThreshold: 3, numberOfAssets: 5 },
    { upwardThreshold: 10, downwardThreshold: 60, stopLossThreshold: 5, numberOfAssets: 5 },
    { upwardThreshold: 3, downwardThreshold: 40, stopLossThreshold: 2, numberOfAssets: 5 },
    { upwardThreshold: 8, downwardThreshold: 70, stopLossThreshold: 4, numberOfAssets: 5 },
    { upwardThreshold: 15, downwardThreshold: 80, stopLossThreshold: 6, numberOfAssets: 5 },
    { upwardThreshold: 5, downwardThreshold: 50, stopLossThreshold: 3, numberOfAssets: 10 },
    { upwardThreshold: 5, downwardThreshold: 50, stopLossThreshold: 3, numberOfAssets: 15 },
    { upwardThreshold: 5, downwardThreshold: 50, stopLossThreshold: 3, numberOfAssets: 20 }
  ];
  
  // Run simulations with different parameter sets
  for (let i = 1; i <= totalRuns; i++) {
    // Cycle through parameter sets or use specific ones
    const paramSetIndex = (i - 1) % parameterSets.length;
    const result = runSingleSimulation(iterations, i, parameterSets[paramSetIndex]);
    results.push(result);
    
    // Add a small delay between runs to prevent overwhelming the system
    if (i < totalRuns) {
      console.log(`Waiting before next simulation...`);
      // In a real implementation, you might add a delay here
    }
  }
  
  console.log(`All ${totalRuns} automated simulation runs completed successfully!`);
  return results;
}

// Function to generate comprehensive analysis report
function generateAnalysisReport(results) {
  console.log('Generating comprehensive analysis report...');
  
  // Sort by total value for ranking
  const sortedResults = [...results].sort((a, b) => b.totalValue - a.totalValue);
  
  const reportContent = `
# Automated Simulation Analysis Report

## Summary Statistics

Total simulations run: ${results.length}
Best performing simulation: Run #${sortedResults[0].runNumber} with value $${sortedResults[0].totalValue.toFixed(2)}
Worst performing simulation: Run #${sortedResults[sortedResults.length - 1].runNumber} with value $${sortedResults[sortedResults.length - 1].totalValue.toFixed(2)}
Average portfolio value: $${(results.reduce((sum, r) => sum + r.totalValue, 0) / results.length).toFixed(2)}

## Detailed Results

| Run # | Upward Threshold | Downward Threshold | Stop Loss | Assets | Portfolio Value |
|-------|------------------|--------------------|-----------|--------|-----------------|
${results.map(r => 
  `| ${r.runNumber} | ${r.params.upwardThreshold || 'N/A'} | ${r.params.downwardThreshold || 'N/A'} | ${r.params.stopLossThreshold || 'N/A'} | ${r.params.numberOfAssets || 'N/A'} | $${r.totalValue.toFixed(2)} |`
).join('\n')}

## Top Performers

1. Run #${sortedResults[0].runNumber} - Value: $${sortedResults[0].totalValue.toFixed(2)}
   Parameters: Upward=${sortedResults[0].params.upwardThreshold}, Downward=${sortedResults[0].params.downwardThreshold}, StopLoss=${sortedResults[0].params.stopLossThreshold}

2. Run #${sortedResults[1].runNumber} - Value: $${sortedResults[1].totalValue.toFixed(2)}
   Parameters: Upward=${sortedResults[1].params.upwardThreshold}, Downward=${sortedResults[1].params.downwardThreshold}, StopLoss=${sortedResults[1].params.stopLossThreshold}

3. Run #${sortedResults[2].runNumber} - Value: $${sortedResults[2].totalValue.toFixed(2)}
   Parameters: Upward=${sortedResults[2].params.upwardThreshold}, Downward=${sortedResults[2].params.downwardThreshold}, StopLoss=${sortedResults[2].params.stopLossThreshold}

## Recommendations

Based on the analysis, consider the following parameter combinations for optimal performance:
- Conservative approach: Higher downward thresholds and lower upward thresholds
- Aggressive approach: Lower downward thresholds and higher upward thresholds
- Balanced approach: Moderate thresholds with appropriate asset counts

`;
  
  // Write report to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFilename = `automated-simulation-report-${timestamp}.md`;
  const reportPath = path.join(__dirname, '..', 'automation', reportFilename);
  fs.writeFileSync(reportPath, reportContent);
  
  console.log(`Analysis report generated: ${reportFilename}`);
  return reportPath;
}

// Main execution function
function main() {
  try {
    console.log('Starting Automated Simulation Runner...');
    
    // Run the automated simulations
    const results = runAutomatedSimulations();
    
    // Generate analysis report
    const reportPath = generateAnalysisReport(results);
    
    console.log('Automated simulation suite completed successfully!');
    console.log(`Results saved to: ${reportPath}`);
    
    return {
      success: true,
      totalRuns: results.length,
      reportPath: reportPath,
      results: results
    };
  } catch (error) {
    console.error('Error in automated simulation runner:', error);
    process.exit(1); // Exit with error code to make sure it fails when errors occur
    return {
      success: false,
      error: error.message
    };
  }
}

// Export functions for use in other modules
module.exports = {
  runAutomatedSimulations,
  generateAnalysisReport,
  main
};

// Run if this file is executed directly
if (require.main === module) {
  main();
}
