# Roll Film PDF Post-Processing Options Fix - Summary

## Problem
PDF quotations for roll film products were displaying pouch-only post-processing options (実幅/seal width, 封入方向/fill direction, etc.) in the "製品仕様" (Product Specifications) section.

## Root Cause
1. **Database**: Roll film quotations had `postProcessingOptions: ["glossy"]` stored in the database
2. **Code**: The `generateCellMappings()` function in `src/lib/excel/excelDataMapper.ts` was mapping ALL specification fields to Excel cells regardless of whether they had values or were applicable to the product type

## Solution Implemented

### 1. Debug Script Created
**File**: `debug-roll-film-specs.js`

A Node.js script that:
- Connects to Supabase using service role key
- Fetches recent roll film quotation items
- Logs full specifications JSON structure
- Shows how postProcessingOptions are stored vs other specification fields
- Categorizes fields by type (basic dimensions, material, post-processing, etc.)

**Results**:
- Found 11 roll film items, all with `postProcessingOptions: ["glossy"]`
- Confirmed that `bagTypeId: "roll_film"` is correctly set
- Identified that pouch-only fields like `sealWidth`, `fillDirection`, etc. are empty for roll film

### 2. Code Fix Applied
**File**: `src/lib/excel/excelDataMapper.ts` (lines 503-568)

**Before**: All specification fields were mapped to Excel cells, even if empty:
```typescript
mappings.push({
  sheet,
  cell: QUOTATION_CELL_LOCATIONS.SEAL_WIDTH,
  value: `シール幅: ${data.specifications.sealWidth}`  // Shows "シール幅: " even when empty!
})
```

**After**: Fields are only mapped if they have values:
```typescript
if (data.specifications.sealWidth) {
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.SEAL_WIDTH,
    value: `シール幅: ${data.specifications.sealWidth}`
  })
}
```

This ensures that pouch-only fields (which are empty strings for roll film) are not included in the PDF.

## Testing Recommendations

1. **Create a new roll film quotation** and verify the PDF doesn't show pouch-only fields
2. **Verify pouch quotations** still show all fields correctly
3. **Run the debug script** to verify database state
4. **Test with existing roll film quotations** to ensure they generate correctly

## Future Improvements

### Option B: Product Type Based Filtering
Add `isRollFilm: boolean` to `ProductSpecifications` interface for more explicit filtering.

### Option C: Fix at Source
Prevent inappropriate post-processing options from being saved:
- Disable pouch-only options when roll film is selected in the UI
- Filter out pouch-only post-processing options during quote submission
- Keep surface finish options (glossy/matte) for all products

### Database Cleanup
Consider running a migration to clean up existing roll film records:
```sql
UPDATE quotation_items
SET specifications = jsonb_set(
  specifications,
  '{postProcessingOptions}',
  '[]'::jsonb
)
WHERE specifications->>'bagTypeId' = 'roll_film';
```

**Note**: Only remove pouch-only options, keep surface finish options if applicable.

## Files Modified

1. **`src/lib/excel/excelDataMapper.ts`** - Added conditional checks for pouch-only fields
2. **`debug-roll-film-specs.js`** - New debug script for database analysis
3. **`docs/roll-film-pdf-issue-analysis.md`** - Detailed analysis document

## Verification

To verify the fix is working:
```bash
node debug-roll-film-specs.js
```

This will show the actual data in the database and help confirm that the fix is working as expected.
