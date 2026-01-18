# File Validator Binary File Fix - Summary

## Problem Description

The file security validator was incorrectly blocking binary files like `.ai` (Adobe Illustrator) files with false positive "malicious content" errors.

### Error Example
When uploading `3sealpouch.ai` file, the validator failed with:
```
有害なコンテンツが検出されました: Suspicious pattern: (\\%27)|(\\')|(\\-\\-)|(\\%23)|(#)
```

### Root Cause

The `checkMaliciousPatterns()` function in `src/lib/file-validator/security-validator.ts` was:
1. Converting binary file buffers to ASCII text
2. Applying SQL injection and XSS pattern checks to the text representation
3. Binary files contain arbitrary byte sequences that can look like suspicious patterns when interpreted as text

For example, the bytes `%PDF'--#` (valid in a PDF/AI file) contain:
- `%27` → `'` (single quote - SQL injection pattern)
- `--` (SQL comment pattern)
- `%23` → `#` (hash - SQL injection pattern)

## Solution

The fix distinguishes between **text-based files** and **binary files**:

### Text-Based Files (Pattern Checks Applied)
These files can contain malicious scripts and should be scanned:
- `text/plain`, `text/html`, `text/css`, `text/javascript`
- `application/json`, `application/xml`, `application/javascript`
- `text/csv`, `application/x-httpd-php`, `text/x-python`, `text/x-shellscript`
- `image/svg+xml` (SVG is XML-based and can contain scripts)

### Binary Files (Magic Number Validation Only)
These files are secured by magic number validation - pattern checks are skipped:
- Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/bmp`, `image/tiff`
- Documents: `application/pdf`, `application/illustrator`, `application/photoshop`
- PostScript: `application/postscript`, `image/x-eps`
- Archives: `application/zip`, `application/x-rar`, `application/x-7z`
- Executables: `application/x-executable`, `application/x-elf`, `application/x-mach-binary`

## Code Changes

### File: `src/lib/file-validator/security-validator.ts`

#### 1. Added Type Classification Constants (Lines 186-224)

```typescript
// File types that should undergo content pattern checking (text-based files)
const TEXT_BASED_TYPES = [
  'text/plain',
  'text/html',
  'text/css',
  'text/javascript',
  'application/javascript',
  'application/json',
  'application/xml',
  'text/xml',
  'text/csv',
  'application/x-httpd-php',
  'text/x-python',
  'text/x-shellscript',
  'image/svg+xml', // SVG is XML-based and can contain scripts
];

// Binary file types (skip content pattern checks - magic number validation is sufficient)
const BINARY_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'application/pdf',
  'application/illustrator',
  'application/photoshop',
  'image/vnd.adobe.photoshop',
  'application/postscript',
  'image/x-eps',
  'application/zip',
  'application/x-rar',
  'application/x-7z',
  'application/x-executable',
  'application/x-elf',
  'application/x-mach-binary',
];
```

#### 2. Updated Malicious Content Detection Logic (Lines 547-567)

```typescript
// Only apply content pattern checks to text-based files
// Binary files are secured by magic number validation and executable blocking
const isTextBased = TEXT_BASED_TYPES.includes(detectedType) ||
                    TEXT_BASED_TYPES.some(t => detectedType.includes(t));

if (isTextBased) {
  const maliciousPatterns = checkMaliciousPatterns(buffer);
  for (const pattern of maliciousPatterns) {
    errors.push({
      code: 'MALICIOUS_CONTENT_DETECTED',
      message_ja: ERROR_MESSAGES.MALICIOUS_CONTENT_DETECTED.ja.replace('{pattern}', pattern),
      message_en: ERROR_MESSAGES.MALICIOUS_CONTENT_DETECTED.en.replace('{pattern}', pattern),
      severity: 'critical',
      category: 'malicious-content',
    });
  }
}
```

#### 3. Updated Exported Constants (Lines 711-718)

```typescript
export const SECURITY_CONSTANTS = {
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_ALLOWED_TYPES,
  SUSPICIOUS_EXTENSIONS,
  MAGIC_NUMBERS,
  TEXT_BASED_TYPES,
  BINARY_TYPES,
};
```

### File: `src/lib/file-validator/__tests__/security-validator.test.ts`

Updated test suite to reflect new behavior:

1. **Text-based file tests** - Verify malicious content detection works for HTML, TXT, JS, etc.
2. **Binary file tests** - Verify binary files (AI, PDF, PSD, JPEG, PNG) don't get false positives
3. **SVG tests** - Verify SVG files (which are XML-based) still get checked
4. **Integration tests** - Verify the overall security model still works

## Security Implications

### Before Fix (Incorrect Behavior)
- Binary files with arbitrary bytes were flagged as malicious
- Legitimate design files (.ai, .psd) were blocked
- False positives created user friction and support burden

### After Fix (Correct Behavior)
- Binary files are validated by **magic number verification** (sufficient for binary formats)
- Text files are validated by **both magic number AND pattern matching** (defense in depth)
- Executable files are still blocked by magic number detection
- Archive files are still detected and can be blocked in strict mode
- SVG files are still scanned for scripts (they're XML-based)

### Security Model Remains Strong

| Threat | Mitigation | Status |
|--------|-----------|--------|
| Malicious executables | Magic number detection | ✓ Working |
| Script injection in text files | Pattern matching | ✓ Working |
| SQL injection in uploads | Pattern matching | ✓ Working |
| Path traversal attacks | Pattern matching | ✓ Working |
| File type spoofing | Magic number validation | ✓ Working |
| Oversized files | Size limit enforcement | ✓ Working |
| Suspicious extensions | Extension blacklist | ✓ Working |

## Testing

### Unit Tests
Updated test suite includes:
- 5 tests for text-based malicious content detection
- 5 tests for binary file false positive prevention
- 1 test for SVG (XML-based) file scanning
- 3 integration tests

### Manual Testing
To verify the fix works for the original issue:

```typescript
import { quickValidateFile } from '@/lib/file-validator';

// Load the actual AI file that was failing
const aiFile = /* your File object for 3sealpouch.ai */;
const result = await quickValidateFile(aiFile);

// Should now pass without malicious content errors
console.log(result.isValid); // true
console.log(result.errors); // [] (empty)
```

## Migration Notes

No breaking changes for API consumers. The fix is backward compatible:

- Existing `validateFileSecurity()` calls work unchanged
- `quickValidateFile()` and `fullValidateFile()` convenience functions unchanged
- Return types and interfaces unchanged
- Only the internal validation logic improved

## Files Modified

1. `src/lib/file-validator/security-validator.ts` - Core validator logic
2. `src/lib/file-validator/__tests__/security-validator.test.ts` - Test suite

## Related Documentation

- Task #72: File Upload Security Implementation
- `src/lib/file-validator/security-validator.ts` - Full implementation
- `src/lib/file-validator/__tests__/security-validator.test.ts` - Test suite

## Date

2026-01-13

## Status

✓ Fixed and tested
