# コンポーネント構造分析

## 概要
- **総コンポーネント数**: 305コンポーネント
- **カテゴリ**: 管理者、認証、B2B、カタログ、フォーム、レイアウト、注文、製造

## 管理者コンポーネント

### ナビゲーション・UI
- `src/components/admin/AdminNavigation.tsx` - 管理者ナビゲーション
- `src/components/admin/CarrierSelector.tsx` - キャリア選択

### 契約・署名
- `src/components/admin/contract-workflow/ContractReminderModal.tsx` - 契約リマインダーモーダル
- `src/components/admin/contract-workflow/ContractTimeline.tsx` - 契約タイムライン
- `src/components/admin/contract-workflow/ContractWorkflowList.tsx` - 契約ワークフローリスト
- `src/components/admin/ContractDownloadButton.tsx` - 契約書ダウンロードボタン
- `src/components/admin/ContractSignatureRequestButton.tsx` - 署名要求ボタン
- `src/components/admin/SendForSignatureModal.tsx` - 署名送信モーダル
- `src/components/admin/SignatureStatusBadge.tsx` - 署名ステータスバッジ

### 生産管理
- `src/components/admin/ProductionProgressVisualizer.tsx` - 生産進捗可視化
- `src/components/admin/ProductionStatusUpdateButton.tsx` - 生産ステータス更新ボタン
- `src/components/admin/StageDetailPanel.tsx` - ステージ詳細パネル

### 在庫・出荷
- `src/components/admin/InventoryUpdateButton.tsx` - 在庫更新ボタン
- `src/components/admin/ShipmentCard.tsx` - 出荷カード
- `src/components/admin/ShipmentCreateModal.tsx` - 出荷作成モーダル
- `src/components/admin/TrackingTimeline.tsx` - 追跡タイムライン
- `src/components/admin/DeliveryTimeSelector.tsx` - 配送時間選択

### ファイル・エントリ
- `src/components/admin/FileValidationResult.tsx` - ファイル検証結果
- `src/components/admin/EntryRecordingButton.tsx` - エントリ記録ボタン

### ダッシュボードウィジェット
- `src/components/admin/dashboard-widgets/AlertsWidget.tsx` - アラートウィジェット
- `src/components/admin/dashboard-widgets/OrderStatisticsWidget.tsx` - 注文統計ウィジェット
- `src/components/admin/dashboard-widgets/QuickActionsWidget.tsx` - クイックアクションウィジェット
- `src/components/admin/dashboard-widgets/RecentActivityWidget.tsx` - 最近のアクティビティウィジェット
- `src/components/admin/dashboard-widgets/StatsCard.tsx` - 統計カード

### 通知
- `src/components/admin/Notifications/AdminNotificationCenter.tsx` - 管理者通知センター
- `src/components/admin/Notifications/NotificationIcon.tsx` - 通知アイコン
- `src/components/admin/Notifications/NotificationList.tsx` - 通知リスト

### パフォーマンス
- `src/components/admin/performance/PerformanceDashboard.tsx` - パフォーマンスダッシュボード

### 韓国向け機能
- `src/components/admin/korea/KoreaCorrectionsManager.tsx` - 韓国訂正マネージャー

### コスト・見積
- `src/components/admin/CostBreakdownPanel.tsx` - コスト内訳パネル
- `src/components/admin/CatalogDownloadAdmin.tsx` - カタログダウンロード管理

## 認証コンポーネント

- `src/components/auth/AuthModal.tsx` - 認証モーダル
- `src/components/auth/ForgotPasswordForm.tsx` - パスワード忘れフォーム
- `src/components/auth/LoginForm.tsx` - ログインフォーム
- `src/components/auth/ProtectedRoute.tsx` - 保護ルート
- `src/components/auth/RegistrationForm.tsx` - 登録フォーム
- `src/components/auth/ResetPasswordForm.tsx` - パスワードリセットフォーム
- `src/components/auth/UserMenu.tsx` - ユーザーメニュー

## B2Bコンポーネント

### 仕様書
- `src/components/b2b/specsheet/SpecSheetEditor.tsx` - 仕様書エディタ
- `src/components/b2b/specsheet/SpecSheetPreview.tsx` - 仕様書プレビュー
- `src/components/b2b/specsheet/SpecSheetViewer.tsx` - 仕様書ビューア

### 見積・注文
- `src/components/b2b/AdminQuotationEditor.tsx` - 管理者見積エディタ
- `src/components/b2b/QuotationWizard.tsx` - 見積ウィザード
- `src/components/b2b/OrderConfirmation.tsx` - 注文確認

## カタログコンポーネント

- `src/components/catalog/CatalogCard.tsx` - カタログカード
- `src/components/catalog/CatalogGrid.tsx` - カタロググリッド
- `src/components/catalog/CatalogHero.tsx` - カタログヒーロー
- `src/components/catalog/CategoryFilter.tsx` - カテゴリフィルター
- `src/components/catalog/ProductComparison.tsx` - 製品比較
- `src/components/catalog/ProductDetail.tsx` - 製品詳細
- `src/components/catalog/ProductGallery.tsx` - 製品ギャラリー
- `src/components/catalog/ProductSpecs.tsx` - 製品仕様

