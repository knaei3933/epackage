/**
 * Customer Information Section Component (Optimized with React.memo)
 */

import { memo } from 'react'
import { User, Mail, Phone, Building2 } from 'lucide-react'
import { Control, FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { JapaneseNameInputController } from '@/components/ui/JapaneseNameInput'
import type { PouchSampleRequestFormData } from './SampleRequestForm.schema'

export interface CustomerInfoSectionProps {
  control: Control<PouchSampleRequestFormData>
  register: UseFormRegister<PouchSampleRequestFormData>
  setValue: UseFormSetValue<PouchSampleRequestFormData>
  errors: FieldErrors<PouchSampleRequestFormData>
}

function CustomerInfoSection({ control, register, setValue, errors }: CustomerInfoSectionProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <User className="w-5 h-5 mr-2 text-gray-600" />
        お客様情報
      </h2>

      {/* JapaneseNameInput */}
      <div className="mb-6">
        <JapaneseNameInputController
          control={control}
          setValue={setValue}
          kanjiLastNameName="kanjiLastName"
          kanjiFirstNameName="kanjiFirstName"
          kanaLastNameName="kanaLastName"
          kanaFirstNameName="kanaFirstName"
          kanjiLastNameError={errors.kanjiLastName?.message}
          kanjiFirstNameError={errors.kanjiFirstName?.message}
          kanaLastNameError={errors.kanaLastName?.message}
          kanaFirstNameError={errors.kanaFirstName?.message}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 会社名 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Building2 className="w-4 h-4 mr-1 text-gray-400" />
            会社名
          </label>
          <input
            type="text"
            {...register('company')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
            placeholder="株式会社サンプル"
          />
          {errors.company && (
            <p className="text-red-600 text-sm">{errors.company.message}</p>
          )}
        </div>

        {/* 電話番号 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Phone className="w-4 h-4 mr-1 text-gray-400" />
            電話番号 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            {...register('phone')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
            placeholder="03-1234-5678"
          />
          {errors.phone && (
            <p className="text-red-600 text-sm">{errors.phone.message}</p>
          )}
        </div>

        {/* FAX */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            FAX
          </label>
          <input
            type="tel"
            {...register('fax')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
            placeholder="03-1234-5678"
          />
          {errors.fax && (
            <p className="text-red-600 text-sm">{errors.fax.message}</p>
          )}
        </div>

        {/* メールアドレス */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Mail className="w-4 h-4 mr-1 text-gray-400" />
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register('email')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
            placeholder="example@company.com"
          />
          {errors.email && (
            <p className="text-red-600 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* 郵便番号 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            郵便番号
          </label>
          <input
            type="text"
            {...register('postalCode')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
            placeholder="100-0001"
          />
          {errors.postalCode && (
            <p className="text-red-600 text-sm">{errors.postalCode.message}</p>
          )}
        </div>

        {/* 住所 */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">
            住所
          </label>
          <input
            type="text"
            {...register('address')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
            placeholder="東京都〇〇区〇〇1-2-3"
          />
          {errors.address && (
            <p className="text-red-600 text-sm">{errors.address.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Optimize with React.memo - only re-render when error messages change
export const CustomerInfoSectionMemo = memo(CustomerInfoSection, (prevProps, nextProps) => {
  // Compare error messages deeply since they're what trigger re-renders
  const prevErrors = {
    kanjiLastName: prevProps.errors.kanjiLastName?.message,
    kanjiFirstName: prevProps.errors.kanjiFirstName?.message,
    kanaLastName: prevProps.errors.kanaLastName?.message,
    kanaFirstName: prevProps.errors.kanaFirstName?.message,
    company: prevProps.errors.company?.message,
    phone: prevProps.errors.phone?.message,
    fax: prevProps.errors.fax?.message,
    email: prevProps.errors.email?.message,
    postalCode: prevProps.errors.postalCode?.message,
    address: prevProps.errors.address?.message,
  }

  const nextErrors = {
    kanjiLastName: nextProps.errors.kanjiLastName?.message,
    kanjiFirstName: nextProps.errors.kanjiFirstName?.message,
    kanaLastName: nextProps.errors.kanaLastName?.message,
    kanaFirstName: nextProps.errors.kanaFirstName?.message,
    company: nextProps.errors.company?.message,
    phone: nextProps.errors.phone?.message,
    fax: nextProps.errors.fax?.message,
    email: nextProps.errors.email?.message,
    postalCode: nextProps.errors.postalCode?.message,
    address: nextProps.errors.address?.message,
  }

  return JSON.stringify(prevErrors) === JSON.stringify(nextErrors)
})

// Export both memoized and non-memoized versions for flexibility
export { CustomerInfoSection }
export default CustomerInfoSection
