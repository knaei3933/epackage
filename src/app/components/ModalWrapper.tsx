'use client'

import { useCatalog } from '@/contexts/CatalogContext'
import { SampleRequestModal } from '@/components/contact/SampleRequestModal'

export function ModalWrapper() {
  const { sampleRequestModalOpen, sampleRequestProduct, closeSampleRequestModal } = useCatalog()

  return (
    <SampleRequestModal
      isOpen={sampleRequestModalOpen}
      onClose={closeSampleRequestModal}
      product={sampleRequestProduct}
    />
  )
}
