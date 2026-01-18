# APIルート構造分析

## 概要
- **総APIルート数**: 191ルート
- **カテゴリ**: 認証、注文、見積、在庫、生産、管理、会員機能

## 認証API (7ルート)

### セッション管理
- `src/app/api/auth/session/route.ts` - セッション確認
- `src/app/api/auth/signin/route.ts` - サインイン
- `src/app/api/auth/signout/route.ts` - サインアウト
- `src/app/api/auth/register/route.ts` - 会員登録
- `src/app/api/auth/verify-email/route.ts` - メール認証
- `src/app/api/auth/forgot-password/route.ts` - パスワードリセット要求
- `src/app/api/auth/reset-password/route.ts` - パスワードリセット

## 注文API (21ルート)

### 一般注文
- `src/app/api/orders/route.ts` - 注文一覧・作成
- `src/app/api/orders/create/route.ts` - 注文作成
- `src/app/api/orders/update/route.ts` - 注文更新
- `src/app/api/orders/cancel/route.ts` - 注文キャンセル
- `src/app/api/orders/receive/route.ts` - 注文受領
- `src/app/api/orders/reorder/route.ts` - 再注文
- `src/app/api/orders/[id]/route.ts` - 注文詳細
- `src/app/api/orders/[id]/cancel/route.ts` - 注文キャンセル
- `src/app/api/orders/[id]/status/route.ts` - ステータス更新

### 会員注文
- `src/app/api/member/orders/route.ts` - 注文一覧・作成
- `src/app/api/member/orders/confirm/route.ts` - 注文確認
- `src/app/api/member/orders/[id]/route.ts` - 注文詳細
- `src/app/api/member/orders/[id]/tracking/route.ts` - 配送追跡
- `src/app/api/member/orders/[id]/comments/route.ts` - コメント管理
- `src/app/api/member/orders/[id]/approvals/route.ts` - 承認管理
- `src/app/api/member/orders/[id]/approvals/[requestId]/route.ts` - 承認詳細
- `src/app/api/member/orders/[id]/data-receipt/route.ts` - データ入稿
- `src/app/api/member/orders/[id]/data-receipt/[fileId]/route.ts` - データ入稿ファイル
- `src/app/api/member/orders/[id]/production-data/route.ts` - 生産データ
- `src/app/api/member/orders/[id]/production-logs/route.ts` - 生産ログ
- `src/app/api/admin/orders/statistics/route.ts` - 注文統計

## 見積API (15ルート)

### 一般見積
- `src/app/api/quotations/route.ts` - 見積一覧・作成
- `src/app/api/quotations/save/route.ts` - 見積保存
- `src/app/api/quotations/submit/route.ts` - 見積提出
- `src/app/api/quotations/list/route.ts` - 見積リスト
- `src/app/api/quotations/[id]/route.ts` - 見積詳細
- `src/app/api/quotations/[id]/convert/route.ts` - 注文変換
- `src/app/api/quotations/[id]/invoice/route.ts` - 請求書作成
- `src/app/api/quotitions/[id]/confirm-transfer/route.ts` - 振込確認

### 会員見積
- `src/app/api/member/quotations/route.ts` - 見積一覧・作成
- `src/app/api/member/quotations/[id]/route.ts` - 見積詳細
- `src/app/api/member/quotations/[id]/approve/route.ts` - 見積承認
- `src/app/api/member/quotations/[id]/confirm/route.ts` - 見積確認
- `src/app/api/member/quotations/[id]/confirm-payment/route.ts` - 支払い確認
- `src/app/api/member/quotations/[id]/convert/route.ts` - 注文変換
- `src/app/api/member/quotations/[id]/export/route.ts` - エクスポート
- `src/app/api/member/quotations/[id]/invoice/route.ts` - 請求書

### 管理者見積
- `src/app/api/admin/quotations/route.ts` - 見積一覧・作成
- `src/app/api/admin/quotations/[id]/cost-breakdown/route.ts` - コスト内訳

### PDF生成
- `src/app/api/quotation/route.ts` - 見積PDF
- `src/app/api/quotation/pdf/route.ts` - 見積PDF生成
- `src/app/api/quotes/pdf/route.ts` - 見積PDF
- `src/app/api/quotes/excel/route.ts` - 見積Excel

