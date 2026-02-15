# Task 86: Admin Dashboard Error Handling - Visual Guide

## Error State UI Components

### 1. Primary Error Alert (Red)
```
┌─────────────────────────────────────────────────────────┐
│ ⚠ ダッシュボードデータの読み込みエラー                    │
│                                                          │
│ Error message details here...                            │
│                                                          │
│ [🔄 再試行] [📄 ページを再読み込み]                       │
│                                                          │
│ リトライ回数: 1回                                        │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- AlertCircle icon from lucide-react
- Red background (bg-red-50) with red border (border-red-200)
- Detailed error message
- Retry button with loading state
- Page reload button
- Retry counter

### 2. Fallback Warning (Yellow)
```
┌─────────────────────────────────────────────────────────┐
│ ⚠ 一部のデータを表示できません。最新情報は手動で更新してください。 │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- Warning icon
- Yellow background (bg-yellow-50)
- Informative message
- Alerts users to degraded state

### 3. Error Cards (Individual Stats)
```
┌─────────────────────┐  ┌─────────────────────┐
│ 総注文数             │  │ 総売上               │
│ ⚠ 読み込み失敗       │  │ ⚠ 読み込み失敗       │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│ 保留中見積もり        │  │ 生産ジョブ           │
│ ⚠ 読み込み失敗       │  │ ⚠ 読み込み失敗       │
└─────────────────────┘  └─────────────────────┘
```

**Features**:
- Red-tinted cards (bg-red-50, border-red-200)
- AlertCircle icon
- Consistent error messaging
- Maintains grid layout

### 4. Loading State
```
┌─────────────────────┐
│ ▓▓▓▓▓▓              │  ← Skeleton loader
│ ▓▓▓▓▓▓▓▓▓           │
│ ▓▓▓                  │
└─────────────────────┘
```

**Features**:
- Pulse animation
- Matches card dimensions
- Professional appearance

### 5. Refresh Indicator
```
管理ダッシュボード                           [🔄 更新中...] 2026/01/04 10:30:00
```

**Features**:
- Spinning icon during validation
- Blue color for active state
- Last updated timestamp

## Component Hierarchy

```
AdminDashboardPage
├── DashboardSkeleton (loading)
├── Error State (error)
│   ├── ErrorAlert (primary)
│   ├── FallbackWarning (secondary)
│   └── DegradedDashboard
│       ├── OrderStatisticsWidget (with error)
│       ├── RecentActivityWidget
│       ├── QuickActionsWidget
│       └── AlertsWidget
└── Normal State (success)
    ├── Header with RefreshIndicator
    ├── OrderStatisticsWidget
    ├── RecentActivityWidget
    ├── QuickActionsWidget
    └── AlertsWidget
```

## Error Handling Flow

```
┌─────────────┐
│ Page Load   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ SWR Fetch   │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
    Success         Error
       │              │
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│ Display     │  │ Error Alert │
│ Dashboard   │  │ + Fallback  │
└─────────────┘  └──────┬──────┘
                        │
                        ▼
                  ┌──────────┐
                  │ User     │
                  │ Retry?   │
                  └────┬─────┘
                       │
          ┌────────────┴────────────┐
          Yes                        No
          │                          │
          ▼                          ▼
    ┌──────────┐            ┌──────────┐
    │ SWR      │            │ Stay in  │
    │ Refetch  │            │ Fallback │
    └────┬─────┘            └──────────┘
         │
         ▼
    ┌──────────┐
    │ Success/ │
    │ Error    │
    └──────────┘
```

## Color Scheme

### Error States
- **Primary Error**: Red-50 background, Red-200 border, Red-600/700/800 text
- **Warning**: Yellow-50 background, Yellow-200 border, Yellow-600/700 text
- **Icons**: AlertCircle (red-600), Warning (yellow-600)

### Loading States
- **Skeleton**: Gray-200 with pulse animation
- **Spinner**: Blue-600 with rotation animation
- **Text**: Blue-600 for "更新中..."

