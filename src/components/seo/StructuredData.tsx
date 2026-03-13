'use client'

import React from 'react'

interface StructuredDataProps {
  type: 'Organization' | 'Product' | 'LocalBusiness' | 'FAQ' | 'HowTo'
  data: Record<string, any>
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const generateSchema = () => {
    switch (type) {
      case 'Organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Epackage Lab',
          alternateName: 'イーパッケージラボ',
          url: 'https://www.package-lab.com',
          logo: 'https://www.package-lab.com/logo.png',
          description: '韓国品質の包装材料で日本のものづくりを支援するパッケージング専門会社',
          foundingDate: '2010',
          areaServed: [
            {
              '@type': 'Country',
              name: '日本'
            }
          ],
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'JP',
            addressRegion: '兵庫県',
            addressLocality: '明石市',
            postalCode: '673-0846',
            streetAddress: '上ノ丸2-11-21'
          },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+81-50-1793-6500',
            contactType: 'customer service',
            availableLanguage: ['Japanese', 'Korean', 'English'],
            hoursAvailable: 'Mo-Fr 09:00-18:00'
          },
          sameAs: [
            'https://www.linkedin.com/company/epackage-lab',
            'https://twitter.com/epackage_lab'
          ],
          knowsAbout: [
            'パッケージング',
            '包装資材',
            '食品包装',
            '医薬品包装',
            '化粧品包装'
          ],
          serviceType: 'B2Bパッケージングソリューション',
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'パッケージング製品カタログ',
            numberOfItems: 6
          }
        }

      case 'Product':
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: data.name,
          description: data.description,
          category: data.category,
          image: data.image || 'https://www.package-lab.com/images/products/default-product.jpg',
          brand: {
            '@type': 'Brand',
            name: 'Epackage Lab'
          },
          manufacturer: {
            '@type': 'Organization',
            name: 'Epackage Lab'
          },
          material: data.material,
          offers: {
            '@type': 'Offer',
            availability: 'https://schema.org/InStock',
            price: data.price || '0',
            priceCurrency: 'JPY',
            priceValidUntil: data.priceValidUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priceSpecification: {
              '@type': 'PriceSpecification',
              price: data.price || '0',
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
              returnMethod: 'https://schema.org/ReturnByMail'
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
                }
              }
            }
          },
          aggregateRating: data.aggregateRating || undefined,
          review: data.review || undefined
        }

      case 'LocalBusiness':
        return {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Epackage Lab Japan',
          description: '韓国品質の包装材料で日本のものづくりを支援',
          url: 'https://www.package-lab.com',
          telephone: '+81-50-1793-6500',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'JP',
            addressRegion: '兵庫県',
            addressLocality: '明石市',
            postalCode: '673-0846',
            streetAddress: '上ノ丸2-11-21'
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 34.99,
            longitude: 134.99
          },
          openingHours: [
            'Mo-Fr 09:00-18:00'
          ],
          priceRange: '$$',
          paymentAccepted: ['Credit Card', 'Bank Transfer'],
          currenciesAccepted: 'JPY'
        }

      case 'FAQ':
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data.faqs.map((faq: any) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer
            }
          }))
        }

      case 'HowTo':
        return {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: data.name,
          description: data.description,
          image: data.image,
          estimatedCost: {
            '@type': 'MonetaryAmount',
            currency: 'JPY',
            value: '0'
          },
          supply: data.supplies,
          step: data.steps.map((step: any, index: number) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name,
            text: step.text,
            image: step.image
          }))
        }

      default:
        return {}
    }
  }

  const schema = generateSchema()

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2)
      }}
    />
  )
}

// Predefined schemas for common use cases
export function OrganizationSchema() {
  return <StructuredData type="Organization" data={{}} />
}

export function LocalBusinessSchema() {
  return <StructuredData type="LocalBusiness" data={{}} />
}

export function ProductSchema({
  name,
  description,
  category,
  material,
  image,
  price,
  priceValidUntil,
  aggregateRating,
  review
}: {
  name: string
  description: string
  category: string
  material: string
  image?: string
  price?: string
  priceValidUntil?: string
  aggregateRating?: {
    '@type': 'AggregateRating'
    ratingValue: number
    reviewCount: number
    bestRating: number
  }
  review?: Array<{
    '@type': 'Review'
    reviewRating: {
      '@type': 'Rating'
      ratingValue: number
    }
    author: {
      '@type': 'Person'
      name: string
    }
    reviewBody: string
  }>
  foodGrade?: boolean
  pharmaGrade?: boolean
}) {
  return (
    <StructuredData
      type="Product"
      data={{
        name,
        description,
        category,
        material,
        image,
        price,
        priceValidUntil,
        aggregateRating,
        review
      }}
    />
  )
}

export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  return <StructuredData type="FAQ" data={{ faqs }} />
}

export function HowToSchema({
  name,
  description,
  image,
  supplies,
  steps
}: {
  name: string
  description: string
  image?: string
  supplies: string[]
  steps: Array<{ name: string; text: string; image?: string }>
}) {
  return (
    <StructuredData
      type="HowTo"
      data={{ name, description, image, supplies, steps }}
    />
  )
}