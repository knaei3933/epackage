/**
 * Customer Information Section Component (Optimized with React.memo)
 */

import { memo } from 'react'
import { User, Mail, Phone, Building2 } from 'lucide-react'
import { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormTrigger } from 'react-hook-form'
import { JapaneseNameInputController } from '@/components/ui/JapaneseNameInput'
import type { PouchSampleRequestFormData } from './SampleRequestForm.schema'

export interface CustomerInfoSectionProps {
  control: Control<PouchSampleRequestFormData>
  register: UseFormRegister<PouchSampleRequestFormData>
  setValue: UseFormSetValue<PouchSampleRequestFormData>
  trigger: UseFormTrigger<PouchSampleRequestFormData>
  errors: FieldErrors<PouchSampleRequestFormData>
}

function CustomerInfoSection({ control, register, setValue, trigger, errors }: CustomerInfoSectionProps) {
  return (
    <div className="bg-bg-secondary rounded-container p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center">
        <User className="w-5 h-5 mr-2 text-text-secondary" />
        お客様情報
      </h2>

      {/* JapaneseNameInput */}
      <div className="mb-6">
        <JapaneseNameInputController
          control={control}
          setValue={setValue}
          trigger={trigger}
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
          <label className="text-sm font-medium text-text-secondary flex items-center">
            <Building2 className="w-4 h-4 mr-1 text-text-muted" />
            会社名
          </label>
          <input
            type="text"
            {...register('company')}
            data-testid="customer-company-name"
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
            placeholder="株式会社サンプル"
          />
          {errors.company && (
            <p className="text-error text-sm">{errors.company.message}</p>
          )}
        </div>

        {/* 電話番号 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center">
            <Phone className="w-4 h-4 mr-1 text-text-muted" />
            電話番号 <span className="text-error">*</span>
          </label>
          <input
            type="tel"
            {...register('phone')}
            data-testid="customer-phone-number"
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
            placeholder="03-1234-5678"
          />
          {errors.phone && (
            <p className="text-error text-sm">{errors.phone.message}</p>
          )}
        </div>

        {/* FAX */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">
            FAX
          </label>
          <input
            type="tel"
            {...register('fax')}
            data-testid="customer-fax-number"
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
            placeholder="03-1234-5678"
          />
          {errors.fax && (
            <p className="text-error text-sm">{errors.fax.message}</p>
          )}
        </div>

        {/* メールアドレス */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center">
            <Mail className="w-4 h-4 mr-1 text-text-muted" />
            メールアドレス <span className="text-error">*</span>
          </label>
          <input
            type="email"
            {...register('email')}
            data-testid="customer-email-address"
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
            placeholder="example@company.com"
          />
          {errors.email && (
            <p className="text-error text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* 郵便番号 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">
            郵便番号
          </label>
          <input
            type="text"
            {...register('postalCode')}
            data-testid="customer-postal-code"
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
            placeholder="100-0001"
          />
          {errors.postalCode && (
            <p className="text-error text-sm">{errors.postalCode.message}</p>
          )}
        </div>

        {/* 住所 */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-text-secondary">
            住所
          </label>
          <input
            type="text"
            {...register('address')}
            data-testid="customer-address"
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
            placeholder="東京都〇〇区〇〇1-2-3"
          />
          {errors.address && (
            <p className="text-error text-sm">{errors.address.message}</p>
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
