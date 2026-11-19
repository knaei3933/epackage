/**
 * Message Section Component (Optimized with React.memo)
 */

import { memo } from 'react'
import { MessageSquare } from 'lucide-react'
import { Control, FieldErrors, UseFormRegister } from 'react-hook-form'
import type { PouchSampleRequestFormData } from './SampleRequestForm.schema'

export interface MessageSectionProps {
  register: UseFormRegister<PouchSampleRequestFormData>
  errors: FieldErrors<PouchSampleRequestFormData>
}

function MessageSection({ register, errors }: MessageSectionProps) {
  return (
    <div className="bg-brand-muted rounded-container p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2 text-brand" />
        お問い合わせ内容
      </h2>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">
          メッセージ <span className="text-error">*</span>
        </label>
        <textarea
          {...register('message')}
          data-testid="sample-message"
          rows={6}
          className="w-full resize-none rounded-md border border-border-strong bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted"
          placeholder={`ご要望やご質問がございましたらご記入ください
例：
・パウチのサイズについて
・素材についてのご相談
・納期について`}
        />
        <div className="flex justify-between items-center">
          {errors.message && (
            <p className="text-error text-sm">{errors.message.message}</p>
          )}
          <p className="text-xs text-text-muted ml-auto">
            10文字以上500文字以内で入力してください
          </p>
        </div>
      </div>
    </div>
  )
}

// Optimize with React.memo - only re-render when message error changes
export const MessageSectionMemo = memo(MessageSection, (prevProps, nextProps) => {
  return prevProps.errors.message?.message === nextProps.errors.message?.message
})

// Export both memoized and non-memoized versions
export { MessageSection }
export default MessageSection
