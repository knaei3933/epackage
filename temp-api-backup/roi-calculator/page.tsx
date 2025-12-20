'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ROICalculatorRedirect() {
  const router = useRouter()

  useEffect(() => {
    // 301 리디렉션: quote-simulator로 영구 이동
    router.replace('/quote-simulator')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brixa-600 mx-auto mb-4"></div>
        <p className="text-gray-600">見積もりシミュレーターに移動中...</p>
      </div>
    </div>
  )
}