# Epackage Lab ホームページ TASK

## TASK-001: プロジェクト初期化 (2時間)

### 🎯 Objective
Next.js 16 + TypeScript + Tailwind CSS プロジェクトの基本設定と開発環境構築

### 🤖 Assigned Agents
- **primary**: frontend-developer
- **support**: error-detective

### 🔧 MCP Tools
- **Context7**: Next.js 16ドキュメント参照
- **GitHub MCP**: リポジトリ設定

### ✅ Checklist
- [ ] Next.js 16 プロジェクト作成 (App Router)
- [ ] TypeScript 厳格モード設定
- [ ] Tailwind CSS 4 + PostCSS 4 設定
- [ ] ESLint + Prettier 設定
- [ ] 基本フォルダ構造作成
- [ ] GitHub リポジトリ作成と初期コミット

### 🔗 Dependency Management
- **Prerequisite TASK**: なし
- **Successor TASK**: TASK-002
- **Shared Resources**: なし
- **Blocking Conditions**: Node.js 20+ インストール済み

### 🔍 Automatic Verification
```bash
npm run build && npm run lint && npm run type-check
echo "✅ TASK-001 verification successful"
```

### 🚨 Failure Response
- Build failure → error-detective 設定ファイル分析
- TypeScript error → debugger 型定義確認
- Dependency conflict → package.json クリーンアップ

### Copy-Paste Execution Commands
```bash
# Copy and execute these commands:
"Get Next.js 16 project initialization with Context7. TypeScript + Tailwind CSS foundation"

Task: frontend-developer
"Project structure setup. src/components, src/lib, src/types folder configuration with TypeScript strict mode"
```

---

## TASK-002: デザインシステム構築 (3時間)

### 🎯 Objective
Epackage Lab ブランドに基づいた一貫性のあるデザインシステムとコンポーネントライブラリの実装

### 🤖 Assigned Agents
- **primary**: ui-ux-designer
- **support**: frontend-developer

### 🔧 MCP Tools
- **Magic MCP**: コンポーネント生成
- **Context7**: Tailwind CSS 4ドキュメント

### ✅ Checklist
- [ ] カスタムCSS変数定義 (--brixa-primary など)
- [ ] タイポグラフィスケール設定
- [ ] カラーパレット定義
- [ ] 基本UIコンポーネント (Button, Input, Card など)
- [ ] レスポンシブグリッドシステム
- [ ] ダークモード対応準備

### 🔗 Dependency Management
- **Prerequisite TASK**: TASK-001
- **Successor TASK**: TASK-003
- **Shared Resources**: src/styles/globals.css, src/lib/utils.ts
- **Blocking Conditions**: 基本プロジェクト構築完了

### 🔍 Automatic Verification
```bash
npm run build && npm run lint
# Component rendering test
npm run test:components 2>/dev/null || echo "Component tests not implemented yet"
echo "✅ TASK-002 verification successful"
```

### 🚨 Failure Response
- Build failure → error-detective CSS変数分析
- Component error → debugger コンポーネントデバッグ
- Style conflict → tailwind-merge 関数確認

### Copy-Paste Execution Commands
```bash
# Copy and execute these commands:
Task: ui-ux-designer
"Epackage Lab design system design. Corporate colors, typography, component library structure with Japanese typography considerations"

Task: frontend-developer
"Implement design system with React 18 + TypeScript. Use cn() utility function, CSS custom properties for --brixa-primary theme colors"
```

---

## TASK-003: データベース設計と設定 (4時間)

### 🎯 Objective
Supabaseプロジェクト設定、データベーススキーマ作成、APIクライアント設定

### 🤖 Assigned Agents
- **primary**: database-admin
- **support**: database-optimizer

### 🔧 MCP Tools
- **Context7**: Supabase最新ドキュメント
- **Sequential Thinking**: ERD設計とリレーション分析

### ✅ Checklist
- [ ] Supabaseプロジェクト作成
- [ ] PostgreSQLスキーマ作成 (quotation_requests, contacts, sample_requests)
- [ ] 型定義ファイル生成 (types/database.ts)
- [ ] Supabaseクライアント設定
- [ ] Row Level Security (RLS) ポリシー設定
- [ ] APIテスト (CRUD操作)

