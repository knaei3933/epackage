# Excel Quotation System - Complete Implementation Guide

## Overview

This system generates Japanese business quotation documents (見積書) in Excel format based on exact cell mappings from `quote_data_mapping.md`.

## Architecture

```
src/lib/excel/
├── excelQuotationTypes.ts      # Complete TypeScript type definitions
├── processingOptionMapper.ts   # Processing options to Excel format
├── excelDataMapper.ts          # Database → Excel data transformation
└── excelGenerator.ts           # Excel file generation with ExcelJS
```

## Installation

Required package:
```bash
npm install exceljs
npm install --save-dev @types/exceljs
```

## Complete Usage Example

### 1. Client-Side Export Request

```typescript
/**
 * Export quotation to Excel from client
 */
async function exportQuotationToExcel(quotationId: string) {
  try {
    const response = await fetch(`/api/b2b/quotations/${quotationId}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        format: 'xlsx',
        includeWatermark: true,
        includeFormulas: true
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Export failed')
    }

    // Get filename from headers
    const fileName = response.headers.get('X-Filename') ||
                     `quotation_${quotationId}.xlsx`

    // Download file
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    window.URL.revokeObjectURL(url)

    return { success: true, fileName }
  } catch (error) {
    console.error('Export error:', error)
    return { success: false, error: error.message }
  }
}
```

### 2. Server-Side Generation

```typescript
import { generateExcelQuotation } from '@/lib/excel/excelGenerator'
import { QuotationData } from '@/lib/excel/excelQuotationTypes'

// Example quotation data
const quotationData: QuotationData = {
  metadata: {
    quotationNumber: 'QT-2025-0001',
    issueDate: '2025年12月31日',
    validDate: '2026年01月31日',
    status: 'sent',
    version: 'v1.0'
  },

  customer: {
    companyName: '有限会社加豆フーズ',
    companyNameEn: 'Kato Foods Co., Ltd.',
    postalCode: '〒379-2311',
    address: '群馬県みどり市懸町阿佐美1940',
    contactPerson: '山田 太郎',
    email: 'yamada@katofoods.jp',
    phone: '090-1234-5678'
  },

  supplier: {
    brandName: 'EPACKAGE Lab',
    subBrand: 'by kanei-trade',
    description: 'オーダーメイドバッグ印刷専門',
    companyName: '金井貿易株式会社',
    postalCode: '〒673-0846',
    address: '兵庫県明石市上ノ丸2-11-21-102',
    phone: 'TEL: 080-6942-7235',
    email: 'info@epackage-lab.com'
  },

  paymentTerms: {
    paymentMethod: '先払い',
    submissionDeadline: '指定なし',
    proofDeadline: '指定なし',
    paymentDeadline: '校了前',
    deliveryDate: '校了から約1か月',
    bankInfo: 'PayPay銀行 ビジネス営業部支店(005)普通 5630235'
  },

  specifications: {
    specNumber: 'L',
    pouchType: 'スタンドパウチ',
    pouchTypeEn: 'Stand Pouch',
    contents: '粉体',
    size: '130×130×60',
    material: 'PET12μ+AL7μ+PET12μ+LLDPE60',
    sealWidth: '5mm',
    fillDirection: '上',
    notchShape: 'V',
    notchPosition: '指定位置',
    hangingHole: false,
    hangingPosition: '指定位置',
    ziplockPosition: '指定位置',
    cornerRadius: 'R5'
  },

  orders: [
    {
      no: 1,
      skuCount: 1,
      quantity: 5000,
      unitPrice: 73.9,
      discount: 0,
      total: 369500
    },
    {
      no: 2,
      skuCount: 1,
      quantity: 10000,
      unitPrice: 53.6,
      discount: 0,
      total: 536000
    }
  ],

  orderSummary: {
    totalSkuCount: 2,
    totalQuantity: 15000,
    subtotal: 905500,
    taxRate: 0.10,
    taxAmount: 90550,
    totalWithTax: 996050
  },

  options: {
    ziplock: true,
    notch: true,
    hangingHole: false,
    cornerRound: true,
    gasVent: false,
    easyCut: false,
    embossing: false
  },

  watermark: {
    text: '申101入',
    position: 'center',
    style: {
      fontSize: 48,
      color: '#CCCCCC',
      opacity: 0.3
    }
  }
}

