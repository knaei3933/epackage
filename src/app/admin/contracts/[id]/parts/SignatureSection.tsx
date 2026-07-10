/**
 * Signature Section for AdminContractDetailClient
 */

'use client';

import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface SignatureSectionProps {
  contract: any;
}

export function SignatureSection({ contract }: SignatureSectionProps) {
  return (
    <>
        {/* 署名情報（電子署名法対応） */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">電子署名情報</h2>
          <div className="space-y-4">
            {/* 顧客署名 */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">顧客署名</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {contract.customer_signature_type && (
                  <div>
                    <dt className="text-gray-600">署名タイプ</dt>
                    <dd className="text-gray-900 mt-1">
                      {contract.customer_signature_type === 'handwritten' && '手書き署名'}
                      {contract.customer_signature_type === 'hanko' && 'はんこ'}
                      {contract.customer_signature_type === 'mixed' && '併用'}
                    </dd>
                  </div>
                )}
                {contract.customer_ip_address && (
                  <div>
                    <dt className="text-gray-600">IPアドレス</dt>
                    <dd className="text-gray-900 mt-1">{contract.customer_ip_address}</dd>
                  </div>
                )}
                {contract.customer_hanko_image_path && (
                  <div className="md:col-span-2">
                    <dt className="text-gray-600">はんこ画像</dt>
                    <dd className="mt-1">
                      <img
                        src={contract.customer_hanko_image_path}
                        alt="Customer Hanko"
                        className="h-16 w-auto border border-gray-300 rounded"
                      />
                    </dd>
                  </div>
                )}
                {contract.customer_timestamp_verified !== null && (
                  <div>
                    <dt className="text-gray-600">タイムスタンプ検証</dt>
                    <dd className={cn(
                      'mt-1 font-medium',
                      contract.customer_timestamp_verified ? 'text-green-600' : 'text-red-600'
                    )}>
                      {contract.customer_timestamp_verified ? '検証済み' : '未検証'}
                    </dd>
                  </div>
                )}
                {contract.customer_certificate_url && (
                  <div>
                    <dt className="text-gray-600">署名証明書</dt>
                    <dd className="mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(contract.customer_certificate_url!, '_blank')}
                      >
                        表示
                      </Button>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* 管理者署名 */}
            {contract.admin_signature_type && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">管理者署名</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-600">署名タイプ</dt>
                    <dd className="text-gray-900 mt-1">
                      {contract.admin_signature_type === 'handwritten' && '手書き署名'}
                      {contract.admin_signature_type === 'hanko' && 'はんこ'}
                      {contract.admin_signature_type === 'mixed' && '併用'}
                    </dd>
                  </div>
                  {contract.admin_ip_address && (
                    <div>
                      <dt className="text-gray-600">IPアドレス</dt>
                      <dd className="text-gray-900 mt-1">{contract.admin_ip_address}</dd>
                    </div>
                  )}
                  {contract.admin_hanko_image_path && (
                    <div className="md:col-span-2">
                      <dt className="text-gray-600">はんこ画像</dt>
                      <dd className="mt-1">
                        <img
                          src={contract.admin_hanko_image_path}
                          alt="Admin Hanko"
                          className="h-16 w-auto border border-gray-300 rounded"
                        />
                      </dd>
                    </div>
                  )}
                  {contract.admin_timestamp_verified !== null && (
                    <div>
                      <dt className="text-gray-600">タイムスタンプ検証</dt>
                      <dd className={cn(
                        'mt-1 font-medium',
                        contract.admin_timestamp_verified ? 'text-green-600' : 'text-red-600'
                      )}>
                        {contract.admin_timestamp_verified ? '検証済み' : '未検証'}
                      </dd>
                    </div>
                  )}
                  {contract.admin_certificate_url && (
                    <div>
                      <dt className="text-gray-600">署名証明書</dt>
                      <dd className="mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(contract.admin_certificate_url!, '_blank')}
                        >
                          表示
                        </Button>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* 法的効力 */}
            {contract.legal_validity_confirmed !== null && (
              <div className="pt-4 border-t border-gray-200">
                <div className={cn(
                  'flex items-center gap-2 p-3 rounded-lg',
                  contract.legal_validity_confirmed
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-yellow-50 border border-yellow-200'
                )}>
                  <span className={cn(
                    'text-lg',
                    contract.legal_validity_confirmed ? '✓' : '⚠'
                  )} />
                  <div>
                    <p className={cn(
                      'font-medium',
                      contract.legal_validity_confirmed ? 'text-green-900' : 'text-yellow-900'
                    )}>
                      {contract.legal_validity_confirmed ? '法的効力: 確認済み' : '法的効力: 未確認'}
                    </p>
                    {contract.signature_expires_at && (
                      <p className="text-sm text-gray-600 mt-1">
                        署名有効期限: {new Date(contract.signature_expires_at).toLocaleString('ja-JP')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
    </>
  );
}
