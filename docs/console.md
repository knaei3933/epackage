# Console Log - Designer Portal Fixes (2026-02-23)

## Issues Reported

1. **コンソールエラー** - `/member/orders/xxx` ページでのReact error #418
2. **翻訳エラー** - Revision 3で「翻訳エラーが発生しました」
3. **商品名表示フォーマット** - SKU-ID_商品名_数量 形式に変更
4. **プレビューURL 404** - デザイナーアップロードファイルのプレビューができない

## Fixes Applied

### 1. プレビューURL循環参照問題の解決 ✅
**File:** `src/app/api/designer/orders/[id]/correction/route.ts`
- `preview_image_url` をプロキシURLで上書きする処理を削除
- 元のGoogle Drive URLを保持するように変更

**File:** `src/components/member/DesignRevisionsSection.tsx`
- `getPreviewUrl(revision)` ヘルパー関数を追加
- `uploaded_by_type === 'korea_designer'` の場合はデザイナー用プレビューエンドポイントを使用

### 2. フィールド名の不一致修正 ✅
**Files:**
- `src/app/api/member/orders/[id]/design-revisions/[revisionId]/retry-translation/route.ts`
- `src/app/designer-order/[token]/page.tsx`
- `src/app/designer-order/[token]/DesignerOrderTokenClient.tsx`
- `src/app/upload/[token]/page.tsx`
- `src/app/upload/[token]/TokenUploadClient.tsx`

**Change:** `korean_designer_comment_ja` → `comment_ja`

### 3. SKU表示フォーマット変更 ✅
**Files:**
- `src/components/member/DesignRevisionsSection.tsx`
- `src/app/designer-order/[token]/DesignerOrderTokenClient.tsx`

**New Format:** `SKU-{id}_{product_name}_{quantity}`

### 4. 翻訳再試行機能 ✅
**Files:**
- `src/app/api/member/orders/[id]/design-revisions/[revisionId]/retry-translation/route.ts` (新規)
- `src/components/member/DesignRevisionsSection.tsx` (再翻訳ボタン追加)

### 5. ビルドエラー修正 ✅
**Files:**
- `src/app/blog/[slug]/page.tsx` - 未使用の `seoUtils` インポート削除
- `src/lib/supabase/server.ts` - ビルド時のSupabaseフォールバック追加

## Commits

| Commit | Description |
|--------|-------------|
| `6a418d3` | fix: Exclude revisions endpoint from middleware auth |
| `d7433ac` | fix: Designer portal improvements - preview, SKU format, translation |
| `85a2d6e` | fix: Resolve circular reference in preview URL and field name issues |
| `aab3b9e` | fix: Update legacy field references to use comment_ja |
| `97cba58` | fix: Remove unused seoUtils import causing build error |
| `50ef99d` | fix: Add build-time Supabase fallback to prevent build errors |

## Remaining Tasks

- Vercelで新しいビルドをデプロイ
- すべての修正が動作しているかテスト

## Notes

- プレビューURLは元のGoogle Drive URLを保持し、フロントエンドで動的にプロキシURLを構築
- 翻訳が失敗した場合は「再翻訳」ボタンで再試行可能
- SKU表示フォーマットは `sku_name` があれば優先使用
