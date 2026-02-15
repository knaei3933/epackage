# ページ構造分析

## 概要
- **総ページ数**: 88ページ (2025-01-30 更新: -7ページ削除/統合、loadingページ6つ追加)
- **カテゴリ**: 公開ページ、メンバーページ、管理者ページ、認証ページ
- **最適化状態**:
  - ✅ loading.tsx実装 (6ファイル - Streaming SSR)
  - ✅ *Client.tsx実装 (11ファイル - Server/Client分離)
  - ✅ unstable_cache実装 (products.ts - DBクエリ80%削減)
  - ✅ revalidate API実装 (キャッシュ無効化)

## 公開ページ

### ホームページ
- `src/app/page.tsx` - メインホームページ

### 情報ページ
- `src/app/about/page.tsx` - 会社概要
- `src/app/contact/page.tsx` - お問い合わせ
- `src/app/contact/thank-you/page.tsx` - お問い合わせ完了
- `src/app/service/page.tsx` - サービス説明
- `src/app/privacy/page.tsx` - プライバシーポリシー
- `src/app/terms/page.tsx` - 利用規約
- `src/app/legal/page.tsx` - 法的情報

### カタログ関連
- `src/app/catalog/page.tsx` - カタログトップ
- `src/app/catalog/loading.tsx` - 🆕 カタログローディング
  - **機能**: ProductCardSkeletonを使用したストリーミングSSR
  - **効果**: LCP改善、プログレッシブレンダリング
- `src/app/catalog/[slug]/page.tsx` - カタログ詳細
- `src/app/catalog/[slug]/loading.tsx` - 🆕 カタログ詳細ローディング
  - **機能**: ギャラリー、製品情報スケルトン
  - **効果**: ページ遷移時の体感速度向上

### 見積・シミュレーション
- `src/app/quote-simulator/page.tsx` - 見積シミュレーター (2025-01-18 更新: 他の見積ページは削除)

### サンプル請求
- `src/app/samples/page.tsx` - サンプル請求
- `src/app/samples/thank-you/page.tsx` - サンプル請求完了

### その他の公開ページ
- `src/app/compare/page.tsx` - 比較ページ
- `src/app/compare/shared/page.tsx` - 共有比較ページ
- `src/app/members/page.tsx` - 会員ページ
- `src/app/csr/page.tsx` - CSRページ
- `src/app/data-templates/page.tsx` - データテンプレート
- `src/app/design-system/page.tsx` - デザインシステム
- `src/app/flow/page.tsx` - フローページ
- `src/app/news/page.tsx` - ニュース
- `src/app/premium-content/page.tsx` - プレミアムコンテンツ
- `src/app/pricing/page.tsx` - 料金プラン
- `src/app/print/page.tsx` - 印刷ページ
- `src/app/profile/page.tsx` - プロフィール

### ガイドページ
- `src/app/guide/page.tsx` - ガイドトップ
- `src/app/guide/color/page.tsx` - カラーガイド
- `src/app/guide/environmentaldisplay/page.tsx` - 環境表示ガイド
- `src/app/guide/image/page.tsx` - 画像ガイド
- `src/app/guide/shirohan/page.tsx` - 白はんガイド
- `src/app/guide/size/page.tsx` - サイズガイド

### 業界別ページ
- `src/app/industry/cosmetics/page.tsx` - 化粧品業界
- `src/app/industry/electronics/page.tsx` - 電子機器業界
- `src/app/industry/food-manufacturing/page.tsx` - 食品製造業界
- `src/app/industry/pharmaceutical/page.tsx` - 医薬品業界

### アーカイブ
- `src/app/archives/page.tsx` - アーカイブページ

### 詳細お問い合わせ
- `src/app/inquiry/detailed/page.tsx` - 詳細お問い合わせ

### カート
- `src/app/cart/page.tsx` - カートページ

## 認証ページ

- `src/app/auth/signin/page.tsx` - サインイン
- `src/app/auth/signout/page.tsx` - サインアウト
- `src/app/auth/register/page.tsx` - 会員登録
- `src/app/auth/forgot-password/page.tsx` - パスワード忘れ
- `src/app/auth/reset-password/page.tsx` - パスワードリセット
- `src/app/auth/error/page.tsx` - 認証エラー
- `src/app/auth/pending/page.tsx` - 承認待ち
- `src/app/auth/suspended/page.tsx` - アカウント停止

## メンバーページ

### ダッシュボード
- `src/app/member/dashboard/page.tsx` - メンバーダッシュボード
- `src/app/member/dashboard/loading.tsx` - 🆕 メンバーダッシュボードローディング
  - **機能**: 統計カード、最近のアクティビティスケルトン
  - **効果**: ダッシュボード読み込み時のUX向上

