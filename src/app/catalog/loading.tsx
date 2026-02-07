import { ProductCardSkeleton } from '@/components/catalog/ProductCardSkeleton'

export default function CatalogLoading() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProductCardSkeleton count={6} />
    </div>
  )
}
