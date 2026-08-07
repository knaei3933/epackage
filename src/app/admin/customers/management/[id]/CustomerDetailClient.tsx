/**
 * Customer Detail Client Component
 *
 * 顧客詳細ページの Client Component（タブ式）。
 *
 * タブ構成:
 *   - 基本情報（表示＋フル編集）  ... Step 4
 *   - 見積履歴（ソート＋ステータスフィルタ） ... Step 7
 *   - 注文履歴（ソート＋元見積紐付け） ... Step 8
 *
 * 設計メモ:
 *   - fetchCustomerById は { data: unknown } を返すため CustomerDetailResponse へキャスト。
 *   - 編集フォームは profileEditSchema（基本情報・camelCase）と adminEditProfileSchema
 *     （運用項目・status/markup_rate/markup_rate_note）を1つのスキーマへ統合して運用。
 *   - 保存時、基本情報は mapProfileEditToSnakeCase で snake_case へ変換し、
 *     運用項目とマージして PATCH /api/admin/customers/[id] へ送信。
 *   - メールアドレスは読み取り専用（disabled）。変更は別フロー（Non-Goal）と明示。
 *   - レスポンシブ（Step 10）: 既存 MobileCustomerList のブレイクポイント方式を踏襲。
 */

'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Loader2,
  ArrowLeft,
  Edit3,
  Save,
  X,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  FileText,
  Download,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Package,
  Link2,
} from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { fetchCustomerById } from '@/lib/api/admin/customers';
import {
  profileEditSchema,
  adminEditProfileSchema,
} from '@/lib/validations/profile-edit';
import { BusinessType, ProductCategory } from '@/types/auth';
import { PRODUCT_CATEGORY_OPTIONS, getProductCategoryLabel } from '@/types/enums';
import type { UserStatus } from '@/types/auth';
import { ORDER_STATUS_LABELS } from '@/types/order-status';
import type { OrderStatus } from '@/types/order-status';
import { formatDate } from '@/types/portal';
import type {
  Profile,
  CustomerDetailResponse,
  CustomerOrder,
  CustomerQuotation,
} from '../parts/types';
import { getStatusBadge, getQuotationStatusBadge } from '../parts/badges';
// クライアント側ページネーション用のページネーションUI（一覧テーブルと共通コンポーネント）
import { DesktopPagination } from '../parts/Pagination';

// =====================================================
// フォームスキーマ（基本情報 + 運用項目 を統合）
// =====================================================
// profileEditSchema（camelCase）の全フィールドに運用項目（status/markup_rate/
// markup_rate_note）を足した単一スキーマ。1つの useForm で両セクションを扱う。
const fullEditSchema = profileEditSchema.extend({
  status: adminEditProfileSchema.shape.status,
  markup_rate: adminEditProfileSchema.shape.markup_rate,
  markup_rate_note: adminEditProfileSchema.shape.markup_rate_note,
});

type FullEditFormData = z.infer<typeof fullEditSchema>;
const ACQUISITION_CHANNEL_OPTIONS = [
  { value: 'web_search', label: '検索エンジン' },
  { value: 'social_media', label: 'SNS' },
  { value: 'referral', label: '紹介' },
  { value: 'exhibition', label: '展示会' },
  { value: 'advertisement', label: '広告' },
  { value: 'other', label: 'その他' },
];

const PREFECTURE_OPTIONS = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

// adminEditProfileSchema が許容する4値（INVITED は除く）
const USER_STATUS_OPTIONS: { value: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED'; label: string }[] = [
  { value: 'PENDING', label: '承認待ち' },
  { value: 'ACTIVE', label: 'アクティブ' },
  { value: 'SUSPENDED', label: '停止中' },
  { value: 'DELETED', label: '削除済み' },
];