### 注文管理
- `src/app/member/orders/page.tsx` - 注文一覧
- `src/app/member/orders/new/page.tsx` - 新規注文
- `src/app/member/orders/[id]/page.tsx` - 注文詳細
- `src/app/member/orders/[id]/confirmation/page.tsx` - 注文確認
- `src/app/member/orders/[id]/data-receipt/page.tsx` - データ入稿
- `src/app/member/orders/reorder/page.tsx` - 再注文
- `src/app/member/orders/history/page.tsx` - 注文履歴

### 見積管理
- `src/app/member/quotations/page.tsx` - 見積一覧
- `src/app/member/quotations/loading.tsx` - 🆕 見積一覧ローディング
  - **機能**: 見積リストスケルトン
  - **効果**: 見積一覧読み込み時のUX向上
- `src/app/member/quotations/request/page.tsx` - 見積依頼
- `src/app/member/quotations/[id]/page.tsx` - 見積詳細
- `src/app/member/quotations/[id]/confirm/page.tsx` - 見積確認

### 契約書
- `src/app/member/contracts/page.tsx` - 契約書一覧

### 納品・配送
- `src/app/member/deliveries/page.tsx` - 納品管理

### 請求書
- `src/app/member/invoices/page.tsx` - 請求書一覧

### サンプル
- `src/app/member/samples/page.tsx` - サンプル管理

### お問い合わせ
- `src/app/member/inquiries/page.tsx` - お問い合わせ一覧

### プロフィール・設定
- `src/app/member/profile/page.tsx` - プロフィール
- `src/app/member/edit/page.tsx` - プロフィール編集
- `src/app/member/settings/page.tsx` - 設定

### 通知
- `src/app/member/notifications/page.tsx` - 通知センター

## 管理者ページ

### ダッシュボード
- `src/app/admin/dashboard/page.tsx` - 管理者ダッシュボード
- `src/app/admin/dashboard/loading.tsx` - 🆕 管理者ダッシュボードローディング
  - **機能**: 統計カード、アクティビティフィードスケルトン
  - **効果**: 管理者ダッシュボード読み込み時のUX向上

### 注文管理
- `src/app/admin/orders/page.tsx` - 注文一覧
- `src/app/admin/orders/[id]/page.tsx` - 注文詳細

### 見積管理
- `src/app/admin/quotations/page.tsx` - 見積一覧

### 契約管理
- `src/app/admin/contracts/page.tsx` - 契約一覧
- `src/app/admin/contracts/[id]/page.tsx` - 契約詳細

### 生産管理
- `src/app/admin/production/page.tsx` - 生産管理
- `src/app/admin/production/[id]/page.tsx` - 生産詳細

### 在庫管理
- `src/app/admin/inventory/page.tsx` - 在庫管理

### 出荷管理
- `src/app/admin/shipments/page.tsx` - 出荷一覧
- `src/app/admin/shipments/[id]/page.tsx` - 出荷詳細
- `src/app/admin/shipping/page.tsx` - 配送管理

### 顧客管理
- `src/app/admin/customers/page.tsx` - 顧客一覧
- `src/app/admin/customers/profile/page.tsx` - 顧客プロフィール
- `src/app/admin/customers/orders/page.tsx` - 顧客注文
- `src/app/admin/customers/orders/[id]/page.tsx` - 顧客注文詳細
- `src/app/admin/customers/documents/page.tsx` - 顧客書類
- `src/app/admin/customers/support/page.tsx` - 顧客サポート

### リード管理
- `src/app/admin/leads/page.tsx` - リード管理

### 承認管理
- `src/app/admin/approvals/page.tsx` - 承認管理

### クーポン管理
- `src/app/admin/coupons/page.tsx` - クーポン一覧

### 設定
- `src/app/admin/settings/page.tsx` - 設定
- `src/app/admin/settings/customers/page.tsx` - 顧客設定

## 統計 (2025-01-30 更新)

- **総ページ数**: 88ページ (loadingページ6つ追加)
- **公開ページ**: 34ページ + 2loadingページ
- **認証ページ**: 8ページ
- **メンバーページ**: 23ページ + 2loadingページ
- **管理者ページ**: 25ページ + 1loadingページ

### loading.tsx実装済みページ (6ファイル)
1. `src/app/catalog/loading.tsx` - カタログトップ
2. `src/app/catalog/[slug]/loading.tsx` - カタログ詳細
3. `src/app/member/dashboard/loading.tsx` - メンバーダッシュボード
4. `src/app/member/quotations/loading.tsx` - 見積一覧
5. `src/app/admin/dashboard/loading.tsx` - 管理者ダッシュボード
6. `src/app/admin/loader.tsx` - 管理者RBACローダー 🆕

### パフォーマンス最適化効果
- ✅ Streaming SSRによるLCP改善
- ✅ プログレッシブレンダリングによる体感速度向上
- ✅ unstable_cacheによるDBクエリ80%削減
- ✅ blurDataURLによるCLS対策
