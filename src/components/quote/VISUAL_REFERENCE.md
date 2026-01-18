# Post-Processing Groups - Visual Reference Guide

## UI Component Structure

```
PostProcessingGroups (Main Container)
│
├── Group Card (Repeated for each group)
│   ├── Group Header
│   │   ├── Icon (emoji)
│   │   ├── Name (e.g., "ジッパー")
│   │   ├── Description (e.g., "再封性の選択")
│   │   └── Checkmark (if any option selected)
│   │
│   └── Options Grid
│       └── Option Card (Repeated for each option)
│           ├── Selection/Conflict Indicator (top-right)
│           ├── Preview Image (left)
│           ├── Content (right)
│           │   ├── Name
│           │   ├── Description
│           │   ├── Feature Tags
│           │   ├── Multiplier (green if >1, gray if 1.0)
│           │   ├── Conflict Warning (if applicable)
│           │   └── Detailed Description (if selected)
│
└── Sticky Footer (only when multiplier > 1.0)
    ├── Icon + Label
    ├── Total Multiplier
    └── Percentage Increase
```

## Color Scheme

### Selection States
| State | Border Color | Background | Badge | Icon |
|-------|-------------|------------|-------|------|
| Selected | Green-500 | Green-50 | Green checkmark | Check |
| Conflicting | Amber-300 | Amber-50/30 | Amber warning | AlertCircle |
| Normal | Gray-200 | White | None | - |
| Hover | Navy-300 | - | - | - |

### Group Card States
| State | Border Color | Background |
|-------|-------------|------------|
| Has Selection | Navy-200 | Navy-50/30 |
| No Selection | Gray-200 | White |

## Component Hierarchy

```
PostProcessingGroups
├── div (container)
│   ├── div (groups container)
│   │   ├── div (group card)
│   │   │   ├── div (group header)
│   │   │   └── div (options grid)
│   │   │       └── OptionCard
│   │   │           ├── button (trigger)
│   │   │           │   ├── div (selection indicator)
│   │   │           │   ├── div (conflict indicator)
│   │   │           │   └── div (content)
│   │   │           │       ├── img (preview)
│   │   │           │       └── div (details)
│   │   │           │           ├── h4 (name)
│   │   │           │           ├── p (description)
│   │   │           │           ├── div (features)
│   │   │           │           ├── div (multiplier)
│   │   │           │           ├── div (conflict warning)
│   │   │           │           └── div (detailed description)
│   │   └── ... (more option cards)
│   └── ... (more group cards)
│   └── div (sticky footer)
│       └── div (gradient background)
│           └── div (content)
```

## Responsive Breakpoints

```css
/* Mobile First */
.group-card {
  padding: 1rem;
}

.option-card {
  /* Full width on mobile */
  grid-template-columns: 1fr;
}

/* Tablet and up */
@media (min-width: 640px) {
  .options-grid {
    /* 2 columns for options within groups */
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .options-grid {
    /* Can use more columns if needed */
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}
```

## Interaction Flow

```
User Clicks Option
    ↓
Check if Already Selected
    ├─ Yes → Deselect (remove from selection)
    │         ↓
    │         Update Multiplier
    │         ↓
    │         Re-render
    │
    └─ No → Check for Conflicts
              ↓
              Find Conflicting Options in Same Group
              ↓
              Remove Conflicting Options from Selection
              ↓
              Add Current Option to Selection
              ↓
              Update Multiplier
              ↓
              Re-render
```

## State Management

```typescript
// Input Props
{
  groups: PostProcessingGroup[];      // Static configuration
  selectedOptions: string[];          // Current selection state
  onToggleOption: Function;           // State updater
  totalMultiplier: number;            // Calculated total
}

// Internal State
{
  exclusiveGroups: Record<string, string[]>;  // Built from groups
  conflictingOptions: string[];               // Calculated per option
}

// Output (via onToggleOption)
onToggleOption(optionId: string, multiplier: number)
```

## Accessibility Features

### Keyboard Navigation (Future Enhancement)
- `Tab` - Navigate between options
- `Enter/Space` - Select option
- `Arrow Keys` - Navigate within group
- `Escape` - Close/deselect

### ARIA Labels (Recommended Addition)
```tsx
<div
  role="radiogroup"
  aria-label={group.name}
>
  <button
    role="radio"
    aria-checked={isSelected}
    aria-describedby={optionId + '-desc'}
  >
    {option.name}
  </button>
</div>
```

### Screen Reader Support
- Clear group labels
- Option names and descriptions
- Selection state announcements
- Multiplier information
- Conflict warnings

## Performance Considerations

### Optimization Strategies
1. **Memoization**: Use `React.memo` for OptionCard
2. **Callback Stability**: `useCallback` for toggle handler
3. **Computed Values**: Cache exclusive groups calculation
4. **Virtualization**: Consider for very large option lists

### Example Optimization
```typescript
const OptionCard = React.memo(({ option, isSelected, onSelect }) => {
  // Component code
}, (prevProps, nextProps) => {
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isConflicting === nextProps.isConflicting
  );
});
```

## Testing Scenarios

### Unit Tests
- [ ] Renders group cards correctly
- [ ] Renders option cards correctly
- [ ] Shows selection state
- [ ] Shows conflict warnings
- [ ] Calls toggle handler on click
- [ ] Displays correct multiplier
- [ ] Sticky footer appears when needed

### Integration Tests
- [ ] Selecting one option deselects conflicting
- [ ] Multiplier updates correctly
- [ ] All groups work independently
- [ ] State persists across re-renders

### E2E Tests
- [ ] Complete selection flow
- [ ] Mobile responsiveness
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

## Browser Compatibility

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |
| Mobile | iOS 14+, Android 10+ | Full support |

## Debugging Tips

### Common Issues

**Issue**: Options not deselecting
- **Check**: `exclusiveGroups` mapping is correct
- **Verify**: `onToggleOption` is being called
- **Confirm**: State is updating properly

**Issue**: Multiplier incorrect
- **Check**: Multiplier values in group config
- **Verify**: Calculation logic in parent component
- **Confirm**: No duplicate options selected

**Issue**: Styling broken
- **Check**: Tailwind classes are correct
- **Verify**: No CSS conflicts
- **Confirm**: Responsive breakpoints working

## Migration Checklist

- [ ] Copy `PostProcessingGroups.tsx` to project
- [ ] Update `ImprovedQuotingWizard.tsx` import
- [ ] Replace `postProcessingOptions` with `postProcessingGroups`
- [ ] Update render to use new component
- [ ] Test all selection scenarios
- [ ] Verify multiplier calculations
- [ ] Check responsive design
- [ ] Run existing tests
- [ ] Update documentation
- [ ] Deploy to staging
- [ ] Get user feedback
- [ ] Deploy to production
