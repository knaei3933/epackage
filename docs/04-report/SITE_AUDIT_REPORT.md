# Epackage Lab サイト全面点検リポート

**点検日:** 2026-07-06
**範囲:** Admin 27ページ + Member 25ページ + 関連 API 297ルート
**方式:** 静的コードレビュー + DB実データ照合 + 10ステップワークフロー検証

---

## 優先度凡例
- **P0 (Critical):** 顧客直接影響・データ不整合・フロー完全遮断
- **P1 (High):** 管理者業務阻害・統計0・主要機能未実装
- **P2 (Medium):** UI/UX不良・alert()濫用・レガシー表記混在
- **P3 (Low):** 整理改善候補・軽微な表記揺れ

---

## P0 — Critical (即時修正推奨)

### P0-1: 見積詳細ページの注文変換ゲート残留
- **ファイル:** `src/app/member/quotations/[id]/QuotationDetailClient.tsx:758, 1375`
- **問題:** 注文変換ボタン表示条件が `status === 'approved' || 'QUOTATION_APPROVED'` で固定。DB実データでは50件中23件が `DRAFT` → 変換ボタン非表示
- **影響:** convert API（`894a5c7a`）で承認ゲートは除去済みだが、UIが追従していない。リストページは直ったが詳細ページは未対応
- **修正案:** `QuotationDetailClient.tsx` の `canConvert` 判定を convert API と同じ `!isTerminal` ロジックに統一

### P0-2: 見積詳細ページのPDF再生成バグ
- **ファイル:** `src/app/member/quotations/[id]/QuotationDetailClient.tsx:489`
- **問題:** `pdf_url` が null の場合、`generateQuotePDF()` で別PDFを再生成する。シミュレーター発行PDFと不一致
- **影響:** リストページ（`QuotationsClient.tsx:200`）は再生成フォールバック削除済みだが、詳細ページは未対応 → ユーザー報告の「PDF違う」が再発
- **修正案:** 詳細ページも保存済みPDFのみ表示、null時は「シミュレーターで再発行」アラート

### P0-3: WORK_ORDER ステータス未定義
- **ファイル:** `src/types/order-status.ts:44-58`
- **問題:** DB に `WORK_ORDER` 値が実在（1件）するが、`OrderStatus` 型と `ORDER_STATUS_LABELS` に定義なし
- **影響:** `getStatusLabel('WORK_ORDER')` が `undefined` アクセスでクラッシュ、その注文の表示が壊れる
- **修正案:** `OrderStatus` 型とラベルマップに `WORK_ORDER` を追加

---

## P1 — High (早急対応推奨)

### P1-1: 管理者ダッシュボード見積統計が常に0
- **ファイル:** `src/app/admin/dashboard/data.ts:64`
- **問題:** `q.status === 'draft'`（小文字）でフィルタ。DBは大文字 `DRAFT`/`CONVERTED` → マッチ0件
- **影響:** 管理者が見積状況をダッシュボードで把握不可
- **修正案:** `normalizeStatus()` 経由で統一、または大小文字両対応

### P1-2: リード管理ページが空データ表示
- **ファイル:** `src/app/admin/leads/AdminLeadsClient.tsx:47-59`
- **問題:** `// TODO: /api/admin/leads` とコメントアウト、`setLeads([])` で空配列固定。API（`src/app/api/admin/leads/route.ts`）は実装済みだが未接続
- **影響:** リード管理ページに永遠に何も表示されない
- **修正案:** TODOコメントを外し、実際のAPI fetchを実装

### P1-3: 仕様変更機能が未実装
- **ファイル:** `src/app/member/orders/[id]/preparation/OrderSpecificationItemList.tsx:67`
- **問題:** `// TODO: 実際の仕様変更処理を実装` — 確定ボタンを押しても `console.log` のみ
- **影響:** 注文準備ページの仕様変更が反映されない
- **修正案:** `/api/admin/orders/[id]/specification-change` API への送信を実装

---

## P2 — Medium (改善推奨)

### P2-1: status enum の legacy/workflow 混在
- **問題:** `normalizeStatus()` が両方対応するが、個別コンポーネントで生フィルタ多数
  - `AdminQuotationsClient.tsx:169-171`: `DRAFT || QUOTATION_PENDING` 二重判定
  - `AdminContractsClient.tsx:78`: `=== 'DRAFT'` のみ
  - `QuotationDetailClient.tsx:758`: `approved || QUOTATION_APPROVED` 二重判定
- **修正案:** 全ページ `normalizeStatus()` 経由に統一

### P2-2: alert() 濫用 (管理者側)
- **ファイル:** 主に `AdminContractDetailClient.tsx` (6箇所), `AdminNotificationsClient.tsx` (6箇所), `AdminOrdersClient.tsx`
- **問題:** 操作結果を `alert()` で通知。モバイルで不便、UX低下
- **修正案:** Toast通知コンポーネントへ統一

### P2-3: 管理者署名がモック実装
- **ファイル:** `src/app/admin/contracts/[id]/AdminContractDetailClient.tsx:154-161`
- **問題:** `// For now, just update the status and timestamp` — 実際の署名データ取得なし
- **影響:** 電子署名が形式的、法的証拠力に問題の可能性

---

## P3 — Low (整理候補)

