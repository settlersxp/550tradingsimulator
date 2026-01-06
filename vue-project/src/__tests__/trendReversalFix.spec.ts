import { describe, it, expect } from 'vitest'
import type { Position } from '../types/position'
import type { Asset } from '../types/asset'
import { addPositionWhenThresholdCrossed } from '../portfolioLogic'

describe('Trend Reversal Fix Tests', () => {
  // Test the specific scenario described in the issue
  it('should only open new position when upward threshold is reached after trend reversal reset', () => {
    // Simulate the exact scenario from the task:
    // 1. "Trend Reversed" switches from "yes" to "no" 
    // 2. "Current Price" is lower than "Downward Threshold (%)"
    // 3. When price starts to increase, should only open new trade when upward threshold is reached
    
    const asset: Asset = {
      name: 'TestAsset',
      price: 95.00, // Current price (lower than previous)
      displayPrice: 95.00, // Display price
      previousPrice: 100.00, // Previous price 
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: -1, isActive: true } as Position
      ],
      trendReversed: true, // Trend was reversed (yes)
      trendReversalPercentage: 10,
      reverseTrendTriggerValue: 95.00, // Price at which reversal was triggered
      highestOpeningPrice: 100.00 // Required by Asset interface
    }
    
    // Initially, there should be 1 position
    expect(asset.positions).toHaveLength(1)
    
    // Simulate price going up from 95 to 102 (7% increase)
    // This should not create a new position because it's less than upward threshold of 5%
    asset.previousPrice = 95.00
    asset.price = 102.00
    
    addPositionWhenThresholdCrossed(asset, 5, 50) // upwardThreshold = 5%, downwardThreshold = 50%
    
    // Should NOT create new position because 7% increase is less than 5% upward threshold
    expect(asset.positions).toHaveLength(1)
    
    // Now simulate price going up enough to exceed the upward threshold
    asset.previousPrice = 102.00
    asset.price = 106.00 // 6% increase (exceeds 5% threshold)
    
    addPositionWhenThresholdCrossed(asset, 5, 50) // upwardThreshold = 5%, downwardThreshold = 50%
    
    // Should create new position because 6% > 5% upward threshold
    expect(asset.positions).toHaveLength(2)
  })

  // Test that trend reversal flag gets reset properly when price exceeds trigger value
  it('should properly reset trend reversal when current price > reverse trend trigger value', () => {
    const asset: Asset = {
      name: 'TestAsset',
      price: 105.00, // Current price (higher than previous)
      displayPrice: 105.00, // Display price
      previousPrice: 100.00, // Previous price 
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: -1, isActive: true } as Position
      ],
      trendReversed: true,
      trendReversalPercentage: 10,
      reverseTrendTriggerValue: 95.00, // Price at which trend reversal occurred
      highestOpeningPrice: 100.00 // Required by Asset interface
    }
    
    const initialPositionCount = asset.positions.length
    
    addPositionWhenThresholdCrossed(asset, 5, 50)
    
    // Trend reversal should be reset because current price (105) > trigger value (95)
    expect(asset.trendReversed).toBe(false)
    expect(asset.reverseTrendTriggerValue).toBeUndefined()
    
    // Should not create new position here because we're in the normal threshold checking logic
    expect(asset.positions).toHaveLength(initialPositionCount)
  })

  // Test the complete scenario: trend reversal reset + then upward threshold check
  it('should properly handle complete trend reversal reset and then upward threshold', () => {
    // Start with a scenario where trend is reversed
    const asset: Asset = {
      name: 'TestAsset',
      price: 90.00, // Price below the highest opening price (100)
      displayPrice: 90.00, // Display price
      previousPrice: 100.00, // Previous price 
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: -1, isActive: true } as Position
      ],
      trendReversed: true,
      trendReversalPercentage: 10,
      reverseTrendTriggerValue: 95.00, // Price at which trend reversal occurred
      highestOpeningPrice: 100.00 // Required by Asset interface
    }
    
    const initialPositionCount = asset.positions.length
    
    // Simulate price moving up enough to reset trend reversal (current price > trigger value)
    asset.previousPrice = 90.00
    asset.price = 102.00 // Price is now above the reverse trigger value of 95
    
    addPositionWhenThresholdCrossed(asset, 5, 50)
    
    // Trend reversal should be reset
    expect(asset.trendReversed).toBe(false)
    
    // Should create new position because we're checking upward threshold after reset
    expect(asset.positions).toHaveLength(initialPositionCount + 1)
  })
})
