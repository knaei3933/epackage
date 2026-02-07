/**
 * Admin Contract Detail Page
 *
 * 管理者契約書詳細ページ
 * - 契約情報の詳細表示
 * - 署名状況管理
 * - 電子署名対応
 * - PDF生成・ダウンロード
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ContractDownloadButton, ContractPreviewButton } from '@/components/admin/ContractDownloadButton';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';

interface Contract {
  id: string;
  contract_number: string;
  order_id: string;
  work_order_id: string | null;
  company_id: string;
  customer_name: string;
  customer_representative: string;
  total_amount: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'CUSTOMER_SIGNED' | 'ADMIN_SIGNED' | 'ACTIVE' | 'CANCELLED';
  customer_signed_at: string | null;
  admin_signed_at: string | null;
  signature_data: any;
  customer_ip_address: string | null;
  admin_ip_address: string | null;
  pdf_url: string | null;
  final_contract_url: string | null;
  terms: any;
  notes: string | null;
  // Japan e-Signature Law Compliance Fields
  customer_signature_type: 'handwritten' | 'hanko' | 'mixed' | null;
  admin_signature_type: 'handwritten' | 'hanko' | 'mixed' | null;
  customer_hanko_image_path: string | null;
  admin_hanko_image_path: string | null;
  customer_timestamp_token: string | null;
  admin_timestamp_token: string | null;
  customer_timestamp_verified: boolean | null;
  admin_timestamp_verified: boolean | null;
  customer_certificate_url: string | null;
  admin_certificate_url: string | null;
  signature_expires_at: string | null;
  legal_validity_confirmed: boolean | null;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
}

export default function AdminContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const { supabase } = useSupabaseClient();
  const [contract, setContract] = useState<Contract | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (contractId && supabase) {
      fetchContractDetails();
    }
  }, [contractId, supabase]);

  const fetchContractDetails = async () => {
    if (!supabase) return;

    setLoading(true);
    try {
      // Fetch contract details
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (contractError) throw contractError;

      setContract(contractData as Contract);
      setNotes(contractData?.notes || '');

      // Fetch related order
      if (contractData?.order_id) {
        const { data: orderData } = await supabase
          .from('orders')
          .select('id, order_number, customer_name, customer_email')
          .eq('id', contractData.order_id)
          .single();

        setOrder(orderData as Order);
      }
    } catch (error) {
      console.error('契約詳細の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!supabase || !contract) return;

    if (!confirm(`ステータスを ${getStatusLabel(newStatus)} に変更しますか？`)) {
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('contracts')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contractId);

      if (error) throw error;

      fetchContractDetails();
      alert('ステータスを変更しました');
    } catch (error) {
      console.error('ステータス変更に失敗しました:', error);
      alert('ステータス変更に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const signAsAdmin = async () => {
    if (!supabase || !contract) return;

    if (!confirm('契約書に管理者署名を行います。よろしいですか？')) {
      return;
    }

    setUpdating(true);
    try {
      // In a real implementation, you would capture the admin's signature here
      // For now, just update the status and timestamp
      const { error } = await supabase
        .from('contracts')
        .update({
          status: 'ADMIN_SIGNED',
          admin_signed_at: new Date().toISOString(),
          admin_ip_address: '127.0.0.1', // TODO: Use actual IP
          updated_at: new Date().toISOString(),
        })
        .eq('id', contractId);

      if (error) throw error;

      fetchContractDetails();
      alert('管理者署名が完了しました');
    } catch (error) {
      console.error('署名に失敗しました:', error);
      alert('署名に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const generatePDF = async () => {
    if (!supabase || !contract) return;

    setUpdating(true);
    try {
      // Call PDF generation API
      const response = await fetch(`/api/admin/contracts/${contractId}/pdf`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const data = await response.json();

      // Update contract with PDF URL
      const { error } = await supabase
        .from('contracts')
        .update({ pdf_url: data.pdfUrl })
        .eq('id', contractId);

      if (error) throw error;

      fetchContractDetails();
      alert('PDFを生成しました');
    } catch (error) {
      console.error('PDF生成に失敗しました:', error);
      alert('PDF生成に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const updateNotes = async () => {
    if (!supabase || !contract) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('contracts')
        .update({
          notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contractId);

      if (error) throw error;

      fetchContractDetails();
      alert('メモを更新しました');
    } catch (error) {
      console.error('メモ更新に失敗しました:', error);
      alert('メモ更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      DRAFT: 'ドラフト',
      SENT: '送信済み',
      CUSTOMER_SIGNED: '顧客署名済み',
      ADMIN_SIGNED: '管理者署名済み',
      ACTIVE: '有効',
      CANCELLED: 'キャンセル',
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string): string => {
    const variants: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      CUSTOMER_SIGNED: 'bg-yellow-100 text-yellow-800',
      ADMIN_SIGNED: 'bg-green-100 text-green-800',
      ACTIVE: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-center text-gray-600 mt-4">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600">契約書が見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              契約書詳細
            </h1>
            <p className="text-gray-600 mt-1">
              契約番号: {contract.contract_number}
            </p>
          </div>
          <div className="flex gap-3">
            {order && (
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/orders/${order.id}`)}
              >
                注文詳細を見る
              </Button>
            )}
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              戻る
            </button>
          </div>
        </div>

        {/* ステータス */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ステータス</h2>
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <span className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                getStatusVariant(contract.status)
              )}>
                {getStatusLabel(contract.status)}
              </span>

              {/* 署名状況 */}
              <div className="flex gap-4 text-sm">
                <div className={cn(
                  'flex items-center gap-2',
                  contract.customer_signed_at ? 'text-green-600' : 'text-gray-400'
                )}>
                  <span className={cn(
                    'w-2 h-2 rounded-full',
                    contract.customer_signed_at ? 'bg-green-600' : 'bg-gray-300'
                  )} />
                  顧客署名
                  {contract.customer_signed_at && (
                    <span className="text-xs">
                      ({new Date(contract.customer_signed_at).toLocaleString('ja-JP')})
                    </span>
                  )}
                </div>
                <div className={cn(
                  'flex items-center gap-2',
                  contract.admin_signed_at ? 'text-green-600' : 'text-gray-400'
                )}>
                  <span className={cn(
                    'w-2 h-2 rounded-full',
                    contract.admin_signed_at ? 'bg-green-600' : 'bg-gray-300'
                  )} />
                  管理者署名
                  {contract.admin_signed_at && (
                    <span className="text-xs">
                      ({new Date(contract.admin_signed_at).toLocaleString('ja-JP')})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* アクション */}
            <div className="flex gap-3">
              {contract.status === 'DRAFT' && (
                <Button
                  onClick={() => updateStatus('SENT')}
                  disabled={updating}
                >
                  送信
                </Button>
              )}
              {contract.status === 'CUSTOMER_SIGNED' && !contract.admin_signed_at && (
                <Button
                  onClick={signAsAdmin}
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  管理者署名
                </Button>
              )}
              {contract.status === 'ADMIN_SIGNED' && !contract.legal_validity_confirmed && (
                <Button
                  onClick={() => {
                    if (confirm('契約の法的効力を確認します。よろしいですか？')) {
                      updateStatus('ACTIVE');
                    }
                  }}
                  disabled={updating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  有効化
                </Button>
              )}
              <Button
                variant="outline"
                onClick={generatePDF}
                disabled={updating}
              >
                PDF再生成
              </Button>
              <ContractPreviewButton
                contract={contract}
                size="default"
                onDownloadComplete={(url) => {
                  setContract({ ...contract, final_contract_url: url });
                }}
              />
              <ContractDownloadButton
                contract={contract}
                size="default"
                onDownloadComplete={(url) => {
                  setContract({ ...contract, final_contract_url: url });
                }}
              />
            </div>
          </div>
        </div>

        {/* 契約情報 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">契約情報</h2>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-gray-600">契約番号</dt>
              <dd className="text-gray-900 mt-1">{contract.contract_number}</dd>
            </div>
            <div>
              <dt className="text-gray-600">作成日時</dt>
              <dd className="text-gray-900 mt-1">
                {new Date(contract.created_at).toLocaleString('ja-JP')}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">契約金額</dt>
              <dd className="text-gray-900 mt-1">
                {contract.total_amount.toLocaleString()} {contract.currency}
              </dd>
            </div>
            {contract.work_order_id && (
              <div>
                <dt className="text-gray-600">作業標準書ID</dt>
                <dd className="text-gray-900 mt-1">{contract.work_order_id}</dd>
              </div>
            )}
            {order && (
              <>
                <div>
                  <dt className="text-gray-600">注文番号</dt>
                  <dd className="text-gray-900 mt-1">{order.order_number}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">顧客名</dt>
                  <dd className="text-gray-900 mt-1">{order.customer_name}</dd>
                </div>
              </>
            )}
          </dl>
        </div>

        {/* 契約当事者 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">契約当事者</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-600">顧客名（乙）</dt>
              <dd className="text-gray-900 mt-1">{contract.customer_name}</dd>
            </div>
            <div>
              <dt className="text-gray-600">代理人</dt>
              <dd className="text-gray-900 mt-1">{contract.customer_representative}</dd>
            </div>
          </dl>
        </div>

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

        {/* 契約条件 */}
        {contract.terms && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">契約条件</h2>
            <pre className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg overflow-x-auto">
              {JSON.stringify(contract.terms, null, 2)}
            </pre>
          </div>
        )}

        {/* 管理者メモ */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">管理者メモ</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="契約に関するメモを入力..."
          />
          <div className="mt-3">
            <Button
              onClick={updateNotes}
              disabled={updating}
              className="px-6"
            >
              メモを更新
            </Button>
          </div>
        </div>

        {/* 署名データ */}
        {contract.signature_data && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">署名データ</h2>
            <pre className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg overflow-x-auto">
              {JSON.stringify(contract.signature_data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
