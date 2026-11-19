/**
 * Sample Items Section
 *
 * サンプル1セット提供（選択機能なし）
 */

'use client'

import { Package } from 'lucide-react'
import { Control } from 'react-hook-form'
import type { PouchSampleRequestFormData } from './SampleRequestForm.schema'

interface SampleItemsSectionProps {
  control: Control<PouchSampleRequestFormData>
  errors: any
}

export function SampleItemsSection({ control, errors }: SampleItemsSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          サンプルご依頼
        </h2>
        <p className="text-text-secondary mb-4">
          無料でサンプルをお送りいたします。必要事項をご入力ください。
        </p>
      </div>
    </div>
  )
}
