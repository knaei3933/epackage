# TC-AUTH-007 Test Flow Diagram

## Visual Representation

```
┌─────────────────────────────────────────────────────────────────┐
│                     TEST START: TC-AUTH-007                      │
│              事業形態によるフォーム変化                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Navigate to Registration Page                          │
│  ────────────────────────────────────────                       │
│  • URL: /auth/register                                          │
│  • Wait for: domcontentloaded                                   │
│  • Timeout: 60s                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Locate Radio Buttons                                   │
│  ────────────────────────────────────                           │
│  • individualRadio = getByRole('radio', {name: '個人'})         │
│  • corporationRadio = getByRole('radio', {name: '法人'})        │
│  • Count total radio buttons                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Radio Buttons  │
                    │    Found?       │
                    └─────────────────┘
                      │           │
                     NO          YES
                      │           │
                      ▼           ▼
              ┌──────────┐   ┌─────────────────────────────────┐
              │ SKIP     │   │ STEP 3: Verify Initial State    │
              │ TEST     │   │ ────────────────────────────    │
              └──────────┘   │ • Check '個人' is default       │
                              │ • Verify NO company fields      │
                              │   - Try 4 selector strategies   │
                              │   - Sum all counts              │
                              │   - Expect: count = 0           │
                              └─────────────────────────────────┘
                                              │
                                              ▼
                            ┌─────────────────────────────────┐
                            │  Company Fields Hidden?         │
                            └─────────────────────────────────┘
                              │                    │
                             NO                  YES
                              │                    │
                              ▼                    ▼
                      ┌──────────┐      ┌─────────────────────────┐
                      │  FAIL    │      │ STEP 4: Select '法人'    │
                      │  TEST    │      │ ─────────────────────    │
                      └──────────┘      │ • Click corporationRadio  │
                                         │ • Wait 500ms (React)     │
                                         └─────────────────────────┘
                                                       │
                                                       ▼
                                    ┌─────────────────────────────────┐
                                    │ STEP 5: Poll for Company Fields │
                                    │ ────────────────────────────    │
                                    │ • Timeout: 5000ms               │
                                    │ • Interval: 200ms               │
                                    │ • For each selector:            │
                                    │   1. Locate element             │
                                    │   2. Check visibility           │
                                    │   3. If visible → SUCCESS      │
                                    │   4. If not → retry             │
                                    └─────────────────────────────────┘
                                                       │
                                                       ▼
                                    ┌─────────────────────────────────┐
                                    │  Company Fields Found?          │
                                    └─────────────────────────────────┘
                                      │                    │
                                     NO                  YES
                                      │                    │
                                      ▼                    ▼
                              ┌──────────┐      ┌─────────────────────────┐
                              │  FAIL    │      │ STEP 6: Verify All Fields│
                              │  TEST    │      │ ─────────────────────    │
                              └──────────┘      │ • Company name ✓         │
                                                 │ • Legal entity # ✓       │
                                                 │ • Position ✓             │
                                                 │ • Section heading ✓      │
                                                 └─────────────────────────┘
                                                               │
                                                               ▼
                                                ┌─────────────────────────┐
                                                │         PASS ✓          │
                                                └─────────────────────────┘
```

## Selector Strategy Flow

```
┌─────────────────────────────────────────────────────────────┐
│           MULTI-SELECTOR STRATEGY (for each field)          │
└─────────────────────────────────────────────────────────────┘

For Company Name Field:
┌─────────────────────────────────────────────────────────────┐
│  Try Selector 1: input[name="companyName"]                  │
│     │                                                        │
│     ├── Found & Visible? → SUCCESS ✓                        │
│     │                                                        │
│     └── Not Found/Visible? → Try Next Selector               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Try Selector 2: input[placeholder*="会社"]                 │
│     │                                                        │
│     ├── Found & Visible? → SUCCESS ✓                        │
│     │                                                        │
│     └── Not Found/Visible? → Try Next Selector               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Try Selector 3: input[id*="company" i]                     │
│     │                                                        │
│     ├── Found & Visible? → SUCCESS ✓                        │
│     │                                                        │
│     └── Not Found/Visible? → Try Next Selector               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Try Selector 4: input[aria-label*="会社" i]                │
│     │                                                        │
│     ├── Found & Visible? → SUCCESS ✓                        │
│     │                                                        │
│     └── Not Found/Visible? → Wait 200ms & Retry All         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Timeout (5s)?  │
                    └─────────────────┘
                      │           │
                    YES          NO
                      │           │
                      ▼           ▼
              ┌──────────┐   Return to
              │  FAIL    │   Selector 1
              │  TEST    │
              └──────────┘
```

## Timing Diagram

