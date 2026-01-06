import type { Asset } from './types/asset'

// Word list for generating random asset names
const wordList = [
  'Apple', 'Banana', 'Cherry', 'Dragon', 'Elephant', 'Flower', 'Guitar', 'Harmony',
  'Iris', 'Jungle', 'Kite', 'Lion', 'Mountain', 'Night', 'Ocean', 'Piano',
  'Queen', 'River', 'Sun', 'Tree', 'Umbrella', 'Violin', 'Water', 'Xylophone',
  'Yacht', 'Zebra', 'Air', 'Beam', 'Cloud', 'Dance', 'Eagle', 'Fire'
]

// Generate a random word from the word list
export function generateRandomWord(): string {
  const randomIndex = Math.floor(Math.random() * wordList.length)
  return wordList[randomIndex] || ""
}

// Add a new position when price thresholds are crossed
export function addPositionWhenThresholdCrossed(asset: Asset, upwardThreshold: number, downwardThreshold: number): void {
  console.log("DEBUG: addPositionWhenThresholdCrossed called with:", { asset: asset.name, upwardThreshold, downwardThreshold });
  
  const uptrend = asset.price > asset.previousPrice;
  
  console.log("DEBUG: Asset:", asset);
  console.log("DEBUG: Uptrend:", uptrend);
  
  if (asset.positions.length === 0) {
    // If no positions exist at all, we can create a new one
    console.log("DEBUG: No existing positions, opening new position");
    openNewPosition(asset);
    return;
  }
  
  // Calculate the percentage difference between current price and highest opening price
  // This represents how much the price has dropped from the highest position
  const differencePercentage = Math.abs(((asset.highestOpeningPrice - asset.price) / asset.highestOpeningPrice) * 100);

  console.log("DEBUG: Highest opening price:", asset.highestOpeningPrice);
  console.log("DEBUG: Difference percentage:", differencePercentage);
  
  if(differencePercentage == 0){
    console.log('DEBUG: Difference is 0, returning early');
    return;
  }
  
  // Check for trend reversal protection 
  const trendReversalPercentage = asset.trendReversalPercentage; // Use the asset's trendReversalPercentage (which is required)
  
  console.log("DEBUG: Trend reversal percentage:", trendReversalPercentage);
  console.log("DEBUG: Asset trend reversed:", asset.trendReversed);
  
  // Activate trend reversal flag when price drops
  if (!asset.trendReversed && asset.price < asset.previousPrice) {
    console.log("DEBUG: Trend reversal triggered");
    asset.trendReversed = true;
    // When trend reversal is triggered, store the current price as the trigger value
    asset.reverseTrendTriggerValue = asset.price;
  }
  
  // If we're in a trend reversal period, check if we should allow new positions
  if (asset.trendReversed) {
    console.log("DEBUG: In trend reversal period");
    // Calculate how much current price is below the highest opening price
    const priceBelowTopPercentage = ((asset.highestOpeningPrice - asset.price) / asset.highestOpeningPrice) * 100;
    
    console.log("DEBUG: Price below top percentage:", priceBelowTopPercentage);
    
    // If we're still within trend reversal percentage, prevent new positions
    if (priceBelowTopPercentage < trendReversalPercentage) {
      console.log("DEBUG: Still within trend reversal percentage, preventing new positions");
      return; // Don't create new positions during trend reversal period
    }
    
    // The main condition for resetting trend reversal:
    // 1. Current price > old top price (price has recovered above highest opening price)
    // 2. Current price is trend reversal % lower than old top price (price dropped significantly again)
    // 3. Current price > reverse trend trigger value (the condition specified in the task - when current price exceeds the trigger value, reset trend reversal)
    const shouldReset = asset.price > asset.highestOpeningPrice || 
                        priceBelowTopPercentage >= trendReversalPercentage || 
                        (asset.reverseTrendTriggerValue !== undefined && asset.price > asset.reverseTrendTriggerValue);
    
    console.log("DEBUG: Should reset trend reversal:", shouldReset);
    
    if (shouldReset) {
      console.log("DEBUG: Resetting trend reversal");
      asset.trendReversed = false;
      // Reset the reverse trend trigger value when trend reversal is invalidated
      asset.reverseTrendTriggerValue = undefined;

      // Outside of the trendReversed while there are active positions, the highestOpeningPrice equals the max opening price of the opened positions.
      // The positions whithout a take profit are excluded because it is possible to have one opened at the historical maximum.
      const numberOfValidOpeningPrices: number[] = asset.positions.filter(p => p.isActive && p.stopLossPrice != -1).map(p => p.openingPrice)
      
      if(numberOfValidOpeningPrices.length>0){
        asset.highestOpeningPrice = Math.max(...numberOfValidOpeningPrices);
      }else{
        asset.highestOpeningPrice = asset.price;
      }
      
      // After trend reversal is reset, check if we should open a new position based on upward threshold
      // This fixes the issue where after trend reversal is reset, we would create positions 
      // on every price increase instead of only when upward threshold is reached
      console.log("DEBUG: After resetting trend reversal, checking for upward threshold");
      if (uptrend && differencePercentage > upwardThreshold) {
        console.log("DEBUG: Opening new position due to upward threshold after trend reversal reset");
        openNewPosition(asset);
        return;
      }
    }
  }
  
  // Price is going up significantly enough to open a new uptrend position
  console.log("DEBUG: Checking for upward threshold:", { upwardThreshold, differencePercentage });
  if(uptrend && differencePercentage > upwardThreshold){
    console.log("DEBUG: Opening new position due to upward threshold");
    openNewPosition(asset);
    return;
  }

  // Only create new positions if we're dealing with a significant drop (based on downward threshold)
  // The logic should be: when price drops significantly from the highest opening price, 
  // we want to add more positions to increase exposure
  console.log("DEBUG: Checking for downward threshold:", { downwardThreshold, differencePercentage });
  if (!uptrend && differencePercentage > downwardThreshold) {
    console.log("DEBUG: Opening new position due to downward threshold");
    openNewPosition(asset);
    return;
  }
  
  console.log("DEBUG: No conditions met for opening new position");
}

