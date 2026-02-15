# PDF Generation Module (Refactored)

<!-- Parent: ../AGENTS.md -->

## Purpose

リファクタリングされたPDF生成モジュール - 日本語B2Bドキュメント作成用統合システム

PDF generation module for creating Japanese B2B business documents including:
- **契約書 (Contracts)** - Sales/purchase agreements with legal formatting
- **仕様書 (Specification Sheets)** - Technical product specifications
- **見積書 (Quotations)** - Price quotes and estimates

## 新規アーキテクチャ (New Architecture)

リファクタリングにより、以下の構造化されたアーキテクチャを採用：

```
src/lib/pdf/
├── core/                      # コアコンポーネント（共通機能）
│   ├── base.ts               # BasePdfGenerator抽象クラス
│   ├── font-manager.ts       # Google Fonts管理
│   ├── template-manager.ts   # Handlebarsテンプレート管理
│   ├── layout-helper.ts      # PDFレイアウト計算
│   └── client-adapter.ts     # ブラウザ側PDF生成
├── generators/                # PDFジェネレーター（具象実装）
│   ├── contract-generator.ts    # 契約書生成器
│   ├── quotation-generator.ts   # 見積書生成器（新規）
│   └── specsheet-generator.ts   # 仕様書生成器
└── index.ts                  # 統一エクスポート
```

## Key Files

| File | Purpose | Exported Functions |
|------|---------|-------------------|
| `core/base.ts` | 抽象基底クラス - 全ジェネレーターの基本機能 | `BasePdfGenerator` class |
| `core/font-manager.ts` | フォント管理 - Google Fonts、日本語フォント | `FontManager`, `PREDEFINED_FONTS` |
| `core/template-manager.ts` | テンプレート管理 - Handlebars、キャッシュ | `TemplateManager` class |
| `core/layout-helper.ts` | レイアウト計算 - ページサイズ、マージン | `LayoutHelper`, `PAGE_SIZES` |
| `generators/contract-generator.ts` | 契約書PDF生成（リファクタリング済み） | `generateContractPdf()`, `validateContractData()` |
| `generators/specsheet-generator.ts` | 仕様書PDF生成（リファクタリング済み） | `generateSpecSheetPdf()`, `validateSpecSheetData()` |
| `generators/quotation-generator.ts` | 見積書PDF生成（新規追加） | `generateQuotationPdf()`, `validateQuotationData()` |
| `index.ts` | 統一エクスポート - すべての公開API | All public exports |

## For AI Agents

### 新規ジェネレーターの追加方法

1. **BasePdfGeneratorを継承**
```typescript
import { BasePdfGenerator } from '@/lib/pdf/core/base';

class MyPdfGenerator extends BasePdfGenerator<MyData, PdfResult> {
  protected prepareTemplateData(data: MyData): Record<string, unknown> {
    return { /* テンプレートデータ */ };
  }

  protected validateData(data: MyData): { isValid: boolean; errors: string[] } {
    return { isValid: true, errors: [] };
  }

  protected estimateSize(data: MyData): number {
    return 1000;
  }
}
```

2. **便利関数をエクスポート**
```typescript
export async function generateMyPdf(data: MyData, options?: PdfGenerationOptions) {
  const generator = new MyPdfGenerator();
  return generator.generate(data, options);
}

export function validateMyData(data: MyData) {
  const generator = new MyPdfGenerator();
  return generator.validateData(data);
}
```

3. **モックデータ関数を追加**
```typescript
export function createMockMyData(): MyData {
  return { /* テスト用モックデータ */ };
}
```

### PDF生成パターン（リファクタリング後）

全ジェネレーターはBasePdfGeneratorを継承し、統一されたパターンに従います：

```typescript
// 1. ジェネレーターインスタンス作成
const generator = new ContractPdfGenerator();

// 2. バリデーション（オプション）
const { isValid, errors } = generator.validateData(data);
if (!isValid) {
  console.error('Validation failed:', errors);
}

// 3. PDF生成
const result = await generator.generate(data, { outputPath: './output.pdf' });

// 4. 結果確認
if (result.success) {
  console.log('PDF saved to:', result.filePath);
} else {
  console.error('Generation failed:', result.error);
}
```

### コンポーネント使用例

**FontManager - フォント切り替え**
```typescript
import { FontManager } from '@/lib/pdf/core/font-manager';

const manager = new FontManager();
manager.setFont('zenMaruGothic'); // 丸ゴシック体に切り替え
const css = manager.generateFontCss();
```