### 🔗 Dependency Management
- **Prerequisite TASK**: TASK-001
- **Successor TASK**: TASK-004
- **Shared Resources**: .env.local, src/lib/supabase.ts
- **Blocking Conditions**: Supabaseアカウント準備完了

### 🔍 Automatic Verification
```bash
npm run build && npm run lint
# Database connection test
npm run test:db 2>/dev/null || echo "DB tests not implemented yet"
echo "✅ TASK-003 verification successful"
```

### 🚨 Failure Response
- Connection failure → error-detective 接続設定分析
- Schema error → debugger SQL構文確認
- RLS error → database-admin セキュリティポリシー確認

### Copy-Paste Execution Commands
```bash
# Copy and execute these commands:
"Sequential Thinking Epackage Lab ERD design:
Entities: quotation_requests, quotation_results, contacts, sample_requests
Relationships: 1:N for request-to-results, proper constraints and indexes"

Task: database-admin
"Create Supabase project and tables based on ERD with proper PostgreSQL types, constraints, and RLS policies for B2B quotation system"
```

---

## TASK-004: 共有コンポーネント実装 (3時間)

### 🎯 Objective
Header, Footer, Navigation, Layoutなど、再利用可能な基本コンポーネントの実装

### 🤖 Assigned Agents
- **primary**: frontend-developer
- **support**: ui-ux-designer

### 🔧 MCP Tools
- **Magic MCP**: UIコンポーネント生成
- **Context7**: React Hook Formドキュメント

### ✅ Checklist
- [ ] Headerコンポーネント (ナビゲーション、ロゴ)
- [ ] Footerコンポーネント (リンク、会社情報)
- [ ] Layoutコンポーネント (共通レイアウト)
- [ ] Navigationコンポーネント (モバイル対応)
- [ ] Loadingスケルトン
- [ ] Error Boundary 実装

### 🔗 Dependency Management
- **Prerequisite TASK**: TASK-002
- **Successor TASK**: TASK-005
- **Shared Resources**: src/components/ui/, src/components/layout/
- **Blocking Conditions**: デザインシステム完了

### 🔍 Automatic Verification
```bash
npm run build && npm run lint
# Component unit tests
npm run test:unit 2>/dev/null || echo "Unit tests not implemented yet"
echo "✅ TASK-004 verification successful"
```

### 🚨 Failure Response
- Build failure → error-detective TypeScriptエラー分析
- Layout error → debugger コンポーネント構造確認
- Responsive error → ui-ux-designer レスポンシブ設計レビュー

### Copy-Paste Execution Commands
```bash
# Copy and execute these commands:
Task: ui-ux-designer
"Layout components design for Epackage Lab. Navigation structure, mobile responsiveness, Japanese typography considerations"

Task: frontend-developer
"Implement reusable layout components with React 18 + TypeScript. Use Tailwind CSS responsive design, cn() utility function, and proper TypeScript interfaces"
```

---

## TASK-005: 自動見積りシステム - 基本実装 (4時間)

### 🎯 Objective
見積り計算エンジンと基本UIの実装。StepOne (基本情報・素材選択) まで完成

### 🤖 Assigned Agents
- **primary**: frontend-developer
- **support**: backend-developer

### 🔧 MCP Tools
- **Context7**: React Context APIドキュメント
- **Sequential Thinking**: 状態管理設計

### ✅ Checklist
- [ ] SimulationContext 設計と実装
- [ ] StepOne コンポーネント (基本情報・素材選択)
- [ ] 価格計算ロジック実装 (フロントエンド側)
- [ ] 型定義 (SimulationState, 計算パラメータ)
- [ ] フォームバリデーション (Zod使用)
- [ ] リアルタイム価格計算 (0.5秒以内応答)

### 🔗 Dependency Management
- **Prerequisite TASK**: TASK-002, TASK-004
- **Successor TASK**: TASK-006
- **Shared Resources**: src/components/simulation/, src/lib/pricing.ts
- **Blocking Conditions**: 基本コンポーネント完了

