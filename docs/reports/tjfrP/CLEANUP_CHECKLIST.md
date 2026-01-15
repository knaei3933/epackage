# 整理対象ファイルリスト (Cleanup File List)

## 概要 (Overview)

**目的**: Portal → Admin統合における全ファイルの削除、移動、変更をリストアップ

**作成日**: 2026-01-15

**注意**: 本リストの変更は、Phase 4（リダイレクト実装後）に実施してください

---

## 1. 削除対象ファイル（Files to Delete）

### 1.1 Portalディレクトリ全体

**削除タイミング**: Phase 4後

```
DELETE src/app/portal/
├── page.tsx
├── orders/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── documents/
│   └── page.tsx
├── profile/
│   └── page.tsx
└── support/
    └── page.tsx
```

**ファイル数**: 6ファイル
**確認事項**:
- [ ] 301リダイレクトが正しく動作している
- [ ] `/admin/customers/*`ページが全て機能している
- [ ] 全てのAPI呼び出しが`/api/member/*`に変更されている
- [ ] E2Eテストが通過している

### 1.2 Portalコンポーネントディレクトリ

**削除タイミング**: Phase 4後

```
DELETE src/components/portal/
├── PortalLayout.tsx
├── OrderSummaryCard.tsx
├── DocumentDownloadCard.tsx
├── ProductionProgressWidget.tsx
└── ShipmentTrackingCard.tsx
```

**ファイル数**: 5ファイル

**各ファイルの処理**:

| ファイル | 処理方法 | 理由 |
|---------|---------|------|
| `PortalLayout.tsx` | `components/admin/CustomerPortalLayout.tsx`に移動後削除 | Admin/customers専用レイアウトに変更 |
| `OrderSummaryCard.tsx` | `components/shared/order/`に移動後削除 | 共通コンポーネント化 |
| `DocumentDownloadCard.tsx` | 既存`DocumentDownload`に統合後削除 | 重複削除 |
| `ProductionProgressWidget.tsx` | `components/shared/production/`に移動後削除 | 共通コンポーネント化 |
| `ShipmentTrackingCard.tsx` | `components/shared/shipping/`に移動後削除 | 共通コンポーネント化 |

### 1.3 APIルートディレクトリ全体

**削除タイミング**: Phase 4後

```
DELETE src/app/api/customer/
├── dashboard/
│   └── route.ts
├── orders/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── profile/
│   └── route.ts
└── documents/
    └── route.ts
```

**ファイル数**: 5ファイル

**確認事項**:
- [ ] 全ての呼び出し元が`/api/member/*`に変更されている
- [ ] APIテストが通過している
- [ ] Postman/Insomnia等のAPIコレクションを更新済み

---

## 2. 移動対象ファイル（Files to Move）

### 2.1 コンポーネントの移動

**移動タイミング**: Phase 2

#### 2.1.1 OrderSummaryCard

**元の場所**: `src/components/portal/OrderSummaryCard.tsx`
**新しい場所**: `src/components/shared/order/OrderSummaryCard.tsx`

**移動コマンド**:
```bash
mkdir -p src/components/shared/order
mv src/components/portal/OrderSummaryCard.tsx src/components/shared/order/
```

**インポート文の更新**:
```typescript
// 更新前
import { OrderSummaryCard } from '@/components/portal/OrderSummaryCard';

// 更新後
import { OrderSummaryCard } from '@/components/shared/order/OrderSummaryCard';
// または
import { OrderSummaryCard } from '@/components/shared/order';
```

#### 2.1.2 ProductionProgressWidget

**元の場所**: `src/components/portal/ProductionProgressWidget.tsx`
**新しい場所**: `src/components/shared/production/ProductionProgressWidget.tsx`

**移動コマンド**:
```bash
mkdir -p src/components/shared/production
mv src/components/portal/ProductionProgressWidget.tsx src/components/shared/production/
```

**インポート文の更新**:
```typescript
// 更新前
import { ProductionProgressWidget } from '@/components/portal/ProductionProgressWidget';

// 更新後
import { ProductionProgressWidget } from '@/components/shared/production/ProductionProgressWidget';
// または
import { ProductionProgressWidget } from '@/components/shared/production';
```