**TemplateManager - カスタムテンプレート**
```typescript
import { TemplateManager } from '@/lib/pdf/core/template-manager';

const manager = new TemplateManager();
manager.registerTemplateFromString('custom', '<div>{{content}}</div>');
const template = await manager.getTemplate('custom');
```

**LayoutHelper - ページ計算**
```typescript
import { LayoutHelper } from '@/lib/pdf/core/layout-helper';

const width = LayoutHelper.calculateContentWidth('A4', 'portrait');
const style = LayoutHelper.generateTableStyle(true); // compact
```

### テンプレートの場所

Templates are stored in `templet/` directory at project root:
- `templet/specsheet_ja.html` - Japanese spec sheet template
- `templet/contract_ja_kanei_trade_improved.html` - Japanese contract template
- `templet/quotation_ja.html` - Japanese quotation template (to be created)

### Japanese Date Formatting

Both generators format dates using Japanese era system (wareki):

```typescript
// Returns: "令和6年4月1日" format
formatJapaneseDate(date: Date | string): string
```

Eras supported: 明治, 大正, 昭和, 平成, 令和

### Data Validation

Each generator provides validation:

```typescript
// Spec sheets
validateSpecSheetData(data: SpecSheetData): { isValid: boolean; errors: string[] }

// Contracts
validateContractData(data: ContractData): { isValid: boolean; errors: string[] }
```

Required fields are checked before PDF generation.

### Mock Data Creation

Both provide mock data for testing:

```typescript
createMockSpecSheetData(): SpecSheetData
createMockContractData(): ContractData
```

### Error Handling

PDF generation returns consistent result types:

```typescript
interface SpecSheetPdfResult {
  success: boolean;
  filePath?: string;
  buffer?: Buffer;
  base64?: string;
  error?: string;
  metadata?: {
    generatedAt: string;
    fileSize: number;
    pageCount?: number;
    specNumber: string;
    revision: string;
  };
}

interface PdfGenerationResult {
  success: boolean;
  filePath?: string;
  buffer?: Buffer;
  error?: string;
}
```

### Common Patterns When Adding New PDF Types

1. **Create types in `src/types/`** - Define data structures
2. **Create generator in `src/lib/pdf/`** - Follow existing patterns
3. **Create HTML template in `templet/`** - Use Handlebars syntax
4. **Add tests in `__tests__/`** - Test generation and validation
5. **Export from generator** - Provide main function, base64 variant, validation, mock data

## Dependencies

### Runtime Dependencies
- `playwright` - Headless browser for PDF rendering (chromium)
- `handlebars` - HTML template engine
- `fs` - File system operations
- `path` - Path manipulation

### Type Dependencies
- `@/types/specsheet` - SpecSheetData, SpecSheetPdfOptions, SpecSheetPdfResult
- `@/types/contract` - ContractData, PdfGenerationOptions, PdfGenerationResult
- `@/types/signature` - SignatureData for contract signatures

### Development Dependencies
- `@types/node` - Node.js types
- TypeScript - Type checking

## Template Data Structure

### Spec Sheet Template Data

```typescript
interface SpecSheetTemplateData {
  header: { companyName, address, phone, email, website };
  specSheet: { specNumber, revision, issueDate, title, categoryName };
  customer: { name, department, contactPerson };
  product: {
    name, productCode,
    dimensionsTable: DimensionRow[],
    materials: MaterialLayer[],
    specifications: SpecFeature[],
    performance?: PerformanceRow[],
    compliance?: string[]
  };
  production: { method, process, qualityControl, packaging, delivery };
  design?: { printing, colorGuide, designData };
  pricing?: { basePrice, moq, volumeDiscount };
  remarks?: string;
  approvals?: { preparedBy, approver1, approver2 };
}
```

### Contract Template Data

```typescript
// Mapped from ContractData to template variables
{
  contractNumber, issueDate, effectiveDate, validUntil, orderNumber,
  clientName, clientNameKana, clientAddress, clientRepresentative,
  supplierName, supplierNameKana, supplierAddress, supplierRepresentative,
  items: [{ ...item, unitPrice, amount }],
  totalAmount, subtotalAmount,
  paymentMethod, paymentDeadline, depositPercentage, depositAmount, bankInfo,
  deliveryPeriod, deliveryLocation, deliveryConditions,
  specialTerms, remarks,
  clientStamp, clientSignature, supplierStamp, supplierSignature,
  hasClientStamp, hasClientSignature, hasSupplierStamp, hasSupplierSignature
}
```

