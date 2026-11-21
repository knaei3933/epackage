'use client'

import React from 'react'
import Link from 'next/link'
import { GitCompare, Check, Plus } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/Button'
import { useComparison } from '@/contexts/ComparisonContext'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/database'

interface CompareToggleProps {
  product: Product
  className?: string
}

/** 製品カードに付ける「比較に追加」ボタン（文字つき） */
export function CompareToggle({ product, className }: CompareToggleProps) {
  const { toggleProductSelection, isProductSelected, canAddMore } = useComparison()
  const selected = isProductSelected(product.id)
  const disabled = !selected && !canAddMore

  return (
    <Button
      type="button"
      variant={selected ? 'secondary' : 'outline'}
      size="sm"
      aria-pressed={selected}
      disabled={disabled}
      title={disabled ? '比較できるのは4件までです' : undefined}
      className={cn('w-full', selected && 'border-brand', className)}
      onClick={(e) => {
        e.stopPropagation()
        toggleProductSelection(product)
      }}
    >
      {selected ? (
        <Check className="mr-1 h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <Plus className="mr-1 h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      {selected ? '比較に追加済み' : '比較に追加'}
    </Button>
  )
}

/** 比較に入れた数を見せて /compare へ進むリンク。1件も無いときは出さない */
export function CompareLink({ className }: { className?: string }) {
  const { state } = useComparison()
  const count = state.selectedProducts.length
  if (count === 0) return null

  return (
    <Link
      href="/compare"
      className={cn(buttonVariants({ variant: 'outline', size: 'md' }), className)}
    >
      <GitCompare className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
      比較へ（{count}件）
    </Link>
  )
}