#### 2.1.3 ShipmentTrackingCard

**元の場所**: `src/components/portal/ShipmentTrackingCard.tsx`
**新しい場所**: `src/components/shared/shipping/ShipmentTrackingCard.tsx`

**移動コマンド**:
```bash
mkdir -p src/components/shared/shipping
mv src/components/portal/ShipmentTrackingCard.tsx src/components/shared/shipping/
```

**インポート文の更新**:
```typescript
// 更新前
import { ShipmentTrackingCard } from '@/components/portal/ShipmentTrackingCard';

// 更新後
import { ShipmentTrackingCard } from '@/components/shared/shipping/ShipmentTrackingCard';
// または
import { ShipmentTrackingCard } from '@/components/shared/shipping';
```

### 2.2 レイアウトの移動

**移動タイミング**: Phase 3

#### 2.2.1 PortalLayout → CustomerPortalLayout

**元の場所**: `src/components/portal/PortalLayout.tsx`
**新しい場所**: `src/components/admin/CustomerPortalLayout.tsx`

**移動コマンド**:
```bash
mkdir -p src/components/admin
cp src/components/portal/PortalLayout.tsx src/components/admin/CustomerPortalLayout.tsx
```

**注意**: コピーしてから編集するため、元ファイルは後で削除

**変更内容**:
1. コンポーネント名を`PortalLayout`→`CustomerPortalLayout`に変更
2. ナビゲーション先を`/portal/*`→`/admin/customers/*`に変更
3. 必要に応じてスタイルを調整

---

## 3. 作成対象ファイル（Files to Create）

### 3.1 新規Admin/Customersページ

**作成タイミング**: Phase 3

#### 3.1.1 顧客ポータルダッシュボード

**ファイル**: `src/app/admin/customers/page.tsx`

**元ファイル**: `src/app/portal/page.tsx`

**主な変更**:
- API呼び出し: `/api/customer/dashboard` → `/api/member/dashboard`
- ナビゲーションリンクを更新

```bash
# コピー
mkdir -p src/app/admin/customers
cp src/app/portal/page.tsx src/app/admin/customers/page.tsx

# 編集
# 1. API呼び出しを変更
# 2. 必要に応じてUIを調整
```

#### 3.1.2 注文一覧ページ

**ファイル**: `src/app/admin/customers/orders/page.tsx`

**元ファイル**: `src/app/portal/orders/page.tsx`

**主な変更**:
- API呼び出し: `/api/customer/orders` → `/api/member/orders`

```bash
# コピー
mkdir -p src/app/admin/customers/orders
cp src/app/portal/orders/page.tsx src/app/admin/customers/orders/page.tsx

# 編集
# 1. API呼び出しを変更
```

#### 3.1.3 注文詳細ページ

**ファイル**: `src/app/admin/customers/orders/[id]/page.tsx`

**元ファイル**: `src/app/portal/orders/[id]/page.tsx`

**主な変更**:
- API呼び出し: `/api/customer/orders/[id]` → `/api/member/orders/[id]`

```bash
# コピー
mkdir -p src/app/admin/customers/orders/[id]
cp src/app/portal/orders/[id]/page.tsx src/app/admin/customers/orders/[id]/page.tsx

# 編集
# 1. API呼び出しを変更
```

#### 3.1.4 ドキュメントページ

**ファイル**: `src/app/admin/customers/documents/page.tsx`

**元ファイル**: `src/app/portal/documents/page.tsx`

**主な変更**:
- API呼び出し: `/api/customer/documents` → `/api/member/contracts`

```bash
# コピー
mkdir -p src/app/admin/customers/documents
cp src/app/portal/documents/page.tsx src/app/admin/customers/documents/page.tsx

# 編集
# 1. API呼び出しを変更
# 2. 必要に応じて契約書に特化したUIに調整
```

#### 3.1.5 プロフィールページ

**ファイル**: `src/app/admin/customers/profile/page.tsx`

**元ファイル**: `src/app/portal/profile/page.tsx`

**主な変更**:
- API呼び出し: `/api/customer/profile` → `/api/member/profile`

