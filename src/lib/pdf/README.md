# PDF Module

リファクタリングされたPDF生成システム

## 概要 (Overview)

このモジュールは、PlaywrightとHTMLテンプレートを使用したPDF生成システムの統合アーキテクチャを提供します。

## ディレクトリ構造 (Directory Structure)

```
src/lib/pdf/
├── core/                      # コアコンポーネント
│   ├── base.ts               # BasePdfGenerator抽象クラス
│   ├── font-manager.ts       # フォント管理者
│   ├── template-manager.ts   # テンプレート管理者
│   ├── layout-helper.ts      # レイアウトヘルパー
│   └── client-adapter.ts     # クライアントPDFアダプター
├── generators/                # PDFジェネレーター
│   ├── contract-generator.ts    # 契約書生成器
│   ├── quotation-generator.ts   # 見積書生成器
│   └── specsheet-generator.ts   # 仕様書生成器
└── index.ts                  # モジュールエクスポート
```

## コアコンポーネント (Core Components)

### BasePdfGenerator

全PDFジェネレーターの抽象基底クラス。

**機能:**
- テンプレート管理とキャッシュ
- Playwrightブラウザ管理
- PDF生成オプション
- エラーハンドリング
- 日本語フォーマットユーティリティ

**使用例:**
```typescript
import { BasePdfGenerator } from '@/lib/pdf';

class MyGenerator extends BasePdfGenerator<MyData, PdfResult> {
  constructor() {
    super({
      templatePath: 'path/to/template.html',
      defaultPdfOptions: { format: 'A4', orientation: 'portrait' },
    });
  }

  protected prepareTemplateData(data: MyData): Record<string, unknown> {
    return { /* テンプレートデータ */ };
  }

  protected validateData(data: MyData): { isValid: boolean; errors: string[] } {
    // バリデーションロジック
    return { isValid: true, errors: [] };
  }

  protected estimateSize(data: MyData): number {
    return 1000;
  }
}
```

### FontManager

Google Fontsと日本語フォントの管理。

**機能:**
- 定義済み日本語フォント（Noto Sans JP、Zen Maru Gothicなど）
- カスタムフォント登録
- フォントCSS生成
- システムフォント対応

**使用例:**
```typescript
import { FontManager } from '@/lib/pdf';

const manager = new FontManager();
manager.setFont('zenMaruGothic');
const css = manager.generateFontCss();
```

**定義済みフォント:**
- `notoSansJP` - Noto Sans JP（デフォルト）
- `notoSerifJP` - Noto Serif JP
- `zenKakuGothic` - Zen Kaku Gothic New
- `zenMaruGothic` - Zen Maru Gothic
- `sawarabiGothic` - Sawarabi Gothic

### TemplateManager

HTMLテンプレートの管理とコンパイル。

**機能:**
- テンプレート登録（ファイル/文字列/インライン）
- テンプレートキャッシュ
- 組み込みHandlebarsヘルパー
- カスタムヘルパー登録

**組み込みヘルパー:**
- `{{formatYen amount}}` - 日本円フォーマット
- `{{formatJapaneseDate date}}` - 和暦日付フォーマット
- `{{eq a b}}`, `{{ne a b}}`, `{{gt a b}}`, `{{lt a b}}` - 比較演算子
- `{{length array}}` - 配列長
- `{{truncate str length}}` - 文字列切り詰め

### LayoutHelper

PDFレイアウト計算ユーティリティ。

**機能:**
- ページ寸法計算（A4、A3、Letter、Legal）
- コンテンツサイズ計算
- マージンパースとCSS生成
- テーブルスタイル生成

## ジェネレーター (Generators)

### ContractPdfGenerator

契約書PDF生成。

```typescript
import { generateContractPdf, createMockContractData } from '@/lib/pdf';

const data = createMockContractData();
const result = await generateContractPdf(data, { outputPath: '/path/to/contract.pdf' });

if (result.success) {
  console.log('PDF generated:', result.filePath);
}
```

### SpecSheetPdfGenerator

仕様書PDF生成。

```typescript
import { generateSpecSheetPdf, createMockSpecSheetData } from '@/lib/pdf';

const data = createMockSpecSheetData();
const result = await generateSpecSheetPdf(data, {
  format: 'A4',
  includePricing: true,
});
```

### QuotationPdfGenerator

見積書PDF生成。

```typescript
import { generateQuotationPdf } from '@/lib/pdf';

const data: QuotationData = {
  quoteNumber: 'QT-2024-001',
  issueDate: '2024-04-01',
  validUntil: '2024-07-01',
  issuer: { /* ... */ },
  recipient: { /* ... */ },
  items: [ /* ... */ ],
};

const result = await generateQuotationPdf(data);
```

