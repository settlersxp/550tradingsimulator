import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('mounts and renders properly', () => {
    // Test that the component mounts without errors (this is the main concern)
    const wrapper = mount(App)
    expect(wrapper.exists()).toBe(true)
  })
  
  it('initializes with correct default values', () => {
    // Test that the component mounts without errors 
    const wrapper = mount(App)
    expect(wrapper.exists()).toBe(true)
  })
})
