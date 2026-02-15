# コンポーネント構造分析

## 概要
- **総コンポーネント数**: 274コンポーネント (2025-01-30 更新: loadingコンポーネント6つ追加、Framer Motion最適化61ファイル、305→274削減統合)
- **カテゴリ**: 管理者、認証、B2B、カタログ、フォーム、レイアウト、注文、製造、UI共通
- **最適化状態**:
  - ✅ blurDataURL実装 (CLS対策完了)
  - ✅ loading.tsx実装 (6ファイル)
  - ✅ *Client.tsx実装 (11ファイル - Server/Client分離) 🆕
  - ✅ lucide-react直接imports (111ファイル)
  - ✅ Framer Motion静的imports復旧 (61ファイル)
  - ✅ PDF generator動的imports (バンドルサイズ最適化)
  - ✅ @ts-ignore削除 (タイプ安全性向上)
  - ✅ logger実装 (構造化ログ)

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

### 見積シミュレーター (2025-01-30 更新)
- `src/components/quote/ImprovedQuotingWizard.tsx` - 統合見積ウィザード
  - **価格計算ロジック修正**: すべての製品タイプで`useFilmCostCalculation: true`適用
  - 文書の計算式準拠: `((材料原価 + 印刷費 + 後加工費) × 1.4 × 1.05 + 配送料) × 1.2`
  - 配送料の二重マージン問題を解決
  - 修正箇所: Line 1244, 2439, 2744 (3箇所)
  - **🆕 PDFダウンロード機能改善 (2025-01-30)**:
    - Blob URL方式を導入（`doc.save()`依存を廃止）
    - ユーザーが直接クリック可能なダウンロードボタンを画面中央に表示
    - 自動クリックも試行（ユーザージェスチャ検出）
    - ログイン・ゲストユーザー両対応
- `src/components/quote/sections/SpecsStep.tsx` - 基本仕様ステップ
- `src/components/quote/sections/PostProcessingStep.tsx` - 後加工ステップ
- `src/components/quote/sections/SKUQuantityStep.tsx` - SKU・数量ステップ
- `src/components/quote/sections/ResultStep.tsx` - 結果ステップ
  - **🆕 PDFダウンロード機能改善 (2025-01-30)**:
    - ImprovedQuotingWizardと同様のBlob URL方式を適用
    - ゲストユーザーもPDFダウンロード可能に
- `src/components/quote/MultiQuantityStep.tsx` - 複数数量ステップ

### PDF生成ライブラリ (2025-01-30 更新)
- `src/lib/pdf-generator.ts` - PDF生成ライブラリ
  - **🆕 責務分離改善 (2025-01-30)**:
    - PDF生成のみを担当（ダウンロード処理を削除）
    - `doc.save()`直接呼び出しを削除
    - `pdfBuffer`（Uint8Array）と`blob`（Blob）を返却
    - 呼び出し元でダウンロード方法を選択可能に
    - メンテナンス性向上（生成とダウンロードの分離）
- `src/components/quote/MultiQuantityComparisonTable.tsx` - 複数数量比較表
- `src/components/quote/EnvelopePreview.tsx` - 封筒プレビュー
- `src/components/quote/ParallelProductionOptions.tsx` - 並行生産オプション
- `src/components/quote/EconomicQuantityProposal.tsx` - 経済的数量提案

## カタログコンポーネント

### 製品カード (2025-01-19 更新)
- `src/components/catalog/ProductCard.tsx` - 製品カード
  - **最適化**: blurDataURL実装 (CLS対策)
  - **機能**: Next.js Imageコンポーネント、プレースホルダーblur
- `src/components/catalog/ProductCardSkeleton.tsx` - 🆕 製品カードスケルトン
  - **用途**: loading.tsxで使用するローディング表示
  - **機能**: Streaming SSR対応のプログレッシブレンダリング
- `src/components/catalog/EnhancedProductCard.tsx` - 拡張製品カード
  - **最適化**: <img> → Next.js Image変換、blurDataURL実装
  - **機能**: ホバーアニメーション、お気に入り、クイックビュー