// Generate Excel file
const result = await generateExcelQuotation(quotationData, {
  format: 'xlsx',
  includeWatermark: true,
  outputPath: '/public/quotations'
})

if (result.success) {
  console.log(`Excel generated: ${result.filePath}`)
  console.log(`Filename: ${result.fileName}`)
}
```

### 3. Processing Options Mapping

```typescript
import {
  mapProcessingOptionsToExcel,
  formatProcessingOptionsForDisplay,
  calculateProcessingPriceImpact
} from '@/lib/excel/processingOptionMapper'
import { processingOptionsConfig } from '@/components/quote/processingConfig'

// Selected processing options from database
const selectedOptions = [
  'zipper-yes',
  'notch-yes',
  'corner-round'
]

// Map to Excel format
const excelOptions = mapProcessingOptionsToExcel(selectedOptions)
console.log(excelOptions)
// {
//   ziplock: true,
//   notch: true,
//   hangingHole: false,
//   cornerRound: true,
//   gasVent: false,
//   easyCut: false,
//   embossing: false
// }

// Format for display in Excel
const displayOptions = formatProcessingOptionsForDisplay(excelOptions)
console.log(displayOptions)
// [
//   { name: 'チャック', value: '○' },
//   { name: 'ノッチ', value: '○' },
//   { name: '吊り下げ穴', value: '-' },
//   { name: '角加工', value: '○' },
//   ...
// ]

// Calculate price impact
const priceImpact = calculateProcessingPriceImpact(
  selectedOptions,
  processingOptionsConfig
)
console.log(priceImpact)
// {
//   totalMultiplier: 1.204,
//   breakdown: [
//     { optionId: 'zipper-yes', name: '지퍼 있음', nameJa: 'ジッパーあり', multiplier: 1.12 },
//     { optionId: 'notch-yes', name: '노치 있음', nameJa: 'ノッチあり', multiplier: 1.03 },
//     { optionId: 'corner-round', name: '모서리 둥근', nameJa: '角丸', multiplier: 1.05 }
//   ],
//   processingTime: '+2 business days',
//   minimumQuantity: 1000
// }
```

### 4. Database Integration Example

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { mapDatabaseQuotationToExcel } from '@/lib/excel/excelDataMapper'
import { generateExcelQuotation } from '@/lib/excel/excelGenerator'

async function generateQuotationFromDatabase(
  quotationId: string,
  supabase: ReturnType<typeof createRouteHandlerClient>
) {
  // Fetch quotation data
  const { data: quotation } = await supabase
    .from('quotations')
    .select('*')
    .eq('id', quotationId)
    .single()

  // Fetch quotation items
  const { data: items } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quotationId)
    .order('display_order')

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', quotation.user_id)
    .single()

  // Transform to Excel format
  const excelData = await mapDatabaseQuotationToExcel(
    quotation,
    items || [],
    profile || undefined
  )

  // Generate Excel file
  const result = await generateExcelQuotation(excelData, {
    format: 'xlsx',
    includeWatermark: true,
    outputPath: process.env.QUOTATION_EXPORT_PATH || '/tmp/quotations'
  })

  return result
}
```

## React Component Integration

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet } from 'lucide-react'

interface QuotationExportButtonProps {
  quotationId: string
  quotationNumber: string
}

