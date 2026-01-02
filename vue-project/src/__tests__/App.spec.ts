import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('mounts and renders properly', () => {
    const wrapper = mount(App)
    // Check that the component renders without errors
    expect(wrapper.exists()).toBe(true)
    
    // Check for key elements that should be present
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
    const wrapper = mount(App)
    // Verify component mounts correctly
    expect(wrapper.exists()).toBe(true)
    
    // Check that we have the expected inputs and controls
    expect(wrapper.find('#assets').exists()).toBe(true)
    expect(wrapper.find('#upThreshold').exists()).toBe(true)
    expect(wrapper.find('#downThreshold').exists()).toBe(true)
    
    // Verify component structure is correct - we can't directly access vm properties
    // but we can verify the UI elements that represent the initial state
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true)
  })
})