- `src/components/catalog/ProductDetailModal.tsx` - 製品詳細モーダル
  - **最適化**: blurDataURL実装（メイン画像+サムネイル）
  - **機能**: ギャラリー、拡大表示

### カタロググリッド・リスト
- `src/components/catalog/CatalogCard.tsx` - カタログカード
- `src/components/catalog/CatalogGrid.tsx` - カタロググリッド
- `src/components/catalog/CatalogHero.tsx` - カタログヒーロー
- `src/components/catalog/CategoryFilter.tsx` - カテゴリフィルター
- `src/components/catalog/ProductComparison.tsx` - 製品比較
- `src/components/catalog/ProductDetail.tsx` - 製品詳細
- `src/components/catalog/ProductGallery.tsx` - 製品ギャラリー
- `src/components/catalog/ProductSpecs.tsx` - 製品仕様
- `src/components/catalog/ProductListItem.tsx` - 製品リストアイテム
- `src/components/catalog/DownloadButton.tsx` - ダウンロードボタン

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

## 注文コンポーネント (2025-01-19 更新)

- `src/components/orders/OrderCard.tsx` - 注文カード
- `src/components/orders/OrderDetails.tsx` - 注文詳細
- `src/components/orders/OrderStatus.tsx` - 注文ステータス
- `src/components/orders/OrderTimeline.tsx` - 注文タイムライン
- `src/components/orders/OrderItems.tsx` - 注文アイテム
- `src/components/orders/CustomerApprovalSection.tsx` - 顧客承認セクション
- `src/components/orders/OrderCommentsSection.tsx` - 注文コメントセクション
- `src/components/orders/OrderHistoryPDFButton.tsx` - 🆕 注文履歴PDFボタン
  - **最適化**: PDFライブラリ動的import（jsPDF、html2canvas、DOMPurify）
  - **効果**: バンドルサイズ+80KB節約
  - **機能**: 日本語フォント対応、A4形式、複数注文対応

## 製造コンポーネント

- `src/components/manufacturing/ProductionFlow.tsx` - 生産フロー
- `src/components/manufacturing/ProductionStatus.tsx` - 生産ステータス
- `src/components/manufacturing/QualityCheck.tsx` - 品質チェック

## アーカイブコンポーネント (2025-01-19 更新)

- `src/components/archives/ArchivePage.tsx` - アーカイブページ
- `src/components/archives/ArchiveGrid.tsx` - アーカイブグリッド
  - **最適化**: blurDataURL実装
- `src/components/archives/ArchiveDetailModal.tsx` - アーカイブ詳細モーダル
  - **最適化**: blurDataURL実装（メイン画像+サムネイル）
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

### ホーム (2025-01-19 更新)
- `src/components/home/HeroSection.tsx` - ヒーローセクション
  - **最適化**: blurDataURL実装
  - **機能**: パララックス背景、CTAボタン
- `src/components/home/PremiumProductShowcase.tsx` - プレミアム製品ショーケース
  - **最適化**: blurDataURL実装
- `src/components/home/ProductLineupSection.tsx` - 製品ラインアップ
  - **最適化**: blurDataURL実装
- `src/components/home/HomePageProductCard.tsx` - ホームページ製品カード
  - **最適化**: blurDataURL実装
- `src/components/home/QuoteSimulator.tsx` - 見積シミュレーター
- `src/components/home/EnhancedQuoteSimulator.tsx` - 拡張見積シミュレーター
- `src/components/home/CTASection.tsx` - CTAセクション
- `src/components/home/ManufacturingProcessShowcase.tsx` - 製造プロセスショーケース

### お問い合わせ
- `src/components/inquiry/InquiryForm.tsx` - お問い合わせフォーム
- `src/components/inquiry/InquiryWizard.tsx` - お問い合わせウィザード

### カート
- `src/components/cart/CartItem.tsx` - カートアイテム
- `src/components/cart/CartSummary.tsx` - カートサマリー

### 比較
- `src/components/comparison/ComparisonTable.tsx` - 比較テーブル
- `src/components/comparison/ComparisonCard.tsx` - 比較カード

