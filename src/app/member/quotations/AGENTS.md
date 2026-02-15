<!-- Parent: ../../AGENTS.md -->

# src/app/member/quotations/ - Member Quotation Pages

**Purpose:** Member-facing quotation management pages - list, view details, PDF download, and convert to orders.

## Directory Structure

```
member/quotations/
├── page.tsx                    # Quotation list page (Server Component)
├── [id]/
│   └── page.tsx                # Quotation detail page (Client Component)
├── QuotationsClient.tsx        # Client component for list page
├── loader.ts                   # Server-side data fetching
├── loading.tsx                 # Loading fallback component
└── request/
    └── page.tsx                # Quotation request page
```

## Key Files

### List Page (`page.tsx`)
- **Server Component** - Fetches quotations server-side
- Pagination: 5 items per page
- Status filtering: all, draft, sent, approved, rejected, expired, converted
- Passes data to `QuotationsClient` for interactivity

```typescript
// Server-side data fetching pattern
const data = await fetchQuotationsServerSide(status, ITEMS_PER_PAGE, offset);
```

### Detail Page (`[id]/page.tsx`)
- **Client Component** - Interactive quotation detail view
- Features:
  - PDF download with Supabase storage save
  - Quotation deletion (draft status only)
  - Order conversion (approved status only)
  - Download history tracking
  - Detailed specifications display
- Helper functions for Japanese translation of bag types, materials, thickness

### Client Component (`QuotationsClient.tsx`)
- Handles filtering, pagination, and status changes
- SWR for real-time data updates
- Status badge rendering

### Loader (`loader.ts`)
- Server-side quotation fetching with authentication
- Joins with `quotation_items` table
- Orders by `created_at` DESC

## For AI Agents

### Quotation Page Patterns

When working with quotation pages:

1. **Server Components** (list pages):
   - Fetch data server-side using `fetchQuotationsServerSide()`
   - Pass initial data to client components
   - Handle auth redirects in server component

2. **Client Components** (detail pages):
   - Use SWR for real-time updates
   - Handle PDF generation client-side with `generateQuotePDF()`
   - Save PDF to Supabase Storage for admin use

3. **PDF Generation Pattern**:
   ```typescript
   const result = await generateQuotePDF(pdfData as QuoteData, {
     filename: `${quotation.quotationNumber}.pdf`,
   });
   // Save to Supabase Storage
   await fetch(`/api/member/quotations/${quotationId}/save-pdf`, {
     method: 'POST',
     body: JSON.stringify({ pdfData: dataUrl }),
   });
   ```

4. **Specification Display**:
   - Use helper functions: `getBagTypeName()`, `getMaterialName()`, `getThicknessName()`
   - Handle roll_film and spout_pouch special cases (width + pitch display)
   - Filter post-processing options based on bag type

5. **Status-Based Actions**:
   - DRAFT: Can delete, awaiting approval
   - APPROVED: Can convert to order, download invoice
   - CONVERTED: Show order link, read-only
   - REJECTED: Show contact message

### Common Tasks

- **Add new status filter**: Update status options in both page.tsx and QuotationsClient.tsx
- **Modify PDF template**: Edit `lib/pdf-generator.ts` QuoteData mapping
- **Add specification field**: Add to detail page display and PDF mapping
- **Change pagination**: Update `ITEMS_PER_PAGE` constant

### Dependencies

- `@supabase/supabase-js@^2.89.0` - Database client
- `date-fns` - Date formatting with Japanese locale
- `swr@^2.3.8` - Client-side data fetching
- `@react-pdf/renderer` - PDF generation (via lib/pdf-generator.ts)
- `lucide-react` - Icons

### Related Files

- `src/lib/pdf-generator.ts` - QuotePDF generation
- `src/lib/unified-pricing-engine.ts` - Material specifications
- `src/constants/enToJa.ts` - Translation helpers
- `src/types/dashboard.ts` - Quotation type definitions
