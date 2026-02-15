# JapaneseNameInput Component UI Improvements

## Overview
Improved the Japanese name input component to follow standard Japanese form conventions with separate fields for surname and given name.

## Changes Made

### 1. Component Structure (`src/components/ui/JapaneseNameInput.tsx`)

#### New 4-Field Layout
The component now supports the standard Japanese form pattern:
- **漢字 - 姓** (Kanji - Surname): `kanjiLastName`
- **漢字 - 名** (Kanji - Given Name): `kanjiFirstName`
- **ひらがな - 姓** (Hiragana - Surname): `kanaLastName`
- **ひらがな - 名** (Hiragana - Given Name): `kanaFirstName`

#### UI Layout
```
氏名 *
+--------------------------------------------------+
| 漢字                                              |
| +----------------------++   +------------------+ |
| | 姓                 |   | | 名               | |
| | [山田]              |   | | [太郎]           | |
| +----------------------++   +------------------+ |
+--------------------------------------------------+
| ひらがな                                         |
| +----------------------++   +------------------+ |
| | 姓                 |   | | 名               | |
| | [やまだ]            |   | | [たろう]         | |
| +----------------------++   +------------------+ |
+--------------------------------------------------+
```

#### Props Interface
```typescript
export interface JapaneseNameInputProps {
  kanjiLastName?: string;
  kanjiFirstName?: string;
  kanaLastName?: string;
  kanaFirstName?: string;
  onKanjiLastNameChange?: (value: string) => void;
  onKanjiFirstNameChange?: (value: string) => void;
  onKanaLastNameChange?: (value: string) => void;
  onKanaFirstNameChange?: (value: string) => void;
  label?: string;
  required?: boolean;
  // ... error and validation props
}
```

### 2. Zod Schema Updates (`src/types/auth.ts`)

#### Registration Schema
```typescript
// 日本の氏名（漢字・ひらがな、姓・名別）
kanjiLastName: z
  .string()
  .min(1, '姓（漢字）を入力してください。')
  .max(50, '姓は50文字以内で入力してください。')
  .regex(/^[\u4E00-\u9FFF\s]+$/, '漢字のみ入力可能です。'),
kanjiFirstName: z
  .string()
  .min(1, '名（漢字）を入力してください。')
  .max(50, '名は50文字以内で入力してください。')
  .regex(/^[\u4E00-\u9FFF\s]+$/, '漢字のみ入力可能です。'),
kanaLastName: z
  .string()
  .min(1, '姓（ひらがな）を入力してください。')
  .max(50, '姓は50文字以内で入力してください。')
  .regex(/^[\u3040-\u309F\s]+$/, 'ひらがなのみ入力可能です。'),
kanaFirstName: z
  .string()
  .min(1, '名（ひらがな）を入力してください。')
  .max(50, '名は50文字以内で入力してください。')
  .regex(/^[\u3040-\u309F\s]+$/, 'ひらがなのみ入力可能です。'),
```

#### User Type Updates
```typescript
export interface User {
  id: string;
  email: string;
  // ... other fields
  kanjiLastName?: string | null;
  kanjiFirstName?: string | null;
  kanaLastName?: string | null;
  kanaFirstName?: string | null;
  // ... other fields
}
```

### 3. RegistrationForm Updates (`src/components/auth/RegistrationForm.tsx`)

Updated to use the new 4-field structure:
```tsx
<JapaneseNameInput
  kanjiLastName={watch('kanjiLastName')}
  kanjiFirstName={watch('kanjiFirstName')}
  kanaLastName={watch('kanaLastName')}
  kanaFirstName={watch('kanaFirstName')}
  onKanjiLastNameChange={(value) => setValue('kanjiLastName', value)}
  onKanjiFirstNameChange={(value) => setValue('kanjiFirstName', value)}
  onKanaLastNameChange={(value) => setValue('kanaLastName', value)}
  onKanaFirstNameChange={(value) => setValue('kanaFirstName', value)}
  kanjiLastNameError={errors.kanjiLastName?.message}
  kanjiFirstNameError={errors.kanjiFirstName?.message}
  kanaLastNameError={errors.kanaLastName?.message}
  kanaFirstNameError={errors.kanaFirstName?.message}
  required
/>
```