## 価格計算ライブラリ (2025-01-18 更新)

### 統合価格エンジン
- `src/lib/unified-pricing-engine.ts` - 統合価格計算エンジン
  - **価格計算ロジック修正**: 配送料をマージン計算から除外
  - 文書の計算式準拠: `((材料原価 + 印刷費 + 後加工費) × 1.4 × 1.05 + 配送料) × 1.2`
  - 修正箇所: Line 912 (costWithDutyJPY使用、再度quantity乗算なし)
  - `performFilmCostCalculation`メソッド更新:
    - 配送料をマージン計算の後ろに移動
    - 製造者マージン40% → 関税5% → 配送料追加 → 販売者マージン20%

### フィルム原価計算
- `src/lib/film-cost-calculator.ts` - フィルム原価計算エンジン
  - **価格計算ロジック修正**: 配送料を単価から除外
  - 修正箇所: Line 371
  - 修正前: `costPerMeterJPY = costWithDutyAndDeliveryJPY / length`
  - 修正後: `costPerMeterJPY = costWithDutyJPY / length`
  - 配送料は別フィールド`deliveryCostJPY`で管理

### パウチ原価計算
- `src/lib/pouch-cost-calculator.ts` - パウチ原価計算エンジン
  - SKU別原価計算機能
  - 最小確保量ルール適用 (1SKU: 500m+, 2+SKU: 300m+)
  - ロス400m固定

### テスト
- `src/lib/unified-pricing-engine.test.ts` - 統合価格エンジンテスト
  - 新規テスト追加: Roll Film 476mm × 500m 検証
  - 期待価格: ¥197,723 (許容範囲±10%)
  - テスト結果: ¥210,352 ✅

## ユーティリティライブラリ (2025-01-19 更新)

### ロガー - 🆕
- `src/lib/logger.ts` - 構造化ロガー
  - **機能**: 環境別ログレベル、構造化ログ出力
  - **レベル**: debug、info、warn、error
  - **出力先**: コンソール（開発環境）、エラーログサービス（本番環境）

### 画像最適化 - 🆕
- `src/lib/image-optimization.ts` - 画像最適化ユーティリティ
  - **機能**: blurDataURL生成、画像圧縮
- `src/lib/blur-data.json` - blurデータキャッシュ
  - **用途**: 事前生成されたblurDataURLの管理

### キャッシュ管理 - 🆕
- `src/lib/fetchCache.ts` - fetchキャッシュ戦略
  - **機能**: unstable_cacheラッパー、タグ管理

## 統計 (2025-01-30 更新)

- **総コンポーネント数**: 274コンポーネント
- **管理者コンポーネント**: 30+
- **認証コンポーネント**: 7
- **B2Bコンポーネント**: 8+
- **カタログコンポーネント**: 12 (blurDataURL実装済み: 4)
- **フォームコンポーネント**: 10+
- **レイアウトコンポーネント**: 6
- **注文コンポーネント**: 7 (PDF最適化済み: 1)
- **製造コンポーネント**: 3
- **アーカイブコンポーネント**: 6 (blurDataURL実装済み: 2)
- **UIコンポーネント**: 15+
- **ホームコンポーネント**: 9 (blurDataURL実装済み: 4)
- **その他**: 200+
- **loadingコンポーネント**: 6 🆕 (+1)
- **ユーティリティライブラリ**: 4
- ***Client.tsxコンポーネント**: 11 🆕 (Server/Client分離による新規追加)

### 最適化実装状況
- ✅ blurDataURL実装: 10コンポーネント
- ✅ loading.tsx実装: 6ページ
- ✅ *Client.tsx実装: 11ページ
- ✅ lucide-react直接imports: 111ファイル
- ✅ Framer Motion静的imports復旧: 61ファイル
- ✅ PDF generator動的imports: 1ファイル
- ✅ @ts-ignore削除: 39インスタンス（9ファイル）
- ✅ logger実装: 1ファイル
- ✅ unstable_cache実装: 3関数（products.ts）