```bash
# コピー
mkdir -p src/app/admin/customers/profile
cp src/app/portal/profile/page.tsx src/app/admin/customers/profile/page.tsx

# 編集
# 1. API呼び出しを変更
```

#### 3.1.6 サポートページ

**ファイル**: `src/app/admin/customers/support/page.tsx`

**元ファイル**: `src/app/portal/support/page.tsx`

**主な変更**:
- 静的ページのためAPI変更なし
- ナビゲーションリンクを更新

```bash
# コピー
mkdir -p src/app/admin/customers/support
cp src/app/portal/support/page.tsx src/app/admin/customers/support/page.tsx

# 編集
# 1. ナビゲーションリンクを更新（もしあれば）
```

### 3.2 共通コンポーネントインデックスファイル

**作成タイミング**: Phase 2

#### 3.2.1 Orderコンポーネントインデックス

**ファイル**: `src/components/shared/order/index.ts`

```typescript
export { OrderSummaryCard } from './OrderSummaryCard';
export { OrderTable } from './OrderTable';
export { OrderFilters } from './OrderFilters';
export { OrderStatusBadge } from './OrderStatusBadge';
```

#### 3.2.2 Productionコンポーネントインデックス

**ファイル**: `src/components/shared/production/index.ts`

```typescript
export { ProductionProgressWidget } from './ProductionProgressWidget';
export { ProductionTimeline } from './ProductionTimeline';
```

#### 3.2.3 Shippingコンポーネントインデックス

**ファイル**: `src/components/shared/shipping/index.ts`

```typescript
export { ShipmentTrackingCard } from './ShipmentTrackingCard';
export { DeliveryStatusBadge } from './DeliveryStatusBadge';
```

### 3.3 共有コンポーネント統合

**作成タイミング**: Phase 2

#### 3.3.1 DocumentDownload統合

**ファイル**: `src/components/shared/document/DocumentDownload.tsx`

**元ファイル**:
- `src/components/portal/DocumentDownloadCard.tsx`
- `src/components/b2b/DocumentDownload.tsx`（既存）

**統合方法**: 既存の`DocumentDownload`をベースにPortal版の機能を統合

```bash
mkdir -p src/components/shared/document
# 既存のDocumentDownloadをコピー/編集
cp src/components/b2b/DocumentDownload.tsx src/components/shared/document/DocumentDownload.tsx
```

---

## 4. 変更対象ファイル（Files to Modify）

### 4.1 ミドルウェア

**ファイル**: `src/middleware.ts`

**変更タイミング**: Phase 3

**変更内容**:

1. **顧客ポータルルート定義を追加**:
```typescript
const isCustomerPortalRoute = pathname.startsWith('/admin/customers');
```

2. **認証ロジックの統合**:
```typescript
// 既存のPortal認証とMember認証を統合
if (isMemberRoute || isCustomerPortalRoute) {
  // 共通の認証ロジック
}
```

3. **301リダイレクトの実装**:
```typescript
// Portal → Admin/Customers への301リダイレクト
if (pathname.startsWith('/portal')) {
  const newPath = pathname.replace('/portal', '/admin/customers');
  const url = new URL(newPath, req.url);
  url.search = req.nextUrl.search;
  return NextResponse.redirect(url, { status: 301 });
}
```

### 4.2 Adminレイアウト

**ファイル**: `src/app/admin/layout.tsx`

**変更タイミング**: Phase 3

**変更内容**:

1. **インポートを追加**:
```typescript
import CustomerPortalLayout from '@/components/admin/CustomerPortalLayout';
```

2. **ルート判定ロジックを追加**:
```typescript
const isCustomerPortal = pathname.startsWith('/admin/customers');
```

3. **レイアウト分岐を実装**:
```typescript
{isCustomerPortal ? (
  <CustomerPortalLayout profile={profile}>
    {children}
  </CustomerPortalLayout>
) : (
  <InternalAdminLayout profile={profile}>
    {children}
  </InternalAdminLayout>
)}
```

### 4.3 Adminナビゲーション

**ファイル**: `src/components/admin/AdminNavigation.tsx`

