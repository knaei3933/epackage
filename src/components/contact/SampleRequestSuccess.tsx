/**
 * Sample Request Success Message Component
 */

import { CheckCircle } from 'lucide-react'

export function SampleRequestSuccess() {
  return (
    <div className="min-h-[600px] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            送信完了
          </h2>
          <p className="text-gray-600">
            サンプルリクエストを受け付けました。
          </p>
          <p className="text-sm text-gray-500">
            担当者より折り返しご連絡いたします。
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">📋 次のステップ</p>
          <ul className="text-left space-y-1 text-blue-700">
            <li>• 担当者が内容を確認</li>
            <li>• 2営業日以内にご連絡</li>
            <li>• サンプル発送の手配</li>
          </ul>
        </div>

        <p className="text-sm text-gray-500">
          まもなくリダイレクトされます...
        </p>
      </div>
    </div>
  )
}
