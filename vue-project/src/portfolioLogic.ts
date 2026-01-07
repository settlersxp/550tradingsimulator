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

/**
 * Adds a new position to an asset when price thresholds are crossed, with sophisticated trend reversal protection.
 * 
 * The function checks for three conditions to determine when to add a new position:
 * 1. When price increases significantly from the highest opening price (upward threshold)
 * 2. When price decreases significantly from the highest opening price (downward threshold)
 * 3. When price recovers above the highest opening price after a trend reversal
 * 
 * The trend reversal protection mechanism prevents new positions during a trend reversal period
 * unless specific reset conditions are met, including price recovery above the highest opening price,
 * significant price drop, price exceeding the reverse trend trigger value, or price increase.
 * 
 * @param asset - The asset to which a new position should be added
 * @param upwardThreshold - The percentage threshold for upward price movement
 * @param downwardThreshold - The percentage threshold for downward price movement
 */
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
    

    // The main condition for resetting trend reversal:
    // 1. Current price > old top price (price has recovered above highest opening price)
    // 2. Current price is trend reversal % lower than old top price (price dropped significantly again)
    // 3. Current price > reverse trend trigger value (the condition specified in the task - when current price exceeds the trigger value, reset trend reversal)
    // 4. Price has increased (current price > previous price) - this is the new requirement from the task
    const shouldResetCondition1 = asset.price > asset.highestOpeningPrice;
    console.log("DEBUG: shouldResetCondition1:", shouldResetCondition1);
    const shouldResetCondition2 = priceBelowTopPercentage >= trendReversalPercentage;
    console.log("DEBUG: shouldResetCondition2:", shouldResetCondition2);
    const shouldResetCondition3 = (asset.reverseTrendTriggerValue !== undefined && asset.price > asset.reverseTrendTriggerValue);
    console.log("DEBUG: shouldResetCondition3:", shouldResetCondition3);
    const shouldResetCondition4 = asset.price > asset.previousPrice;
    console.log("DEBUG: shouldResetCondition4:", shouldResetCondition4);
    
    const shouldReset = shouldResetCondition1 || 
                        shouldResetCondition2 || 
                        shouldResetCondition3 ||
                        shouldResetCondition4;
                        
    // If we're still within trend reversal percentage, prevent new positions 
    // unless one of the exceptions is encountered
    if (priceBelowTopPercentage < trendReversalPercentage) {
      console.log("DEBUG: Still within trend reversal percentage, preventing new positions");
      if(!shouldReset){
        return; // Don't create new positions during trend reversal period
      }else{
        console.log("DEBUG: Should reset trend reversal:", shouldReset);
      }
    }
    
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
  // DEBUG: Uncomment to enable debug logging
  // console.log("DEBUG: applyStopLossLogic called with:", { asset: asset.name, changePercentage, stopLossThreshold });
  
  // Define clear states for the logic flow
  const isPriceIncreasing = changePercentage > 0;
  const isPriceDecreasing = changePercentage < 0;
  const isPriceUnchanged = changePercentage === 0;
  
  // Handle unchanged price case immediately
  if (isPriceUnchanged) {
    // DEBUG: Uncomment to enable debug logging
    // console.log("DEBUG: Price unchanged, no action needed");
    return; // No action needed when price doesn't change
  }
  
  // Process based on price movement direction
  if (isPriceIncreasing) {
    // DEBUG: Uncomment to enable debug logging
    // console.log("DEBUG: Processing price increase");
    processStopLossIncrease(asset, stopLossThreshold);
  } else if (isPriceDecreasing) {
    // DEBUG: Uncomment to enable debug logging
    // console.log("DEBUG: Processing price decrease");
    processStopLossDecrease(asset);
  }
}

