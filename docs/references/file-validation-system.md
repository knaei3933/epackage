# File Validation System - Documentation

Comprehensive file validation system for AI, PDF, and PSD design files in the Epackage Lab B2B packaging system.

## Features

- **Multi-format Support**: AI (Adobe Illustrator), PDF, PSD (Photoshop)
- **Client-side Validation**: Immediate feedback for users
- **Server-side Validation**: Comprehensive checks with Sharp and custom parsers
- **Japanese Error Messages**: Full bilingual support (Japanese/English)
- **File Metadata Extraction**: Dimensions, color mode, fonts, images
- **Preview Generation**: Automatic thumbnails and preview images
- **Storage Integration**: Supabase storage with RLS policies
- **Production Readiness**: Checks for bleed, CMYK, resolution, and more

## Architecture

```
┌─────────────────┐
│  Frontend UI    │
│  (React/Next.js)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  API Endpoint   │────▶│  File Validator  │
│ /api/files/validate│     │  (Client-side)   │
└────────┬────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│ File Ingestion  │────▶│ Server Validator │
│   (Upload)      │     │  (Sharp/pdf-lib) │
└────────┬────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Supabase       │────▶│   File Storage   │
│  Database       │     │   (Buckets)      │
└─────────────────┘     └──────────────────┘
```

## File Structure

```
src/
├── lib/
│   └── file-validator/
│       ├── index.ts              # Main exports
│       ├── ai-validator.ts        # Client-side validation
│       ├── server-validator.ts    # Server-side validation
│       └── file-ingestion.ts      # Upload & storage logic
├── app/
│   └── api/
│       └── files/
│           └── validate/
│               └── route.ts       # API endpoint
├── components/
│   └── admin/
│       └── FileValidationResult.tsx  # UI component
└── types/
    └── *.ts                        # Type definitions
```

## Installation

### Prerequisites

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.89.0",
    "sharp": "^0.34.5",
    "uuid": "^13.0.0"
  }
}
```

### Setup

1. **Environment Variables**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Run Database Setup**:
   See `docs/supabase-storage-setup.md` for complete SQL scripts.

3. **Create Storage Buckets**:
   - `designs`: Original AI/PDF/PSD files
   - `thumbnails`: Small preview images (300x300)
   - `previews`: Large preview images (1200x1200)

## Usage

### Client-side Validation

```typescript
import { validateDesignFile } from '@/lib/file-validator';

const file = fileInput.files[0];
const result = await validateDesignFile(file);

console.log(result.valid); // true/false
console.log(result.issues); // Array of errors
console.log(result.warnings); // Array of warnings
console.log(result.metadata); // File metadata
```

### API Endpoint

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('validateOnly', 'false');
formData.append('generatePreviews', 'true');

const response = await fetch('/api/files/validate', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result);
```

### UI Component

```tsx
import FileValidationResult from '@/components/admin/FileValidationResult';

function MyComponent() {
  const [validationResult, setValidationResult] = useState(null);

  return (
    <FileValidationResult
      result={validationResult}
      onApprove={() => console.log('Approved')}
      onReject={() => console.log('Rejected')}
      language="ja"
    />
  );
}
```

## Validation Rules

### AI Files

| Check | Description | Severity |
|-------|-------------|----------|
| File format | Valid AI file (PDF or EPS-based) | Critical |
| Version | CS6 or CC series supported | Critical |
| Dimensions | Minimum 10x10mm | Critical |
| Color mode | CMYK for print | Major |
| Embedded images | Check for resolution | Warning |
| Fonts | Check availability | Warning |

### PDF Files

| Check | Description | Severity |
|-------|-------------|----------|
| PDF version | 1.4+ supported | Critical |
| Bleed area | 3mm required | Major |
| Color space | CMYK preferred | Major |
| Trim box | Must be set | Major |
| Embedded fonts | All fonts must be embedded | Critical |
| Image resolution | 300 DPI minimum | Critical |

### PSD Files

| Check | Description | Severity |
|-------|-------------|----------|
| File format | Valid PSD file | Critical |
| Color mode | CMYK for print | Major |
| Resolution | 300 DPI minimum | Critical |
| Layers | At least one layer | Warning |
| Hidden layers | Check for hidden content | Warning |

