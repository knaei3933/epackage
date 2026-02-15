# File Validator Decision Flow - Before vs After

## Before Fix (Incorrect - False Positives)

```
┌─────────────────────────────────────────────────────────────┐
│                     File Upload                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Magic Number Validation                         │
│  ✓ Check file signature (JPEG: FF D8 FF, PDF: %PDF, etc)   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         Content Pattern Checking (ALL FILES)                │
│  ❌ Convert binary buffer to ASCII text                    │
│  ❌ Apply text patterns to ALL files                       │
│  ❌ Binary bytes like %PDF'--# match SQL patterns          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
            ┌──────────┐         ┌──────────┐
            │  PASS    │         │  FAIL    │
            │  (Text)  │         │ (Binary) │
            └──────────┘         └──────────┘
                                    │
                                    ▼
                          ❌ FALSE POSITIVE
                    "Malicious content detected"
                            (Incorrect!)
```

**Problem:** Binary files like `.ai` contain arbitrary bytes that look like SQL injection
when interpreted as ASCII text, causing false positives.

---

## After Fix (Correct - Type-Aware Validation)

```
┌─────────────────────────────────────────────────────────────┐
│                     File Upload                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Magic Number Validation                         │
│  ✓ Check file signature                                     │
│  ✓ Detect actual file type (JPEG, PDF, AI, HTML, etc)     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
         ┌──────────────────┐  ┌──────────────────┐
         │  Text-Based?     │  │  Binary File?    │
         │  (HTML, TXT, JS) │  │  (JPEG, PDF, AI) │
         └──────────────────┘  └──────────────────┘
                    │                   │
                    ▼                   ▼
    ┌───────────────────────┐   ┌───────────────────────┐
    │ Pattern Matching      │   │ Skip Pattern Check    │
    │ ✓ Script injection    │   │ ✓ Magic number valid  │
    │ ✓ SQL injection       │   │ ✓ Executables blocked │
    │ ✓ XSS patterns        │   │ ✓ Sufficient security │
    └───────────────────────┘   └───────────────────────┘
                    │                   │
                    ▼                   ▼
            ┌──────────┐         ┌──────────┐
            │  PASS    │         │  PASS    │
            │  (Clean) │         │  (Clean) │
            └──────────┘         └──────────┘
```

**Solution:** Binary files skip pattern matching because magic number validation
is sufficient for their security.

---

## File Type Classification

### Text-Based Files (Pattern Checks Applied)

```
text/plain          → Scan for malicious patterns
text/html           → Scan for <script>, XSS
text/css            → Scan for malicious code
text/javascript     → Scan for eval(), exec()
application/json    → Scan for injection patterns
application/xml     → Scan for XXE, injection
text/csv            → Scan for formula injection
image/svg+xml       → Scan for scripts (XML-based)
```

### Binary Files (Magic Number Only)

```
image/jpeg          → JPEG signature check only
image/png           → PNG signature check only
image/gif           → GIF signature check only
application/pdf     → PDF signature check only
application/illustrator → AI (PDF-based) signature only
application/photoshop   → PSD signature check only
application/postscript  → PS signature check only
```

---

## Security Comparison

| Security Check | Text Files | Binary Files |
|----------------|-----------|--------------|
| Magic Number Validation | ✓ Yes | ✓ Yes |
| File Size Limit | ✓ Yes | ✓ Yes |
| Extension Validation | ✓ Yes | ✓ Yes |
| Executable Blocking | ✓ Yes | ✓ Yes |
| Archive Detection | ✓ Yes | ✓ Yes |
| Pattern Matching | ✓ Yes | ✗ No (not needed) |
| **Overall Security** | **Strong** | **Strong** |

---

## Example: AI File Upload

### File: `3sealpouch.ai`

**File Contents (first bytes):**
```
25 50 44 46 27 2D 2D 23  ...
%  P  D  F  '  -  -  #  ...
```

### Before Fix:
```
Magic Number: ✓ Valid (%PDF = PDF signature)
Content Check: ✗ FAIL (found '%27' = single quote = SQL pattern)
Result: ❌ Blocked (FALSE POSITIVE)
```

### After Fix:
```
Detected Type: application/illustrator (PDF-based)
Is Text-Based: No
Magic Number: ✓ Valid (%PDF = PDF signature)
Pattern Check: Skipped (binary file)
Result: ✓ Accepted (CORRECT)
```

---

## Code Flow

### Main Validation Function

```typescript
export async function validateFileSecurity(file, options) {
  // 1. Check file size
  // 2. Check extension
  // 3. Validate magic number → detects actual file type
  // 4. Block executables
  // 5. Detect archives

  // 6. Content pattern checking (NEW: Type-aware)
  const detectedType = magicNumberResult.detectedType;
  const isTextBased = TEXT_BASED_TYPES.includes(detectedType);

  if (isTextBased) {
    // Only scan text files for patterns
    const threats = checkMaliciousPatterns(buffer);
    // Report threats...
  }
  // Binary files: skip pattern check (magic number is sufficient)

  // 7. Virus scanning (optional)
  // 8. Return result
}
```

---

## Testing Strategy

### Unit Tests

| Test Category | Example Tests |
|---------------|---------------|
| Text File Scanning | ✓ Detect `<script>` in HTML |
| | ✓ Detect SQL in TXT files |
| | ✓ Detect XSS in JSON |
| Binary File Protection | ✓ AI files don't get false positives |
| | ✓ PDF files with pattern-like bytes pass |
| | ✓ JPEG with arbitrary bytes passes |
| | ✓ PNG with binary content passes |
| SVG Scanning | ✓ Detect `<script>` in SVG files |

### Integration Tests

```typescript
// Test: AI file upload
const aiFile = new File([buffer], 'design.ai', 'application/illustrator');
const result = await validateFileSecurity(aiFile);
expect(result.isValid).toBe(true);
expect(result.errors).toHaveLength(0);

// Test: Malicious HTML file
const htmlFile = new File(['<script>alert(1)</script>'], 'xss.html', 'text/html');
const result = await validateFileSecurity(htmlFile);
expect(result.errors.some(e => e.code === 'MALICIOUS_CONTENT_DETECTED')).toBe(true);
```

---

## Summary

**Before:** All files were scanned with text patterns → binary files got false positives

**After:** Only text files get pattern scans → binary files pass on magic number alone

**Security:** Maintained or improved (no reduction in protection)

**User Experience:** Fixed - legitimate design files now upload successfully
