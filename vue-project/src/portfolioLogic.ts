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
export function addPositionWhenThresholdCrossed(asset: Asset, changePercentage: number, stopLossThreshold: number): void {
  // When price threshold is crossed (5% increase or decrease), create a new position
  if (Math.abs(changePercentage) >= 5) {
    openNewPosition(asset);
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
  // as long as current take profit price is lower than new price
  if (changePercentage > 0) { // Price increased
    asset.positions.forEach(position => {
      // For existing positions (where stopLossPrice is not 0), calculate new stop loss based on threshold from current price
      // but keep the better (higher) value between calculated and existing stop loss price
      if (position.stopLossPrice !== 0) {
        const stopLossMultiplier = 1 - (stopLossThreshold / 100);
        const calculatedStopLoss = asset.price * stopLossMultiplier;
        // Keep the better (higher) stop loss value - either the calculated one or existing one
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