// Create a new position when thresholds are crossed
export function openNewPosition(asset: Asset): void {
  const newPosition = {
    openingPrice: asset.price,
    quantity: 1,
    stopLossPrice: -1, // For new positions, set stop loss price to -1 as default
    isActive: true
  };
  asset.positions.push(newPosition);

  asset.highestOpeningPrice = Math.max(...asset.positions.map(p => p.openingPrice));
}

// Apply stop loss logic based on price changes
export function applyStopLossLogic(asset: Asset, changePercentage: number, stopLossThreshold: number): void {
  // When the price of an asset increases, increase stop loss for all positions
  // as long as the calculated stop loss is higher than the current stop loss
  if (changePercentage > 0) { // Price increased
    asset.positions.forEach(position => {
      // Do not update the stop loss for positions just opened or with no change
      if(asset.price == position.openingPrice){
        return;
      }

      // Skip stop loss calculation for closed (inactive) positions
      if (!position.isActive) {
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
  // When the price of an asset decreases, close active positions that have dropped below stop loss price
  else if (changePercentage < 0) { // Price decreased
    asset.positions.forEach(position => {
      // Special case: don't close position if stop loss is uninitialized (-1)
      // and current price is less than opening price
      // Early return if position should NOT be closed
      
      // First, check if position is active
      if (!position.isActive) {
        return; // Don't process inactive positions
      }
      
      // Check if current asset price has dropped below the stop loss price for this position
      if (asset.price >= position.stopLossPrice) {
        return; // Don't close positions that haven't dropped below their stop loss price
      }
      
      // Third, special case: don't close position if stop loss is uninitialized (-1)
      // and current price is less than opening price
      if (position.stopLossPrice === -1 && asset.price < position.openingPrice) {
        return; // Don't close positions with uninitialized stop loss when price is below opening price
      }
      
      // If we reach here, all conditions are met to close the position
      // Close positions that have dropped below their stop loss price
      position.isActive = false; // Close active positions
    })
  }
}

// Calculate total portfolio value
export function calculateTotalValue(portfolioAssets: Asset[]): number {
  // Calculate the difference between closed positions and active positions
  const closedPositionsValue = calculateClosedPositionsValue(portfolioAssets);
  const activePositionsValue = calculateActivePositionsValue(portfolioAssets);
  return closedPositionsValue - activePositionsValue;
}

// Calculate value of only active positions
export function calculateActivePositionsValue(portfolioAssets: Asset[]): number {
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
export function calculateClosedPositionsValue(portfolioAssets: Asset[]): number {
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
