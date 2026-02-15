import React from 'react'
import { Metadata } from 'next'
import { CartProvider } from '@/contexts/CartContext'
import CartPageClient from './CartPageClient'

// SEO Metadata
export const metadata: Metadata = {
  title: 'ショッピングカート | Epackage Lab',
  description: '包装材料の見積・注文カート。製品仕様を確認し、詳細な見積計算や正式な見積依頼が可能です。',
  keywords: ['ショッピングカート', '包装材料', '見積計算', 'B2B', 'Epackage Lab'],
  openGraph: {
    title: 'ショッピングカート | Epackage Lab',
    description: '包装材料の見積・注文カート。製品仕様を確認し、詳細な見積計算や正式な見積依頼が可能です。',
  }
}

export default function CartPage() {
  return (
    <CartProvider>
      <CartPageClient />
    </CartProvider>
  )
}