## Testing

Tests are located in `__tests__/` subdirectory:

```bash
# Run PDF tests
npm test -- src/lib/pdf/__tests__/
```

Test coverage includes:
- PDF generation with valid data
- Error handling for missing templates
- Data validation
- Mock data creation
- File output when outputPath provided
- Base64 encoding

## 使用例 (Usage Examples)

### 契約書PDF生成

```typescript
import { generateContractPdf, createMockContractData } from '@/lib/pdf';

const data = createMockContractData();
const result = await generateContractPdf(data, {
  format: 'A4',
  orientation: 'portrait',
  outputPath: './output/contract.pdf',
});

if (result.success) {
  console.log('契約書PDFが生成されました:', result.filePath);
}
```

### 仕様書PDF生成

```typescript
import { generateSpecSheetPdf, createMockSpecSheetData } from '@/lib/pdf';

const data = createMockSpecSheetData();
const result = await generateSpecSheetPdf(data, {
  includePricing: true,
  includeApproval: true,
});
```

### 見積書PDF生成（新規）

```typescript
import { generateQuotationPdf } from '@/lib/pdf';
import type { QuotationData } from '@/lib/pdf/generators/quotation-generator';

const data: QuotationData = {
  quoteNumber: 'QT-2024-001',
  issueDate: '2024-04-01',
  validUntil: '2024-07-01',
  issuer: { /* 見積元情報 */ },
  recipient: { /* 見積先情報 */ },
  items: [ /* 品目リスト */ ],
};

const result = await generateQuotationPdf(data);
```

### Base64エンコードPDF取得

```typescript
import { generateContractPdfBase64 } from '@/lib/pdf';

const { success, base64, error } = await generateContractPdfBase64(data);

if (success && base64) {
  // APIレスポンスとして返送可能
  return { pdf: base64, mimeType: 'application/pdf' };
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

## Dependencies

### Runtime Dependencies
- `playwright` - Headless browser for PDF rendering (chromium)
- `handlebars` - HTML template engine
- `fs` - File system operations
- `path` - Path manipulation

### Type Dependencies
- `@/types/specsheet` - SpecSheetData, SpecSheetPdfOptions, SpecSheetPdfResult
- `@/types/contract` - ContractData, PdfGenerationOptions, PdfGenerationResult
- `@/types/signature` - SignatureData for contract signatures

### Development Dependencies
- `@types/node` - Node.js types
- `jest` - Testing framework
- `@types/jest` - Jest type definitions

## テスト (Testing)

テストは `src/tests/pdf/` ディレクトリに配置されています：

```bash
# 全PDFテスト実行
npm test -- --testPathPatterns="pdf"

# コアコンポーネントテスト
npm test -- base-generator.test
npm test -- font-manager.test
npm test -- template-manager.test
npm test -- layout-helper.test

# ジェネレーターテスト
npm test -- contract-generator.test
npm test -- specsheet-generator.test
npm test -- quotation-generator.test
```

## 移行ガイド (Migration Guide)

### 既存コードからの移行

**以前のインポート:**
```typescript
import { generateContractPdf } from '@/lib/pdf/contractPdfGenerator';
```

**新しいインポート（推奨）:**
```typescript
import { generateContractPdf } from '@/lib/pdf';
```

機能は完全に互換性があります。

### 新規PDFタイプの追加

新しいPDFタイプを追加する場合：

1. `src/types/` で型定義を作成
2. `src/lib/pdf/generators/` でジェネレーターを作成
3. `src/lib/pdf/index.ts` にエクスポートを追加
4. `src/tests/pdf/` でテストを作成
5. `templet/` にHTMLテンプレートを配置

## Notes

- All generators use Playwright's chromium for consistent PDF rendering
- Japanese font support via Google Fonts (Noto Sans JP) in templates
- PDFs are generated in A4 portrait by default
- Template paths are relative to `process.cwd()` (project root)
- Browser cleanup is handled automatically to prevent memory leaks
- **新規**: 全ジェネレーターが共通の基底クラスを継承
- **新規**: フォント、テンプレート、レイアウト管理がモジュール化
- **新規**: 見積書ジェネレーターが追加された
- **新規**: クライアント側PDF生成がサポートされた