## 管理者API (51ルート)

### ユーザー管理
- `src/app/api/admin/users/route.ts` - ユーザー一覧・作成
- `src/app/api/admin/users/approve/route.ts` - ユーザー承認
- `src/app/api/admin/users/[id]/approve/route.ts` - ユーザー承認
- `src/app/api/admin/users/pending/route.ts` - 承認待ちユーザー
- `src/app/api/admin/users/reject/route.ts` - ユーザー拒否
- `src/app/api/admin/approve-member/route.ts` - メンバー承認

### 生産管理
- `src/app/api/admin/production/route.ts` - 生産管理
- `src/app/api/admin/production/jobs/route.ts` - 生産ジョブ
- `src/app/api/admin/production/jobs/[id]/route.ts` - 生産ジョブ詳細
- `src/app/api/admin/production/update-status/route.ts` - ステータス更新
- `src/app/api/admin/production/[orderId]/route.ts` - 注文生産
- `src/app/api/admin/production-jobs/[id]/route.ts` - 生産ジョブ
- `src/app/api/admin/generate-work-order/route.ts` - 作業標準書生成

### 在庫管理
- `src/app/api/admin/inventory/items/route.ts` - 在庫アイテム
- `src/app/api/admin/inventory/update/route.ts` - 在庫更新
- `src/app/api/admin/inventory/adjust/route.ts` - 在庫調整
- `src/app/api/admin/inventory/receipts/route.ts` - 入庫記録
- `src/app/api/admin/inventory/record-entry/route.ts` - 記録入力
- `src/app/api/admin/inventory/history/[productId]/route.ts` - 在庫履歴

### 出荷・配送管理
- `src/app/api/admin/shipping/shipments/route.ts` - 出荷一覧
- `src/app/api/admin/shipping/tracking/route.ts` - 配送追跡
- `src/app/api/admin/shipping/tracking/[id]/route.ts` - 配送追跡詳細
- `src/app/api/admin/shipping/deliveries/complete/route.ts` - 配送完了
- `src/app/api/admin/shipments/route.ts` - 出荷管理
- `src/app/api/admin/shipments/[id]/tracking/route.ts` - 追跡情報
- `src/app/api/admin/delivery/tracking/[orderId]/route.ts` - 配送追跡

### 契約管理
- `src/app/api/admin/contracts/workflow/route.ts` - 契約ワークフロー
- `src/app/api/admin/contracts/request-signature/route.ts` - 署名要求
- `src/app/api/admin/contracts/send-reminder/route.ts` - リマインダー送信
- `src/app/api/admin/contracts/[contractId]/download/route.ts` - 契約書ダウンロード
- `src/app/api/admin/contracts/[contractId]/send-signature/route.ts` - 署名送信

### 通知管理
- `src/app/api/admin/notifications/route.ts` - 通知一覧・作成
- `src/app/api/admin/notifications/unread-count/route.ts` - 未読カウント
- `src/app/api/admin/notifications/[id]/read/route.ts` - 既読化

### ダッシュボード
- `src/app/api/admin/dashboard/statistics/route.ts` - 統計データ

### 設定管理
- `src/app/api/admin/settings/route.ts` - 設定管理
- `src/app/api/admin/settings/[key]/route.ts` - 設定詳細
- `src/app/api/admin/settings/customer-markup/route.ts` - 顧客マークアップ
- `src/app/api/admin/settings/customer-markup/[id]/route.ts` - 顧客マークアップ詳細

### クーポン管理
- `src/app/api/admin/coupons/route.ts` - クーポン一覧・作成
- `src/app/api/admin/coupons/[id]/route.ts` - クーポン詳細

### パフォーマンス
- `src/app/api/admin/performance/metrics/route.ts` - パフォーマンス指標

### 注文変換
- `src/app/api/admin/convert-to-order/route.ts` - 注文変換

## 会員機能API (44ルート)

### プロフィール・設定
- `src/app/api/member/settings/route.ts` - 設定管理
- `src/app/api/member/profile/route.ts` - プロフィール取得
- `src/app/api/member/dashboard/route.ts` - ダッシュボード
- `src/app/api/member/dashboard/stats/route.ts` - 統計データ

