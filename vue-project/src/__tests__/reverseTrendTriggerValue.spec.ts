import { describe, it, expect } from 'vitest'
import type { Asset } from '../types/asset'
import { addPositionWhenThresholdCrossed } from '../portfolioLogic'

describe('Reverse Trend Trigger Value Tests', () => {
  // Test the specific issue: "Downward Threshold" should be triggered even during trend reversal
  it('should open position when downward threshold is reached during trend reversal', () => {
    // Create an asset that has already experienced a trend reversal
    const asset: Asset = {
      name: 'TestAsset',
      price: 85.00, // Current price (below previous)
      displayPrice: 85.00,
      previousPrice: 100.00, // Previous price (lower)
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: -1, isActive: true }
      ],
      trendReversed: true, // Trend was reversed
      trendReversalPercentage: 10,
      reverseTrendTriggerValue: 95.00, // Price at which reversal occurred
      highestOpeningPrice: 100.00
    }
    
    // Store initial position count
    const initialPositions = asset.positions.length
    
    // With a downward threshold of 10%, the price should be allowed to drop 10% 
    // from highest opening price (100) which is 90, so 85 should still be valid
    addPositionWhenThresholdCrossed(asset, 5, 10)
    
    // Should create a new position because downward threshold is met even during trend reversal
    expect(asset.positions).toHaveLength(initialPositions + 1)
  })

  // Test that the fix doesn't break normal trend reversal protection
  it('should still prevent positions during trend reversal when downward threshold not met', () => {
    // Create an asset that has already experienced a trend reversal but price is not low enough
    const asset: Asset = {
      name: 'TestAsset',
      price: 92.00, // Current price (still above threshold)
      displayPrice: 92.00,
      previousPrice: 100.00, // Previous price (lower)
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: -1, isActive: true }
      ],
      trendReversed: true, // Trend was reversed
      trendReversalPercentage: 10,
      reverseTrendTriggerValue: 95.00, // Price at which reversal occurred
      highestOpeningPrice: 100.00
    }
    
    // Store initial position count
    const initialPositions = asset.positions.length
    
    // With a downward threshold of 10%, price should be allowed to drop to 90
    // Since 92 is above 90, no new position should be created
    addPositionWhenThresholdCrossed(asset, 5, 10)
    
    // Should not create a new position because downward threshold is not met
    expect(asset.positions).toHaveLength(initialPositions)
  })

  // Test that trend reversal is properly reset when price exceeds trigger value
  it('should reset trend reversal when current price exceeds reverse trend trigger value', () => {
    const asset: Asset = {
      name: 'TestAsset',
      price: 105.00, // Current price (higher than previous)
      displayPrice: 105.00,
      previousPrice: 100.00, // Previous price 
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: -1, isActive: true }
      ],
      trendReversed: true,
      trendReversalPercentage: 10,
      reverseTrendTriggerValue: 95.00, // Price at which trend reversal occurred
      highestOpeningPrice: 100.00
    }
    
    const initialPositions = asset.positions.length
    
    addPositionWhenThresholdCrossed(asset, 5, 50)
    
    // Trend reversal should be reset because current price (105) > trigger value (95)
    expect(asset.trendReversed).toBe(false)
    expect(asset.reverseTrendTriggerValue).toBeUndefined()
    
    // Should not create new position here because we're in normal threshold checking logic
    expect(asset.positions).toHaveLength(initialPositions)
  })

  // Test the complete flow: trend reversal reset + then upward threshold check
  it('should properly handle complete trend reversal reset and then upward threshold', () => {
    // Start with a scenario where trend is reversed
    const asset: Asset = {
      name: 'TestAsset',
      price: 90.00, // Price below the highest opening price (100)
      displayPrice: 90.00,
      previousPrice: 100.00, // Previous price 
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: -1, isActive: true }
      ],
      trendReversed: true,
      trendReversalPercentage: 10,
      reverseTrendTriggerValue: 95.00, // Price at which trend reversal occurred
      highestOpeningPrice: 100.00
    }
    
    const initialPositionCount = asset.positions.length
    
    // Simulate price moving up enough to reset trend reversal (current price > trigger value)
    asset.previousPrice = 90.00
    asset.price = 105.00 // Price is now above the reverse trigger value of 95 and above highest opening price
    
    addPositionWhenThresholdCrossed(asset, 5, 50)
    
    // Trend reversal should be reset
    expect(asset.trendReversed).toBe(false)
    
    // Now we check for upward threshold - when price goes from 100 to 105, that's a 5% increase
    // This should meet the 5% upward threshold and create a new position
    expect(asset.positions).toHaveLength(initialPositionCount + 1)
  })
})
