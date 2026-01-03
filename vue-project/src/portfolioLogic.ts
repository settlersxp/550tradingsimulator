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
  
  // Check for trend reversal protection 
  const trendReversalPercentage = asset.trendReversalPercentage; // Use the asset's trendReversalPercentage (which is required)
  
  // Activate trend reversal flag when price drops
  if (!asset.trendReversed && asset.price < asset.previousPrice) {
    asset.trendReversed = true;
    // When trend reversal is triggered, store the current price as the trigger value
    asset.reverseTrendTriggerValue = asset.price;
  }
  
  // If we're in a trend reversal period, check if we should allow new positions
  if (asset.trendReversed) {
    // Calculate how much current price is below the highest opening price
    const priceBelowTopPercentage = ((highestOpeningPrice - asset.price) / highestOpeningPrice) * 100;
    
    // If we're still within trend reversal percentage, prevent new positions
    if (priceBelowTopPercentage < trendReversalPercentage) {
      return; // Don't create new positions during trend reversal period
    }
    
    // The main condition for resetting trend reversal:
    // 1. Current price > old top price (price has recovered above highest opening price)
    // 2. Current price is trend reversal % lower than old top price (price dropped significantly again)
    // 3. Current price > reverse trend trigger value (the condition specified in the task - when current price exceeds the trigger value, reset trend reversal)
    const shouldReset = asset.price > highestOpeningPrice || 
                        priceBelowTopPercentage >= trendReversalPercentage || 
                        (asset.reverseTrendTriggerValue !== undefined && asset.price > asset.reverseTrendTriggerValue);
    
    if (shouldReset) {
      console.log("DEBUG: Resetting trend reversal");
      asset.trendReversed = false;
      // Reset the reverse trend trigger value when trend reversal is invalidated
      asset.reverseTrendTriggerValue = undefined;
    }
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
export function openNewPosition(asset: Asset): void {
  const newPosition = {
    openingPrice: asset.price,
    quantity: 1,
    stopLossPrice: -1, // For new positions, set stop loss price to -1 as default
    isActive: true
  };
  asset.positions.push(newPosition);
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
