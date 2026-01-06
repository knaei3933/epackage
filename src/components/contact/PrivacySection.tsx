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
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <Shield className="w-5 h-5 mr-2 text-gray-600" />
        個人情報の取扱い
      </h2>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <FileText className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">個人情報保護方針</h3>
              <p className="text-sm text-gray-600 mb-3">
                当社はお客様の個人情報を重要視し、適切に取り扱います。
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• 収集した情報はサンプル発送およびご連絡のみに使用いたします</li>
                <li>• お客様の同意なく第三者に開示いたしません</li>
                <li>• SSLにより暗号化され安全に送信されます</li>
              </ul>
              <div className="mt-3 flex gap-4">
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  プライバシーポリシー
                </a>
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  利用規約
                </a>
              </div>
            </div>
          </div>
        </div>

        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            {...register('agreement')}
            className="mt-1 w-5 h-5 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
          />
          <span className="ml-3 text-sm text-gray-700">
            個人情報保護方針に同意する <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.agreement && (
          <p className="text-red-600 text-sm">{errors.agreement.message}</p>
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
