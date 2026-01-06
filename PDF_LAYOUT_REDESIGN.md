# PDF Layout Redesign

## Changes Made

Redesigned the Japanese quotation PDF layout to match the new specifications:

### New Layout Structure
1. **Header**: Date (left) + Number (right)
2. **Title**: 見積書 centered
3. **Main Layout**: Two-column flexbox
   - **Left Panel** (80mm): Payment terms, Specs, Optional Processing, Remarks
   - **Right Panel** (flexible): Customer Info Box, Company Info Box
4. **Order Table**: Full-width table at bottom

### CSS Updates
- Added `.main-layout` with flexbox for left/right split
- Added `.left-content` (80mm fixed width)
- Added `.right-panel` with left border (#D3E4E4)
- Added `.info-box` for customer and company sections
- Added `.order-table-title` for centered order table heading
- Updated `.terms-table` for compact left panel display

### File Modified
- `src/lib/pdf-generator.ts`
  - Updated CSS styles (lines 960-1100)
  - Reorganized HTML structure (lines 1148-1350+)

## Testing
Generate a test PDF to verify the new layout displays correctly with:
- Left panel properly constrained to 80mm
- Right panel filling remaining space
- Info boxes with proper borders and titles
- Order table spanning full width at bottom
- All content properly aligned and readable