### 4. Backward Compatibility

For existing forms (ContactForm, SampleRequestForm), a legacy controller is provided:

```typescript
// Old API (still works for backward compatibility)
export interface LegacyJapaneseNameInputControllerProps {
  control: Control<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  kanjiName: FieldPath<TFieldValues>;      // Single kanji field
  kanaName: FieldPath<TFieldValues>;       // Single kana field
}

// Exported as JapaneseNameInputController for backward compatibility
export { LegacyJapaneseNameInputController as JapaneseNameInputController };
```

## Benefits

### 1. Improved UX
- Clear separation of surname and given name
- Follows Japanese form conventions
- Better visual hierarchy with grouped sections

### 2. Better Data Quality
- Separate validation for each name component
- Reduced user errors from combined name fields
- Easier to parse and process names correctly

### 3. Responsive Design
- Mobile-first layout with single column
- Tablet/desktop: 2-column grid for surname/name
- Maintains usability across all screen sizes

### 4. Accessibility
- Proper labels for each field
- Clear required indicators
- Semantic HTML structure

## Migration Guide

### For New Forms (Recommended)
Use the new 4-field structure:
```tsx
import { JapaneseNameInput } from '@/components/ui/JapaneseNameInput';

<JapaneseNameInput
  kanjiLastName={watch('kanjiLastName')}
  kanjiFirstName={watch('kanjiFirstName')}
  kanaLastName={watch('kanaLastName')}
  kanaFirstName={watch('kanaFirstName')}
  onKanjiLastNameChange={(value) => setValue('kanjiLastName', value)}
  onKanjiFirstNameChange={(value) => setValue('kanjiFirstName', value)}
  onKanaLastNameChange={(value) => setValue('kanaLastName', value)}
  onKanaFirstNameChange={(value) => setValue('kanaFirstName', value)}
  required
/>
```

### For Existing Forms
Continue using the existing `JapaneseNameInputController` - it still works:
```tsx
import { JapaneseNameInputController } from '@/components/ui/JapaneseNameInput';

<JapaneseNameInputController
  control={control}
  setValue={setValue}
  kanjiName="nameKanji"
  kanaName="nameKana"
  required
/>
```

## Database Schema Considerations

When updating the database schema, use:
```sql
-- Instead of:
name_kanji TEXT,
name_kana TEXT,

-- Use:
kanji_last_name TEXT,
kanji_first_name TEXT,
kana_last_name TEXT,
kana_first_name TEXT,
```

## Validation Rules

| Field | Max Length | Pattern | Error Message (Japanese) |
|-------|-----------|---------|--------------------------|
| kanjiLastName | 50 | `^[\u4E00-\u9FFF\s]+$` | 漢字のみ入力可能です。 |
| kanjiFirstName | 50 | `^[\u4E00-\u9FFF\s]+$` | 漢字のみ入力可能です。 |
| kanaLastName | 50 | `^[\u3040-\u309F\s]+$` | ひらがなのみ入力可能です。 |
| kanaFirstName | 50 | `^[\u3040-\u309F\s]+$` | ひらがなのみ入力可能です。 |

## Future Enhancements

1. **Auto Kana Conversion**: Add library like `wanakana` for automatic hiragana conversion
2. **Furigana Support**: Optional ruby text fields for pronunciation guides
3. **Name Order Preference**: Option for [Given Name] [Surname] order for international users
4. **Validation Improvements**: Check for common Japanese name patterns

## Files Modified

1. `src/components/ui/JapaneseNameInput.tsx` - Complete rewrite with 4-field support
2. `src/types/auth.ts` - Updated schema and types
3. `src/components/auth/RegistrationForm.tsx` - Updated to use new fields

## Files Unchanged (Using Legacy Controller)

1. `src/components/contact/ContactForm.tsx` - Still uses `JapaneseNameInputController`
2. `src/components/contact/SampleRequestForm.tsx` - Still uses `JapaneseNameInputController`
