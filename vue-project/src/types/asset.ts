import type { Position } from './position'

export interface Asset {
  name: string
  price: number
  displayPrice: number
  previousPrice: number
  positions: Position[]
  highestOpeningPrice: number
  trendReversed: boolean // Store trend reversal flag on asset level
  trendReversalPercentage: number // Store trend reversal percentage on asset level
  reverseTrendTriggerValue?: number // Store the price at which trend reversal was triggered
  initialReverseTrendTriggerValue?: number // Store the initial price at which trend reversal was triggered (to test against downward threshold)
  initialUptrendValue?:number // Store the price at which the price started to move up again
}