```
Time: 0s                    1s              3s              5s
  │                        │               │               │
  ▼                        ▼               ▼               ▼
┌────────┐           ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Page   │           │ Click    │    │ Polling  │    │ Success  │
│ Load   │───────────▶│ '法人'   │───▶│ Loop     │───▶│ or Fail  │
└────────┘           └──────────┘    └──────────┘    └──────────┘
                            │
                            │ Wait 500ms
                            ▼
                     ┌──────────────┐
                     │ React Re-    │
                     │ render Start │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ DOM Updated  │
                     │ (0-500ms)    │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Polling Loop │◀──┐
                     │ Every 200ms  │   │
                     └──────────────┘   │
                            │           │
                            ▼           │
                     ┌──────────────┐   │
                     │ Try Selector │───┘
                     │ 1, 2, 3, 4   │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Element Found│
                     │    or        │
                     │   Timeout    │
                     └──────────────┘
```

## Component State Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   Registration Form Component                │
└──────────────────────────────────────────────────────────────┘

Initial State (businessType = 'individual'):
┌──────────────────────────────────────────────────────────────┐
│  ❌ Company Info Section: NOT RENDERED                       │
│  ❌ Company Name Input: NOT IN DOM                           │
│  ❌ Legal Entity # Input: NOT IN DOM                         │
│  ❌ Position Input: NOT IN DOM                               │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ User clicks "法人"
                            ▼
React State Update:
┌──────────────────────────────────────────────────────────────┐
│  businessType = 'corporation'                                 │
│  watch('businessType') triggers re-render                    │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ React re-renders
                            ▼
New State (businessType = 'corporation'):
┌──────────────────────────────────────────────────────────────┐
│  ✅ Company Info Section: RENDERED                           │
│  ✅ Company Name Input: IN DOM & VISIBLE                     │
│  ✅ Legal Entity # Input: IN DOM & VISIBLE                   │
│  ✅ Position Input: IN DOM & VISIBLE                         │
│  ✅ Additional Corp Fields: IN DOM & VISIBLE                 │
└──────────────────────────────────────────────────────────────┘
```

## Error Recovery Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                            │
└──────────────────────────────────────────────────────────────┘

Scenario 1: Radio Buttons Not Found
┌──────────┐
│ No radios│──▶ test.skip() with message
│ detected │
└──────────┘

Scenario 2: Initial Company Fields Present
┌──────────────────────┐
│ Company fields exist │──▶ Test FAILS (form broken)
│  at start            │
└──────────────────────┘

Scenario 3: Company Fields Never Appear
┌──────────────────────┐     ┌─────────────┐
│ Timeout reached      │────▶│ Test FAILS  │
│  without finding     │     │ + screenshot│
│  company fields      │     └─────────────┘
└──────────────────────┘

Scenario 4: Partial Fields Appear
┌──────────────────────┐     ┌─────────────┐
│ Some fields found    │────▶│ Test FAILS  │
│  (but not all)       │     │ + detailed  │
└──────────────────────┘     │  error info │
                             └─────────────┘
```

## Success Criteria Checklist

```
✅ PRE-CONDITIONS:
   □ Dev server running on localhost:3000
   □ .env.local configured
   □ Registration page loads successfully

✅ TEST EXECUTION:
   □ Page navigates to /auth/register
   □ Both radio buttons found
   □ Individual radio checked by default
   □ NO company fields initially
   □ Corporation radio clicked successfully
   □ Company name field appears (within 5s)
   □ Legal entity # field appears (within 5s)
   □ Position field appears
   □ Company info section heading visible

✅ POST-CONDITIONS:
   □ No console errors
   □ No network errors
   □ Test completes in <10s
   □ Screenshot captured (if failure)
```

## Performance Metrics

```
Typical Execution Times:
┌──────────────────────────────────────────────────┐
│ Step 1: Page Load          │  1-2 seconds       │
│ Step 2: Locate Radios       │  <100ms            │
│ Step 3: Initial Check       │  <100ms            │
│ Step 4: Click Corporation   │  <50ms             │
│ Step 5: Wait for React      │  500ms initial     │
│ Step 6: Polling Loop        │  0-2000ms          │
│         (usually finds in   │   1-2 polls)       │
│ Step 7: Verify All Fields   │  <100ms            │
├──────────────────────────────────────────────────┤
│ TOTAL (Success)           │  3-5 seconds        │
│ TOTAL (Failure/Timeout)   │  5-6 seconds        │
└──────────────────────────────────────────────────┘
```

## Browser Compatibility

```
✅ CHROMIUM (Desktop Chrome)
   ✅ PASS - Primary testing browser

✅ FIREFOX (Desktop Firefox)
   ✅ PASS - Uses same selectors

✅ WEBKIT (Desktop Safari)
   ✅ PASS - Uses same selectors

⚠️  MOBILE CHROME (Pixel 5)
   ⚠️  May need adjusted timeouts

⚠️  MOBILE SAFARI (iPhone 12)
   ⚠️  May need adjusted timeouts

⚠️  TABLET (iPad Pro)
   ⚠️  May need adjusted timeouts
```