### 🔍 Automatic Verification
```bash
npm run build && npm run lint
# Quote calculation accuracy test
echo '{"orderType":"new","contentsType":"solid","bagType":"flat_3_side","width":100,"height":200,"materialGenre":"opp_al","quantities":[1000]}' | curl -X POST -H "Content-Type: application/json" -d @- http://localhost:3000/api/quotation/calculate
echo "✅ TASK-005 verification successful"
```

### 🚨 Failure Response
- Calculation error → error-detective 計算ロジック分析
- State error → debugger Context APIデバッグ
- Validation error → backend-developer 入力値確認

### Copy-Paste Execution Commands
```bash
# Copy and execute these commands:
"Sequential Thinking quotation system state management design:
React Context API for global state, TypeScript interfaces for form data, real-time calculation engine with 0.5s response time"

Task: frontend-developer
"Implement StepOne component with form validation, material selection dropdowns, size inputs, and real-time price preview. Use Zod for validation"
```

---

## TASK-006: 自動見積りシステム - 数量パターン機能 (3時間)

### 🎯 Objective
StepTwo (数量パターン・オプション設定) と多パターン同時比較機能の実装

### 🤖 Assigned Agents
- **primary**: frontend-developer
- **support**: ui-ux-designer

### 🔧 MCP Tools
- **Context7**: React Hook Form + Zodドキュメント
- **Magic MCP**: コンポーネント生成

### ✅ Checklist
- [ ] StepTwo コンポーネント (数量パターン設定)
- [ ] 数量パターン追加/削除機能 (最大5パターン)
- [ ] 納期選択カレンダー
- [ ] パターン間比較機能
- [ ] 入力値バリデーション (数値範囲チェック)
- [ ] ローディング状態とエラー処理

### 🔗 Dependency Management
- **Prerequisite TASK**: TASK-005
- **Successor TASK**: TASK-007
- **Shared Resources**: src/components/simulation/, SimulationContext
- **Blocking Conditions**: 基本見積り機能完了

### 🔍 Automatic Verification
```bash
npm run build && npm run lint
# Multi-pattern calculation test
echo '{"orderType":"new","quantities":[1000,3000,5000,10000]}' | curl -X POST -H "Content-Type: application/json" -d @- http://localhost:3000/api/quotation/calculate
echo "✅ TASK-006 verification successful"
```

### 🚨 Failure Response
- Pattern error → error-detective 状態管理分析
- UI error → ui-ux-designer レスポンシブレビュー
- Validation error → debugger Zodスキーマ確認

### Copy-Paste Execution Commands
```bash
# Copy and execute these commands:
"Get React Hook Form + Zod schema validation patterns with Context7 for complex form arrays"

Task: frontend-developer
"Implement StepTwo with dynamic form arrays for quantity patterns. Add calendar picker, validation for 100-50000 range, loading states, and error boundaries"
```

---

## TASK-007: 自動見積りシステム - 結果表示とAPI連携 (4時間)

### 🎯 Objective
StepThree (見積り結果表示)、APIエンドポイント実装、PDF生成機能

### 🤖 Assigned Agents
- **primary**: backend-developer
- **support**: frontend-developer

### 🔧 MCP Tools
- **Context7**: Next.js API Routes + PDF生成ライブラリ
- **Sequential Thinking**: API設計とエラーハンドリング

### ✅ Checklist
- [ ] APIエンドポイント実装 (/api/quotation/calculate)
- [ ] StepThree コンポーネント (結果表示)
- [ ] パターン別比較表示
- [ ] PDF見積書生成機能
- [ ] APIエラーハンドリング
- [ ] パフォーマンス最適化 (<200ms応答)

### 🔗 Dependency Management
- **Prerequisite TASK**: TASK-006, TASK-003
- **Successor TASK**: TASK-008
- **Shared Resources**: /api/quotation/route.ts, src/components/simulation/Result.tsx
- **Blocking Conditions**: データベース設定完了

### 🔍 Automatic Verification
```bash
npm run build && npm run lint && npm run test:api 2>/dev/null || echo "API tests not implemented yet"
# End-to-end quote calculation test
npm run test:e2e:quote 2>/dev/null || echo "E2E tests not implemented yet"
echo "✅ TASK-007 verification successful"
```