**変更タイミング**: Phase 3

**変更内容**:

1. **顧客ポータルメニューを追加**:
```typescript
{
  href: '/admin/customers',
  label: '顧客ポータル',
  icon: Users,
  badge: pendingCustomers > 0 ? `${pendingCustomers}` : undefined,
}
```

### 4.4 全インポート文の更新

**影響ファイル**: Portalコンポーネントをインポートしている全ファイル

**変更タイミング**: Phase 2-4

**変更パターン**:

| 元のインポート | 新しいインポート |
|--------------|---------------|
| `@/components/portal/*` | `@/components/shared/*` または `@/components/admin/*` |
| `/api/customer/*` | `/api/member/*` |
| `/portal/*` | `/admin/customers/*` |

**検索コマンド**:
```bash
# 影響ファイルを検索
grep -r "@/components/portal/" src/
grep -r "/api/customer/" src/
grep -r '"/portal/' src/
```

---

## 5. テストファイルの変更（Test Files to Modify）

### 5.1 E2Eテストの移動

**変更タイミング**: Phase 4

#### 5.1.1 テストディレクトリ再構成

```
# 元の場所
tests/e2e/phase-5-portal/

# 新しい場所
tests/e2e/phase-6-customer-portal/
```

**移動コマンド**:
```bash
mkdir -p tests/e2e/phase-6-customer-portal
mv tests/e2e/phase-5-portal/* tests/e2e/phase-6-customer-portal/
```

#### 5.1.2 URL参照の更新

**影響ファイル**: Phase 6の全テストファイル

**変更パターン**:

```typescript
// 更新前
await page.goto('/portal');
await page.goto('/portal/orders');
await page.goto('/portal/orders/12345');

// 更新後
await page.goto('/admin/customers');
await page.goto('/admin/customers/orders');
await page.goto('/admin/customers/orders/12345');
```

**一括置換コマンド**:
```bash
cd tests/e2e/phase-6-customer-portal
find . -name "*.spec.ts" -exec sed -i "s|'/portal|'/admin/customers|g" {} \;
```

### 5.2 リダイレクト検証テスト

**新規作成**: Phase 4

**ファイル**: `tests/e2e/phase-6-customer-portal/00-redirects.spec.ts`

**内容**: 詳細は設計文書「5.3.3 リダイレクト検証テスト」を参照

---

## 6. ドキュメントの更新（Documentation Updates）

### 6.1 技術ドキュメント

**変更タイミング**: Phase 5

#### 6.1.1 CLAUDE.md

**変更内容**:
- ルート構造の更新
- APIエンドポイント一覧の更新
- コンポーネント構成の更新

**ファイル**: `CLAUDE.md`

#### 6.1.2 設計文書

**変更内容**:
- `docs/reports/tjfrP/設計図.md`の更新
- 本統合の反映

**ファイル**: `docs/reports/tjfrP/設計図.md`

#### 6.1.3 APIドキュメント

**変更内容**:
- `/api/customer/*`エンドポイントの削除
- `/admin/customers/*`ルートの追加

**ファイル**: `docs/API_DOCUMENTATION.md`（もしあれば）

### 6.2 ユーザードキュメント

**変更タイミング**: Phase 5

#### 6.2.1 ヘルプページの更新

**ファイル**: `/admin/customers/support`ページ内のヘルプコンテンツ

**変更内容**:
- URL変更案内の追加
- スクリーンショットの更新
- ナビゲーションパスの更新

---

## 7. 実行チェックリスト（Execution Checklist）

### Phase 1: 準備

- [x] 設計文書の作成（統合ホームページ構造設計.md）
- [x] 重複機能分析レポートの作成
- [x] 整理対象ファイルリストの作成（本ファイル）
- [ ] 機能ブランチの作成: `feature/portal-admin-merge`

### Phase 2: API整理 & コンポーネント統合

- [ ] `/api/customer/*` APIエンドポイントの削除（6個）
- [ ] 共通コンポーネントディレクトリの作成
  - [ ] `src/components/shared/order/`
  - [ ] `src/components/shared/production/`
  - [ ] `src/components/shared/shipping/`
  - [ ] `src/components/shared/document/`