export function QuotationExportButton({
  quotationId,
  quotationNumber
}: QuotationExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/b2b/quotations/${quotationId}/export`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            format: 'xlsx',
            includeWatermark: true
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to export quotation')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${quotationNumber}_見積書.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div>
      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="w-4 h-4" />
        <Download className="w-4 h-4" />
        {isExporting ? '生成中...' : 'Excel見積書をダウンロード'}
      </Button>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}
```

## Cell Reference Summary

| Section | Cell Range | Description |
|---------|-----------|-------------|
| Title | D1:F1 | 文書タイトル (見積書) |
| Customer Info | A3:A5 | 顧客情報 |
| Supplier Info | G3:J8 | 供給業者情報 |
| Payment Terms | A7:B12 | 支払条件 |
| Specifications | A14:C27 | 製品仕様 (13項目) |
| Order Header | E14:J14 | 注文テーブルヘッダー |
| Order Data | E15:J16+ | 注文データ (可変) |
| Options Header | A32:B32 | オプション加工ヘッダー |
| Options Data | A33:B40 | オプション加工データ (8項目) |
| Watermark | E24:F26 | 透かし (申101入) |

## Processing Options Mapping

| Database ID | Excel Key | Display Name | Checkbox |
|-------------|-----------|--------------|----------|
| zipper-yes | ziplock | チャック | ○ |
| notch-yes | notch | ノッチ | ○ |
| hang-hole-6mm | hangingHole | 吊り下げ穴 | ○ |
| corner-round | cornerRound | 角加工 | ○ |
| valve-yes | gasVent | ガス抜きバルブ | ○ |
| tear-notch | easyCut | Easy Cut | ○ |
| die-cut-window | embossing | 型抜き | ○ |

## API Endpoints

### POST /api/b2b/quotations/[id]/export

Generate Excel quotation file.

**Request:**
```json
{
  "format": "xlsx",
  "includeWatermark": true,
  "includeFormulas": true
}
```

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Headers:
  - `Content-Disposition`: attachment with filename
  - `X-Quotation-Number`: Quotation number
  - `X-Generated-At`: Generation timestamp

**Errors:**
- 400: Missing quotation ID
- 401: Unauthorized
- 404: Quotation not found
- 500: Generation error

### GET /api/b2b/quotations/[id]/export

Download previously generated Excel file.

**Response:**
- Excel file binary
- Same headers as POST

## Environment Variables

```env
# Optional: Custom export path
QUOTATION_EXPORT_PATH=/public/quotations

# Required: Supabase (for database access)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Testing

```typescript
import { describe, it, expect } from 'vitest'
import { mapProcessingOptionsToExcel } from '@/lib/excel/processingOptionMapper'

describe('Excel Quotation System', () => {
  it('should map processing options correctly', () => {
    const selected = ['zipper-yes', 'notch-yes']
    const result = mapProcessingOptionsToExcel(selected)

    expect(result.ziplock).toBe(true)
    expect(result.notch).toBe(true)
    expect(result.hangingHole).toBe(false)
  })

  it('should format options for Excel display', () => {
    const options = {
      ziplock: true,
      notch: false,
      hangingHole: true
    }

    const display = formatProcessingOptionsForDisplay(options)

    expect(display[0].value).toBe('○') // ziplock
    expect(display[1].value).toBe('-')  // notch
    expect(display[2].value).toBe('○') // hangingHole
  })
})
```

## Troubleshooting

### Issue: Excel file not generated
- Check ExcelJS is installed: `npm list exceljs`
- Verify quotation data is complete
- Check file system write permissions

### Issue: Processing options not showing
- Verify option IDs match database IDs
- Check mapping configuration in `processingOptionMapper.ts`
- Ensure specifications JSON includes `processingOptions` array

### Issue: Japanese characters display incorrectly
- Ensure UTF-8 encoding
- Check font supports Japanese characters (Noto Sans JP)
- Verify Excel version supports Unicode

## Performance Considerations

- Excel generation typically takes < 1 second for standard quotations
- Large quotations (50+ items) may take 2-3 seconds
- Consider caching generated files for repeated downloads
- Use streaming for very large files (>10MB)

## Security Notes

- API validates user owns the quotation before export
- Files are generated in secure temporary location
- Old files should be cleaned up periodically
- Consider adding rate limiting for export endpoint

## Future Enhancements

- [ ] Add PDF export option using jsPDF
- [ ] Support for multi-language templates
- [ ] Custom branding/logo upload
- [ ] Bulk quotation export
- [ ] Email quotation directly to customer
- [ ] Version history and diff viewer
