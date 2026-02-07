# Contact Components Directory

<!-- Parent: ../AGENTS.md -->

## Purpose

Contact form components for user inquiries and sample requests. Includes two main forms:
- **ContactForm**: General inquiries about products, quotations, samples, delivery
- **SampleRequestForm**: Dedicated pouch sample request form with modular sections

## Key Files

| File | Purpose |
|------|---------|
| `ContactForm.tsx` | General contact/inquiry form with validation |
| `SampleRequestForm.tsx` | Modular sample request form with auto-save |
| `CustomerInfoSection.tsx` | Customer information input section |
| `DeliveryDestinationSection.tsx` | Delivery destination management |
| `MessageSection.tsx` | Message/notes input section |
| `PrivacySection.tsx` | Privacy agreement section |
| `SampleItemsSection.tsx` | Sample items selection display |
| `SampleRequestSuccess.tsx` | Success message component |
| `SampleRequestForm.schema.ts` | Zod validation schemas |
| `useSampleRequestForm.ts` | Form submission logic hook |
| `index.ts` | Component exports |

## Architecture

### ContactForm Structure
```
ContactForm (monolithic)
├── JapaneseNameInputController
├── Customer Info Fields
├── Inquiry Type Selection
└── Message Input
```

### SampleRequestForm Structure
```
SampleRequestForm (modular)
├── SampleItemsSection
├── CustomerInfoSection
├── DeliveryDestinationSection
│   └── DeliveryDestinationCard (dynamic)
├── MessageSection
└── PrivacySection
```

## For AI Agents

### When Working With Contact Forms

1. **Validation Patterns**: All forms use `react-hook-form` + `zod`
   - Schema defined in-component (ContactForm) or separate (SampleRequestForm.schema.ts)
   - Japanese name validation: Kanji + Hiragana separate fields
   - Phone/fax: Japanese format validation (`0\d{1,4}-\d{1,4}-\d{4}`)
   - Postal code: `^\d{3}-\d{4}$` format

2. **Japanese Name Input**
   - Uses `JapaneseNameInputController` from `@/components/ui/JapaneseNameInput`
   - Requires: `control`, `setValue`, `trigger` props
   - Fields: `kanjiLastName`, `kanjiFirstName`, `kanaLastName`, `kanaFirstName`

3. **Form Submission**
   - ContactForm: POST to `/api/contact`
   - SampleRequestForm: POST to `/api/samples`
   - Both redirect on success after 2-second delay

4. **Section Components** (SampleRequestForm)
   - Export memoized versions: `ComponentNameMemo`
   - Props pattern: `{ control, register, setValue, trigger, watch, errors }`
   - Each section self-contained with internal state management

5. **Draft Auto-Save** (SampleRequestForm only)
   - Uses `useDraftSave` hook from `@/hooks`
   - Storage key: `'sample-request-form-draft'`
   - Interval: 30 seconds
   - Shows restoration UI if draft exists

### Common Patterns

```typescript
// Form initialization
const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue, trigger } = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { ... }
})

// Japanese name input
<JapaneseNameInputController
  control={control}
  setValue={setValue}
  trigger={trigger}
  kanjiLastNameName="kanjiLastName"
  kanjiFirstNameName="kanjiFirstName"
  kanaLastNameName="kanaLastName"
  kanaFirstNameName="kanaFirstName"
  kanjiLastNameError={errors.kanjiLastName?.message}
  kanjiFirstNameError={errors.kanjiFirstName?.message}
  kanaLastNameError={errors.kanaLastName?.message}
  kanaFirstNameError={errors.kanaFirstName?.message}
  required
/>

// Section component props pattern
interface SectionProps {
  control: Control<FormData>
  register: UseFormRegister<FormData>
  setValue: UseFormSetValue<FormData>
  trigger: UseFormTrigger<FormData>
  watch: UseFormWatch<FormData>
  errors: FieldErrors<FormData>
}
```

### Field Arrays (DeliveryDestinationSection)

```typescript
const { fields, append, remove } = useFieldArray({
  control,
  name: 'deliveryDestinations'
})

// Dynamic field registration
{register(`deliveryDestinations.${index}.fieldName` as const)}

// Error access
errors.deliveryDestinations?.[index]?.fieldName?.message
```

### Styling Conventions

- Primary color: `bg-brixa-600`, `text-brixa-700`
- Section backgrounds: `bg-{color}-50` for visual grouping
- Input focus: `focus:ring-2 focus:ring-brixa-600`
- Icons: lucide-react (`Package`, `User`, `Mail`, `Phone`, `Building`, `Shield`, etc.)

### Adding New Sections

1. Create component file following `{Name}Section.tsx` pattern
2. Define props interface extending form types
3. Export both default and memoized versions
4. Import and use in parent form
5. Add to form schema if validation needed

### Testing

- Use `data-testid` attributes for selectors
- Pattern: `{form-name}-{field-name}` (e.g., `contact-phone-number`)
- Test validation errors, form submission, success states

## Dependencies

### External
- `react-hook-form`: Form state management
- `@hookform/resolvers`: Zod integration
- `zod`: Schema validation
- `lucide-react`: Icons

### Internal
- `@/components/ui/JapaneseNameInput`: Japanese name input controller
- `@/hooks/useDraftSave`: Form draft auto-save functionality

## API Integration

| Form | Endpoint | Payload |
|------|----------|---------|
| ContactForm | `POST /api/contact` | `{ ...formData, inquiryType, subject }` |
| SampleRequestForm | `POST /api/samples` | `{ ...formData, inquiryType: 'pouch_sample' }` |

## State Management

- Form state: `react-hook-form`
- Submit status: `'idle' | 'success' | 'error'`
- Draft persistence: `localStorage` via `useDraftSave`
- Redirects: `window.location.href` after successful submission