### 認証関連
- `src/app/api/member/auth/verify-email/route.ts` - メール認証
- `src/app/api/member/auth/resend-verification/route.ts` - 認証再送

### アドレス管理
- `src/app/api/member/addresses/delivery/route.ts` - 配送先住所
- `src/app/api/member/addresses/delivery/[id]/route.ts` - 配送先詳細
- `src/app/api/member/addresses/billing/route.ts` - 請求先住所
- `src/app/api/member/addresses/billing/[id]/route.ts` - 請求先詳細

### ドキュメント管理
- `src/app/api/member/documents/route.ts` - ドキュメント一覧・作成
- `src/app/api/member/documents/history/route.ts` - ドキュメント履歴
- `src/app/api/member/documents/[id]/download/route.ts` - ドキュメントダウンロード

### ファイル管理
- `src/app/api/member/files/upload/route.ts` - ファイルアップロード
- `src/app/api/member/files/[id]/extract/route.ts` - ファイル抽出

### AI抽出
- `src/app/api/member/ai-extraction/upload/route.ts` - AI抽出アップロード
- `src/app/api/member/ai-extraction/status/route.ts` - AI抽出ステータス
- `src/app/api/member/ai-extraction/approve/route.ts` - AI抽出承認

### 通知管理
- `src/app/api/member/notifications/route.ts` - 通知一覧・作成
- `src/app/api/member/notifications/mark-all-read/route.ts` - 全て既読化
- `src/app/api/member/notifications/delete-all/route.ts` - 全て削除
- `src/app/api/member/notifications/[id]/route.ts` - 通知詳細
- `src/app/api/member/notifications/[id]/read/route.ts` - 既読化

### その他
- `src/app/api/member/invoices/route.ts` - 請求書一覧
- `src/app/api/member/invoices/[invoiceId]/download/route.ts` - 請求書ダウンロード
- `src/app/api/member/samples/route.ts` - サンプル管理
- `src/app/api/member/shipments/route.ts` - 出荷管理
- `src/app/api/member/work-orders/route.ts` - 作業標準書
- `src/app/api/member/spec-sheets/generate/route.ts` - 仕様書生成
- `src/app/api/member/spec-sheets/[id]/approve/route.ts` - 仕様書承認
- `src/app/api/member/spec-sheets/[id]/reject/route.ts` - 仕様書拒否
- `src/app/api/member/stock-in/route.ts` - 入庫管理
- `src/app/api/member/delete-account/route.ts` - アカウント削除
- `src/app/api/member/invites/send/route.ts` - 招待送信
- `src/app/api/member/invites/accept/route.ts` - 招待承認
- `src/app/api/member/certificates/generate/route.ts` - 証明書生成
- `src/app/api/member/inquiries/route.ts` - お問い合わせ

### 韓国向け機能
- `src/app/api/member/korea/send-data/route.ts` - データ送信
- `src/app/api/member/korea/corrections/route.ts` - 訂正管理
- `src/app/api/member/korea/corrections/[id]/upload/route.ts` - 訂正アップロード

## 契約・署名API (9ルート)

- `src/app/api/contracts/route.ts` - 契約一覧・作成
- `src/app/api/contract/pdf/route.ts` - 契約PDF
- `src/app/api/contract/timestamp/route.ts` - タイムスタンプ
- `src/app/api/contract/timestamp/validate/route.ts` - タイムスタンプ検証
- `src/app/api/contract/workflow/action/route.ts` - ワークフローアクション
- `src/app/api/signature/send/route.ts` - 署名送信
- `src/app/api/signature/cancel/route.ts` - 署名キャンセル
- `src/app/api/signature/status/[id]/route.ts` - 署名ステータス
- `src/app/api/signature/webhook/route.ts` - 署名Webhook
- `src/app/api/signature/local/save/route.ts` - ローカル署名保存

## 仕様書API (3ルート)

- `src/app/api/specsheet/pdf/route.ts` - 仕様書PDF
- `src/app/api/specsheet/approval/route.ts` - 仕様書承認
- `src/app/api/specsheet/versions/route.ts` - 仕様書バージョン

## 製品・カタログAPI (4ルート)

