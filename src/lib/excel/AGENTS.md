# AGENTS.md - Excel Quotation System

<!-- Parent: ../AGENTS.md -->

## Purpose

Excel quotation generation system for Japanese business quotations (見積書). Handles database-to-Excel transformation, processing options mapping, and PDF conversion for EPACKAGE Lab's B2B quotation workflow.

## Architecture Overview

```
src/lib/excel/
├── excelQuotationTypes.ts      # Type definitions (QuotationData, CustomerInfo, etc.)
├── excelDataMapper.ts          # Database → Excel data transformation
├── processingOptionMapper.ts   # Processing options to Excel format
├── excelGenerator.ts           # Excel file generation (ExcelJS)
├── quotationToPdfMapper.ts     # QuotationData → QuoteData for PDF
├── pdfConverter.tsx            # Server-side PDF generation (@react-pdf/renderer)
├── clientPdfGenerator.tsx      # Client-side PDF generation
├── excelTemplateLoader.ts      # Template loading utilities
├── index.ts                     # Public API exports
└── __tests__/                  # Unit tests
```

## Key Files

### Core Types: `excelQuotationTypes.ts`

Complete TypeScript type definitions for the quotation system:

- **QuotationData**: Complete quotation document structure
- **CustomerInfo**: Customer company details
- **SupplierInfo**: EPACKAGE Lab supplier information (default: 金井貿易株式会社)
- **PaymentTerms**: Payment and delivery terms
- **ProductSpecifications**: 13 specification items + surface finish
- **OrderItem**: Individual order line items
- **OrderSummary**: Totals, tax calculations
- **OptionalProcessing**: 7 boolean options (zipper, notch, hangingHole, cornerRound, gasVent, easyCut, embossing)

### Data Transformation: `excelDataMapper.ts`

Maps database records to Excel cell format:

- `mapDatabaseQuotationToExcel()`: Main transformation function
- `extractProductSpecifications()`: Handles both pouch types and roll_film
- `extractProcessingOptions()`: Maps postProcessingOptions array
- `calculateOrderSummary()`: 10% Japanese consumption tax
- `generateCellMappings()`: Cell reference generation
- `formatJapaneseDate()`: YYYY年MM月DD日 format

### Processing Options: `processingOptionMapper.ts`

Maps database option IDs to Excel format:

```typescript
// Database IDs → Excel keys
'zipper-yes'       → ziplock: true
'notch-yes'        → notch: true
'hang-hole-6mm'    → hangingHole: true
'corner-round'     → cornerRound: true
'valve-yes'        → gasVent: true
'tear-notch'       → easyCut: true
'die-cut-window'   → embossing: true
```

Key functions:
- `mapProcessingOptionsToExcel()`: ID array → OptionalProcessing
- `formatProcessingOptionsForDisplay()`: For Excel checkbox (○/-)
- `calculateProcessingPriceImpact()`: Multiplier calculation

### Excel Generation: `excelGenerator.ts`

Generates Excel files using ExcelJS:

```typescript
const result = await generateExcelQuotation(quotationData, {
  format: 'xlsx',
  includeWatermark: true,
  includeFormulas: true
})
```

Cell locations (from `QUOTATION_CELL_LOCATIONS`):
- Title: D1
- Customer: A3:A5
- Supplier: G3:J8
- Payment terms: A7:B12
- Specifications: A14:C27
- Order table: E14:J16+
- Processing options: A32:B40

### PDF Conversion: `pdfConverter.tsx` (Server-side)

Server-side PDF generation using @react-pdf/renderer:

- `QuotationPDFDocument`: React component for PDF structure
- `generatePdfBuffer()`: Returns Uint8Array for API responses
- `generatePdfBase64()`: Base64 string for storage
- Japanese font support: Noto Sans JP (with fallback to Helvetica)

### Client PDF: `clientPdfGenerator.tsx`

Client-side PDF generation for browser download:

- `generatePdfBlob()`: Creates Blob for download
- `downloadPdf()`: Triggers browser download
- Font loading: Google Fonts CDN (gstatic) with fallback to unpkg

### Type Mapping: `quotationToPdfMapper.ts`

Converts between Excel format and PDF generator format:

```typescript
mapQuotationDataToQuoteData(quotationData: QuotationData): QuoteData
```

## Dependencies

### Runtime
- `exceljs`: Excel file generation
- `@react-pdf/renderer`: PDF generation
- `@fontsource/noto-sans-jp`: Japanese font support

### Dev
- `@types/exceljs`: TypeScript types for ExcelJS
- `vitest`: Unit testing framework

## For AI Agents

### Excel Pattern Recognition

When working with Excel quotation data, recognize these patterns:

1. **Product Type Detection**:
   - Roll film: `productType === 'roll_film'` OR dimensions contain both "幅" and "ピッチ"
   - Pouch types: stand_pouch, flat_pouch, gusset, gassho

2. **Processing Options Format**:
   - Database stores as array: `['zipper-yes', 'glossy', 'notch-yes']`
   - Excel format uses booleans: `{ ziplock: true, notch: true }`
   - Display format: `{ name: 'チャック', value: '○' }`

3. **Japanese Number Formatting**:
   - Currency: `¥1,000,000` (use `formatJapaneseYen()`)
   - Dates: `令和6年4月1日` or `2025年4月1日`
   - Checkboxes: `○` (enabled) / `-` (disabled)

4. **Cell Reference Pattern**:
   - Labels in column A: `A14` = "仕様番号"
   - Values in column B: `B14` = "L"
   - Order table starts at E14
   - Processing options start at A32

### Common Tasks

**Adding a new processing option**:
1. Add to `OptionalProcessing` type in `excelQuotationTypes.ts`
2. Add mapping in `PROCESSING_OPTION_MAP` (processingOptionMapper.ts)
3. Update `extractProcessingOptions()` (excelDataMapper.ts)
4. Add display in `setProcessingOptions()` (excelGenerator.ts)

**Extending product specifications**:
1. Add field to `ProductSpecifications` type
2. Handle in `extractProductSpecifications()` (note roll_film vs pouch)
3. Add to `specRows` array in `setProductSpecifications()`

**Debugging cell mappings**:
- Check `QUOTATION_CELL_LOCATIONS` constants
- Verify `generateCellMappings()` output
- Ensure column widths accommodate content

### Data Flow

```
Database quotations table
    ↓ (mapDatabaseQuotationToExcel)
QuotationData (Excel format)
    ↓ (generateExcelQuotation)
Excel file (.xlsx)
    ↓ (user download)
Customer receives quotation

OR

QuotationData (Excel format)
    ↓ (mapQuotationDataToQuoteData)
QuoteData (PDF format)
    ↓ (generatePdfBuffer)
PDF file (.pdf)
    ↓ (API response)
Browser downloads PDF
```

### Testing Patterns

```typescript
// Test processing option mapping
const result = mapProcessingOptionsToExcel(['zipper-yes', 'notch-yes'])
expect(result.ziplock).toBe(true)
expect(result.notch).toBe(true)

// Test roll film detection
const specs = extractProductSpecifications({
  bagType: 'roll_film',
  dimensions: '幅: 356mm、ピッチ: 86mm'
})
expect(specs.productType).toBe('roll_film')
expect(specs.sealWidth).toBe('') // Pouch-only field should be empty
```

## Related Documentation

- `EXCEL_EXPORT_USAGE.md`: Complete implementation guide with examples
- `quote_data_mapping.md`: Excel cell location specifications (if exists)
- Parent: `../AGENTS.md` for broader system context