// 見積ステータスフィルタ選択肢（実データの status 値を網羅的にカバー）
const QUOTATION_STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'すべて' },
  { value: 'QUOTATION_PENDING', label: '見積待ち' },
  { value: 'draft', label: '下書き' },
  { value: 'sent', label: '送信済み' },
  { value: 'QUOTATION_APPROVED', label: '承認済み' },
  { value: 'approved', label: '承認済み' },
  { value: 'REJECTED', label: '拒否' },
  { value: 'rejected', label: '拒否' },
  { value: 'EXPIRED', label: '期限切れ' },
  { value: 'expired', label: '期限切れ' },
  { value: 'CONVERTED', label: '注文化済み' },
  { value: 'converted', label: '注文化済み' },
];

type TabId = 'basic' | 'quotations' | 'orders';

type SortKey = 'date' | 'amount' | 'status';
type SortDir = 'asc' | 'desc';

// クライアント側ページネーション・1ページあたりの表示件数
// （APIは全件返却・クライアントで slice して表示する仕様）
const QUOTATIONS_PAGE_SIZE = 5;
const ORDERS_PAGE_SIZE = 5;

// =====================================================
// メインコンポーネント
// =====================================================

export default function CustomerDetailClient({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [detail, setDetail] = useState<CustomerDetailResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FullEditFormData>({
    resolver: zodResolver(fullEditSchema),
  });

  // データ取得
  const loadDetail = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // fetchCustomerById は { data: unknown } を返すため CustomerDetailResponse へキャスト。
      const result = (await fetchCustomerById(customerId)) as CustomerDetailResponse;
      if (result.success && result.data) {
        setDetail(result.data);
      } else {
        setLoadError(result.error || '顧客詳細の読み込みに失敗しました。');
      }
    } catch (e) {
      console.error('[CustomerDetail] load error:', e);
      setLoadError('顧客詳細の読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // 編集モード開始: 現在の顧客データでフォームを初期化
  const startEdit = () => {
    if (!detail?.customer) return;
    const c = detail.customer;
    reset({
      kanjiLastName: c.kanji_last_name || '',
      kanjiFirstName: c.kanji_first_name || '',
      kanaLastName: c.kana_last_name || '',
      kanaFirstName: c.kana_first_name || '',
      corporatePhone: c.corporate_phone || '',
      personalPhone: c.personal_phone || '',
      fax: c.fax || '',
      // Profile.business_type は string リテラル型、フォームは enum BusinessType を期待するためキャスト
      businessType: c.business_type as BusinessType,
      companyName: c.company_name || '',
      legalEntityNumber: c.legal_entity_number || '',
      position: c.position || '',
      department: c.department || '',
      companyUrl: c.company_url || '',
      // Profile.product_category は string リテラル型、フォームは enum ProductCategory を期待するためキャスト
      productCategory: c.product_category as ProductCategory,
      acquisitionChannel: c.acquisition_channel || '',
      postalCode: c.postal_code || '',
      prefecture: c.prefecture || '',
      city: c.city || '',
      street: c.street || '',
      building: c.building || '',
      status: c.status,
      markup_rate: c.markup_rate ?? 0.5,
      markup_rate_note: c.markup_rate_note || '',
    });
    setSaveMessage(null);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    reset();
    setSaveMessage(null);
  };

  // 保存: PATCH /api/admin/customers/[id] へ送信
  //
  // API 契約（タスク#2 worker-2）:
  //   - 基本情報は **camelCase（form 形式）のまま** 送る。
  //     mapProfileEditToSnakeCase は API 側で呼ばれるため、クライアント側では変換しない
  //     （クライアントで snake_case にすると API 側の camelCase→snake_case 変換が
  //      フィールドを見つけられず null 化する二重変換バグになる）。
  //   - 運用項目: status（PENDING/ACTIVE/SUSPENDED/DELETED）, markup_rate, markup_rate_note。
  //   - 保護フィールド（email/role/id 等）は FORBIDDEN_UPDATE_FIELDS で API 側が強制除外。
  //   - data の undefined フィールドは JSON.stringify で除外されるためそのまま送信可能。
  const onSubmit = async (data: FullEditFormData) => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || '顧客情報の更新に失敗しました。');
      }
      setSaveMessage({ type: 'success', text: '顧客情報を更新しました。' });
      setEditMode(false);
      await loadDetail(); // 再取得・再描画
    } catch (e) {
      setSaveMessage({
        type: 'error',
        text: e instanceof Error ? e.message : '顧客情報の更新に失敗しました。',
      });
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------------------
  // ローディング / エラー
  // -----------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <button
            onClick={() => router.push('/admin/customers/management')}
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            顧客一覧へ戻る
          </button>
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 font-medium">{loadError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!detail) return null;

  const customer = detail.customer;
  const fullName = `${customer.kanji_last_name || ''} ${customer.kanji_first_name || ''}`.trim();

  // -----------------------------------------------------
  // 描画
  // -----------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 戻る + ヘッダー */}
        <button
          onClick={() => router.push('/admin/customers/management')}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          顧客一覧へ戻る
        </button>

        {/* 顧客ヘッダー */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-xl flex-shrink-0">
                {(customer.kanji_last_name || customer.email)[0]}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {fullName || customer.email}
                  </h1>
                  {getStatusBadge(customer.status)}
                </div>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {customer.email}
                </p>
                {customer.company_name && (
                  <p className="text-sm text-gray-700 mt-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {customer.company_name}
                  </p>
                )}
              </div>
            </div>
            {activeTab === 'basic' && !editMode && (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={startEdit}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <Edit3 className="w-4 h-4" />
                編集
              </Button>
            )}
          </div>
        </div>

        {/* タブナビゲーション（モバイルでは横スクロール） */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-x-auto">
          <div className="flex min-w-max">
            <TabButton
              active={activeTab === 'basic'}
              onClick={() => setActiveTab('basic')}
              label="基本情報"
            />
            <TabButton
              active={activeTab === 'quotations'}
              onClick={() => setActiveTab('quotations')}
              label={`見積履歴 (${detail.quotations?.length || 0})`}
            />
            <TabButton
              active={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
              label={`注文履歴 (${detail.orders?.length || 0})`}
            />
          </div>
        </div>

        {/* 保存メッセージ */}
        {saveMessage && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
              saveMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {saveMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {saveMessage.text}
          </div>
        )}

        {/* タブ本体 */}
        {activeTab === 'basic' && (
          <BasicInfoTab
            customer={customer}
            statistics={detail.statistics}
            editMode={editMode}
            saving={saving}
            errors={errors}
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            onCancel={cancelEdit}
          />
        )}
        {activeTab === 'quotations' && (
          <QuotationsTab quotations={detail.quotations || []} />
        )}
        {activeTab === 'orders' && (
          <OrdersTab
            orders={detail.orders || []}
            quotations={detail.quotations || []}
          />
        )}
      </div>
    </div>
  );
}

// =====================================================
// タブボタン
// =====================================================
function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );
}

