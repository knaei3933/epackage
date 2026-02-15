export interface PostProcessingOption {
  id: string
  name: string
  nameJa: string
  description: string
  descriptionJa: string
  cost: number
  setupCost?: number
  multiplier: number
  icon?: string
  category?: string
  applicableProducts: string[]
  features: string[]
  featuresJa: string[]
}