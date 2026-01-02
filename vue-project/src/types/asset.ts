import type { Position } from './position'

export interface Asset {
  name: string
  price: number
  previousPrice: number
  positions: Position[]
}
