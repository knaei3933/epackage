'use client'

import { useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCatalog } from '@/contexts/CatalogContext'
import { ProductCard } from './ProductCard'
import { Grid } from '@/components/ui/Grid'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui'
import { safeMap } from '@/lib/array-helpers'

export function CatalogGrid() {
  const { language, t } = useLanguage()
  const { filteredProducts, isLoading } = useCatalog()

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => b.popularity - a.popularity)
  }, [filteredProducts])

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common').loading}</p>
        </div>
      </Container>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <Container className="py-8">
        <EmptyState
          title={t('common').noResults}
          description={
            language === 'ja'
              ? '検索条件に一致する製品が見つかりませんでした。フィルターを調整してください。'
              : 'No products found matching your criteria. Please adjust your filters.'
          }
        />
      </Container>
    )
  }

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {filteredProducts.length} {t('common').results}
        </h2>
      </div>

      <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {safeMap(sortedProducts, (product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </Grid>
    </Container>
  )
}