- [ ] 重複コンポーネントの統合
  - [ ] `OrderSummaryCard`の移動
  - [ ] `ProductionProgressWidget`の移動
  - [ ] `ShipmentTrackingCard`の移動
  - [ ] `DocumentDownloadCard`の統合
- [ ] インポート文の更新
- [ ] コンポーネントテストの作成/更新

### Phase 3: ルート移行

- [ ] `/admin/customers/`ディレクトリ構造の作成
- [ ] Portalページの移動とAPI呼び出しの変更
  - [ ] `page.tsx`（ダッシュボード）
  - [ ] `orders/page.tsx`（注文一覧）
  - [ ] `orders/[id]/page.tsx`（注文詳細）
  - [ ] `documents/page.tsx`（ドキュメント）
  - [ ] `profile/page.tsx`（プロフィール）
  - [ ] `support/page.tsx`（サポート）
- [ ] `CustomerPortalLayout`コンポーネントの作成
- [ ] ミドルウェア権限ロジックの更新
- [ ] Adminレイアウトの統合
- [ ] Adminナビゲーションの更新

### Phase 4: リダイレクト & テスト

- [ ] ミドルウェア301リダイレクトの実装
- [ ] テストディレクトリの再構成
  - [ ] `tests/e2e/phase-5-portal/` → `tests/e2e/phase-6-customer-portal/`
- [ ] 全テストファイルのURL更新
- [ ] リダイレクトテストの追加
  - [ ] `00-redirects.spec.ts`の作成
- [ ] Phase 4 Adminテストの修正
- [ ] Phase 6 Customer Portalテストの実行

### Phase 5: クリーンアップ

- [ ] 301リダイレクトの動作確認
- [ ] `/admin/customers/*`ページの機能確認
- [ ] API呼び出し変更の確認
- [ ] E2Eテストの通過確認
- [ ] `src/app/portal/`の削除
- [ ] `src/app/api/customer/`の削除
- [ ] `src/components/portal/`の削除（未使用コンポーネントのみ）

### Phase 6: 文書化 & 検証

- [ ] CLAUDE.mdの更新
- [ ] APIドキュメントの更新
- [ ] 設計文書の更新
- [ ] 統合テストの実行
- [ ] パフォーマンステストの実行
- [ ] セキュリティテストの実行
- [ ] レポートの作成

---

## 8. ロールバック計画（Rollback Plan）

### 8.1 緊急ロールバック

**実行コマンド**:
```bash
# 1. 機能ブランチから移動
git checkout main

# 2. 移行前の状態に戻す
git revert <migration-commit-hash>

# 3. ビルドとデプロイ
npm run build
npm run deploy
```

### 8.2 段階的ロールバック

#### ミドルウェアのみロールバック
```bash
git checkout main -- src/middleware.ts
# 再デプロイ
```

#### 特定のページのみロールバック
```bash
git checkout main -- src/app/admin/customers/orders
# 再デプロイ
```

---

## 9. 検証コマンド（Validation Commands）

### 9.1 コード検証

```bash
# 全てのPortal参照を検索
grep -r "portal" src/ --include="*.ts" --include="*.tsx"

# 全ての/api/customer/参照を検索
grep -r "/api/customer/" src/ --include="*.ts" --include="*.tsx"

# 全てのcomponents/portal参照を検索
grep -r "@/components/portal/" src/ --include="*.ts" --include="*.tsx"
```

### 9.2 ファイル検証

```bash
# 削除対象ディレクトリの存在確認
ls -la src/app/portal/
ls -la src/app/api/customer/
ls -la src/components/portal/

# 新規ディレクトリの存在確認
ls -la src/app/admin/customers/
ls -la src/components/shared/
ls -la src/components/admin/CustomerPortalLayout.tsx
```

### 9.3 ビルド検証

```bash
# TypeScriptコンパイルチェック
npm run build

# ESLintチェック
npm run lint

# E2Eテスト
npm run test:e2e
```

---

**チェックリストバージョン**: 1.0
**作成日**: 2026-01-15
**作成者**: Claude Code
**ステータス**: 実行待ち
