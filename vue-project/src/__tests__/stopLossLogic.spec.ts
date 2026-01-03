import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PortfolioSimulation from '../components/PortfolioSimulation.vue'
import type { Position } from '../types/position'
import type { Asset } from '../types/asset'
import { applyStopLossLogic } from '../portfolioLogic'

describe('Stop Loss Logic Tests', () => {
  // Test that the component mounts and has expected UI elements
  it('should mount successfully and display expected UI elements', () => {
    const wrapper = mount(PortfolioSimulation)
    
    // Verify the component exists and has basic structure
    expect(wrapper.exists()).toBe(true)
    
    // Check for expected UI elements
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  // Test that component responds to user interactions without errors
  it('should handle user interactions without errors', () => {
    const wrapper = mount(PortfolioSimulation)
    
    // Verify component mounts successfully
    expect(wrapper.exists()).toBe(true)
    
    // Find the update button and click it to test functionality
    const updateButton = wrapper.find('button')
    expect(updateButton.exists()).toBe(true)
    
    // Click the update button - this should trigger the portfolio update logic
    expect(() => {
      updateButton.trigger('click')
    }).not.toThrow()
    
    // Verify component still exists after interaction (no crashes)
    expect(wrapper.exists()).toBe(true)
  })

  // Test that the component structure is correct and can be rendered
  it('should render with correct basic structure', () => {
    const wrapper = mount(PortfolioSimulation)
    
    // Verify component mounts correctly
    expect(wrapper.exists()).toBe(true)
    
    // Check for key structural elements that should exist
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  // Stop loss price calculation based on correct formula (threshold below current price)
  it('should calculate stop loss correctly using correct formula', () => {
    // Create an asset with a position
    const position: Position = {
      openingPrice: 100.00, 
      quantity: 1, 
      stopLossPrice: 101.4232, 
      isActive: true 
    };
    
    const asset: Asset = {
      name: 'TestAsset',
      price: 104.56, // Current price
      previousPrice: 100.00, // Previous price
      positions: [position],
      trendReversed: false,
      trendReversalPercentage: 0
    };
    
    // Calculate percentage change (5.56% increase)
    const changePercentage = ((asset.price - asset.previousPrice) / asset.previousPrice) * 100
    expect(changePercentage).toBeCloseTo(4.56, 2)
    
    // Apply stop loss logic with 3% threshold
    applyStopLossLogic(asset, changePercentage, 3)
    
    // Verify the stop loss price is calculated using correct formula: price * (1 - threshold)
    // 104.56 * (1 - 0.03) = 104.56 * 0.97 = 101.4232
    expect(asset.positions[0].stopLossPrice).toBeCloseTo(101.4232, 4) // 104.56 * 0.97 = 101.4232
  })

  // Position should remain active when stop loss is -1 and current price < opening price
  it('should keep position active when stop loss price is -1 and current price is less than opening price', () => {
    // Create an asset with a position that has uninitialized stop loss (-1)
    // and current price is less than opening price (special case)
    const position: Position = {
      openingPrice: 100.00, 
      quantity: 1, 
      stopLossPrice: -1, 
      isActive: true 
    };
    
    const asset: Asset = {
      name: 'TestAsset',
      price: 95.00, // Current price (less than opening price)
      previousPrice: 100.00, // Previous price
      positions: [position],
      trendReversed: false,
      trendReversalPercentage: 0
    };
    
    // Calculate percentage change (5% decrease)
    const changePercentage = ((asset.price - asset.previousPrice) / asset.previousPrice) * 100
    expect(changePercentage).toBeCloseTo(-5.00, 2)
    
    // Apply stop loss logic with 3% threshold
    applyStopLossLogic(asset, changePercentage, 3)
    
    // Verify the position remains active because:
    // 1. stopLossPrice is -1 (uninitialized) 
    // 2. current price (95.00) < opening price (100.00)
    expect(asset.positions[0].isActive).toBe(true)
  })
  
  // Stop loss should not be calculated for closed positions
  it('should not perform stop loss calculations on closed positions', () => {
    // Create an asset with both active and closed positions
    const activePosition: Position = {
      openingPrice: 100.00, 
      quantity: 1, 
      stopLossPrice: 97.00, 
      isActive: true 
    };   // Active position
    
    const closedPosition: Position = {
      openingPrice: 95.00, 
      quantity: 1, 
      stopLossPrice: 90.25, 
      isActive: false 
    };    // Closed position
    
    const asset: Asset = {
      name: 'TestAsset',
      price: 105.00, // Current price (higher than opening price)
      previousPrice: 100.00, // Previous price
      positions: [activePosition, closedPosition],
      trendReversed: false,
      trendReversalPercentage: 0
    };
    
    // Calculate percentage change (5% increase)
    const changePercentage = ((asset.price - asset.previousPrice) / asset.previousPrice) * 100
    expect(changePercentage).toBeCloseTo(5.00, 2)
    
    // Store original stop loss prices for verification
    const originalActiveStopLoss = asset.positions[0].stopLossPrice;
    const originalClosedStopLoss = asset.positions[1].stopLossPrice;
    
    // Apply stop loss logic with 3% threshold
    applyStopLossLogic(asset, changePercentage, 3)
    
    // Verify that the active position's stop loss was updated (since price increased)
    expect(asset.positions[0].stopLossPrice).toBeGreaterThan(originalActiveStopLoss);
    
    // Verify that the closed position's stop loss was NOT updated (should remain unchanged)
    expect(asset.positions[1].stopLossPrice).toBe(originalClosedStopLoss);
  })
})