### Success States
- **Cards**: White background, Gray-200 border
- **Text**: Gray-900 for values, Gray-500/600 for labels
- **Accents**: Green-600 (revenue), Blue-600 (production), Orange-600 (pending)

## StatsCard Component API

```typescript
<StatsCard
  title="総注文数"              // Card title (required)
  value={stats.totalOrders}    // Numeric or string value (required)
  error={error}                // Error message string (optional)
  loading={isLoading}          // Loading state (optional)
  color="gray"                 // gray | green | blue | orange | red (default: gray)
  subtitle="過去30日間"          // Subtitle text (optional)
/>
```

### Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | Yes | - | Card title/label |
| value | number \| string | Yes | - | Display value |
| error | string | No | undefined | Error message |
| loading | boolean | No | false | Loading state |
| color | enum | No | 'gray' | Value color |
| subtitle | string | No | undefined | Subtitle text |

### State Precedence

1. **Loading** → Shows skeleton loader
2. **Error** → Shows error state with icon
3. **Normal** → Shows value with specified color

## Testing Checklist

### Manual Testing
- [ ] Navigate to `/admin/dashboard`
- [ ] Open browser DevTools Network tab
- [ ] Block API requests to `/api/admin/dashboard/statistics`
- [ ] Verify error alert appears
- [ ] Verify error cards replace stat cards
- [ ] Click "再試行" button
- [ ] Verify loading state appears
- [ ] Unblock API requests
- [ ] Click "再試行" again
- [ ] Verify dashboard recovers

### Automated Testing
```bash
# Run error handling tests
npx playwright test tests/admin-dashboard-error-handling.spec.ts

# Run with UI
npx playwright test tests/admin-dashboard-error-handling.spec.ts --ui

# Run specific test
npx playwright test tests/admin-dashboard-error-handling.spec.ts -g "should show error UI"
```

## File Structure

```
src/
├── app/
│   └── admin/
│       └── dashboard/
│           └── page.tsx                    ← Main dashboard with error handling
├── components/
│   └── admin/
│       └── dashboard-widgets/
│           ├── index.ts                    ← Export updates
│           ├── OrderStatisticsWidget.tsx   ← Error state support
│           ├── StatsCard.tsx               ← New reusable component
│           ├── RecentActivityWidget.tsx    ← (unchanged)
│           ├── QuickActionsWidget.tsx      ← (unchanged)
│           └── AlertsWidget.tsx            ← (unchanged)
└── ...
```

## Key Implementation Details

### Fetcher Function
```typescript
const fetcher = async (url: string) => {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    throw error;
  }
};
```

### SWR Configuration
```typescript
const { data, error, isLoading, isValidating, mutate } = useSWR(
  '/api/admin/dashboard/statistics',
  fetcher,
  {
    refreshInterval: 30000,           // Auto-refresh every 30s
    revalidateOnFocus: true,          // Refresh on window focus
    shouldRetryOnError: false,        // Disable auto-retry (manual only)
    errorRetryCount: 3,               // Max retry attempts
    onError: (err) => {
      console.error('SWR Error:', err);
    }
  }
);
```

### Retry Handler
```typescript
const handleRetry = async () => {
  setIsRetrying(true);
  setRetryCount(prev => prev + 1);
  try {
    await mutate();  // Trigger SWR revalidation
  } finally {
    setIsRetrying(false);
  }
};
```

## Benefits Summary

1. **No More Broken UI**: Dashboard always renders something
2. **Clear Error Communication**: Users know what went wrong
3. **Actionable Recovery**: Clear retry/reload options
4. **Professional Appearance**: Polished error states
5. **Maintained Functionality**: Quick actions always available
6. **Debugging Support**: Console logs for developers
7. **Retry Tracking**: Users know how many attempts made
8. **Graceful Degradation**: Partial functionality during errors

## Related Files

- `tests/admin-dashboard-error-handling.spec.ts` - Comprehensive test suite
- `docs/reports/TASK-086-IMPLEMENTATION-SUMMARY.md` - Full implementation details
- `.taskmaster/tasks/tasks.json` - Task status (completed)
