# PDF Generation Module

<!-- Parent: ../AGENTS.md -->

## Purpose

PDF generation module for creating Japanese B2B business documents including:
- **契約書 (Contracts)** - Sales/purchase agreements with legal formatting
- **仕様書 (Specification Sheets)** - Technical product specifications
- **見積書 (Quotations)** - Price quotes and estimates (via parent pdf-generator.ts)

## Key Files

| File | Purpose | Exported Functions |
|------|---------|-------------------|
| `specSheetPdfGenerator.ts` | Product specification sheet PDF generation | `generateSpecSheetPdf()`, `generateSpecSheetPdfBase64()`, `validateSpecSheetData()`, `createMockSpecSheetData()` |
| `contractPdfGenerator.ts` | Contract/agreement PDF generation | `generateContractPdf()`, `generateContractPdfBase64()`, `generateContractPdfWithStyling()`, `validateContractData()`, `createMockContractData()` |
| `__tests__/specSheetPdfGenerator.test.ts` | Spec sheet PDF generator tests | Test suite for spec sheet generation |
| `__tests__/contractPdfGenerator.test.ts` | Contract PDF generator tests | Test suite for contract generation |
| `../pdf-generator.ts` | Main PDF generator (parent directory) | Quote/invoice PDF generation with jsPDF |

## For AI Agents

### PDF Generation Patterns

Both generators follow a consistent pattern:

```typescript
// 1. Load HTML template (Handlebars)
const template = await loadTemplate();

// 2. Prepare template data from input
const templateData = prepareTemplateData(data);

// 3. Render HTML
const html = template(templateData);

// 4. Launch Playwright browser
const browser = await playwright.launch({ headless: true });
const page = await browser.newPage();

// 5. Set content and generate PDF
await page.setContent(html, { waitUntil: 'networkidle' });
const pdfBuffer = await page.pdf({ format: 'A4', ...options });

// 6. Cleanup
await browser.close();
```

### Template Location

Templates are stored in `templet/` directory at project root:
- `templet/specsheet_ja.html` - Japanese spec sheet template
- `templet/contract_ja_kanei_trade_improved.html` - Japanese contract template

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

## Related Modules

- `src/lib/pdf-generator.ts` - Main PDF generator using jsPDF for quotations
- `src/types/specsheet.ts` - Spec sheet type definitions
- `src/types/contract.ts` - Contract type definitions
- `src/types/signature.ts` - Digital signature types
- `templet/` - HTML templates for PDF generation

## Notes

- All generators use Playwright's chromium for consistent PDF rendering
- Japanese font support via Google Fonts (Noto Sans JP) in templates
- PDFs are generated in A4 portrait by default
- Template paths are relative to `process.cwd()` (project root)
- Browser cleanup is handled in finally blocks to prevent memory leaks
