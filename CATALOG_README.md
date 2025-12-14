# Epackage Lab 製品カタログ (Product Catalog)

## 概要 (Overview)

Epackage Lab の製品カタログページを実装しました。動的ルーティング、高度な検索機能、カテゴリーフィルタリング、画像ギャラリー、およびお問い合わせシステム統合を備えています。

## 実装機能 (Implemented Features)

### 1. 動的製品カタログページ (/catalog)
- **メインカタログページ**: `/src/app/catalog/page.tsx`
- **動的製品詳細ページ**: `/src/app/catalog/[slug]/page.tsx`
- **Next.js App Router** を使用した動的ルーティング
- **静的生成 (SSG)** による最適化

### 2. 6種類のパッケージタイプ (6 Package Types)

1. **スタンダード (Standard)** - 基本的な段ボール箱
2. **プレミアム (Premium)** - 高級ギフトボックス
3. **エコ (Eco-Friendly)** - 環境配慮型紙袋
4. **ラグジュアリー (Luxury)** - 高級木製ボックス
5. **インダストリアル (Industrial)** - 産業用クレートパレット
6. **カスタム (Custom)** - オーダーメイド包装ソリューション

### 3. 高度な検索機能 (Advanced Search)
- 製品名、説明、タグでの全文検索
- 材質、サイズ、業種での絞り込み
- リアルタイム検索結果更新
- デバウンス機能によるパフォーマンス最適化

### 4. カテゴリーフィルタリング (Category Filtering)
- **パッケージタイプ**: 6種類から選択
- **材質**: 段ボール、木材、プラスチックなど
- **サイズ**: 小型、中型、大型、オーダーメイド
- **業界**: eコマース、食品、医療など
- **価格範囲**: 最小・最大価格指定
- **機能フィルター**: 防水、リサイクル可能など

### 5. 画像ギャラリーと詳細表示 (Image Gallery & Detail View)
- **サムネイルギャラリー**: 複数画像対応
- **モーダル表示**: 詳細情報ポップアップ
- **ナビゲーション**: 前後の画像切り替え
- **next/image** による画像最適化
- **レスポンシブデザイン**: モバイル対応

### 6. お問い合わせ連携 (Contact Integration)
- **製品別お問い合わせ**: 製品ID付きフォーム
- **サンプルリクエスト**: 製品サンプル依頼
- **見積依頼**: カスタムパッケージ相談
- **多言語対応**: 日本語・英語・韓国語

## 技術仕様 (Technical Specifications)

### フロントエンド技術
- **Next.js 16.0.3** (App Router)
- **React 19.2.0** (Server Components)
- **TypeScript** (型安全)
- **Tailwind CSS 4** (レスポンシブデザイン)
- **Lucide React** (アイコン)

### 主要コンポーネント
```
src/
├── app/
│   ├── catalog/
│   │   ├── page.tsx              # メインカタログページ
│   │   └── [slug]/
│   │       └── page.tsx          # 動的製品詳細ページ
│   └── api/ (既存の連携API)
├── components/
│   ├── catalog/
│   │   ├── ProductCard.tsx       # 製品カード
│   │   ├── CatalogFilters.tsx    # 検索・フィルター
│   │   ├── CatalogGrid.tsx       # 製品グリッド
│   │   ├── ProductDetailModal.tsx # 詳細モーダル
│   │   └── index.ts              # エクスポート
│   ├── ui/ (既存UIコンポーネント)
│   └── layout/ (既存レイアウト)
├── contexts/
│   ├── CatalogContext.tsx        # カタログ状態管理
│   └── LanguageContext.tsx       # 既存言語コンテキスト
├── data/
│   └── catalogData.ts            # 製品データとユーティリティ
├── lib/
│   ├── catalogUtils.ts           # 検索・フィルターロジック
│   └── i18n.ts                   # 国際化設定
├── types/
│   └── catalog.ts                # カタログ関連型定義
└── locales/
    ├── ja.ts                     # 日本語翻訳
    ├── en.ts                     # 英語翻訳
    └── ko.ts                     # 韓国語翻訳
```

