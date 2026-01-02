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
export function addPositionWhenThresholdCrossed(asset: Asset, changePercentage: number): void {
  // When price threshold is crossed (5% increase or decrease), create a new position
  if (Math.abs(changePercentage) >= 5) {
    const newPosition = {
      openingPrice: asset.price,
      quantity: 1,
      stopLossPrice: asset.price * 1.05, // 5% higher than opening price
      isActive: true
    };
    asset.positions.push(newPosition);
  }
}

// Apply stop loss logic based on price changes
export function applyStopLossLogic(asset: Asset, changePercentage: number): void {
  // When the price of an asset increases, increase stop loss for all positions
  // as long as current take profit price is lower than new price
  if (changePercentage > 0) { // Price increased
    asset.positions.forEach(position => {
      // Increase stop loss for all positions when price increases
      // and the current stop loss is less than the new price
      if (position.stopLossPrice < asset.price) {
        position.stopLossPrice = asset.price * 1.05; // Set to 5% above new price
      }
    })
  } 
  // When the price of an asset decreases, close active positions that were opened at higher prices
  else if (changePercentage < 0) { // Price decreased
    asset.positions.forEach(position => {
      if (position.isActive && position.openingPrice > asset.price) {
        // Only close positions that were opened at a higher price than current price
        position.isActive = false; // Close active positions
      }
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
