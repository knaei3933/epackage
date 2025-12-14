export type PackageType = 'standard' | 'premium' | 'eco' | 'luxury' | 'industrial' | 'custom'

export interface PackageCategory {
  type: string
  material: string[]
  size: string[]
  industry: string[]
}

export interface PackageFeatures {
  waterproof: boolean
  tamperProof: boolean
  recyclable: boolean
  customDesign: boolean
  barcodeCompatible: boolean
  uvProtection: boolean
  temperatureControl: boolean
  childSafe: boolean
}

export interface PackageSpecs {
  dimensions: {
    length: number
    width: number
    height: number
    unit: 'mm' | 'cm' | 'in'
  }
  weight: {
    min: number
    max: number
    unit: 'g' | 'kg' | 'oz' | 'lb'
  }
  capacity: {
    volume: number
    unit: 'ml' | 'l' | 'oz' | 'gal' | 'm²'
  }
}

export interface PackageApplication {
  industry: string
  useCase: string
  productExamples: string[]
}

export interface PackageImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
  width: number
  height: number
}

export interface PackagePricing {
  basePrice: number
  currency: 'JPY' | 'USD' | 'KRW'
  unit: 'piece' | 'box' | 'pallet' | 'quote' | 'meter'
  discountTiers: {
    quantity: number
    discountPercent: number
  }[]
}

export interface PackageProduct {
  id: string
  name: string
  nameEn: string
  nameKo: string
  type: PackageType
  category: PackageCategory
  description: string
  descriptionEn: string
  descriptionKo: string
  specs: PackageSpecs
  features: PackageFeatures
  applications: PackageApplication[]
  images: PackageImage[]
  pricing: PackagePricing
  leadTime: {
    min: number
    max: number
    unit: 'days' | 'weeks'
  }
  minOrder: {
    quantity: number
    unit: 'pieces' | 'boxes' | 'meters'
  }
  popularity: number
  tags: string[]
  isNew?: boolean
  isFeatured?: boolean
  sortOrder?: number // Added for correct product sequence
}

export interface CatalogFilters {
  search: string
  type: PackageType[]
  materials: string[]
  sizes: string[]
  industries: string[]
  priceRange: {
    min: number
    max: number
  }
  features: (keyof PackageFeatures)[]
}

export interface SortOption {
  key: 'relevance' | 'price' | 'popularity' | 'name'
  order: 'asc' | 'desc'
}

export interface CatalogState {
  products: PackageProduct[]
  filteredProducts: PackageProduct[]
  filters: CatalogFilters
  sort: SortOption
  isLoading: boolean
  selectedProduct: PackageProduct | null
  modalOpen: boolean
  currentImageIndex: number
}

export interface ContactFormData {
  name: string
  email: string
  phone: string
  company: string
  productId: string
  message: string
  quantity: number
  urgency: 'normal' | 'urgent' | 'asap'
}