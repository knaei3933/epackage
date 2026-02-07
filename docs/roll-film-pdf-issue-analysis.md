# Roll Film PDF Post-Processing Options Analysis

## Summary

The PDF shows post-processing options (実幅, 封入方向, etc.) in the "製品仕様" (Product Specifications) section for roll film products, when these should only appear for pouch products.

## Root Cause Analysis

### 1. Database Issue (Data Layer)

The `debug-roll-film-specs.js` script revealed that **roll film products DO have `postProcessingOptions` stored in the database**:

```json
{
  "bagTypeId": "roll_film",
  "postProcessingOptions": ["glossy"],
  "width": 356,
  "pitch": 86,
  // ... other fields
}
```

**Found in all 11 recent roll film quotation items** - each has `postProcessingOptions: ["glossy"]` stored.

### 2. Data Flow Analysis

#### Step 1: Quote Creation (Frontend)
- When creating a quote, the quote wizard allows selecting post-processing options (like "glossy" finish)
- These options are saved to `quotation_items.specifications.postProcessingOptions`
- **Issue**: No filtering based on product type (roll_film vs pouch)

#### Step 2: Data Extraction (`src/lib/excel/excelDataMapper.ts`)

The `extractProductSpecifications()` function (lines 215-292):

```typescript
const isRollFilm =
  productType === 'roll_film' ||
  productType === 'ロールフィルム' ||
  (dimensions.includes('幅') && dimensions.includes('ピッチ')) ||
  (dimensions.includes('mm') && !dimensions.includes('×'))
```

**Correctly detects roll film products** and sets pouch-only fields to empty:

```typescript
if (isRollFilm) {
  return {
    ...baseSpecs,
    sealWidth: '',        // Empty for roll film
    fillDirection: '',    // Empty for roll film
    notchShape: '',       // Empty for roll film
    // ... other pouch-only fields set to empty
  }
}
```

#### Step 3: Excel Cell Mapping (`generateCellMappings()`)

**Lines 503-568 map ALL fields to Excel cells regardless of product type**:

```typescript
mappings.push({
  sheet,
  cell: QUOTATION_CELL_LOCATIONS.SEAL_WIDTH,
  value: `シール幅: ${data.specifications.sealWidth}`  // Always written!
})
mappings.push({
  sheet,
  cell: QUOTATION_CELL_LOCATIONS.FILL_DIRECTION,
  value: `封入方向: ${data.specifications.fillDirection}`  // Always written!
})
// ... all other fields
```

Even though these fields are empty strings for roll film, the **labels are still rendered**:
- `シール幅: ` (Seal Width: )
- `封入方向: ` (Fill Direction: )
- etc.

### 3. The Real Issue

The PDF/Excel template **always shows all specification labels** regardless of:
1. Whether the field has a value
2. Whether the product type supports that field

## Solution Options

### Option A: Filter Empty Fields (Recommended)
Modify `generateCellMappings()` to skip fields with empty values:

```typescript
// Only add seal width if it has a value
if (data.specifications.sealWidth) {
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.SEAL_WIDTH,
    value: `シール幅: ${data.specifications.sealWidth}`
  })
}
```

**Pros:**
- Clean, simple fix
- Works for all product types
- No template changes needed

**Cons:**
- Need to add conditional checks for each pouch-only field

### Option B: Product Type Based Filtering
Add a field to `ProductSpecifications` indicating product type, then filter based on that:

```typescript
// In ProductSpecifications interface
isRollFilm: boolean

// In generateCellMappings()
if (!data.specifications.isRollFilm) {
  // Only add pouch-specific fields for pouch products
  if (data.specifications.sealWidth) {
    mappings.push({ /* ... */ })
  }
}
```

**Pros:**
- More explicit product type handling
- Easier to maintain

**Cons:**
- Requires type changes
- More extensive refactoring

### Option C: Fix at Source (Quote Creation)
Prevent `postProcessingOptions` from being saved for roll film products:

```typescript
// In quote submission handler
if (bagTypeId === 'roll_film') {
  // Remove pouch-only post-processing options
  delete specifications.postProcessingOptions
  // Keep only roll-film specific options like finish (glossy/matte)
}
```

**Pros:**
- Fixes data at the source
- Prevents future issues

**Cons:**
- May affect other parts of the system
- Need to handle surface finish separately from other post-processing

## Recommendation

**Implement Option A (Filter Empty Fields)** first as it's:
1. The quickest fix
2. Least invasive
3. Works for the immediate PDF issue

Then consider **Option C (Fix at Source)** for a more robust long-term solution.

## Files to Modify

1. **`src/lib/excel/excelDataMapper.ts`** (lines 503-568)
   - Add conditional checks before adding pouch-only field mappings

2. **`src/components/quote/PostProcessingStep.tsx`** (or similar)
   - Disable pouch-only options when roll film is selected
   - Keep surface finish options (glossy/matte) for all products

3. **API route handling quote submission**
   - Filter out inappropriate post-processing options based on product type

## Test Verification

After implementing fixes:
1. Create a new roll film quotation
2. Verify PDF doesn't show pouch-only fields
3. Verify pouch quotations still show all fields correctly
4. Run `debug-roll-film-specs.js` to verify database doesn't have inappropriate fields

## Database Cleanup

After fixing the code, consider running a migration to clean up existing roll film records:

```sql
UPDATE quotation_items
SET specifications = specifications - 'postProcessingOptions'
WHERE specifications->>'bagTypeId' = 'roll_film'
  AND specifications ? 'postProcessingOptions';
```

**Note:** Be careful not to remove surface finish options if they should apply to roll film.
