/**
 * Privacy Agreement Section Component (Optimized with React.memo)
 */

import { memo } from 'react'
import { Shield, FileText } from 'lucide-react'
import { Control, FieldErrors, UseFormRegister } from 'react-hook-form'
import type { PouchSampleRequestFormData } from './SampleRequestForm.schema'

export interface PrivacySectionProps {
  register: UseFormRegister<PouchSampleRequestFormData>
  errors: FieldErrors<PouchSampleRequestFormData>
}

function PrivacySection({ register, errors }: PrivacySectionProps) {
  return (
    <div className="bg-bg-secondary rounded-container p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
        <Shield className="w-5 h-5 mr-2 text-text-secondary" />
        個人情報の取扱い
      </h2>

      <div className="space-y-4">
        <div className="bg-bg-primary border border-border-medium rounded-container p-4">
          <div className="flex items-start">
            <FileText className="w-5 h-5 text-text-muted mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-text-primary mb-2">個人情報保護方針</h3>
              <p className="text-sm text-text-secondary mb-3">
                当社はお客様の個人情報を重要視し、適切に取り扱います。
              </p>
              <ul className="text-xs text-text-secondary space-y-1">
                <li>• 収集した情報はサンプル発送およびご連絡のみに使用いたします</li>
                <li>• お客様の同意なく第三者に開示いたしません</li>
                <li>• SSLにより暗号化され安全に送信されます</li>
              </ul>
              <div className="mt-3 flex gap-4">
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand hover:text-brand underline"
                >
                  プライバシーポリシー
                </a>
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand hover:text-brand underline"
                >
                  利用規約
                </a>
              </div>
            </div>
          </div>
        </div>

        <label className="flex items-start space-x-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              {...register('agreement')}
              className="peer sr-only"
            />
            <div className="w-5 h-5 mt-0.5 border-2 border-border-strong rounded bg-bg-primary transition-all duration-200 peer-checked:bg-brand peer-checked:border-brand flex items-center justify-center group-hover:border-brand-soft">
              <svg className="w-3 h-3 text-white hidden peer-checked:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <span className="text-base text-text-primary">
            個人情報保護方針に同意する <span className="text-error">*</span>
          </span>
        </label>
        {errors.agreement && (
          <p className="text-error text-sm">{errors.agreement.message}</p>
        )}
      </div>
    </div>
  )
}

// Optimize with React.memo - only re-render when agreement error changes
export const PrivacySectionMemo = memo(PrivacySection, (prevProps, nextProps) => {
  return prevProps.errors.agreement?.message === nextProps.errors.agreement?.message
})

// Export both memoized and non-memoized versions
export { PrivacySection }
export default PrivacySection