function processStopLossIncrease(asset: Asset, stopLossThreshold: number): void {
  // DEBUG: Uncomment to enable debug logging
  // console.log("DEBUG: Processing stop loss increase for asset:", asset.name);
  
  // Loop through all positions and update stop loss for active ones
  asset.positions.forEach(position => {
    // Define clear conditions for processing each position
    const isPositionActive = position.isActive;
    const isPositionNewlyOpened = asset.price === position.openingPrice;
    
    // DEBUG: Uncomment to enable debug logging
    // console.log("DEBUG: Processing position:", { 
    //   isActive: isPositionActive, 
    //   isNewlyOpened: isPositionNewlyOpened,
    //   openingPrice: position.openingPrice,
    //   currentPrice: asset.price
    // });
    
    // Skip processing if position is inactive or newly opened
    if (!isPositionActive || isPositionNewlyOpened) {
      // DEBUG: Uncomment to enable debug logging
      // console.log("DEBUG: Skipping position processing - inactive or newly opened");
      return;
    }
    
    // Calculate new stop loss value
    const stopLossMultiplier = 1 - (stopLossThreshold / 100);
    const calculatedStopLoss = asset.price * stopLossMultiplier;
    
    // DEBUG: Uncomment to enable debug logging
    // console.log("DEBUG: Calculated stop loss:", { 
    //   calculatedStopLoss, 
    //   existingStopLoss: position.stopLossPrice,
    //   openingPrice: position.openingPrice
    // });
    
    // Update stop loss only when beneficial
    const isBeneficialToUpdate = calculatedStopLoss >= position.openingPrice;
    if (isBeneficialToUpdate) {
      position.stopLossPrice = Math.max(calculatedStopLoss, position.stopLossPrice);
      // DEBUG: Uncomment to enable debug logging
      // console.log("DEBUG: Updated stop loss for position:", { 
      //   newStopLoss: position.stopLossPrice 
      // });
    }
  });
}

function processStopLossDecrease(asset: Asset): void {
  // DEBUG: Uncomment to enable debug logging
  // console.log("DEBUG: Processing stop loss decrease for asset:", asset.name);
  
  // Loop through all positions to check for closure
  asset.positions.forEach(position => {
    // Define clear conditions for closing positions
    const isPositionActive = position.isActive;
    const isBelowStopLoss = asset.price < position.stopLossPrice;
    const isUninitializedStopLoss = position.stopLossPrice === -1;
    const isPriceBelowOpening = asset.price < position.openingPrice;
    
    // DEBUG: Uncomment to enable debug logging
    // console.log("DEBUG: Checking position for closure:", { 
    //   isActive: isPositionActive,
    //   belowStopLoss: isBelowStopLoss,
    //   uninitializedStopLoss: isUninitializedStopLoss,
    //   priceBelowOpening: isPriceBelowOpening,
    //   currentPrice: asset.price,
    //   stopLossPrice: position.stopLossPrice,
    //   openingPrice: position.openingPrice
    // });
    
    // Skip processing if position is inactive
    if (!isPositionActive) {
      // DEBUG: Uncomment to enable debug logging
      // console.log("DEBUG: Skipping closure check - position inactive");
      return;
    }
    
    // Skip closing if price hasn't dropped below stop loss
    if (!isBelowStopLoss) {
      // DEBUG: Uncomment to enable debug logging
      // console.log("DEBUG: Skipping closure - not below stop loss");
      return;
    }
    
    // Special case: don't close if stop loss is uninitialized and price is below opening
    if (isUninitializedStopLoss && isPriceBelowOpening) {
      // DEBUG: Uncomment to enable debug logging
      // console.log("DEBUG: Skipping closure - uninitialized stop loss with price below opening");
      return;
    }
    
    // Close the position since it dropped below stop loss
    position.isActive = false;
    // DEBUG: Uncomment to enable debug logging
    // console.log("DEBUG: Closed position:", { 
    //   closingPrice: asset.price,
    //   stopLossPrice: position.stopLossPrice
    // });
  });
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
