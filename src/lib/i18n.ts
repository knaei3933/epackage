// Japanese-only configuration - Language support removed
export type Language = 'ja'

export interface TranslationKeys {
  // Navigation
  nav: {
    home: string
    about: string
    services: string
    pricing: string
    contact: string
    login: string
    signup: string
    dashboard: string
  }

  // Header
  header: {
    tagline: string
    description: string
    cta: string
    languageSelect: string
    mobileMenu: string
    closeMenu: string
  }

  // Footer
  footer: {
    company: string
    aboutUs: string
    ourServices: string
    contactInfo: string
    followUs: string
    newsletter: string
    subscribe: string
    emailPlaceholder: string
    copyright: string
    allRightsReserved: string
    privacyPolicy: string
    termsOfService: string
    address: string
    phone: string
    email: string
    businessHours: string
    hours: string
  }

  // Common
  common: {
    loading: string
    error: string
    retry: string
    close: string
    cancel: string
    confirm: string
    save: string
    delete: string
    edit: string
    view: string
    search: string
    searchPlaceholder: string
    filter: string
    sort: string
    more: string
    less: string
    next: string
    previous: string
    page: string
    of: string
    results: string
    noResults: string
    select: string
    selected: string
    yes: string
    no: string
    ok: string
    success: string
    warning: string
    info: string
    reset: string
  }

  // Error Messages
  errors: {
    pageNotFound: string
    serverError: string
    networkError: string
    validationError: string
    unauthorized: string
    forbidden: string
    unknownError: string
    tryAgain: string
    goHome: string
  }

  // Loading
  loading: {
    initializing: string
    processing: string
    saving: string
    deleting: string
    updating: string
    loadingData: string
    pleaseWait: string
  }

  // Catalog
  catalog: {
    title: string
    subtitle: string
    searchPlaceholder: string
    categoryFilter: string
    allCategories: string
    sortBy: string
    sortByRelevance: string
    sortByPrice: string
    sortByPopularity: string
    packageTypes: {
      standard: string
      premium: string
      eco: string
      luxury: string
      industrial: string
      custom: string
    }
    category: {
      type: string
      material: string
      size: string
      industry: string
    }
    actions: {
      viewDetails: string
      requestSample: string
      addToQuotation: string
      contactUs: string
    }
    details: {
      specifications: string
      materials: string
      dimensions: string
      features: string
      applications: string
      leadTime: string
      minOrder: string
      price: string
    }
    modal: {
      close: string
      previousImage: string
      nextImage: string
      imageOf: string
      inquireAbout: string
    }
  }
}

export type TranslationKey = keyof TranslationKeys

export const defaultLanguage: Language = 'ja'

export const supportedLanguages: Language[] = ['ja']

export const languageNames: Record<Language, string> = {
  ja: '日本語',
}

// Language detection utilities - Japanese only
export const getBrowserLanguage = (): Language => {
  return 'ja'
}

export const getStoredLanguage = (): Language => {
  if (typeof window === 'undefined') return 'ja'

  try {
    const stored = localStorage.getItem('epackage-language')
    if (stored === 'ja') return 'ja'
  } catch (error) {
    console.warn('Failed to get stored language:', error)
  }

  return 'ja'
}

export const storeLanguage = (language: Language): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('epackage-language', language)
  } catch (error) {
    console.warn('Failed to store language:', error)
  }
}