### P3-1: invoices テーブル 0件 / samples テーブル未存在
- **DB状態:** `invoices` 0件, `invoice_items` 0件, `samples` null (テーブル不在), `leads` null
- **影響:** 請求書ページ・サンプルページは空表示、機能は存在するがデータなし（業務運用上は未使用の可能性）

### P3-2: 未使用変数/インポートの散在
- tsc は clean (0エラー) だが、一部コンポーネントに未使用ローカル変数残存

---

## 10ステップワークフロー検証結果

| ステップ | 状態 | 備考 |
|---------|------|------|
| 1. 見積作成 | ✅ 動作 | シミュレーター正常 |
| 2. 見積保存 | ✅ 動作 | save-pdf 修正済み (894a5c7a) |
| 3. 見積→注文明細 | ⚠️ ブロック | P0-1: 詳細ページのゲート残留 |
| 4. 注文変換 (リスト) | ✅ 動作 | SpecApprovalModal 改善済み (0e745367) |
| 5. データ入稿 | ✅ 動作 | |
| 6. 校正作業 | ✅ 動作 | |
| 7. 顧客承認 | ✅ 動作 | |
| 8. 製造 | ⚠️ WORK_ORDER 1件がラベル未定義 | P0-3 |
| 9. 出荷準備 | ✅ 動作 | |
| 10. 出荷 | ✅ 動作 | |

**遮断点:** ステップ3（詳細ページの注文明細）と ステップ8（WORK_ORDER ラベル未定義）

---

## 修正優先ロードマップ

| 優先 | 項目 | ファイル | 推定工数 |
|------|------|---------|---------|
| 即時 | P0-1 詳細ページ変換ゲート | QuotationDetailClient.tsx | 15分 |
| 即時 | P0-2 詳細ページPDF再生成 | QuotationDetailClient.tsx | 10分 |
| 即時 | P0-3 WORK_ORDER 型追加 | order-status.ts | 10分 |
| 早急 | P1-1 ダッシュボード統計 | data.ts | 15分 |
| 早急 | P1-2 リードAPI接続 | AdminLeadsClient.tsx | 30分 |
| 早急 | P1-3 仕様変更実装 | OrderSpecificationItemList.tsx | 45分 |
| 改善 | P2-1 status正規化統一 | 複数 | 1時間 |
| 改善 | P2-2 alert→Toast | 複数 | 2時間 |
| 改善 | P2-3 管理者署名実装 | AdminContractDetailClient.tsx | 要仕様確認 |

---

## 今セッションで既に修正済み (コミット履歴)
1. `894a5c7a` — save-pdf API認証・多パターンPDF保存・リストPDF再生成除去・変換ゲート除去・getPrintingLabelJa・PostProcessingPreview拡大
2. `0e745367` — SpecApprovalModal カードUI・統一製品表示名
3. `5027efef` — printingType auto解決
4. `60cf018d` — カード折り畳み・製品表示名フォーマット統一
5. `5548e9ca` — 単価小数点1桁制限・見積番号整合性
6. `4bcd09b0` — **P0/P1 ブロッカー一括修正:**
   - P0-1 見積詳細変換ゲート (`!isTerminal` 統一, DRAFT/未承認も発注可能)
   - P0-2 見積詳細PDF再生成フォールバック削除 (保存済みPDFのみ, シミュレーター整合)
   - P0-3 WORK_ORDER 型定義追加 (ラベル/進捗/遷移/ステージ, クラッシュ解消)
   - P1-1 ダッシュボード統計 大文字小文字区別なし集計
   - P1-2 AdminLeadsClient 実API接続 (モック空配列除去)
   - P1-3 仕様変更確定 → specification-change API 呼出実装

---

## P0/P1 修正状況 (2026-07-07 更新)

| ID | 状態 | ファイル | 検証 |
|----|------|---------|------|
| P0-1 | ✅ 完了 | QuotationDetailClient.tsx | tsc clean, canConvert=!isTerminal && !isConverted |
| P0-2 | ✅ 完了 | QuotationDetailClient.tsx | tsc clean, generateQuotePDF import 削除済み |
| P0-3 | ✅ 完了 | order-status.ts | tsc clean, WORK_ORDER を型/ラベル/進捗/遷移/ステージに追加 |
| P1-1 | ✅ 完了 | dashboard/data.ts | tsc clean, norm()/upper() で大小文字両対応 |
| P1-2 | ✅ 完了 | AdminLeadsClient.tsx | tsc clean, /api/admin/leads fetch + snake→camel mapping |
| P1-3 | ✅ 完了 | OrderSpecificationItemList.tsx | tsc clean, POST /api/member/orders/[id]/specification-change |

### 型チェック結果
- `npx tsc --noEmit`: **0 エラー** (`.next/dev`, `node_modules/next` 由来の Next.js 生成ファイルノイズを除外)

### 残件 (P2/P3 — ブロッカーなし, 改善候補)
- P2-1: 各コンポーネントの生ステータスフィルタ → normalizeStatus() 統一
- P2-2: alert() → Toast 通知コンポーネントへ統一
- P2-3: 管理者署名の実データ取得 (要仕様確認)
- P3-1: invoices/samples テーブル運用開始時のデータ投入
- P3-2: 未使用変数/インポートの軽微な整理
