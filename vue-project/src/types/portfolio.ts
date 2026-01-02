import type { Asset } from './asset'

export interface Portfolio {
  assets: Asset[]
  upwardThreshold: number
  downwardThreshold: number
}
