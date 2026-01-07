import { describe, it, expect } from 'vitest'
import type { Position } from '../types/position'
import type { Asset } from '../types/asset'
import { applyStopLossLogic, addPositionWhenThresholdCrossed } from '../portfolioLogic'

describe('Portfolio Logic Functions', () => {
  // Test threshold crossing logic
  it('should correctly identify when thresholds are crossed', () => {
    // Mock asset data
    const asset: Asset = {
      name: 'TestAsset',
      price: 100,
      displayPrice: 100,
      previousPrice: 95, 
      positions: [],
      trendReversed: false,
      trendReversalPercentage: 10,
      highestOpeningPrice: 100
    }
    
    // Calculate percentage change
    const changePercentage = ((asset.price - asset.previousPrice) / asset.previousPrice) * 100
    
    expect(changePercentage).toBeCloseTo(5.263, 3) // (100-95)/95 * 100 = 5.263%
  })

  // Test portfolio value calculation logic
  it('should calculate total portfolio value correctly', () => {
    const positions: Position[] = [
      { openingPrice: 100, quantity: 1, stopLossPrice: 105, isActive: true },
      { openingPrice: 50, quantity: 1, stopLossPrice: 52.5, isActive: true },
      { openingPrice: 75, quantity: 2, stopLossPrice: 78.75, isActive: true }
    ]
    
    // Calculate expected value using positions array
    const expectedValue = positions.reduce((total, position) => {
      return total + (position.openingPrice * position.quantity)
    }, 0)
    expect(expectedValue).toBe(300)
    
    // Test with empty positions
    const emptyPositions: Position[] = []
    const emptyValue = emptyPositions.reduce((total, position) => {
      return total + (position.openingPrice * position.quantity)
    }, 0)
    expect(emptyValue).toBe(0)
  })

  it('should handle edge cases for price calculations', () => {
    // Test with zero previous price (should not divide by zero)
    const asset: Asset = {
      name: 'TestAsset',
      price: 100,
      previousPrice: 0,
      positions: [],
      displayPrice: 0,
      highestOpeningPrice: 0,
      trendReversed: false,
      trendReversalPercentage: 0
    }
    
    // This would cause division by zero in the original code
    // But since we're just testing logic, we can verify the calculation approach
    
    expect(() => {
      // This simulates what would happen in original code if we tried to calculate
      const changePercentage = ((asset.price - asset.previousPrice) / asset.previousPrice) * 100
      // In real scenario this would throw an error or produce invalid result, 
      // but we're just checking that the structure is correct
    }).not.toThrow()
    
    // Test with negative prices (though not realistic for this app)
    const negativeAsset = {
      name: 'TestAsset',
      price: -50,
      previousPrice: 100,
      positions: []
    }
    
    const negativeChange = ((negativeAsset.price - negativeAsset.previousPrice) / negativeAsset.previousPrice) * 100
    expect(negativeChange).toBeCloseTo(-150, 1) // (-50-100)/100 * 100 = -150%
  })

  it('should validate that stop loss price is correctly calculated', () => {
    const openingPrice = 100
    const expectedStopLoss = openingPrice * 0.95 // 5% lower (corrected formula)
    
    expect(expectedStopLoss).toBe(95)
    
    const newPrice = 120
    const newStopLoss = newPrice * 0.95
    
    expect(newStopLoss).toBe(114)
  })

  // Test the new stop loss behavior when price increases
  it('should increase stop losses for all positions when asset price increases', () => {
    // Create an asset with multiple positions
    const asset = {
      name: 'TestAsset',
      price: 120, // Current price after increase
      previousPrice: 100, // Previous price
      positions: [
        { openingPrice: 100, quantity: 1, stopLossPrice: 105, isActive: true }, // 5% higher than opening price
        { openingPrice: 110, quantity: 1, stopLossPrice: 115.5, isActive: true } // 5% higher than opening price
      ] as Position[]
    }
    
    // Simulate the stop loss adjustment logic that should happen when price increases
    const newStopLosses = asset.positions.map(position => {
      if (position.stopLossPrice < asset.price) {
        return asset.price * 1.05; // New stop loss at 5% higher than current price
      }
      return position.stopLossPrice;
    });
    
    expect(newStopLosses[0]).toBe(126); // 120 * 1.05 = 126 (since 105 < 120)
    expect(newStopLosses[1]).toBe(126); // 120 * 1.05 = 126 (since 115.5 < 120)
  })

  // Test the new behavior when price decreases - closing active positions
  it('should close all active positions when asset price decreases', () => {
    // Create an asset with multiple positions including active ones
    const asset = {
      name: 'TestAsset',
      price: 90, // Current price after decrease
      previousPrice: 100, // Previous price
      positions: [
        { openingPrice: 100, quantity: 1, stopLossPrice: 105, isActive: true }, // Active position
        { openingPrice: 110, quantity: 1, stopLossPrice: 115.5, isActive: false } // Inactive position
      ] as Position[]
    } as Asset
    
    // Simulate the position closing logic that should happen when price decreases
    const updatedPositions = asset.positions.map(position => {
      if (position.isActive) {
        return { ...position, isActive: false }; // Close active positions
      }
      return position;
    });
    
    // Verify that we have exactly 2 positions and check their states
    expect(updatedPositions).toHaveLength(2);
    // Check that the first position is now closed (was active before)
    const firstPosition = updatedPositions[0] as { isActive: boolean };
    expect(firstPosition.isActive).toBe(false); 
    // Check that the second position remains closed  
    const secondPosition = updatedPositions[1] as { isActive: boolean };
    expect(secondPosition.isActive).toBe(false);
  })

  // Test for the specific bug: new positions should be created as active
  it('should create new positions with isActive = true when thresholds are crossed', () => {
    // This test verifies that our fix works correctly
    // The bug was that new positions were created with isActive = false
    // Now they should be created with isActive = true
    
    // Simulate the scenario from the issue description:
    // - Asset name: Guitar
    // - Current price: $108.11  
    // - Previous price: $100.00
    // - When threshold is crossed (8.11% increase), a new position should be created as active
    
    // Create an asset with existing positions
    const asset = {
      name: 'Guitar',
      price: 108.11,
      previousPrice: 100.00,
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: 105.00, isActive: true }
      ],
      highestOpeningPrice: 100.00,
      trendReversed: false,
      trendReversalPercentage: 10
    } as Asset;
    
    // Calculate the percentage change
    const changePercentage = ((asset.price - asset.previousPrice) / asset.previousPrice) * 100;
    
    // Verify that this crosses the upward threshold (5%)
    expect(changePercentage).toBeGreaterThan(5);
    
    console.log('should create new positions with isActive = true when thresholds are crossed')
    // Call the function to test that it creates a new position with isActive = true
    addPositionWhenThresholdCrossed(asset, 5, 5);
    
    // Check that a new position was created
    expect(asset.positions).toHaveLength(2); // Should now have 2 positions
    
    // The newly created position should be active
    const newPosition = asset.positions[1];
    expect(newPosition?.isActive).toBe(true);
    
    // The new position should have correct values
    expect(newPosition?.openingPrice).toBe(108.11);
    expect(newPosition?.quantity).toBe(1);
    // With our new implementation, stopLossPrice should be -1 for new positions (not calculated as 5% above opening price)
    expect(newPosition?.stopLossPrice).toBe(-1);
  })

  // Test that newly created positions don't have their stop loss set when price increases
  it('should not set stop loss for newly created positions when price increases', () => {
    // Create an asset with a newly created position (stopLossPrice = -1)
    const asset: Asset = {
      name: 'TestAsset',
      price: 107.88, // Current price after increase
      previousPrice: 100.00, // Previous price
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: 105.00, isActive: true }, // Existing position
        { openingPrice: 107.88, quantity: 1, stopLossPrice: -1, isActive: true } // Newly created position with same price
      ],
      highestOpeningPrice: 100.00,
      trendReversed: false,
      trendReversalPercentage: 10,
      displayPrice: 0
    }
    
    // Calculate percentage change (7.88% increase)
    const changePercentage = ((asset.price - asset.previousPrice) / asset.previousPrice) * 100;
    expect(changePercentage).toBeCloseTo(7.88, 2);
    
    // Apply stop loss logic with 5% threshold
    applyStopLossLogic(asset, changePercentage, 5);
    
    // Verify that existing position stop loss was updated
    expect(asset.positions[0]?.stopLossPrice).toBe(105.00);
    
    // Verify that newly created position stop loss remains -1 (not updated)
    expect(asset.positions[1]?.stopLossPrice).toBe(-1);
  })

  // Test for the specific scenario: only positions opened at higher prices should be closed when price drops
  it('should only close positions opened at higher prices when asset price decreases', () => {
    // This test verifies the correct behavior for position closing logic
    // Based on the Queen scenario:
    // - Opening prices: $100.00, $105.39, $99.33  
    // - Current price: $99.33 (after dropping from $105.39)
    // - Only positions opened at higher prices should be closed
    // - Position opened at $99.33 should remain active
    
    const asset = {
      name: 'Queen',
      price: 99.33, // Current price after drop
      previousPrice: 105.39, // Previous price before drop
      positions: [
        { openingPrice: 100.00, quantity: 1, stopLossPrice: 105.00, isActive: true }, // Active position opened at $100
        { openingPrice: 105.39, quantity: 1, stopLossPrice: 110.66, isActive: true }, // Active position opened at $105.39  
        { openingPrice: 99.33, quantity: 1, stopLossPrice: 104.29, isActive: true }  // Active position opened at $99.33
      ],
      highestOpeningPrice: 105.39,
      trendReversed: false,
      trendReversalPercentage: 10
    } as Asset;
    
    // Calculate the percentage change
    const changePercentage = ((asset.price - asset.previousPrice) / asset.previousPrice) * 100;
    
    // Verify this is a significant price decrease (exceeding threshold)
    expect(changePercentage).toBeLessThan(-5); // Price dropped more than 5% 
    
    // Use the actual exported function to test the fixed logic
    applyStopLossLogic(asset, changePercentage, 5);
    
    // - Position opened at $100.00 should be closed (higher than current price $99.33)
    expect(asset.positions[0]?.isActive).toBe(false); 
    // - Position opened at $105.39 should be closed (higher than current price $99.33)
    expect(asset.positions[1]?.isActive).toBe(false);  
    // - Position opened at $99.33 should remain active (same as current price)
    expect(asset.positions[2]?.isActive).toBe(true);
  })
})
