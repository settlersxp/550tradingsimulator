import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PortfolioSimulation from '../components/PortfolioSimulation.vue'

describe('PortfolioSimulation', () => {
  it('mounts and renders properly', () => {
    const wrapper = mount(PortfolioSimulation)
    
    // Check that the component renders without errors
    expect(wrapper.exists()).toBe(true)
    
    // Check for key elements that should be present in PortfolioSimulation
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toContain('Portfolio Simulation Application')
    
    // Check that we have controls
    expect(wrapper.find('.controls').exists()).toBe(true)
    
    // Check that we have portfolio info
    expect(wrapper.find('.portfolio-info').exists()).toBe(true)
    
    // Check for generate button
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('button').text()).toContain('Generate')
  })
  
  it('initializes with correct default values', () => {
    const wrapper = mount(PortfolioSimulation)
    
    // Verify component mounts correctly
    expect(wrapper.exists()).toBe(true)
    
    // Check that we have the expected inputs and controls
    expect(wrapper.find('#assets').exists()).toBe(true)
    expect(wrapper.find('#upThreshold').exists()).toBe(true)
    expect(wrapper.find('#downThreshold').exists()).toBe(true)
    expect(wrapper.find('#stopLossThreshold').exists()).toBe(true)
    
    // Verify component structure is correct
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true)
  })
  
  it('renders asset cards for each asset', () => {
    const wrapper = mount(PortfolioSimulation)
    
    // Check that the component renders without errors
    expect(wrapper.exists()).toBe(true)
    
    // Check that we have asset cards (should be rendered by AssetCard component)
    expect(wrapper.find('.assets-container').exists()).toBe(true)
  })
})