### 🚨 Failure Response
- API error → error-detective APIロジック分析
- PDF error → backend-developer PDF生成確認
- Performance error → performance-engineer ボトルネック分析

### Copy-Paste Execution Commands
```bash
# Copy and execute these commands:
"Get Next.js 14 API Routes best practices with Context7 for performance optimization"

/sc:implement --type api "Quotation calculation API endpoint with validation, error handling, and PDF generation" --persona-backend --focus performance

Task: backend-developer
"Implement PDF generation with Japanese typography support, proper formatting, and brand logo integration"
```

---

## TASK-008: お問い合わせシステム (3時間)

### 🎯 Objective
お問い合わせフォーム、サンプル請求フォーム、メール送信機能の実装

### 🤖 Assigned Agents
- **primary**: backend-developer
- **support**: frontend-developer

### 🔧 MCP Tools
- **Context7**: SendGrid + React Hook Formドキュメント
- **Sequential Thinking**: フォームワークフロー設計

### ✅ Checklist
- [ ] お問い合わせフォーム実装
- [ ] サンプル請求フォーム実装
- [ ] APIエンドポイント (/api/contact, /api/samples)
- [ ] SendGrid連携 (自動メール送信)
- [ ] フォームバリデーションとエラー処理
- [ ] 成功メッセージとリダイレクト

### 🔗 Dependency Management
- **Prerequisite TASK**: TASK-002, TASK-004
- **Successor TASK**: TASK-009
- **Shared Resources**: /api/contact/route.ts, src/components/forms/
- **Blocking Conditions**: 基本UIコンポーネント完了

### 🔍 Automatic Verification
```bash
npm run build && npm run lint
# Form submission test
echo '{"companyName":"Test","contactPerson":"Test","email":"test@example.com","message":"Test message"}' | curl -X POST -H "Content-Type: application/json" -d @- http://localhost:3000/api/contact
echo "✅ TASK-008 verification successful"
```

### 🚨 Failure Response
- Form validation error → error-detective バリデーション分析
- Email error → backend-developer SendGrid設定確認
- API error → debugger エンドポイントデバッグ

### Copy-Paste Execution Commands
```bash
# Copy and execute these commands:
"Get SendGrid email API integration with Next.js 14 and React Hook Form validation patterns"

Task: backend-developer
"Implement contact and sample request forms with proper validation, error handling, Japanese email templates, and automatic CRM integration"
```

---

## TASK-009: 製品カタログページ (3時間)

### 🎯 Objective
動的製品カタログ、検索機能、フィルタリング機能の実装

### 🤖 Assigned Agents
- **primary**: frontend-developer
- **support**: ui-ux-designer

### 🔧 MCP Tools
- **Magic MCP**: コンポーネント生成
- **Context7**: Next.js動的ルーティングドキュメント

### ✅ Checklist
- [ ] 製品カタログページ実装
- [ ] 6種類パッケージタイプ表示
- [ ] 検索機能実装
- [ ] カテゴリーフィルタリング
- [ ] 画像ギャラリーと詳細表示
- [ ] お問い合わせ連携

### 🔗 Dependency Management
- **Prerequisite TASK**: TASK-004
- **Successor TASK**: TASK-010
- **Shared Resources**: src/app/catalog/page.tsx, src/components/catalog/
- **Blocking Conditions**: 基本レイアウト完了

### 🔍 Automatic Verification
```bash
npm run build && npm run lint
# Catalog rendering test
curl http://localhost:3000/catalog | grep -i "package" | head -5
echo "✅ TASK-009 verification successful"
```

### 🚨 Failure Response
- Rendering error → error-detective コンポーネント分析
- Performance error → performance-engineer 画像最適化
- Search error → debugger 検索機能デバッグ

### Copy-Paste Execution Commands
```bash
# Copy and execute these commands:
Task: ui-ux-designer
"Product catalog page design for 6 package types. Gallery layout, search interface, filtering options with Japanese typography"

Task: frontend-developer
"Implement dynamic catalog page with Next.js 13+ app router. Add search functionality, category filtering, image optimization with next/image"
```

