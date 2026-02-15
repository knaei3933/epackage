'use client'

import { useEffect } from 'react'

export default function PricingRedirectPage() {
  useEffect(() => {
    // 見積もりシミュレーターページにリダイレクト
    window.location.href = '/quote-simulator'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brixa-600 mx-auto mb-4"></div>
        <p className="text-gray-600">見積もりシミュレーターにリダイレクト中...</p>
      </div>
    </div>
  )
}