- `src/app/api/products/route.ts` - 製品一覧・作成
- `src/app/api/products/filter/route.ts` - 製品フィルター
- `src/app/api/products/search/route.ts` - 製品検索
- `src/app/api/products/categories/route.ts` - カテゴリ一覧

## サンプル・お問い合わせAPI (3ルート)

- `src/app/api/samples/route.ts` - サンプル一覧・作成
- `src/app/api/samples/request/route.ts` - サンプル請求
- `src/app/api/contact/route.ts` - お問い合わせ送信

## 支払い・クーポンAPI (2ルート)

- `src/app/api/payments/confirm/route.ts` - 支払い確認
- `src/app/api/coupons/validate/route.ts` - クーポン検証

## 出荷API (10ルート)

- `src/app/api/shipments/route.ts` - 出荷一覧・作成
- `src/app/api/shipments/create/route.ts` - 出荷作成
- `src/app/api/shipments/bulk-create/route.ts` - 一括出荷作成
- `src/app/api/shipments/[id]/route.ts` - 出荷詳細
- `src/app/api/shipments/[id]/track/route.ts` - 追跡情報
- `src/app/api/shipments/[id]/schedule-pickup/route.ts` - 集荷予定
- `src/app/api/shipments/[id]/label/route.ts` - ラベル生成
- `src/app/api/shipments/[id]/[trackingId]/update-tracking/route.ts` - 追跡更新
- `src/app/api/shipments/tracking/route.ts` - 追跡一覧

## その他のAPI (22ルート)

### AI関連
- `src/app/api/ai/parse/route.ts` - AI解析
- `src/app/api/ai/review/route.ts` - AIレビュー
- `src/app/api/ai/specs/route.ts` - AI仕様書
- `src/app/api/ai-parser/upload/route.ts` - AIパーサーアップロード
- `src/app/api/ai-parser/extract/route.ts` - AIパーサー抽出
- `src/app/api/ai-parser/validate/route.ts` - AIパーサー検証
- `src/app/api/ai-parser/approve/route.ts` - AIパーサー承認
- `src/app/api/ai-parser/reprocess/route.ts` - AIパーサー再処理

### B2B機能
- `src/app/api/b2b/files/upload/route.ts` - B2Bファイルアップロード
- `src/app/api/b2b/ai-extraction/upload/route.ts` - B2B AI抽出

### ユーティリティ
- `src/app/api/analytics/vitals/route.ts` - Web Vitals記録
- `src/app/api/errors/log/route.ts` - エラーログ
- `src/app/api/files/validate/route.ts` - ファイル検証
- `src/app/api/notes/route.ts` - メモ管理
- `src/app/api/notes/[id]/route.ts` - メモ詳細
- `src/app/api/profile/route.ts` - プロフィール
- `src/app/api/profile/[id]/route.ts` - プロフィール詳細
- `src/app/api/registry/corporate-number/route.ts` - 法人番号登録
- `src/app/api/registry/postal-code/route.ts` - 郵便番号登録
- `src/app/api/settings/route.ts` - 設定
- `src/app/api/templates/route.ts` - テンプレート
- `src/app/api/comparison/save/route.ts` - 比較保存

### ダウンロード
- `src/app/api/download/templates/excel/route.ts` - Excelテンプレート
- `src/app/api/download/templates/pdf/route.ts` - PDFテンプレート
- `src/app/api/download/templates/[category]/route.ts` - カテゴリテンプレート

### デバッグ・開発
- `src/app/api/debug/auth/route.ts` - 認証デバッグ
- `src/app/api/dev/set-admin/route.ts` - 管理者設定
- `src/app/api/dev/apply-migration/route.ts` - マイグレーション適用

### Supabase MCP
- `src/app/api/supabase-mcp/execute/route.ts` - SQL実行

## 統計

- **認証API**: 7ルート
- **注文API**: 21ルート
- **見積API**: 15ルート
- **管理者API**: 51ルート
- **会員機能API**: 44ルート
- **契約・署名API**: 9ルート
- **仕様書API**: 3ルート
- **製品・カタログAPI**: 4ルート
- **サンプル・お問い合わせAPI**: 3ルート
- **支払い・クーポンAPI**: 2ルート
- **出荷API**: 10ルート
- **その他API**: 22ルート
