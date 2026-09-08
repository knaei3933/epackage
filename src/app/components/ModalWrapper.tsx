'use client'

import { useCatalog } from '@/contexts/CatalogContext'
import dynamic from 'next/dynamic'

const SampleRequestModal = dynamic(
  () =>
    import('@/components/contact/SampleRequestModal').then((mod) => ({
      default: mod.SampleRequestModal,
    })),
  {
    ssr: false,
    loading: () => null,
  },
)

export function ModalWrapper() {
  const { sampleRequestModalOpen, sampleRequestProduct, closeSampleRequestModal } = useCatalog()

  if (!sampleRequestModalOpen) {
    return null
  }

  return (
    <SampleRequestModal
      isOpen={sampleRequestModalOpen}
      onClose={closeSampleRequestModal}
      product={sampleRequestProduct}
    />
  )
}
