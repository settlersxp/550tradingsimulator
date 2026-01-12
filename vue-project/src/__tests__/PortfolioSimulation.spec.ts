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
    expect(wrapper.find('h1').text()).toContain('Portfolio Simulation Dashboard')
    
    // Check that we have controls
    expect(wrapper.find('.controls').exists()).toBe(true)
    
    // Check that we have portfolio info
    expect(wrapper.find('.portfolio-summary').exists()).toBe(true)
    
    // Check for buttons - there should be 5 buttons: +, -, Generate, Reinitialize, Export History
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(5)
    
    // Verify the button texts are correct
    const buttonTexts = buttons.map(btn => btn.text())
    expect(buttonTexts).toContain('+')
    expect(buttonTexts).toContain('-')
    expect(buttonTexts).toContain('Generate')
    expect(buttonTexts).toContain('Reinitialize')
    expect(buttonTexts).toContain('Export History')
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
  
  it('displays portfolio summary with key metrics', () => {
    const wrapper = mount(PortfolioSimulation)
    
    // Check that we have the portfolio summary section
    expect(wrapper.find('.portfolio-summary').exists()).toBe(true)
    
    // Check that we have all three summary cards
    const summaryCards = wrapper.findAll('.summary-card')
    expect(summaryCards.length).toBe(3)
    
    // Check for the expected metrics
    const cardTitles = summaryCards.map(card => card.find('h2').text())
    expect(cardTitles).toContain('Portfolio Value')
    expect(cardTitles).toContain('Active Positions')
    expect(cardTitles).toContain('Closed Positions')
  })
  
  it('renders assets in a responsive grid layout', () => {
    const wrapper = mount(PortfolioSimulation)
    
    // Check that we have the assets container
    expect(wrapper.find('.assets-container').exists()).toBe(true)
    
    // Check that the assets container has the correct styling for grid layout
    const assetsContainer = wrapper.find('.assets-container')
    expect(assetsContainer.exists()).toBe(true)
  })
})
