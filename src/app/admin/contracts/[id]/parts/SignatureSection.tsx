/**
 * Signature Section for AdminContractDetailClient
 *
 * 実DB contracts カラムのみへ寄せた署名情報表示（drift 解消）。
 * 証明書URLは contract_data(jsonb) の certificates へ保存される
 * （certificates/generate route の保存仕様と整合）。
 */

'use client';

import { Button } from '@/components/ui/Button';
import type { Contract } from '@/types/features/contract';

interface SignatureSectionProps {
  contract: Contract;
}

export function SignatureSection({ contract }: SignatureSectionProps) {
  // contract_data(jsonb) の証明書メタデータ（certificates/generate route が保存）
  const contractData =
    (contract.contract_data as Record<string, any> | null) ?? {};
  const certificates =
    (contractData.certificates as Record<string, any> | undefined) ?? {};
  const customerCert = certificates.customer as { url?: string } | undefined;
  const adminCert = certificates.admin as { url?: string } | undefined;

  return (
    <>
      {/* 署名情報 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">電子署名情報</h2>
        <div className="space-y-4">
          {/* 顧客署名 */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">顧客署名</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {contract.customer_signed_at && (
                <div>
                  <dt className="text-gray-600">署名日時</dt>
                  <dd className="text-gray-900 mt-1">
                    {new Date(contract.customer_signed_at).toLocaleString('ja-JP')}
                  </dd>
                </div>
              )}
              {contract.customer_ip_address && (
                <div>
                  <dt className="text-gray-600">IPアドレス</dt>
                  <dd className="text-gray-900 mt-1">{contract.customer_ip_address}</dd>
                </div>
              )}
              {contract.customer_signature_url && (
                <div className="md:col-span-2">
                  <dt className="text-gray-600">署名画像</dt>
                  <dd className="mt-1">
                    <img
                      src={contract.customer_signature_url}
                      alt="顧客署名"
                      className="h-16 w-auto border border-gray-300 rounded"
                    />
                  </dd>
                </div>
              )}
              {customerCert?.url && (
                <div>
                  <dt className="text-gray-600">署名証明書</dt>
                  <dd className="mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(customerCert.url, '_blank')}
                    >
                      表示
                    </Button>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* 管理者署名 */}
          {contract.admin_signed_at && (
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">管理者署名</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-600">署名日時</dt>
                  <dd className="text-gray-900 mt-1">
                    {new Date(contract.admin_signed_at).toLocaleString('ja-JP')}
                  </dd>
                </div>
                {contract.admin_signature_url && (
                  <div className="md:col-span-2">
                    <dt className="text-gray-600">署名画像</dt>
                    <dd className="mt-1">
                      <img
                        src={contract.admin_signature_url}
                        alt="管理者署名"
                        className="h-16 w-auto border border-gray-300 rounded"
                      />
                    </dd>
                  </div>
                )}
                {adminCert?.url && (
                  <div>
                    <dt className="text-gray-600">署名証明書</dt>
                    <dd className="mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(adminCert.url, '_blank')}
                      >
                        表示
                      </Button>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* 最終契約書 */}
          {contract.final_contract_url && (
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => window.open(contract.final_contract_url, '_blank')}
              >
                最終契約書を表示
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