### データ構造
- **PackageProduct**: 製品情報の完全な型定義
- **PackageFeatures**: 8つの機能フラグ (防水、リサイクルなど)
- **PackageSpecs**: 寸法、重量、容量の仕様
- **PackageApplication**: 業界別用途事例
- **サンプルデータ**: 6種類のパッケージタイプに対応

### パフォーマンス最適化
- **静的生成**: 製品ページの事前生成
- **画像最適化**: next/image による自動最適化
- **デバウンス**: 検索入力のパフォーマンス向上
- **メモ化**: React useCallback による再レンダリング抑制
- **URL同期**: 検索・フィルター状態のURL永続化

## 多言語対応 (Internationalization)

### 対応言語
- **日本語 (ja)**: デフォルト言語
- **英語 (en)**
- **韓国語 (ko)**

### 翻訳範囲
- UI全般のラベルとメッセージ
- 製品名と説明 (3言語対応)
- パッケージタイプとカテゴリー
- 検索プレースホルダー
- エラーメッセージと成功メッセージ

## SEO対策 (SEO Optimization)

### メタデータ
- 動的タイトルと説明の生成
- Open Graph タグ (Facebook/X 対応)
- Twitter Card 対応
- 構造化データ (JSON-LD)

### パフォーマンス
- コアウェブバイタルの最適化
- 画像の遅延読み込み
- 静的生成による高速表示

## ナビゲーション統合

ナビゲーションメニューに「製品カタログ」リンクを追加:
- **アイコン**: Grid3X3 (Lucide React)
- **URL**: `/catalog`
- **多言語ラベル**: 日本語「製品カタログ」

## 使用方法 (Usage)

### カタログページにアクセス
```bash
npm run dev
# ブラウザで http://localhost:3000/catalog にアクセス
```

### 機能操作
1. **検索**: トップの検索バーにキーワード入力
2. **フィルター**: パッケージタイプ、材質、サイズで絞り込み
3. **ソート**: 関連度、価格、人気度で並び替え
4. **詳細表示**: 製品カードクリックで詳細モーダル
5. **お問い合わせ**: 詳細ページから製品別お問い合わせ

### 製品データの追加
`src/data/catalogData.ts` に新しい製品データを追加:

```typescript
{
  id: 'new-product',
  name: '新製品名',
  nameEn: 'New Product Name',
  nameKo: '새 제품 이름',
  type: 'standard', // PackageType
  category: { /* カテゴリー情報 */ },
  description: '製品説明',
  descriptionEn: 'Product Description',
  descriptionKo: '제품 설명',
  specs: { /* 仕様情報 */ },
  features: { /* 機能フラグ */ },
  applications: [ /* 用途事例 */ ],
  images: [ /* 画像情報 */ ],
  pricing: { /* 価格情報 */ },
  leadTime: { /* 納期 */ },
  minOrder: { /* 最小注文数 */ },
  popularity: 80, /* 人気度 0-100 */
  tags: ['タグ1', 'タグ2'],
  isNew: true,
  isFeatured: false
}
```

## 今後の拡張 (Future Enhancements)

### 機能追加
- **お気に入り機能**: ユーザーのお気に入り保存
- **比較機能**: 製品の並列比較
- **カスタマイズシミュレーター**: オンラインデザインツール
- **在庫状況**: リアルタイム在庫表示
- **レビュー機能**: 顧客レビューと評価

### 技術改善
- **PWA対応**: オフライン利用
- **アクセシビリティ**: WCAG 2.1 AA 対応
- **分析**: 製品閲覧データの収集
- **A/Bテスト**: UI改善のためのテスト

## デプロイ (Deployment)

### 本番環境ビルド
```bash
npm run build
npm start
```

### 静的生成
製品ページは事前生成されるため、ホスティング費用の削減と表示速度の向上が期待できます。

---

この製品カタログは Epackage Lab のビジネスニーズに合わせて設計されており、スケーラブルで保守性の高い構造になっています。