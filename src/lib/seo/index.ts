import { Metadata } from 'next'

// Site configuration constants
export const SITE_CONFIG = {
  name: 'Epackage Lab',
  url: 'https://epackage-lab.com',
  locale: 'ja_JP',
  defaultTitle: 'Epackage Lab | 韓国品質の包装材料で日本のものづくりを支援',
  description:
    '韓国品質の包装材料と日本規制完全準拠で日本のものづくりを支援するEpackage Lab。食品安全規格対応。500社以上の日本企業実績。',
  ogImage: '/images/og-image.jpg',
  twitterCreator: '@epackage_lab',
} as const

// Generate default metadata for pages
export function generateDefaultMetadata(options: {
  title?: string
  description?: string
  ogImage?: string
  canonical?: string
}): Metadata {
  const { title, description, ogImage, canonical } = options

  return {
    title: title || SITE_CONFIG.defaultTitle,
    description: description || SITE_CONFIG.description,
    openGraph: {
      type: 'website',
      locale: SITE_CONFIG.locale,
      url: canonical ? `${SITE_CONFIG.url}${canonical}` : SITE_CONFIG.url,
      siteName: SITE_CONFIG.name,
      title: title || SITE_CONFIG.defaultTitle,
      description: description || SITE_CONFIG.description,
      images: [
        {
          url: ogImage || SITE_CONFIG.ogImage,
          width: 1200,
          height: 630,
          alt: title || SITE_CONFIG.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title || SITE_CONFIG.defaultTitle,
      description: description || SITE_CONFIG.description,
      images: [ogImage || SITE_CONFIG.ogImage],
      creator: SITE_CONFIG.twitterCreator,
    },
    alternates: canonical
      ? {
          canonical: canonical,
          languages: {
            ja: canonical,
            en: `/en${canonical}`,
          },
        }
      : undefined,
  }
}

// Generate product metadata
export function generateProductMetadata(product: {
  id: string
  name_ja: string
  description_ja: string
  category: string
  tags: string[]
  image?: string
}): Metadata {
  const title = `${product.name_ja} | Epackage Lab`
  const canonical = `/catalog/${product.id}`

  return {
    title,
    description: product.description_ja,
    keywords: [
      ...product.tags,
      'Epackage Lab',
      'パッケージング',
      '包装',
      product.name_ja,
    ],
    openGraph: {
      title,
      description: product.description_ja,
      url: `${SITE_CONFIG.url}${canonical}`,
      images: [
        {
          url: product.image || `/images/products/${product.id}.jpg`,
          width: 1200,
          height: 630,
          alt: product.name_ja,
        },
      ],
    },
    alternates: {
      canonical,
      languages: {
        ja: canonical,
        en: `/en${canonical}`,
      },
    },
  }
}

// Generate industry page metadata
export function generateIndustryMetadata(industry: {
  name: string
  description: string
  keywords: string[]
}): Metadata {
  const title = `${industry.name} | Epackage Lab`

  return {
    title,
    description: industry.description,
    keywords: [...industry.keywords, 'Epackage Lab', 'パッケージング'],
    openGraph: {
      title,
      description: industry.description,
    },
  }
}

// Generate guide page metadata
export function generateGuideMetadata(guide: {
  name: string
  description: string
  keywords?: string[]
}): Metadata {
  const title = `${guide.name} | Epackage Lab`

  return {
    title,
    description: guide.description,
    keywords: guide.keywords
      ? [...guide.keywords, 'Epackage Lab', 'パッケージング']
      : ['Epackage Lab', 'パッケージング'],
    openGraph: {
      title,
      description: guide.description,
    },
  }
}

// Structured data helpers

// Generate Organization schema
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    sameAs: [
      'https://www.linkedin.com/company/epackage-lab',
      'https://twitter.com/epackage_lab',
    ],
  }
}

// Generate BreadcrumbList schema
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  }
}

// Generate LocalBusiness schema
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    image: `${SITE_CONFIG.url}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'JP',
      addressRegion: 'Tokyo',
    },
  }
}