## クライアント側PDF生成 (Client-Side PDF Generation)

ブラウザ環境でのPDF生成もサポートしています。

```typescript
import { ClientPdfAdapter } from '@/lib/pdf';

// HTML要素からPDF生成
const result = await ClientPdfAdapter.generateFromHtml({
  element: '#pdf-content',
  filename: 'document.pdf',
  scale: 2,
});

// PDFをダウンロード
ClientPdfAdapter.downloadPdf(result.dataUrl, 'document.pdf');
```

**必要なライブラリ:**
- html2canvas
- jsPDF

## テスト (Tests)

テストは `src/tests/pdf/` ディレクトリに配置されています。

```bash
# 全PDFテスト実行
npm test -- pdf

# 特定のテストファイル
npm test -- base-generator.test
npm test -- font-manager.test
npm test -- template-manager.test
npm test -- layout-helper.test
npm test -- contract-generator.test
npm test -- specsheet-generator.test
npm test -- quotation-generator.test
```

## 使用例 (Usage Examples)

### 基本的なPDF生成

```typescript
import { generateContractPdf } from '@/lib/pdf';
import type { ContractData } from '@/types/contract';

const data: ContractData = {
  contractNumber: 'CTR-2024-001',
  issueDate: '2024-04-01',
  effectiveDate: '2024-04-15',
  buyer: { /* ... */ },
  seller: { /* ... */ },
  items: [ /* ... */ ],
  terms: { /* ... */ },
};

const result = await generateContractPdf(data, {
  format: 'A4',
  orientation: 'portrait',
  outputPath: './output/contract.pdf',
});

if (!result.success) {
  console.error('PDF generation failed:', result.error);
}
```

### カスタムフォント使用

```typescript
import { ContractPdfGenerator, FontManager } from '@/lib/pdf';

const fontManager = new FontManager();
fontManager.setFont('zenMaruGothic');

const generator = new ContractPdfGenerator({
  customCss: fontManager.generateFontCss(),
});

const result = await generator.generate(data);
```

### Base64エンコードされたPDF取得

```typescript
import { generateContractPdfBase64 } from '@/lib/pdf';

const { success, base64, error } = await generateContractPdfBase64(data);

if (success && base64) {
  // APIレスポンスとして返送
  return { pdf: base64 };
}
```

### データバリデーション

```typescript
import { validateContractData } from '@/lib/pdf';

const { isValid, errors } = validateContractData(data);

if (!isValid) {
  console.error('Validation errors:', errors);
}
```

## 移行ガイド (Migration Guide)

### 既存コードからの移行

既存のジェネレーター関数はそのまま使用できます。

```typescript
// 既存コード（変更なし）
import { generateContractPdf } from '@/lib/pdf/contractPdfGenerator';
// 新しいインポート（推奨）
import { generateContractPdf } from '@/lib/pdf';
```

### 新規ジェネレーターの作成

BasePdfGeneratorを継承して新しいジェネレーターを作成できます。

```typescript
import { BasePdfGenerator } from '@/lib/pdf';

class InvoicePdfGenerator extends BasePdfGenerator<InvoiceData, PdfResult> {
  constructor() {
    super({
      templatePath: 'templates/invoice.html',
      defaultPdfOptions: { format: 'A4' },
    });
  }

  protected prepareTemplateData(data: InvoiceData): Record<string, unknown> {
    return {
      invoiceNumber: data.invoiceNumber,
      items: data.items.map(item => ({
        ...item,
        price: this.formatCurrency(item.price),
      })),
    };
  }

  protected validateData(data: InvoiceData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data.invoiceNumber) errors.push('Invoice number required');
    return { isValid: errors.length === 0, errors };
  }

  protected estimateSize(data: InvoiceData): number {
    return 1000 + data.items.length * 200;
  }
}
```

## パフォーマンス最適化 (Performance Optimization)

- テンプレートキャッシュが有効になっています
- Playwrightブラウザは各生成後に適切にクリーンアップされます
- フォントはGoogle Fontsから遅延ロードされます

## 依存関係 (Dependencies)

- `playwright` - PDF生成
- `handlebars` - テンプレートエンジン
- `@types/handlebars` - TypeScript型定義

## 注意事項 (Notes)

- テンプレートファイルは `templet/` ディレクトリに配置してください
- 日本語フォントを使用するには、インターネット接続が必要です（Google Fontsからロード）
- PDF生成はサーバーサイドでの実行を推奨します

## ライセンス (License)

MIT
