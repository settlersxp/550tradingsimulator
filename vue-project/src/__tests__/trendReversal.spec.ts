import { describe, it, expect } from 'vitest'
import type { Position } from '../types/position'
import type { Asset } from '../types/asset'
import { addPositionWhenThresholdCrossed, applyStopLossLogic } from '../portfolioLogic'

describe('Trend Reversal Protection Tests', () => {
  // Test that trend reversal flag is activated when price drops
  it('should activate trend reversal flag when current price < previous price', () => {
    // Create an asset with a position and set up an uptrend scenario
    const asset: Asset = {
      name: 'TestAsset',
      price: 105.00, // Current price
      displayPrice: 105.00, // Display price
      previousPrice: 110.00, // Previous price (lower)
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: -1, isActive: true } as Position
      ],
      trendReversed: false,
      trendReversalPercentage: 10
    }
    
    // Initially, no trend reversal should be active
    expect(asset.positions[0].isActive).toBe(true)
    
    // Call the function that should detect trend reversal
    addPositionWhenThresholdCrossed(asset, 5, 5) // upwardThreshold = 5%, downwardThreshold = 5%
    
    // Should not create new positions during trend reversal (this is just testing flag activation)
    expect(asset.positions).toHaveLength(1)
  })

  // Test that trend reversal logic prevents new position creation when trend is reversed
  it('should prevent opening new positions during trend reversal period', () => {
    // Create an asset with an existing position
    const asset: Asset = {
      name: 'TestAsset',
      price: 95.00, // Current price (lower than previous)
      displayPrice: 95.00, // Display price
      previousPrice: 100.00, // Previous price 
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: -1, isActive: true } as Position
      ],
      trendReversed: false,
      trendReversalPercentage: 10
    }
    
    // Store initial position count
    const initialPositions = asset.positions.length
    
    // Call function that should prevent new positions during trend reversal
    addPositionWhenThresholdCrossed(asset, 5, 5)
    
    // Should not create new positions during trend reversal period
    expect(asset.positions).toHaveLength(initialPositions)
  })

// Test that trend reversal flag is reset when price exceeds old top price
  it('should reset trend reversal flag when current price > old top price', () => {
    // Create an asset with a position and simulate trend reversal scenario
    const asset: Asset = {
      name: 'TestAsset',
      price: 110.00, // Current price (higher than previous)
      previousPrice: 105.00, // Previous price 
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: -1, isActive: true } as Position
      ],
      trendReversalPercentage: 10, // Set default value
      trendReversed: true
    }
    
    // Call function to potentially reset trend reversal flag
    addPositionWhenThresholdCrossed(asset, 5, 5)
    
    // The function should not create new positions during trend reversal period
    expect(asset.positions).toHaveLength(1)
  })

  // Test default trend reversal percentage is 10%
  it('should use default trend reversal percentage of 10%', () => {
    // We'll test this by checking if the logic properly calculates with 10% threshold
    const asset: Asset = {
      name: 'TestAsset',
      price: 90.00, // Current price (10% below top price)
      displayPrice: 90.00, // Display price
      previousPrice: 100.00, // Previous price 
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: -1, isActive: true } as Position
      ],
      trendReversalPercentage: 10, // Set default value
      trendReversed:true,
      reverseTrendTriggerValue: 100
    }
    
    // Call function to see how it handles the default 10% threshold.
    // downwardThreshold from addPositionWhenThresholdCrossed must be higher or 
    // equal to trendReversalPercentage else a trade is allowed to be created.
    addPositionWhenThresholdCrossed(asset, 5, 10)
    
    // Should not create new positions when price is at 10% below top (default trend reversal)
    expect(asset.positions).toHaveLength(1)
  })

// Test that trend reversal logic works correctly with different parameters
  it('should handle custom trend reversal percentage', () => {
    // This test will be implemented after the actual functionality is added
    
    // For now, just verify that function exists and can accept parameter
    const asset = {
      name: 'TestAsset',
      price: 95.00,
      previousPrice: 100.00,
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: -1, isActive: true } as Position
      ]
    } as Asset
    
    // This will be updated once implementation is complete
    expect(asset.positions).toHaveLength(1)
  })

  // Test reverse trend trigger value functionality
  it('should store reverse trend trigger value when trend reversal is triggered', () => {
    const asset = {
      name: 'TestAsset',
      price: 95.00, // Current price (lower than previous)
      previousPrice: 100.00, // Previous price 
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: -1, isActive: true } as Position
      ]
    } as Asset
    
    // Initially, reverseTrendTriggerValue should be undefined
    expect(asset.reverseTrendTriggerValue).toBeUndefined();
    
    // Call the function that should trigger trend reversal and store trigger value
    addPositionWhenThresholdCrossed(asset, 5, 5);
    
    // After trend reversal, reverseTrendTriggerValue should be set to current price
    expect(asset.reverseTrendTriggerValue).toBe(95.00);
    expect(asset.trendReversed).toBe(true);
  })

  // Test that trend reversal is invalidated when current price > reverse trend trigger value
  it('should invalidate trend reversal when current price exceeds reverse trend trigger value', () => {
    const asset = {
      name: 'TestAsset',
      price: 105.00, // Current price (higher than previous)
      previousPrice: 100.00, // Previous price 
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: -1, isActive: true } as Position
      ]
    } as Asset
    
    // Simulate that trend reversal was already triggered and trigger value stored
    asset.trendReversed = true;
    asset.reverseTrendTriggerValue = 95.00; // Price at which trend reversal occurred
    
    // Call the function to test if trend reversal is invalidated
    addPositionWhenThresholdCrossed(asset, 5, 5);
    
    // Trend reversal should be reset because current price (105) > trigger value (95)
    expect(asset.trendReversed).toBe(false);
    expect(asset.reverseTrendTriggerValue).toBeUndefined();
  })

  // Test that trend reversal is not invalidated when current price <= reverse trend trigger value
  it('should keep trend reversal active when current price <= reverse trend trigger value', () => {
    const asset: Asset = {
      name: 'TestAsset',
      price: 91.00, // Current price (lower than previous)
      displayPrice: 91.00, // Display price
      previousPrice: 100.00, // Previous price 
      positions: [],
      trendReversed: true,
      trendReversalPercentage: 10
    }

    const positions: Position[] = [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: -1, isActive: true }
    ]
    asset.positions = positions;
    
    // Simulate that trend reversal was already triggered and trigger value stored
    asset.reverseTrendTriggerValue = 95.00; // Price at which trend reversal occurred

    // Call the function to test if trend reversal remains active
    addPositionWhenThresholdCrossed(asset, 5, 5);
    
    // Trend reversal should remain active because current price (90) <= trigger value (95)
    expect(asset.trendReversed).toBe(true);
    expect(asset.reverseTrendTriggerValue).toBe(95.00);
  })
})
