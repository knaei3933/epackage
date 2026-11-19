/**
 * Sample Request Success Message Component
 */

import { CheckCircle, ClipboardList } from 'lucide-react'

export function SampleRequestSuccess() {
  return (
    <div className="min-h-[600px] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-success-muted rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-brand" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text-primary">
            送信完了
          </h2>
          <p className="text-text-secondary">
            サンプルリクエストを受け付けました。
          </p>
          <p className="text-sm text-text-muted">
            担当者より折り返しご連絡いたします。
          </p>
        </div>

        <div className="bg-brand-muted border border-brand-soft rounded-container p-4 text-sm text-brand">
          <p className="font-medium mb-1 flex items-center gap-2">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            次のステップ
          </p>
          <ul className="text-left space-y-1 text-brand">
            <li>• 担当者が内容を確認</li>
            <li>• 2営業日以内にご連絡</li>
            <li>• サンプル発送の手配</li>
          </ul>
        </div>

        <p className="text-sm text-text-muted">
          まもなくリダイレクトされます...
        </p>
      </div>
    </div>
  )
}
