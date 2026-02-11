<!-- Generated: 2026-02-08 | Updated: 2026-02-08 -->

# epac_homepagever1.1 (EpackageLab)

## Purpose
EpackageLab は、包装資材の B2B eコマースプラットフォームです。お見積もりの自動作成、会員管理、注文管理、生産管理、管理者ダッシュボードなど、包装資材業界向けの包括的なソリューションを提供します。Next.js 15 (App Router) と Supabase を使用して構築されています。

## Key Files

| File | Description |
|------|-------------|
| `package.json` | プロジェクトの依存関係とスクリプト |
| `next.config.ts` | Next.js 設定ファイル |
| `tsconfig.json` | TypeScript 設定 |
| `tailwind.config.ts` | Tailwind CSS 設定 |
| `playwright.config.ts` | Playwright E2E テスト設定 |
| `.env.local` | 環境変数（ローカル開発用） |
| `.env.production.example` | 環境変数のテンプレート |
| `src/middleware.ts` | Next.js ミドルウェア（認証・国際化） |
| `types/database.ts` | データベース型定義 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | アプリケーションソースコード（`src/AGENTS.md`） |
| `docs/` | プロジェクトドキュメント（`docs/AGENTS.md`） |
| `tests/` | テストスイート（`tests/AGENTS.md`） |
| `public/` | 静的アセット（画像、ドキュメント等） |
| `server/` | バックエンドサーバー実装 |
| `supabase/` | データベースマイグレーション |
| `scripts/` | ユーティリティスクリプト |
| `design/` | デザインファイルと資産 |

## For AI Agents

### Working In This Directory

**重要:**
- `.env.local` はローカル開発用で、`.env.production.example` を参考に環境変数を設定してください
- Supabase プロジェクトが必要です（環境変数で設定）
- 日本語と英語のバイリンガル対応です（`src/locales/`）

**開発コマンド:**
```bash
npm install           # 依存関係のインストール
npm run dev           # 開発サーバー起動（ポート 3000）
npm run build         # プロダクションビルド
npm run test          # E2E テスト実行
npm run lint          # ESLint チェック
```

**コード規約:**
- TypeScript Strict Mode を使用
- ESLint と Prettier でコード品質を維持
- 機能ベースのディレクトリ構造（src/app/内）

### Testing Requirements

- E2E テスト: Playwright（`tests/e2e/`）
- 単体テスト: Vitest
- カバレッジ目標: >80%
- PR 前に全テストがパスすることを確認

### Common Patterns

- **App Router:** ページは `src/app/` 内のディレクトリ構造で定義
- **API Routes:** `src/app/api/` 内にルートハンドラー
- **認証:** Supabase Auth + Hanko
- **国際化:** i18n で日本語・英語対応
- **状態管理:** React Context API

## Dependencies

### External (主要)

- **Next.js 15.x** - React フレームワーク（App Router）
- **React 19.x** - UI ライブラリ
- **TypeScript 5.x** - 型安全性
- **Supabase** - データベース・認証・ストレージ
- **Tailwind CSS 4.x** - スタイリング
- **Playwright** - E2E テスト
- **Zod** - スキーマ検証
- **jspdf/pdfmake** - PDF 生成

### 内部アーキテクチャ

- `src/lib/pricing/` - 価格計算エンジン
- `src/lib/pdf/` - PDF 生成ロジック
- `src/lib/email/` - メールテンプレート
- `src/components/` - React コンポーネント
- `src/contexts/` - React Context プロバイダー

## プロジェクト構成の特記事項

**マルチテナント B2B プラットフォーム:**
- 会員登録承認フロー（管理者承認制）
- 見積もり → 注文 → 生産 → 出荷のワークフロー
- 管理者ダッシュボードと会員ダッシュボード
- 複雑な価格計算（SKU、数量、後加工オプションによる変動）

**対応包装資材:**
- スタンドパウチ
- 三方袋・四方袋
- ロールフィルム
- その他包装資材

**サポート言語:**
- 日本語（デフォルト）
- 英語
- 韓国語（一部）

<!-- MANUAL: プロジェクト固有の設定や注意点をここに追加 -->
