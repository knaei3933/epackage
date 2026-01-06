/**
 * Custom hook for Sample Request Form submission logic
 */

import { useState } from 'react'
import type { PouchSampleRequestFormData } from './SampleRequestForm.schema'

export type SubmitStatus = 'idle' | 'success' | 'error'

export interface UseSampleRequestSubmitResult {
  isSubmitting: boolean
  submitStatus: SubmitStatus
  errorMessage: string
  submitSampleRequest: (data: PouchSampleRequestFormData) => Promise<void>
}

export function useSampleRequestSubmit(): UseSampleRequestSubmitResult {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const submitSampleRequest = async (data: PouchSampleRequestFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/samples', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          inquiryType: 'pouch_sample'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '送信に失敗しました')
      }

      setSubmitStatus('success')

      // 成功後にリダイレクト
      setTimeout(() => {
        window.location.href = '/samples/thank-you'
      }, 2000)

    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : '予期せぬエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,
    submitStatus,
    errorMessage,
    submitSampleRequest
  }
}