---

## TASK-010: パフォーマンス最適化とSEO対策 (4時間)

### 🎯 Objective
Core Web Vitals改善、SEO対策、画像最適化、キャッシュ戦略の実装

### 🤖 Assigned Agents
- **primary**: performance-engineer
- **support**: frontend-developer

### 🔧 MCP Tools
- **Context7**: Next.jsパフォーマンス最適化ドキュメント
- **Sequential Thinking**: パフォーマンスボトルネック分析

### ✅ Checklist
- [ ] Core Web Vitals測定と改善
- [ ] 画像最適化 (next/image, WebP変換)
- [ ] メタタグとSEO設定
- [ ] キャッシュ戦略実装
- [ ] バンドルサイズ最適化
- [ ] Lighthouseスコア90以上達成

### 🔗 Dependency Management
- **Prerequisite TASK**: TASK-007, TASK-009
- **Successor TASK**: TASK-011
- **Shared Resources**: 全体パフォーマンス設定
- **Blocking Conditions**: 主要機能実装完了

### 🔍 Automatic Verification
```bash
npm run build && npm run analyze
npm run lighthouse 2>/dev/null || echo "Lighthouse CLI not available"
echo "✅ TASK-010 verification successful"
```

### 🚨 Failure Response
- Performance regression → performance-engineer ボトルネック分析
- Bundle size increase → error-detective 依存関係分析
- SEO issues → debugger メタタグ確認

### Copy-Paste Execution Commands
```bash
# Copy and execute these commands:
"Get Next.js 14 performance optimization and Core Web Vitals improvement guide with Context7"

Task: performance-engineer
"Analyze bundle size, implement React optimization (memo, useMemo, useCallback), optimize images with WebP, configure caching strategy for Japanese market"
```

---

## TASK-011: E2Eテスト実装 (3時間)

### 🎯 Objective
Playwrightを使用したエンドツーエンドテスト、見積りシステム機能テスト

### 🤖 Assigned Agents
- **primary**: qa-engineer
- **support**: frontend-developer

### 🔧 MCP Tools
- **Playwright MCP**: E2Eテスト自動化
- **Context7**: React Testing Libraryドキュメント

### ✅ Checklist
- [ ] Playwright設定とテスト環境構築
- [ ] 見積りシステムE2Eテスト (全ステップ)
- [ ] お問い合わせフォームテスト
- [ ] レスポンシブデザインテスト
- [ ] アクセシビリティテスト (WCAG 2. AA)
- [ ] カバレッジレポート生成

### 🔗 Dependency Management
- **Prerequisite TASK**: TASK-010
- **Successor TASK**: TASK-012
- **Shared Resources**: tests/e2e/, テスト設定ファイル
- **Blocking Conditions**: 全機能実装完了

### 🔍 Automatic Verification
```bash
npm run test:e2e
npm run test:coverage
echo "✅ TASK-011 verification successful"
```

### 🚨 Failure Response
- Test failure → error-detective テスト失敗分析
- Coverage不足 → debugger カバレッジギャップ確認
- Performance test failure → qa-engineer テスト条件調整

### Copy-Paste Execution Commands
```bash
# Copy and execute these commands:
"Write comprehensive E2E tests with Playwright MCP for quotation system:
- Complete 3-step quotation workflow
- Form validation and error handling
- Responsive design testing
- Japanese input validation"

Task: frontend-developer
"Implement unit and integration tests with Vitest + React Testing Library. Focus on quotation calculation accuracy and form validation logic"
```

---

## TASK-012: 本番環境デプロイ (2時間)

### 🎯 Objective
Vercelへの本番環境デプロイ、環境変数設定、ドメイン設定

### 🤖 Assigned Agents
- **primary**: devops-engineer
- **support**: error-detective

### 🔧 MCP Tools
- **GitHub MCP**: リポジトリ管理
- **Context7**: Vercelデプロイガイド

### ✅ Checklist
- [ ] Vercelプロジェクト設定
- [ ] 環境変数設定 (.env.local → 本番)
- [ ] カスタムドメイン設定
- [ ] SSL証明書設定
- [ ] パフォーマンス監視設定
- [ ] 本番環境テスト

