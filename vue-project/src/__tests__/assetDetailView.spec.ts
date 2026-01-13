import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AssetDetailView from '../components/AssetDetailView.vue'
import type { Asset } from '@/types/asset'
import type { Position } from '@/types/position'

describe('AssetDetailView', () => {
  // Test with an asset that has no positions
  it('should display correctly with no positions', () => {
    const asset: Asset = {
      name: 'Test Asset',
      price: 100,
      displayPrice: 95,
      previousPrice: 95,
      positions: [],
      highestOpeningPrice: 100,
      trendReversed: false,
      trendReversalPercentage: 10,
      initialReverseTrendTriggerValue: 95
    }

    const wrapper = mount(AssetDetailView, {
      props: {
        asset: asset
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('h2').text()).toContain('Test Asset - Detailed View')
    
    // Check that all basic information is displayed
    expect(wrapper.text()).toContain('Current Price: $100.00')
    expect(wrapper.text()).toContain('Previous Price: $95.00')
    expect(wrapper.text()).toContain('Price Change:')
    expect(wrapper.text()).toContain('Highest Opening Price: $100.00')
    
    // Check trend information
    expect(wrapper.text()).toContain('Trend Reversed: No')
    expect(wrapper.text()).toContain('Trend Reversal Percentage: 10%')
    
    // Check position status
    expect(wrapper.text()).toContain('Position Status: No Positions')
    expect(wrapper.text()).toContain('Total Positions: 0')
    
    // Check that no positions are displayed
    expect(wrapper.find('.no-positions').exists()).toBe(true)
  })

  // Test with an asset that has active positions
  it('should display correctly with active positions', () => {
    const positions: Position[] = [
      {
        openingPrice: 100,
        quantity: 2,
        stopLossPrice: 95,
        isActive: true
      },
      {
        openingPrice: 110,
        quantity: 1,
        stopLossPrice: 105,
        isActive: true
      }
    ]

    const asset: Asset = {
      name: 'Test Asset',
      price: 105,
      displayPrice: 100,
      previousPrice: 100,
      positions: positions,
      highestOpeningPrice: 110,
      trendReversed: false,
      trendReversalPercentage: 10,
      initialReverseTrendTriggerValue: 100
    }

    const wrapper = mount(AssetDetailView, {
      props: {
        asset: asset
      }
    })

    expect(wrapper.exists()).toBe(true)
    
    // Check that all information is displayed correctly
    expect(wrapper.text()).toContain('Current Price: $105.00')
    expect(wrapper.text()).toContain('Previous Price: $100.00')
    expect(wrapper.text()).toContain('Price Change:')
    expect(wrapper.text()).toContain('Highest Opening Price: $110.00')
    
    // Check trend information
    expect(wrapper.text()).toContain('Trend Reversed: No')
    expect(wrapper.text()).toContain('Trend Reversal Percentage: 10%')
    
    // Check position status
    expect(wrapper.text()).toContain('Position Status: Only Active Positions')
    expect(wrapper.text()).toContain('Total Positions: 2')
    expect(wrapper.text()).toContain('Active Positions: 2')
    expect(wrapper.text()).toContain('Closed Positions: 0')
    
    // Check portfolio values are displayed
    expect(wrapper.text()).toContain('Total Positions Value:')
    expect(wrapper.text()).toContain('Active Positions Value:')
    expect(wrapper.text()).toContain('Closed Positions Value:')
  })

  // Test with an asset that has closed positions
  it('should display correctly with closed positions', () => {
    const positions: Position[] = [
      {
        openingPrice: 100,
        quantity: 2,
        stopLossPrice: 95,
        isActive: false
      },
      {
        openingPrice: 110,
        quantity: 1,
        stopLossPrice: 105,
        isActive: false
      }
    ]

    const asset: Asset = {
      name: 'Test Asset',
      price: 105,
      displayPrice: 100,
      previousPrice: 100,
      positions: positions,
      highestOpeningPrice: 110,
      trendReversed: true,
      trendReversalPercentage: 15,
      initialReverseTrendTriggerValue: 100,
      reverseTrendTriggerValue: 98
    }

    const wrapper = mount(AssetDetailView, {
      props: {
        asset: asset
      }
    })

    expect(wrapper.exists()).toBe(true)
    
    // Check that all information is displayed correctly
    expect(wrapper.text()).toContain('Current Price: $105.00')
    expect(wrapper.text()).toContain('Previous Price: $100.00')
    expect(wrapper.text()).toContain('Price Change:')
    expect(wrapper.text()).toContain('Highest Opening Price: $110.00')
    
    // Check trend information
    expect(wrapper.text()).toContain('Trend Reversed: Yes')
    expect(wrapper.text()).toContain('Trend Reversal Percentage: 15%')
    expect(wrapper.text()).toContain('Reverse Trend Trigger Value: 98')
    expect(wrapper.text()).toContain('Initial Reverse Trend Trigger Value: 100')
    
    // Check position status
    expect(wrapper.text()).toContain('Position Status: Only Closed Positions')
    expect(wrapper.text()).toContain('Total Positions: 2')
    expect(wrapper.text()).toContain('Active Positions: 0')
    expect(wrapper.text()).toContain('Closed Positions: 2')
  })

  // Test with an asset that has mixed positions
  it('should display correctly with mixed positions', () => {
    const positions: Position[] = [
      {
        openingPrice: 100,
        quantity: 2,
        stopLossPrice: 95,
        isActive: true
      },
      {
        openingPrice: 110,
        quantity: 1,
        stopLossPrice: 105,
        isActive: false
      }
    ]

    const asset: Asset = {
      name: 'Test Asset',
      price: 105,
      displayPrice: 100,
      previousPrice: 100,
      positions: positions,
      highestOpeningPrice: 110,
      trendReversed: false,
      trendReversalPercentage: 10,
      initialReverseTrendTriggerValue: 100
    }

    const wrapper = mount(AssetDetailView, {
      props: {
        asset: asset
      }
    })

    expect(wrapper.exists()).toBe(true)
    
    // Check position status
    expect(wrapper.text()).toContain('Position Status: Mixed Positions')
    expect(wrapper.text()).toContain('Total Positions: 2')
    expect(wrapper.text()).toContain('Active Positions: 1')
    expect(wrapper.text()).toContain('Closed Positions: 1')
  })

  // Test back button functionality
  it('should emit close event when back button is clicked', async () => {
    const asset: Asset = {
      name: 'Test Asset',
      price: 100,
      displayPrice: 95,
      previousPrice: 95,
      positions: [],
      highestOpeningPrice: 100,
      trendReversed: false,
      trendReversalPercentage: 10,
      initialReverseTrendTriggerValue: 95
    }

    const wrapper = mount(AssetDetailView, {
      props: {
        asset: asset
      }
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    
    await button.trigger('click')
    
    // Check that close event was emitted
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
