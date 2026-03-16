import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductDetailClient } from './ProductDetailClient'
import { PRODUCT_CATEGORIES, getAllProducts } from '@/lib/product-data'
import React, { Fragment } from 'react'

// Get products from centralized data source
const mockProducts = getAllProducts(null, 'ja')

// Generate static params for all products
export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    slug: product.id,
  }))
}

// Generate metadata for each product
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = mockProducts.find(p => p.id === slug)

  if (!product) {
    return {
      title: '製品が見つかりません | Epackage Lab',
    }
  }

  const categoryInfo = PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES]

  // Generate JSON-LD structured data
  const materialNames = product.materials.map(m => {
    const materialNames: { [key: string]: string } = {
      'PE': 'ポリエチレン',
      'PP': 'ポリプロピレン',
      'PET': 'PETフィルム',
      'ALUMINUM': 'アルミニウム',
      'PAPER_LAMINATE': 'ラミネート紙',
      '特殊素材': '特殊素材'
    }
    return materialNames[m] || m
  }).join(', ')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name_ja,
    description: product.description_ja,
    category: categoryInfo?.name_ja || '包装資材',
    image: `https://www.package-lab.com/images/products/${product.id}.jpg`,
    brand: {
      '@type': 'Brand',
      name: 'Epackage Lab'
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Epackage Lab'
    },
    material: materialNames,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      price: '0',
      priceCurrency: 'JPY',
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: '0',
        priceCurrency: 'JPY',
        valueAddedTaxIncluded: true
      },
      seller: {
        '@type': 'Organization',
        name: 'Epackage Lab',
        url: 'https://www.package-lab.com'
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        applicableCountry: 'JP',
        returnFees: {
          '@type': 'MonetaryAmount',
          currency: 'JPY',
          value: '0'
        }
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          currency: 'JPY',
          value: '0'
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          businessDays: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['https://schema.org/Monday', 'https://schema.org/Tuesday', 'https://schema.org/Wednesday', 'https://schema.org/Thursday', 'https://schema.org/Friday'],
            opens: '09:00',
            closes: '18:00'
          },
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 10,
            maxValue: 21,
            unitCode: 'DAY'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY'
          }
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'JP'
        }
      }
    }
  }

  return {
    title: `${product.name_ja} | Epackage Lab`,
    description: product.description_ja,
    keywords: [...product.tags, 'Epackage Lab', 'パッケージング', '包装', product.name_ja],
    openGraph: {
      title: `${product.name_ja} | Epackage Lab`,
      description: product.description_ja,
      images: [
        {
          url: `/images/products/${product.id}.jpg`,
          width: 1200,
          height: 630,
          alt: product.name_ja,
        }
      ]
    },
    other: {
      'application/ld+json': JSON.stringify(jsonLd)
    }
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = mockProducts.find(p => p.id === slug)

  if (!product) {
    notFound()
  }

  const categoryInfo = PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES]

  // Generate JSON-LD structured data
  const materialNames = product.materials.map(m => {
    const names: { [key: string]: string } = {
      'PE': 'ポリエチレン',
      'PP': 'ポリプロピレン',
      'PET': 'PETフィルム',
      'ALUMINUM': 'アルミニウム',
      'PAPER_LAMINATE': 'ラミネート紙',
      '特殊素材': '特殊素材'
    }
    return names[m] || m
  }).join(', ')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name_ja,
    description: product.description_ja,
    category: categoryInfo?.name_ja || '包装資材',
    image: `https://www.package-lab.com/images/products/${product.id}.jpg`,
    brand: {
      '@type': 'Brand',
      name: 'Epackage Lab'
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Epackage Lab'
    },
    material: materialNames,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      price: '0',
      priceCurrency: 'JPY',
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: '0',
        priceCurrency: 'JPY',
        valueAddedTaxIncluded: true
      },
      seller: {
        '@type': 'Organization',
        name: 'Epackage Lab',
        url: 'https://www.package-lab.com'
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        applicableCountry: 'JP',
        returnFees: {
          '@type': 'MonetaryAmount',
          currency: 'JPY',
          value: '0'
        }
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          currency: 'JPY',
          value: '0'
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          businessDays: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['https://schema.org/Monday', 'https://schema.org/Tuesday', 'https://schema.org/Wednesday', 'https://schema.org/Thursday', 'https://schema.org/Friday'],
            opens: '09:00',
            closes: '18:00'
          },
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 10,
            maxValue: 21,
            unitCode: 'DAY'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY'
          }
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'JP'
        }
      }
    }
  }

  return (
    <>
      <script
        id="product-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd)
        }}
      />
      <ProductDetailClient product={product} />
    </>
  )
}