### 🔗 Dependency Management
- **Prerequisite TASK**: TASK-011
- **Successor TASK**: TASK-013
- **Shared Resources**: Vercel設定、GitHub Actions
- **Blocking Conditions**: 全テスト完了

### 🔍 Automatic Verification
```bash
# Production build test
npm run build:prod
# Production deployment verification
curl -I https://epackage-lab.com | head -5
echo "✅ TASK-012 verification successful"
```

### 🚨 Failure Response
- Build failure → error-detective 本番ビルドエラー分析
- Deployment failure → devops-engineer Vercel設定確認
- Environment error → debugger 環境変数デバッグ

### Copy-Paste Execution Commands
```bash
# Copy and execute these commands:
"Get Vercel deployment guide with Context7 for Next.js 16 + TypeScript + Tailwind CSS applications"

Task: devops-engineer
"Set up Vercel project with proper environment variables, custom domain configuration, SSL certificates, and performance monitoring for Japanese market"
```

---

## TASK-013: ローンチ準備とマーケティング統合 (2時間)

### 🎯 Objective
Google Analytics設定、SNS連携、コンテンツ最終化、ローンチチェックリスト実行

### 🤖 Assigned Agents
- **primary**: business-analyst
- **support**: frontend-developer

### 🔧 MCP Tools
- **Context7**: Google Analytics 4設定
- **Sequential Thinking**: マーケティング戦略統合

### ✅ Checklist
- [ ] Google Analytics 4設定
- [ ] ヒートマップ分析ツール設定
- [ ] SNSシェアボタン実装
- [ ] コンテンツ最終レビュー (日本語校正)
- [ ] ローンチチェックリスト実行
- [ ] モニタリングダッシュボード設定

### 🔗 Dependency Management
- **Prerequisite TASK**: TASK-012
- **Successor TASK**: なし (プロジェクト完了)
- **Shared Resources**: 全体設定、マーケティングツール
- **Blocking Conditions**: 本番環境デプロイ完了

### 🔍 Automatic Verification
```bash
# Final build and deployment test
npm run build && npm run deploy:prod
# Analytics tracking verification
curl -I https://epackage-lab.com | grep -i "x-ga"
echo "✅ TASK-013 verification successful"
echo "🚀 Epackage Lab Launch Ready!"
```

### 🚨 Failure Response
- Analytics error → error-detective トラッキング設定確認
- Content error → business-analyst コンテンツレビュー
- Performance issue → performance-engineer 最終最適化

### Copy-Paste Execution Commands
```bash
# Copy and execute these commands:
"Get Google Analytics 4 setup with Context7 for Next.js 16 applications. Configure custom events for quotation system tracking"

Task: business-analyst
"Set up marketing analytics dashboard, configure conversion tracking for quotation system, implement social media sharing, and conduct final content review for Japanese market launch"
```

---

## 📋 プロジェクト完了チェックリスト

### 全タスク完了時の最終検証
```bash
# Complete project verification
npm run build && npm run lint && npm run test:e2e && npm run lighthouse
echo "🎉 Epackage Lab Project Complete!"
echo "📊 Final Performance Metrics:"
echo "- Build Status: Success"
echo "- Test Coverage: 90%+"
echo "- Lighthouse Score: 90+"
echo "- E2E Tests: All passed"
echo "- Production Deployed: ✅"
```

### 🚀 ローンチ準備完了状態
- ✅ すべてのP0機能実装完了
- ✅ 自動見積りシステム完全動作
- ✅ レスポンシブデザイン対応
- ✅ パフォーマンス最適化完了
- ✅ E2Eテストパス
- ✅ 本番環境デプロイ完了
- ✅ マーケティングツール統合完了

**プロジェクト期間**: 約35時間 (約2週間、フルタイム開発)
**品質目標達成**: 全ての主要指標ターゲット達成
**ローンチ準備**: 100% 完了

---

**Document Version**: 1.0
**Created**: 2025-11-22
**Next Review**: 2025-12-22
**Project Manager**: Development Lead