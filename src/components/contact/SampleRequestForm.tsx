/**
 * Sample Request Form (Modular with Draft Save)
 *
 * パウチサンプルリクエストフォーム
 * モジュール化されたコンポーネント構成 + 自動保存機能
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Package, Send, CheckCircle, RotateCcw } from 'lucide-react'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'
import type { PouchSampleRequestFormData } from './SampleRequestForm.schema'
import { pouchSampleRequestSchema } from './SampleRequestForm.schema'
import { useSampleRequestSubmit } from './useSampleRequestForm'
import { SampleRequestSuccess } from './SampleRequestSuccess'
import { CustomerInfoSection } from './CustomerInfoSection'
import { DeliveryDestinationSection } from './DeliveryDestinationSection'
import { MessageSection } from './MessageSection'
import { PrivacySection } from './PrivacySection'
import { SampleItemsSection } from './SampleItemsSection'
import { useDraftSave } from '@/hooks'

const DRAFT_STORAGE_KEY = 'sample-request-form-draft'

export default function PouchSampleRequestForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm<PouchSampleRequestFormData>({
    resolver: zodResolver(pouchSampleRequestSchema),
    defaultValues: {
      kanjiLastName: '',
      kanjiFirstName: '',
      kanaLastName: '',
      kanaFirstName: '',
      company: '',
      email: '',
      phone: '',
      fax: '',
      postalCode: '',
      address: '',
      agreement: false,
      deliveryType: 'normal',
      deliveryDestinations: [{
        id: 'dest-1',
        contactPerson: '',
        phone: '',
        address: '',
        sameAsCustomer: true
      }],
      sampleItems: [],
      message: ''
    }
  })

  // Draft save functionality
  const {
    hasDraft,
    restoreDraft,
    clearDraft,
    lastSaved,
    scheduleSave,
  } = useDraftSave<PouchSampleRequestFormData>({
    storageKey: DRAFT_STORAGE_KEY,
    interval: 30000, // 30 seconds
    enabled: true,
    onSaved: (data) => {
      console.log('Draft saved at:', new Date().toLocaleTimeString('ja-JP'))
    },
    onCleared: () => {
      console.log('Draft cleared')
    },
  })

  // Restore draft on mount if available
  useEffect(() => {
    const initializeForm = async () => {
      // Priority 1: Restore draft if available
      if (hasDraft) {
        const restored = restoreDraft()
        if (restored) {
          // Populate form with restored data
          Object.entries(restored).forEach(([key, value]) => {
            if (key !== 'timestamp') {
              setValue(key as any, value as any)
            }
          })
          return
        }
      }

      // Priority 2: Auto-fill member information if logged in and no draft
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            // Auto-fill member information
            setValue('kanjiLastName', profile.kanji_last_name || '')
            setValue('kanjiFirstName', profile.kanji_first_name || '')
            setValue('kanaLastName', profile.kana_last_name || '')
            setValue('kanaFirstName', profile.kana_first_name || '')
            setValue('company', profile.company_name || '')
            setValue('email', profile.email || session.user.email || '')
            // Use corporate_phone first, fallback to personal_phone
            setValue('phone', profile.corporate_phone || profile.personal_phone || '')
            setValue('postalCode', profile.postal_code || '')
            // Combine address fields
            const addressParts = [
              profile.prefecture,
              profile.city,
              profile.street,
              profile.building
            ].filter(Boolean)
            setValue('address', addressParts.join(''))
          }
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      }
    }

    initializeForm()
  }, [hasDraft, restoreDraft, setValue])

  // Watch form changes and schedule auto-save
  const formData = watch()
  useEffect(() => {
    scheduleSave(formData)
  }, [formData, scheduleSave])

  const { isSubmitting, submitStatus, errorMessage, submitSampleRequest } = useSampleRequestSubmit()

  const onSubmit = async (data: PouchSampleRequestFormData) => {
    await submitSampleRequest(data)
    // Clear draft on successful submission
    clearDraft()
    reset()
  }

  // Handle draft restoration
  const handleRestoreDraft = () => {
    const restored = restoreDraft()
    if (restored) {
      Object.entries(restored).forEach(([key, value]) => {
        if (key !== 'timestamp') {
          setValue(key as any, value as any)
        }
      })
    }
  }

  const handleClearDraft = () => {
    if (confirm('保存された下書きをクリアしますか？')) {
      clearDraft()
      reset()
    }
  }

  // Success state
  if (submitStatus === 'success') {
    return <SampleRequestSuccess />
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brixa-600 rounded-full mb-6">
          <Package className="w-8 h-8 text-brixa-700" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          パウチサンプルご依頼
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          パウチ製品のサンプルをご請求いただけます
        </p>
        <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>完全無料</span>
          <Send className="w-4 h-4 text-navy-600 ml-4" />
          <span>迅速発送</span>
        </div>

        {/* Draft Restoration Notice */}
        {hasDraft && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-amber-800">
                    保存された下書きがあります
                  </p>
                  {lastSaved && (
                    <p className="text-xs text-amber-600">
                      保存時刻: {lastSaved.toLocaleString('ja-JP')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRestoreDraft}
                  className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  復元する
                </button>
                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="px-4 py-2 text-sm border border-amber-600 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  クリア
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Error Alert */}
        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              送信エラーが発生しました: {errorMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Sample Items Section */}
          <SampleItemsSection
            control={control}
            watch={watch}
            errors={errors}
          />

          {/* Customer Information Section */}
          <CustomerInfoSection
            control={control}
            register={register}
            setValue={setValue}
            trigger={trigger}
            errors={errors}
          />

          {/* Delivery Section */}
          <DeliveryDestinationSection
            control={control}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />

          {/* Message Section */}
          <MessageSection
            register={register}
            errors={errors}
          />

          {/* Privacy Agreement Section */}
          <PrivacySection
            register={register}
            errors={errors}
          />

          {/* Submit Button */}
          <div className="flex items-center justify-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting || watch('sampleItems')?.length === 0}
              className="px-8 py-4 bg-brixa-600 text-white font-semibold rounded-lg hover:bg-brixa-700 focus:ring-4 focus:ring-brixa-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[200px]"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  サンプル依頼を送信中...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Send className="w-5 h-5 mr-2" />
                  {watch('sampleItems')?.length === 0
                    ? 'サンプルを選択してください'
                    : 'サンプル依頼を送信'}
                </span>
              )}
            </button>
          </div>

          {/* Form Footer Notice */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              ※ 2営業日以内にご連絡いたします
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
