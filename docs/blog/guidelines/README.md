# Epackage Lab ブログ作成ガイドライン

> **バージョン**: 3.0 (日本語版)
> **更新日**: 2026-04-11
> **対象**: コンテンツクリエイター、ライター、開発者

---

## 概要

このガイドラインは、Epackage Labブログで高品質な記事を作成するための包括的なドキュメントです。日本語市場に対応し、SEO戦略の最適化を図っています。

---

## ディレクトリ構造

```
docs/blog/guidelines/
├── README.md                           # このファイル
├── CHANGELOG.md                        # 更新履歴
├── article-templates/                  # 記事テンプレート（shared）
│   ├── 30-second-summary-guide.md      # 30秒要約ガイド
│   ├── diagnostic-chart-guide.md       # 診断チャートガイド
│   ├── myth-busting-article.md         # 神話破壊型記事
│   ├── interview-metrics-quantification-guide.md  # 指標定量化ガイド
│   └── technical-explanation.md        # 技術解説記事
├── seo-strategy/                       # SEO戦略（shared）
│   ├── question-based-titles.md        # 質問型タイトル
│   ├── ai-content-seo.md               # AIコンテンツSEO対策
│   └── platform-decision-framework.md  # プラットフォーム意思決定
└── shared/                             # 共有技術ドキュメント
    ├── technical-standards/            # 技術標準
    ├── image-guidelines/               # 画像ガイドライン（nanobanana MCP）
    ├── cta-protocol/                   # CTAプロトコル
    └── change-management/              # 変更管理
```

---

## 新規作成ガイドライン（2025-04-11追加）

Brixa競合分析に基づく新規ガイドライン：

### 📋 SEOおよび準備状況監査報告

| ドキュメント | 説明 | 対象 |
|-------------|------|------|
| `AUDIT-REPORT.md` | SEO実装・ガイドライン準備状況監査報告 | 全体的評価 |

### 記事テンプレート（shared/article-templates/）

| ファイル | 説明 | 対象 |
|---------|------|------|
| `30-second-summary-guide.md` | 30秒要約セクション作成ガイド | 全記事タイプ |
| `diagnostic-chart-guide.md` | 診断チャート作成ガイド（2分岐ツリー） | 選択ガイド記事 |
| `myth-busting-article.md` | 神話破壊型記事テンプレート | 価格透明性記事 |
| `interview-metrics-quantification-guide.md` | インタビュー指標定量化ガイド | 導入事例記事 |
| `technical-explanation.md` | 技術解説記事テンプレート（比較・選択ガイド） | 印刷技術・素材解説 |

### SEO戦略（shared/seo-strategy/）

| ファイル | 説明 | 対象 |
|---------|------|------|
| `question-based-titles.md` | 質問型タイトルSEO戦略 | 全記事タイプ |
| `platform-decision-framework.md` | プラットフォーム意思決定フレームワーク | SEO担当者 |

### 記事テンプレート（article-templates/）

| ファイル | 説明 | 対象 |
|---------|------|------|
| `30-second-summary-guide.md` | 30秒要約セクション作成ガイド | 全記事タイプ |
| `diagnostic-chart-guide.md` | 診断チャート作成ガイド（2分岐ツリー） | 選択ガイド記事 |
| `myth-busting-article.md` | 神話破壊型記事テンプレート | 価格透明性記事 |
| `interview-metrics-quantification-guide.md` | インタビュー指標定量化ガイド | 導入事例記事 |
| `technical-explanation.md` | 技術解説記事テンプレート（比較・選択ガイド） | 印刷技術・素材解説 |
| `business-perspective.md` | 経営者向けビジネスリスク・戦略記事テンプレート | 経営者・事業担当者 |
| `writing-practical-guide.md` | ブログ作成実務ガイド（改善推奨事項の実装） | 全ライター |

### SEO戦略（seo-strategy/）

| ファイル | 説明 | 対象 |
|---------|------|------|
| `question-based-titles.md` | 質問型タイトルSEO戦略 | 全記事タイプ |
| `ai-content-seo.md` | AIコンテンツSEO対策ガイド | AI活用コンテンツ |
| `platform-decision-framework.md` | プラットフォーム意思決定フレームワーク | SEO担当者 |

---

## クイックスタート

### 新しい記事を作成するライター

