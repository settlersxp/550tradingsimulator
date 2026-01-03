import type { Position } from './position'

export interface Asset {
  name: string
  price: number
  displayPrice: number
  previousPrice: number
  positions: Position[]
  trendReversed: boolean // Store trend reversal flag on asset level
  trendReversalPercentage: number // Store trend reversal percentage on asset level
  reverseTrendTriggerValue?: number // Store the price at which trend reversal was triggered
}
