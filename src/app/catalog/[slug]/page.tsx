import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductDetailClient } from './ProductDetailClient'
import { PRODUCT_CATEGORIES, getAllProducts } from '@/lib/product-data'

// Get products from centralized data source
const mockProducts = getAllProducts(null, 'ja')

// Generate static params for all products
export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    slug: product.id,
  }))
}

// Generate metadata for each product
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = mockProducts.find(p => p.id === params.slug)

  if (!product) {
    return {
      title: '製品が見つかりません | Epackage Lab',
    }
  }

  const categoryInfo = PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES]

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
    }
  }
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = mockProducts.find(p => p.id === params.slug)

  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} />
}