## Error Messages

All error messages are available in Japanese and English:

```typescript
const ERROR_MESSAGES = {
  colorModeNotCMYK: {
    ja: 'カラーモードがCMYKではありません（現在: {mode}）',
    en: 'Color mode is not CMYK (Current: {mode})',
  },
  lowResolution: {
    ja: '画像解像度が不足しています（現在: {dpi} DPI、必要: {min} DPI）',
    en: 'Image resolution insufficient (Current: {dpi} DPI, Required: {min} DPI)',
  },
  // ... more messages
};
```

## API Reference

### `validateDesignFile(file, options?)`

Validate a design file on the client side.

**Parameters**:
- `file: File` - File to validate
- `options?: ValidationOptions` - Optional validation settings

**Returns**: `Promise<ValidationResult>`

### `validateFileServer(buffer, fileName, options?)`

Validate a file with server-side enhancements.

**Parameters**:
- `buffer: Buffer` - File buffer
- `fileName: string` - File name
- `options?: ValidationOptions` - Optional validation settings

**Returns**: `Promise<ValidationResult>`

### `ingestDesignFile(file, fileName, options)`

Upload, validate, and store a design file.

**Parameters**:
- `file: File | Buffer` - File to ingest
- `fileName: string` - File name
- `options: IngestionOptions` - Ingestion settings

**Returns**: `Promise<IngestionResult>`

## Type Definitions

```typescript
interface ValidationResult {
  valid: boolean;
  fileType: 'AI' | 'PDF' | 'PSD';
  fileName: string;
  fileSize: number;
  issues: ValidationIssue[];
  warnings: ValidationIssue[];
  metadata: FileMetadata;
  validatedAt: string;
}

interface ValidationIssue {
  type: 'error' | 'warning';
  category: 'format' | 'dimension' | 'color' | 'font' | 'image' | 'structure';
  message_ja: string;
  message_en: string;
  severity: 'critical' | 'major' | 'minor';
}

interface FileMetadata {
  dimensions?: { width: number; height: number };
  dpi?: number;
  colorMode?: 'CMYK' | 'RGB' | 'GRAY';
  pages?: number;
  fonts?: string[];
  images?: number;
  // ... more fields
}
```

## Testing

### Unit Tests

```typescript
import { validateDesignFile } from '@/lib/file-validator';

describe('File Validation', () => {
  it('should validate PDF files', async () => {
    const file = new File(['%PDF-1.4...'], 'test.pdf');
    const result = await validateDesignFile(file);
    expect(result.fileType).toBe('PDF');
  });
});
```

### Integration Tests

```typescript
import { ingestDesignFile } from '@/lib/file-validator';

describe('File Ingestion', () => {
  it('should upload and validate file', async () => {
    const result = await ingestDesignFile(file, 'test.ai', {
      userId: 'test-user',
      validateOnly: true,
    });
    expect(result.success).toBe(true);
  });
});
```

## Troubleshooting

### Issue: "Sharp installation error"

**Solution**: Sharp requires native dependencies. Rebuild:
```bash
npm rebuild sharp
```

### Issue: "Permission denied on upload"

**Solution**: Check RLS policies and ensure user is authenticated:
```sql
SELECT * FROM profiles WHERE id = auth.uid();
```

### Issue: "Font detection not working"

**Solution**: Font detection is limited on client-side. Use server-side validation for comprehensive checks.

## Performance Considerations

- **File Size**: Maximum 100MB per file
- **Validation Time**: ~1-3 seconds for typical files
- **Thumbnail Generation**: ~2-5 seconds for PSD files
- **Memory Usage**: Sharp processes images in memory chunks

## Security

- **Authentication Required**: All operations require valid JWT
- **File Type Validation**: MIME types and magic numbers checked
- **Path Traversal Prevention**: File paths validated
- **Size Limits**: Enforced at multiple levels
- **RLS Policies**: Database and storage protected

## License

This module is part of the Epackage Lab project.

## Support

For issues or questions, please contact the development team.