// =====================================================
// Step 4: 基本情報タブ（表示＋フル編集）
// =====================================================
interface BasicInfoTabProps {
  customer: Profile;
  statistics: CustomerDetailResponse['data']['statistics'];
  editMode: boolean;
  saving: boolean;
  errors: Record<string, { message?: string }>;
  register: ReturnType<typeof useForm<FullEditFormData>>['register'];
  handleSubmit: ReturnType<typeof useForm<FullEditFormData>>['handleSubmit'];
  onSubmit: (data: FullEditFormData) => Promise<void>;
  onCancel: () => void;
}

function BasicInfoTab({
  customer,
  statistics,
  editMode,
  saving,
  errors,
  register,
  handleSubmit,
  onSubmit,
  onCancel,
}: BasicInfoTabProps) {
  // 表示モード
  if (!editMode) {
    return (
      <div className="space-y-6">
        {/* 統計サマリー */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-4">注文・見積統計</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <StatTile label="総注文数" value={String(statistics.totalOrders)} color="text-blue-600" />
            <StatTile
              label="総購入額"
              value={`¥${((statistics.totalSpent || 0) / 10000).toFixed(1)}万`}
              color="text-green-600"
            />
            <StatTile label="総見積数" value={String(statistics.totalQuotations || 0)} color="text-purple-600" />
            <StatTile label="見積待ち" value={String(statistics.pendingQuotations || 0)} color="text-amber-600" />
          </div>
        </div>

        {/* 基本情報 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">基本情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <DataRow label="メールアドレス" value={customer.email} icon={<Mail className="w-3.5 h-3.5" />} />
            <DataRow label="ステータス" value={getStatusBadge(customer.status)} />
            <DataRow label="事業者種別" value={customer.business_type === 'CORPORATION' ? '法人' : '個人'} />
            <DataRow label="製品カテゴリー" value={labelForProductCategory(customer.product_category)} />
            <DataRow
              label="氏名（漢字）"
              value={`${customer.kanji_last_name || ''} ${customer.kanji_first_name || ''}`.trim() || '-'}
            />
            <DataRow
              label="氏名（かな）"
              value={`${customer.kana_last_name || ''} ${customer.kana_first_name || ''}`.trim() || '-'}
            />
            <DataRow label="会社電話" value={customer.corporate_phone || '-'} icon={<Phone className="w-3.5 h-3.5" />} />
            <DataRow label="携帯電話" value={customer.personal_phone || '-'} icon={<Phone className="w-3.5 h-3.5" />} />
            <DataRow label="FAX" value={customer.fax || '-'} icon={<Phone className="w-3.5 h-3.5" />} />
            <DataRow label="会社名" value={customer.company_name || '-'} icon={<Building2 className="w-3.5 h-3.5" />} />
            <DataRow label="法人番号" value={customer.legal_entity_number || '-'} />
            <DataRow label="役職" value={customer.position || '-'} />
            <DataRow label="部署" value={customer.department || '-'} />
            <DataRow label="会社URL" value={customer.company_url || '-'} />
            <DataRow label="流入経路" value={labelForAcquisitionChannel(customer.acquisition_channel)} />
          </div>
        </div>

        {/* 住所 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            住所
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <DataRow label="郵便番号" value={customer.postal_code ? `〒${customer.postal_code}` : '-'} />
            <DataRow label="都道府県" value={customer.prefecture || '-'} />
            <DataRow label="市区町村" value={customer.city || '-'} />
            <DataRow label="番地" value={customer.street || '-'} />
            <DataRow label="建物名" value={customer.building || '-'} />
          </div>
        </div>

        {/* 運用項目 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">運用項目</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <DataRow label="マークアップ率" value={`${((customer.markup_rate ?? 0.5) * 100).toFixed(0)}%`} />
            <DataRow label="マークアップ率 備考" value={customer.markup_rate_note || '-'} />
            <DataRow
              label="登録日"
              value={formatDate(customer.created_at, 'ja')}
              icon={<Calendar className="w-3.5 h-3.5" />}
            />
            <DataRow
              label="最終ログイン"
              value={customer.last_login_at ? formatDate(customer.last_login_at, 'ja') : '-'}
            />
          </div>
        </div>
      </div>
    );
  }

  // 編集モード
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* メール（読み取り専用・Non-Goal 明示） */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium">メールアドレスの変更は別フローとなります（本画面では編集できません）。</p>
        </div>
      </div>

      {/* 認証情報（メールのみ・disabled） */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">認証情報</h2>
        <Input
          label="メールアドレス（読み取り専用）"
          type="email"
          value={customer.email}
          disabled
          helperText="メールアドレスの変更は別フローで行ってください。"
        />
      </div>

      {/* 氏名 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">氏名</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="姓（漢字）" placeholder="山田" error={errors.kanjiLastName?.message} {...register('kanjiLastName')} />
          <Input label="名（漢字）" placeholder="太郎" error={errors.kanjiFirstName?.message} {...register('kanjiFirstName')} />
          <Input label="姓（かな）" placeholder="やまだ" error={errors.kanaLastName?.message} {...register('kanaLastName')} />
          <Input label="名（かな）" placeholder="たろう" error={errors.kanaFirstName?.message} {...register('kanaFirstName')} />
        </div>
      </div>

      {/* 連絡先 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">連絡先</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="会社電話番号" type="tel" placeholder="03-1234-5678" error={errors.corporatePhone?.message} {...register('corporatePhone')} />
          <Input label="携帯電話" type="tel" placeholder="090-1234-5678" error={errors.personalPhone?.message} {...register('personalPhone')} />
          <Input label="FAX番号" type="tel" placeholder="03-1234-5678" error={errors.fax?.message} {...register('fax')} />
        </div>
      </div>

      {/* 事業形態 + 会社情報 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">事業形態・会社情報</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">事業者種別</label>
            <div className="flex gap-6">
              {([BusinessType.INDIVIDUAL, BusinessType.CORPORATION] as const).map((bt) => (
                <label key={bt} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value={bt} {...register('businessType')} className="text-blue-600" />
                  <span className="text-sm">{bt === BusinessType.CORPORATION ? '法人' : '個人'}</span>
                </label>
              ))}
            </div>
            {errors.businessType && <p className="mt-1 text-sm text-red-500">{errors.businessType.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="会社名" placeholder="株式会社イパッケージLab" error={errors.companyName?.message} {...register('companyName')} />
            <Input label="法人番号" placeholder="1234567890123" maxLength={13} error={errors.legalEntityNumber?.message} {...register('legalEntityNumber')} />
            <Input label="役職" placeholder="代表取締役" error={errors.position?.message} {...register('position')} />
            <Input label="部署" placeholder="営業チーム" error={errors.department?.message} {...register('department')} />
            <Input label="会社URL" type="url" placeholder="https://example.com" error={errors.companyUrl?.message} {...register('companyUrl')} />
            <SelectField
              label="製品カテゴリー"
              register={register('productCategory')}
              options={PRODUCT_CATEGORY_OPTIONS}
              error={errors.productCategory?.message}
            />
          </div>
        </div>
      </div>

      {/* 住所 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">住所</h2>
        <div className="space-y-4">
          <Input label="郵便番号" placeholder="123-4567" error={errors.postalCode?.message} {...register('postalCode')} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">都道府県</label>
              <select
                {...register('prefecture')}
                className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">選択</option>
                {PREFECTURE_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <Input label="市区町村" placeholder="加古郡稲美町六分一" error={errors.city?.message} {...register('city')} />
            <Input label="番地" placeholder="1-2-3" error={errors.street?.message} {...register('street')} />
            <Input label="建物名" placeholder="〇〇ビル 3F" error={errors.building?.message} {...register('building')} />
          </div>
          <SelectField
            label="流入経路"
            register={register('acquisitionChannel')}
            options={ACQUISITION_CHANNEL_OPTIONS}
            includeBlank
            error={errors.acquisitionChannel?.message}
          />
        </div>
      </div>

      {/* 運用項目 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">運用項目</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
            <select
              {...register('status')}
              className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              {USER_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>}
            <p className="mt-1 text-xs text-gray-500">「招待中（INVITED）」は管理者招待フロー専用のため選択できません。</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">マークアップ率（0〜10）</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              {...register('markup_rate', { valueAsNumber: true })}
              className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            {errors.markup_rate && <p className="mt-1 text-sm text-red-500">{errors.markup_rate.message}</p>}
            <p className="mt-1 text-xs text-gray-500">例: 0.5 = 50%</p>
          </div>
          <div className="md:col-span-2">
            <Input
              label="マークアップ率 備考"
              placeholder="特別契約のため 40% に設定"
              error={errors.markup_rate_note?.message}
              {...register('markup_rate_note')}
            />
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button type="submit" variant="primary" size="lg" disabled={saving} className="flex-1 flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? '保存中...' : '保存する'}
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={onCancel} disabled={saving} className="flex items-center justify-center gap-2">
          <X className="w-4 h-4" />
          キャンセル
        </Button>
      </div>
    </form>
  );
}

// =====================================================
// Step 7: 見積履歴タブ
// =====================================================
function QuotationsTab({ quotations }: { quotations: CustomerQuotation[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  // クライアント側ページネーション用 state
  const [currentPage, setCurrentPage] = useState(1);

  const sorted = useMemo(() => {
    let list = quotations;
    if (statusFilter !== 'ALL') {
      list = list.filter((q) => q.status === statusFilter);
    }
    const arr = [...list];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else if (sortKey === 'amount') cmp = (a.total_amount || 0) - (b.total_amount || 0);
      else cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [quotations, sortKey, sortDir, statusFilter]);

  // ページネーション計算: フィルタ・ソート後の sorted 配列をページサイズで分割
  const totalPages = Math.max(1, Math.ceil(sorted.length / QUOTATIONS_PAGE_SIZE));
  const paginated = sorted.slice((currentPage - 1) * QUOTATIONS_PAGE_SIZE, currentPage * QUOTATIONS_PAGE_SIZE);

  // フィルタ・ソート変更で sorted 件数が変わり currentPage が totalPages を超えたら1ページ目へ戻す
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    // ソート変更時に1ページ目へリセット
    setCurrentPage(1);
  };

  // ステータスフィルタ変更時に1ページ目へリセット
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (quotations.length === 0) {
    return <EmptyState icon={<FileText className="w-10 h-10 text-gray-300" />} message="見積履歴はありません。" />;
  }

  return (
    <div className="space-y-4">
      {/* フィルタ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-sm text-gray-600">ステータス絞り込み:</label>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="h-10 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {QUOTATION_STATUS_FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="text-xs text-gray-400 sm:ml-auto">{sorted.length}件 / 全{quotations.length}件</span>
      </div>

      {/* デスクトップ: テーブル */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium w-10"></th>
              <th className="px-4 py-3 text-left font-medium">見積番号</th>
              <SortableTh label="作成日" active={sortKey === 'date'} dir={sortDir} onClick={() => toggleSort('date')} />
              <SortableTh label="金額" active={sortKey === 'amount'} dir={sortDir} onClick={() => toggleSort('amount')} align="right" />
              <SortableTh label="ステータス" active={sortKey === 'status'} dir={sortDir} onClick={() => toggleSort('status')} />
              <th className="px-4 py-3 text-center font-medium">PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((q) => (
              <QuotationRow
                key={q.id}
                quotation={q}
                expanded={expanded.has(q.id)}
                onToggle={() => toggleExpand(q.id)}
              />
            ))}
          </tbody>
        </table>
        {/* クライアント側ページネーション（テーブル直下・全件対象） */}
        {sorted.length > QUOTATIONS_PAGE_SIZE && (
          <DesktopPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sorted.length}
            itemsPerPage={QUOTATIONS_PAGE_SIZE}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>

      {/* モバイル: カード */}
      <div className="md:hidden space-y-3">
        {paginated.map((q) => (
          <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{q.quotation_number}</p>
                <p className="text-xs text-gray-500">{formatDate(q.created_at, 'ja')}</p>
              </div>
              {getQuotationStatusBadge(q.status)}
            </div>
            <div className="text-lg font-bold text-gray-900 mb-2">¥{(q.total_amount || 0).toLocaleString()}</div>
            {q.items && q.items.length > 0 && (
              <QuotationItems quotation={q} />
            )}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-2">
              {q.pdf_url && (
                <a href={q.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded">
                  <Download className="w-3 h-3" /> PDF
                </a>
              )}
              <a href={`/admin/quotations?id=${q.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                詳細
              </a>
            </div>
          </div>
        ))}
        {/* クライアント側ページネーション（モバイル・カード直下） */}
        {sorted.length > QUOTATIONS_PAGE_SIZE && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-3">
            <DesktopPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={sorted.length}
              itemsPerPage={QUOTATIONS_PAGE_SIZE}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function QuotationRow({
  quotation,
  expanded,
  onToggle,
}: {
  quotation: CustomerQuotation;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-3 text-center">
          {quotation.items && quotation.items.length > 0 && (
            <button onClick={onToggle} className="text-gray-400 hover:text-gray-700">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </td>
        <td className="px-4 py-3">
          <a href={`/admin/quotations?id=${quotation.id}`} className="text-blue-600 hover:underline font-medium">
            {quotation.quotation_number}
          </a>
        </td>
        <td className="px-4 py-3 text-gray-600">{formatDate(quotation.created_at, 'ja')}</td>
        <td className="px-4 py-3 text-right font-medium">¥{(quotation.total_amount || 0).toLocaleString()}</td>
        <td className="px-4 py-3">{getQuotationStatusBadge(quotation.status)}</td>
        <td className="px-4 py-3 text-center">
          {quotation.pdf_url ? (
            <a href={quotation.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded">
              <Download className="w-3 h-3" /> PDF
            </a>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
        </td>
      </tr>
      {expanded && quotation.items && quotation.items.length > 0 && (
        <tr className="bg-gray-50">
          <td colSpan={6} className="px-4 py-3">
            <QuotationItems quotation={quotation} />
          </td>
        </tr>
      )}
    </>
  );
}

function QuotationItems({ quotation }: { quotation: CustomerQuotation }) {
  if (!quotation.items || quotation.items.length === 0) return null;
  return (
    <div className="text-sm">
      <div className="text-gray-500 mb-1">明細:</div>
      <div className="space-y-1">
        {quotation.items.map((item) => (
          <div key={item.id} className="flex justify-between text-xs">
            <span className="text-gray-700">{item.product_name} × {item.quantity}</span>
            <span className="text-gray-600">¥{(item.total_price || 0).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// Step 8: 注文履歴タブ
// =====================================================
function OrdersTab({
  orders,
  quotations,
}: {
  orders: CustomerOrder[];
  quotations: CustomerQuotation[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  // クライアント側ページネーション用 state
  const [currentPage, setCurrentPage] = useState(1);

  // quotation_id → quotation_number の参照マップ（元見積紐付け表示用）
  const quotationMap = useMemo(() => {
    const m = new Map<string, string>();
    quotations.forEach((q) => m.set(q.id, q.quotation_number));
    return m;
  }, [quotations]);

  const sorted = useMemo(() => {
    const arr = [...orders];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else if (sortKey === 'amount') cmp = (a.total_amount || 0) - (b.total_amount || 0);
      else cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [orders, sortKey, sortDir]);

  // ページネーション計算: ソート後の sorted 配列をページサイズで分割
  const totalPages = Math.max(1, Math.ceil(sorted.length / ORDERS_PAGE_SIZE));
  const paginated = sorted.slice((currentPage - 1) * ORDERS_PAGE_SIZE, currentPage * ORDERS_PAGE_SIZE);

  // ソート変更で sorted 件数は変わらないが、表示位置をリセットするため1ページ目へ戻す
  // （orders にフィルタは無いが totalPages > currentPage になり得ないよう念のためクランプ）
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    // ソート変更時に1ページ目へリセット
    setCurrentPage(1);
  };

  if (orders.length === 0) {
    return <EmptyState icon={<Package className="w-10 h-10 text-gray-300" />} message="注文履歴はありません。" />;
  }

  return (
    <div className="space-y-4">
      {/* デスクトップ: テーブル */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">注文番号</th>
              <SortableTh label="注文日" active={sortKey === 'date'} dir={sortDir} onClick={() => toggleSort('date')} />
              <SortableTh label="金額" active={sortKey === 'amount'} dir={sortDir} onClick={() => toggleSort('amount')} align="right" />
              <SortableTh label="ステータス" active={sortKey === 'status'} dir={sortDir} onClick={() => toggleSort('status')} />
              <th className="px-4 py-3 text-left font-medium">元見積</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{o.order_number}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(o.created_at, 'ja')}</td>
                <td className="px-4 py-3 text-right font-medium">¥{(o.total_amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3">{getOrderStatusBadge(o.status)}</td>
                <td className="px-4 py-3">
                  {o.quotation_id ? (
                    quotationMap.has(o.quotation_id) ? (
                      <a
                        href={`/admin/quotations?id=${o.quotation_id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Link2 className="w-3 h-3" />
                        {quotationMap.get(o.quotation_id)}
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <Link2 className="w-3 h-3" />
                        （見積なし）
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* クライアント側ページネーション（テーブル直下・全件対象） */}
        {sorted.length > ORDERS_PAGE_SIZE && (
          <DesktopPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sorted.length}
            itemsPerPage={ORDERS_PAGE_SIZE}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>

      {/* モバイル: カード */}
      <div className="md:hidden space-y-3">
        {paginated.map((o) => (
          <div key={o.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="font-medium text-gray-900">{o.order_number}</p>
              {getOrderStatusBadge(o.status)}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{formatDate(o.created_at, 'ja')}</span>
              <span className="font-bold text-gray-900">¥{(o.total_amount || 0).toLocaleString()}</span>
            </div>
            {o.quotation_id && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                {quotationMap.has(o.quotation_id) ? (
                  <a href={`/admin/quotations?id=${o.quotation_id}`} className="inline-flex items-center gap-1 text-xs text-blue-600">
                    <Link2 className="w-3 h-3" />
                    元見積: {quotationMap.get(o.quotation_id)}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <Link2 className="w-3 h-3" />
                    元見積参照あり（非表示）
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        {/* クライアント側ページネーション（モバイル・カード直下） */}
        {sorted.length > ORDERS_PAGE_SIZE && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-3">
            <DesktopPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={sorted.length}
              itemsPerPage={ORDERS_PAGE_SIZE}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// 共有 UI 補助
// =====================================================

function StatTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <div className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );
}

function DataRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <dt className="text-sm text-gray-500 flex items-center gap-1.5 flex-shrink-0">
        {icon}
        {label}
      </dt>
      <dd className="text-sm text-gray-900 text-right min-w-0 break-all">{value}</dd>
    </div>
  );
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
  align = 'left',
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: 'left' | 'right';
}) {
  return (
    <th className={`px-4 py-3 font-medium ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1 hover:text-gray-900 ${align === 'right' ? 'flex-row-reverse' : ''} ${
          active ? 'text-blue-600' : ''
        }`}
      >
        {label}
        {active && (dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
      </button>
    </th>
  );
}

function SelectField({
  label,
  register,
  options,
  includeBlank,
  error,
}: {
  label: string;
  register: ReturnType<ReturnType<typeof useForm<FullEditFormData>>['register']>;
  options: readonly { value: string; label: string }[];
  includeBlank?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        {...register}
        className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
      >
        {includeBlank && <option value="">選択</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}

// =====================================================
// 注文ステータスバッジ（ORDER_STATUS_LABELS を使用・既存 badges.tsx に注文用が無いため）
// =====================================================
function getOrderStatusBadge(status: OrderStatus) {
  const conf = ORDER_STATUS_LABELS[status];
  const variant = (() => {
    const cat = conf?.category;
    if (cat === 'terminated') return 'error' as const;
    if (cat === 'final') return 'success' as const;
    if (cat === 'production' || cat === 'active') return 'info' as const;
    if (cat === 'initial') return 'warning' as const;
    return 'secondary' as const;
  })();
  return <Badge variant={variant} size="sm">{conf?.ja ?? status}</Badge>;
}

// =====================================================
// 区分値ラベル変換（RegistrationForm と同一・デザイン統一）
// =====================================================
function labelForProductCategory(value: string): string {
  return PRODUCT_CATEGORY_OPTIONS.find((o) => o.value === value)?.label || value || '-';
}

function labelForAcquisitionChannel(value: string | null): string {
  if (!value) return '-';
  return ACQUISITION_CHANNEL_OPTIONS.find((o) => o.value === value)?.label || value;
}
