import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OHLCFileSimulation from '../components/OHLCFileSimulation.vue'

describe('OHLCFileSimulation', () => {
  it('renders correctly', () => {
    const wrapper = mount(OHLCFileSimulation)
    expect(wrapper.exists()).toBe(true)
  })

  it('has the correct title', () => {
    const wrapper = mount(OHLCFileSimulation)
    expect(wrapper.find('h2').text()).toBe('OHLC File-Based Simulation')
  })
})