## フォームコンポーネント

### 共通フォーム
- `src/components/forms/FormField.tsx` - フォームフィールド
- `src/components/forms/FormLabel.tsx` - フォームラベル
- `src/components/forms/FormMessage.tsx` - フォームメッセージ
- `src/components/forms/FormSelect.tsx` - フォームセレクト
- `src/components/forms/FormTextarea.tsx` - フォームテキストエリア
- `src/components/forms/FormCheckbox.tsx` - フォームチェックボックス
- `src/components/forms/FormRadio.tsx` - フォームラジオ
- `src/components/forms/FormDatePicker.tsx` - フォーム日付ピッカー

### 専門フォーム
- `src/components/forms/ContactForm.tsx` - お問い合わせフォーム
- `src/components/forms/SampleRequestForm.tsx` - サンプル請求フォーム
- `src/components/forms/QuotationForm.tsx` - 見積フォーム
- `src/components/forms/RegistrationForm.tsx` - 登録フォーム
- `src/components/forms/AddressForm.tsx` - 住所フォーム

## レイアウトコンポーネント

- `src/components/layout/Header.tsx` - ヘッダー
- `src/components/layout/Navigation.tsx` - ナビゲーション
- `src/components/layout/Footer.tsx` - フッター
- `src/components/layout/Sidebar.tsx` - サイドバー
- `src/components/layout/MobileNavigation.tsx` - モバイルナビゲーション
- `src/components/layout/Breadcrumb.tsx` - パンくず

## 注文コンポーネント

- `src/components/orders/OrderCard.tsx` - 注文カード
- `src/components/orders/OrderDetails.tsx` - 注文詳細
- `src/components/orders/OrderStatus.tsx` - 注文ステータス
- `src/components/orders/OrderTimeline.tsx` - 注文タイムライン
- `src/components/orders/OrderItems.tsx` - 注文アイテム

## 製造コンポーネント

- `src/components/manufacturing/ProductionFlow.tsx` - 生産フロー
- `src/components/manufacturing/ProductionStatus.tsx` - 生産ステータス
- `src/components/manufacturing/QualityCheck.tsx` - 品質チェック

## アーカイブコンポーネント

- `src/components/archives/ArchivePage.tsx` - アーカイブページ
- `src/components/archives/ArchiveGrid.tsx` - アーカイブグリッド
- `src/components/archives/ArchiveDetailModal.tsx` - アーカイブ詳細モーダル
- `src/components/archives/ArchiveFilters.tsx` - アーカイブフィルター
- `src/components/archives/SearchBar.tsx` - 検索バー
- `src/components/archives/Pagination.tsx` - ページネーション

## その他のコンポーネント

### UIコンポーネント
- `src/components/ui/button.tsx` - ボタン
- `src/components/ui/input.tsx` - インプット
- `src/components/ui/select.tsx` - セレクト
- `src/components/ui/checkbox.tsx` - チェックボックス
- `src/components/ui/radio.tsx` - ラジオ
- `src/components/ui/textarea.tsx` - テキストエリア
- `src/components/ui/datepicker.tsx` - 日付ピッカー
- `src/components/ui/modal.tsx` - モーダル
- `src/components/ui/dropdown.tsx` - ドロップダウン
- `src/components/ui/tabs.tsx` - タブ
- `src/components/ui/accordion.tsx` - アコーディオン
- `src/components/ui/badge.tsx` - バッジ
- `src/components/ui/card.tsx` - カード
- `src/components/ui/table.tsx` - テーブル

### ダッシュボード
- `src/components/dashboard/StatsCard.tsx` - 統計カード
- `src/components/dashboard/Chart.tsx` - チャート
- `src/components/dashboard/Progress.tsx` - 進捗

### ホーム
- `src/components/home/Hero.tsx` - ヒーロー
- `src/components/home/Features.tsx` - 機能
- `src/components/home/Testimonials.tsx` - お客様の声

### お問い合わせ
- `src/components/inquiry/InquiryForm.tsx` - お問い合わせフォーム
- `src/components/inquiry/InquiryWizard.tsx` - お問い合わせウィザード

### カート
- `src/components/cart/CartItem.tsx` - カートアイテム
- `src/components/cart/CartSummary.tsx` - カートサマリー

### 比較
- `src/components/comparison/ComparisonTable.tsx` - 比較テーブル
- `src/components/comparison/ComparisonCard.tsx` - 比較カード

## 統計

- **管理者コンポーネント**: 30+
- **認証コンポーネント**: 7
- **B2Bコンポーネント**: 8+
- **カタログコンポーネント**: 8
- **フォームコンポーネント**: 10+
- **レイアウトコンポーネント**: 6
- **注文コンポーネント**: 5
- **製造コンポーネント**: 3
- **アーカイブコンポーネント**: 6
- **UIコンポーネント**: 15+
- **その他**: 200+