1. 記事タイプを選択: `article-templates/`
2. テンプレートをコピーして記事作成
3. SEOチェックリストで確認
4. 公開前チェックを実行

### Brixaスタイル記事を作成する場合

1. **診断チャート付き記事**: `shared/article-templates/diagnostic-chart-guide.md` 参照
2. **質問型タイトル**: `shared/seo-strategy/question-based-titles.md` 参照
3. **30秒要約**: `shared/article-templates/30-second-summary-guide.md` 参照
4. **ビジネス視点**: `article-templates/business-perspective.md` 参照

### 開発者

1. `shared/technical-standards/` でシステム構造を確認
2. `shared/cta-protocol/` でCTAシステムを理解
3. `shared/image-guidelines/` で画像仕様を確認
4. `shared/change-management/` で更新フローを確認

---

## 記事タイプ

| タイプ | 説明 | 文字数目安 |
|--------|------|-----------|
| **product-intro** | 製品紹介 | 3,000〜5,000文字 |
| **practical-tips** | 実践的ノウハウ | 4,000〜7,000文字 |
| **printing-tech** | 印刷技術 | 2,500〜4,000文字 |
| **customer-stories** | 導入事例 | 5,000〜10,000文字 |

詳細は `article-templates/` を参照してください。

---

## SEO戦略

詳細は `seo-strategy/` を参照してください。

### ゲーテスケジュールのSEO最適化

**重要**: AIコンテンツとして認識されないよう、自然なゲーテスケジュールを維持してください。

**推奨パターン**:
- 週1-2回の公開（1-2週間隔）
- 時間帯を多様化（午前/午後を混合）
- 同日に複数記事を公開しない

**悪い例（避けるべき）**:
- 2025-02-27に3つの記事を同時公開
- 毎週同じ曜日・同じ時間に公開
- 過去の日付（2025年）のまま公開

**良い例**:
```
2026-01-08 09:30（印刷技術）
2026-01-22 14:20（製品紹介）
2026-02-05 10:15（製品紹介）
2026-02-19 16:45（製品紹介）
2026-03-12 11:30（実践ガイド）
```

詳細は [ai-content-seo.md](./shared/seo-strategy/ai-content-seo.md) を参照してください。

---

## 画像ガイドライン

### nanobanana MCPを使用した画像生成

```bash
# 画像生成の例
mcp__nanobanana__nanobanana_generate \
  prompt="スタンドパウチの製品イメージ。底部がW字型に折りたたまれ、自立する様子" \
  aspect_ratio="16:9" \
  quality="high"
```

詳細は `shared/image-guidelines/` を参照してください。

---

## CTAシステム

記事には自動的にCTAが挿入されます：

- **中盤CTA**: 記事の50%位置
- **終了CTA**: 記事の最後

詳細は `shared/cta-protocol/` を参照してください。

---

## 変更管理

ガイドラインの変更には以下の手順が必要です：

1. 変更リクエストの作成
2. 影響分析（Core vs Language-specific）
3. 承認
4. 実装
5. 相互参照の更新

詳細は `shared/change-management/propagation-protocol.md` を参照してください。

---

## 品質チェックリスト

記事公開前に以下のチェックを実施してください：

- [ ] リード文で読者の悩みに共感
- [ ] メインタイトルにキーワードを含む
- [ ] メタディスクリプション設定済み（120〜160文字）
- [ ] 目次のリンクが正しい
- [ ] CTAリンクが有効
- [ ] 画像にalt属性がある

詳細は各言語の `quality-checklist.md` を参照してください。

---

## 関連資料

- [EXPERT_BLOG_WRITING_GUIDE.md](../EXPERT_BLOG_WRITING_GUIDE.md) - 旧版ガイド（参考用）
- [ROADMAP.md](../ROADMAP.md) - 記事ロードマップ
- [src/lib/types/blog.ts](../../../src/lib/types/blog.ts) - 型定義
- [src/lib/blog/queries.ts](../../../src/lib/blog/queries.ts) - データ取得

---

## 更新履歴

- **v3.0** (2025-04-11): 多言語対応版リリース（ja/ko/shared構造）
- **v2.0** (2025-04-11): 単一ファイル版
- **v1.0** (初期版): Brixa Brixarchベース

---

**問い合わせ**: Epackage Lab ブログ編集部
**最終更新**: 2025-04-11
