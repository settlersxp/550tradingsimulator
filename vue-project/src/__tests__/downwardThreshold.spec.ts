import { describe, it, expect } from 'vitest'
import type { Asset } from '../types/asset'
import { addPositionWhenThresholdCrossed, openNewPosition } from '../portfolioLogic'

describe('Downward Threshold Logic', () => {
  // Test case from the issue: with Previous Price: $100.00, Current Price: $92.49, Downward Threshold (%): 50
  // No new position should be opened at $92.49 because difference is less than 50%
  it('should not open new position when current price is within downward threshold', () => {
    const asset = {
      name: 'TestAsset',
      price: 92.49, // Current price
      previousPrice: 100.00, // Previous price
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: 105.00, isActive: true }
      ]
    } as Asset
    
    // This should NOT create a new position because the difference between 
    // current price ($92.49) and lowest opening price ($100.00) is:
    // (100.00 - 92.49) / 100.00 * 100 = 7.51%
    // Which is less than the 50% downward threshold
    
    const initialPositionCount = asset.positions.length
    addPositionWhenThresholdCrossed(asset, 50, 50)
    
    // Should not create a new position since 7.51% < 50% downward threshold
    expect(asset.positions).toHaveLength(initialPositionCount)
  })

  it('should open new position when current price is below downward threshold', () => {
    const asset = {
      name: 'TestAsset',
      price: 49.00, // Current price  
      previousPrice: 100.00, // Previous price
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: 105.00, isActive: true }
      ]
    } as Asset
    
    // This SHOULD create a new position because the difference between 
    // current price ($49.00) and lowest opening price ($100.00)
    // Which equals more more than 50% downward threshold
    
    const initialPositionCount = asset.positions.length
    addPositionWhenThresholdCrossed(asset, 5, 50)
    
    // Should create a new position since 50% >= 50% downward threshold
    expect(asset.positions).toHaveLength(initialPositionCount + 1)
  })

  it('should handle case with no active positions correctly', () => {
    const asset = {
      name: 'TestAsset',
      price: 49.00, // Current price  
      previousPrice: 102.00, // Previous price
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: 105.00, isActive: false } // Inactive position
      ]
    } as Asset
    
    // This SHOULD create a new position because there are no active positions,
    // and the difference between current price ($50.00) and lowest opening price ($100.00) is:
    // (100.00 - 50.00) / 100.00 * 100 = 50%
    // Which equals the 50% downward threshold
    
    const initialPositionCount = asset.positions.length
    addPositionWhenThresholdCrossed(asset, 5, 50)
    
    // Should create a new position since there are no active positions and 50% >= 50% threshold
    expect(asset.positions).toHaveLength(initialPositionCount + 1)
  })

  it('should correctly find the lowest opening price among all positions', () => {
    const asset = {
      name: 'TestAsset',
      price: 40.00, // Current price  
      previousPrice: 100.00, // Previous price
      positions: [
        { openingPrice: 120.00, quantity: 1, stopLossPrice: 126.00, isActive: true }, // Active position at higher price
        { openingPrice: 100.00, quantity: 1, stopLossPrice: 105.00, isActive: true }, // Active position at middle price
        { openingPrice: 80.00, quantity: 1, stopLossPrice: 84.00, isActive: false }  // Inactive position at lower price
      ]
    } as Asset
    
    // The lowest opening price among ALL active positions is $100.00 (inactive position)
    // Difference from current price ($100.00) to new price ($40.00) = 60%
    // So a new position should be opened
    
    const initialPositionCount = asset.positions.length
    addPositionWhenThresholdCrossed(asset, 5, 50)
    
    // Should not create a new position since the difference is 0% < 50% threshold
    expect(asset.positions).toHaveLength(initialPositionCount + 1)
  })

    // Test the exact scenario from the bug report
  it('should NOT create new position when price movement is less than downward threshold', () => {
    // Exact scenario from bug report:
    // Current Price: $95.56
    // Previous Price: $100.00  
    // Downward Threshold (%): 50
    // Difference: (100.00 - 95.56) / 100.00 * 100 = 4.44%
    // Since 4.44% < 50%, no new position should be created
    
    const asset = {
      name: 'TestAsset',
      price: 95.56, // Current price
      previousPrice: 100.00, // Previous price
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: 105.00, isActive: true }
      ]
    } as Asset
    
    const initialPositionCount = asset.positions.length
    addPositionWhenThresholdCrossed(asset, 5, 50) // Using downward threshold of 50%
    
    // Should not create a new position since 4.44% < 50% downward threshold
    expect(asset.positions).toHaveLength(initialPositionCount)
  })

  it('should create new position when price movement exceeds downward threshold', () => {
    // Test that the function still works correctly when threshold IS exceeded
    // Current Price: $49.00 (49% below original price)
    // Previous Price: $100.00
    // Downward Threshold (%): 50
    // Difference: (100.00 - 49.00) / 100.00 * 100 = 51%
    // Since 51% > 50%, new position SHOULD be created
    
    const asset = {
      name: 'TestAsset',
      price: 49.00, // Current price  
      previousPrice: 100.00, // Previous price
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: 105.00, isActive: true }
      ]
    } as Asset
    
    const initialPositionCount = asset.positions.length
    addPositionWhenThresholdCrossed(asset, 5, 50) // Using downward threshold of 50%
    
    // Should create a new position since 51% > 50% downward threshold
    expect(asset.positions).toHaveLength(initialPositionCount + 1)
  })
})
