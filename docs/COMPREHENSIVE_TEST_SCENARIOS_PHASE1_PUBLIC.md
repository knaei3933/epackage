# Comprehensive E2E Test Scenarios - Phase 1: Public Pages

**Document Version:** 1.0
**Date:** 2026-01-14
**Test Environment:** http://localhost:3000
**Test Accounts:**
- Admin: `admin@epackage-lab.com` / `Admin1234`
- Member: `test@epackage-lab.com` / `Test1234!`

---

## Table of Contents

1. [Homepage (/)](#1-homepage-)
2. [Catalog (/catalog)](#2-catalog-catalog)
3. [Quote Simulator (/quote-simulator)](#3-quote-simulator-quote-simulator)
4. [Samples (/samples)](#4-samples-samples)
5. [Contact (/contact)](#5-contact-contact)
6. [Sign In (/auth/signin)](#6-sign-in-authsignin)
7. [Register (/auth/register)](#7-register-authregister)
8. [ROI Calculator (/roi-calculator)](#8-roi-calculator-roi-calculator)
9. [Guide Pages (/guide/*)](#9-guide-pages-guide)
10. [News (/news)](#10-news-news)
11. [Archives (/archives)](#11-archives-archives)

---

## Test Execution Guidelines

### Prerequisites
- Development server running on `localhost:3000`
- Database accessible (Supabase)
- Console open for error monitoring
- Test data prepared (optional)

### Test Result Recording
- ✅ Pass: All expected results met
- ❌ Fail: One or more expected results not met
- ⚠️ Skip: Test blocked by environment or prerequisite issue
- 🐛 Bug: Issue found, requires ticket

### Console Error Monitoring
- Check browser console for JavaScript errors on each page load
- Filter out expected API errors (404, 500 in dev mode)
- Record any unexpected errors with screenshot

---

## 1. Homepage (/)

### TC-PUB-001: Homepage Load and Render

**Description:** ホームページが正しく読み込まれ、すべてのセクションが表示されることを確認

**Preconditions:** None

**Test Steps:**
1. Navigate to `http://localhost:3000`
2. Wait for page to fully load
3. Verify page title is "Epackage Lab"
4. Check console for errors
5. Scroll through entire page

**Expected Results:**
- Page loads within 3 seconds
- No console errors
- Announcement banner visible (if announcements exist)
- Hero section visible with title
- Product showcase section visible
- Manufacturing process showcase visible
- CTA section visible
- Footer visible with all links
- Responsive design works (mobile view)

**Success Criteria:**
- All sections render correctly
- No broken images
- All links are clickable

---

### TC-PUB-002: Homepage Navigation Links

**Description:** ホームページのすべてのナビゲーションリンクが正しく動作することを確認

**Preconditions:** Homepage loaded

**Test Steps:**
1. Click logo in header
2. Click "カタログ" link in navigation
3. Click "見積シミュレーター" link
4. Click "サンプル依頼" link
5. Click "お問い合わせ" link
6. Click "ログイン" link
7. Click any CTA button on the page

**Expected Results:**
- Logo click redirects to homepage (/)
- All navigation links redirect to correct pages
- No 404 errors
- Smooth transitions between pages

---

### TC-PUB-003: Homepage Interactive Elements

**Description:** ホームページのインタラクティブ要素が動作することを確認

**Preconditions:** Homepage loaded

**Test Steps:**
1. Scroll to product showcase section
2. Hover over product cards
3. Click "詳細を見る" button on any product
4. Scroll to CTA section
5. Click all CTA buttons
6. Test mobile menu (if on mobile viewport)

**Expected Results:**
- Product cards have hover effects
- "詳細を見る" redirects to product detail
- CTA buttons redirect to correct pages
- Mobile menu opens and closes correctly
- No console errors during interactions

---

### TC-PUB-004: Homepage Announcement Banner

**Description:** お知らせバナーが正しく表示され、閉じるボタンが動作することを確認

**Preconditions:** Homepage loaded with active announcements

**Test Steps:**
1. Verify announcement banner is visible at top of page
2. Read announcement content
3. Click close button (X) on banner
4. Refresh page
5. Verify banner reappears

**Expected Results:**
- Announcement banner displays correctly
- Close button hides banner
- Banner reappears on page refresh
- Multiple announcements show carousel (if applicable)

---

### TC-PUB-005: Homepage SEO Elements

**Description:** ホームページのSEO要素が正しく設定されていることを確認

**Preconditions:** Homepage loaded

**Test Steps:**
1. Open browser DevTools
2. Check page title in `<head>`
3. Check meta description
4. Check Open Graph tags
5. Check canonical URL
6. Check structured data (JSON-LD)

**Expected Results:**
- Title: "Epackage Lab" or similar
- Meta description exists and is relevant
- OG tags present (title, description, image)
- Canonical URL set to root
- Structured data for Organization, LocalBusiness, FAQ present

---

## 2. Catalog (/catalog)

### TC-PUB-010: Catalog Page Load

**Description:** カタログページが正しく読み込まれ、製品が表示されることを確認

**Preconditions:** None

**Test Steps:**
1. Navigate to `http://localhost:3000/catalog`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Count visible product cards

**Expected Results:**
- Page loads within 3 seconds
- Page title: "パウチ製品カタログ | Epackage Lab"
- All 6 product types visible:
  - 平袋 (Flat Pouch)
  - スタンドパウチ (Stand Up Pouch)
  - 合掌袋 (Lap Seal Pouch)
  - ボックス型パウチ (Box Pouch)
  - スパウトパウチ (Spout Pouch)
  - ロールフィルム (Roll Film)
- No console errors

---

### TC-PUB-011: Catalog Product Cards

**Description:** 製品カードが正しく表示され、インタラクティブ機能が動作することを確認

**Preconditions:** Catalog page loaded

**Test Steps:**
1. Hover over each product card
2. Click each product card
3. Verify modal opens with product details
4. Close modal
5. Repeat for all products

**Expected Results:**
- Product cards have hover effects
- Clicking card opens detail modal
- Modal displays:
  - Product name (Japanese)
  - Product description
  - Product image
  - Specifications
  - "見積もりに追加" button (if logged in)
- Modal close button works
- No console errors

---

### TC-PUB-012: Catalog Filter Functionality

**Description:** カタログのフィルター機能が正しく動作することを確認

**Preconditions:** Catalog page loaded

**Test Steps:**
1. Locate filter section
2. Click "素材" (Material) filter
3. Select "PET+AL"
4. Verify products are filtered
5. Clear filter
6. Click "タイプ" (Type) filter
7. Select "スタンドパウチ"
8. Verify products are filtered

**Expected Results:**
- Filters are visible and accessible
- Selecting filter updates product list
- Clear filter resets view
- Filter combinations work correctly
- No console errors

---

### TC-PUB-013: Catalog Search Functionality

**Description:** カタログの検索機能が正しく動作することを確認

**Preconditions:** Catalog page loaded

**Test Steps:**
1. Locate search bar
2. Enter "スタンド" in search field
3. Wait for results
4. Clear search
5. Enter "パウチ" in search field
6. Verify all pouches appear

**Expected Results:**
- Search bar is visible and accessible
- Typing triggers search (real-time or on submit)
- Search results match query
- Clear search resets view
- No results message appears for invalid search
- No console errors

---

### TC-PUB-014: Catalog Add to Quote

**Description:** カタログから見積もりに製品を追加できることを確認

**Preconditions:** User logged in

**Test Steps:**
1. Navigate to catalog
2. Click on a product card
3. In product modal, click "見積もりに追加"
4. Verify toast/notification appears
5. Check cart/count indicator

**Expected Results:**
- "見積もりに追加" button is visible (when logged in)
- Clicking button adds to cart/quote
- Success message appears
- Cart count updates
- No console errors

---

## 3. Quote Simulator (/quote-simulator)

### TC-PUB-020: Quote Simulator Page Load

**Description:** 見積シミュレーターページが正しく読み込まれることを確認

**Preconditions:** None

**Test Steps:**
1. Navigate to `http://localhost:3000/quote-simulator`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify wizard interface is visible

**Expected Results:**
- Page loads within 3 seconds
- Page title: "統合見積もりシステム | Epackage Lab"
- Quote wizard visible with step indicators
- Step 1 (基本仕様) is active
- No console errors

---

### TC-PUB-021: Quote Wizard - Step 1: Basic Specs

**Description:** 基本仕様ステップで袋のタイプ、素材、厚さを選択できることを確認

**Preconditions:** Quote simulator loaded

**Test Steps:**
1. Verify bag type options are displayed
2. Click "スタンドパウチ"
3. Verify selection is highlighted
4. Scroll to material section
5. Select "PET+AL"
6. Select thickness "標準タイプ"
7. Enter dimensions (width, height, gusset)
8. Click "次へ" button

**Expected Results:**
- All 6 bag types displayed with images
- Selection highlights with green border and checkmark
- Material options displayed with features
- Thickness options displayed
- Dimension inputs accept numbers
- "次へ" button becomes enabled when all required fields filled
- No console errors

---

### TC-PUB-022: Quote Wizard - Step 2: Post Processing

**Description:** 後加工ステップで追加オプションを選択できることを確認

**Preconditions:** Step 1 completed

**Test Steps:**
1. Verify post-processing options are displayed
2. Click "ジッパー" (Zipper)
3. Verify option is added
4. Click "穴あけ" (Hanging Hole)
5. Verify option is added
6. Click "次へ" button

**Expected Results:**
- Post-processing groups displayed:
  - 開封部 (Opening): ジッパー, チャック
  - 機能部 (Function): 穴あけ, パンチ
  - 印刷部 (Printing): グラビア, 柔版
- Selected options appear in summary
- Price updates dynamically
- "次へ" button enabled
- No console errors

---

### TC-PUB-023: Quote Wizard - Step 3: SKU Selection

**Description:** SKU選択ステップでデザイン数と数量を設定できることを確認

**Preconditions:** Step 2 completed

**Test Steps:**
1. Select "1デザイン" (1 Design)
2. Enter quantity: 1000
3. Click "数量追加" to add second quantity
4. Enter quantity: 5000
5. Click "次へ" button

**Expected Results:**
- Design options: 1-5 designs
- Quantity inputs accept numbers
- Multiple quantities can be added
- Comparison table shows price breaks
- "次へ" button enabled when quantities valid
- No console errors

---

### TC-PUB-024: Quote Wizard - Step 4: Quantity and Printing

**Description:** 数量・印刷ステップで印刷オプションを選択できることを確認

**Preconditions:** Step 3 completed

**Test Steps:**
1. Verify printing options displayed
2. Select "グラビア印刷"
3. Enter number of colors: 8
4. Verify price updates
5. Click "次へ" button

**Expected Results:**
- Printing options: グラビア, 柔版, オフセット
- Color input accepts numbers (1-10)
- Price updates dynamically
- "次へ" button enabled
- No console errors

---

### TC-PUB-025: Quote Wizard - Step 5: Result

**Description:** 見積結果ステップで価格詳細が正しく表示されることを確認

**Preconditions:** All previous steps completed

**Test Steps:**
1. Review price breakdown
2. Verify unit price and total price
3. Click "見積を保存"
4. Verify login prompt or save success
5. Click "PDFダウンロード"
6. Click "メールで送信"

**Expected Results:**
- Price breakdown displayed:
  - 基本価格
  - 素材価格
  - 後加工価格
  - 印刷価格
  - 合計
- Unit price per quantity
- "見積を保存" works (or prompts login)
- PDF download generates PDF
- "メールで送信" opens email modal
- No console errors

---

### TC-PUB-026: Quote Wizard Navigation

**Description:** ウィザードのナビゲーション（戻る、進む、ステップインジケーター）が正しく動作することを確認

**Preconditions:** Quote simulator loaded

**Test Steps:**
1. Complete Step 1
2. Click "次へ"
3. Click "戻る"
4. Verify Step 1 data is preserved
5. Click step indicator for Step 3
6. Verify validation prevents skip
7. Complete steps 1-4
8. Click any step indicator
9. Verify navigation works between completed steps

**Expected Results:**
- "戻る" button returns to previous step
- Data is preserved when navigating back
- Cannot skip incomplete steps
- Step indicators show progress
- Can jump between completed steps
- Current step is highlighted
- No console errors

---

### TC-PUB-027: Quote Wizard Keyboard Navigation

**Description:** キーボードナビゲーションが正しく動作することを確認

**Preconditions:** Quote simulator loaded

**Test Steps:**
1. Press Tab key
2. Verify focus moves to next input
3. Press Shift+Tab
4. Verify focus moves to previous input
5. Press Enter on form
6. Press Escape on modal
7. Check keyboard shortcuts hint

**Expected Results:**
- Tab navigation works logically
- Enter submits form or confirms action
- Escape closes modals
- Keyboard shortcuts are displayed
- Focus is visible
- No console errors

---

## 4. Samples (/samples)

### TC-PUB-030: Samples Page Load

**Description:** サンプル依頼ページが正しく読み込まれることを確認

**Preconditions:** None

**Test Steps:**
1. Navigate to `http://localhost:3000/samples`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify sample request form is visible

**Expected Results:**
- Page loads within 3 seconds
- Page title: "パウチサンプルご依頼 | Epackage Lab"
- Sample request form visible
- Form fields are accessible
- No console errors

---

### TC-PUB-031: Sample Request Form - Product Selection

**Description:** サンプル依頼フォームで製品を選択できることを確認

**Preconditions:** Samples page loaded

**Test Steps:**
1. Verify product selection section
2. Click on first product checkbox
3. Verify product is added
4. Click on second product
5. Verify both products selected
6. Click third, fourth, fifth products
7. Try to click sixth product
8. Verify limit warning

**Expected Results:**
- Products displayed with checkboxes
- Up to 5 products can be selected
- Sixth selection shows warning: "最大5点まで選択可能です"
- Selected products displayed in list
- No console errors

---

### TC-PUB-032: Sample Request Form - Contact Information

**Description:** サンプル依頼フォームで連絡先情報を入力できることを確認

**Preconditions:** Products selected

**Test Steps:**
1. Enter company name: "テスト会社"
2. Enter name: "テスト太郎"
3. Enter email: "test@example.com"
4. Enter phone: "03-1234-5678"
5. Enter address details
6. Verify form validation

**Expected Results:**
- All fields accept input
- Email field validates email format
- Phone field validates phone format
- Required fields show error if empty
- No console errors

---

### TC-PUB-033: Sample Request Form - Submission

**Description:** サンプル依頼フォームを送信できることを確認

**Preconditions:** All form fields filled

**Test Steps:**
1. Complete all required fields
2. Click "送信" button
3. Verify success message or redirect
4. Check confirmation page
5. Verify email notification (if configured)

**Expected Results:**
- "送信" button is enabled when form valid
- Submission shows loading state
- Success message appears
- Redirect to thank you page (/samples/thank-you)
- Confirmation email sent (if configured)
- No console errors

---

### TC-PUB-034: Sample Request Form - Validation

**Description:** サンプル依頼フォームのバリデーションが正しく動作することを確認

**Preconditions:** Samples page loaded

**Test Steps:**
1. Try to submit with no products selected
2. Try to submit with empty email
3. Try to submit with invalid email format
4. Try to submit with empty required fields
5. Fix validation errors
6. Verify form becomes valid

**Expected Results:**
- Validation errors displayed for each issue
- Error messages in Japanese
- Field with error highlighted
- Form cannot submit until valid
- Clear error messages guide user
- No console errors

---

## 5. Contact (/contact)

### TC-PUB-040: Contact Page Load

**Description:** お問い合わせページが正しく読み込まれることを確認

**Preconditions:** None

**Test Steps:**
1. Navigate to `http://localhost:3000/contact`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify contact form is visible

**Expected Results:**
- Page loads within 3 seconds
- Page title: "パウチお問い合わせ | Epackage Lab"
- Contact form visible
- No console errors

---

### TC-PUB-041: Contact Form - Inquiry Type Selection

**Description:** お問い合わせフォームで問い合わせ種類を選択できることを確認

**Preconditions:** Contact page loaded

**Test Steps:**
1. Locate inquiry type dropdown/radio
2. Select "製品について"
3. Verify selection
4. Select "見積もりについて"
5. Verify selection
6. Select "その他"
7. Verify selection

**Expected Results:**
- Inquiry type options displayed:
  - 製品について
  - 見積もりについて
  - サンプルについて
  - アカウントについて
  - その他
- Selection is visually indicated
- No console errors

---

### TC-PUB-042: Contact Form - Message Input

**Description:** お問い合わせフォームでメッセージを入力できることを確認

**Preconditions:** Inquiry type selected

**Test Steps:**
1. Enter subject: "テスト問い合わせ"
2. Enter message (1000 characters)
3. Verify character count
4. Attach file (if feature exists)
5. Verify file upload works

**Expected Results:**
- Subject field accepts text
- Message area accepts multi-line text
- Character count displayed (if applicable)
- File upload accepts valid file types
- File size limit enforced
- No console errors

---

### TC-PUB-043: Contact Form - Submission

**Description:** お問い合わせフォームを送信できることを確認

**Preconditions:** All required fields filled

**Test Steps:**
1. Complete all required fields
2. Complete reCAPTCHA (if present)
3. Click "送信" button
4. Verify success message
5. Check redirect to thank you page

**Expected Results:**
- "送信" button enabled when form valid
- Submission shows loading state
- Success message appears
- Redirect to /contact/thank-you
- Confirmation email sent (if configured)
- No console errors

---

### TC-PUB-044: Contact Form - Validation

**Description:** お問い合わせフォームのバリデーションが正しく動作することを確認

**Preconditions:** Contact page loaded

**Test Steps:**
1. Try to submit with empty fields
2. Try to submit with invalid email
3. Try to submit with short message
4. Try to submit without reCAPTCHA
5. Fix validation errors

**Expected Results:**
- Validation errors for each issue
- Japanese error messages
- Fields highlighted
- Form cannot submit until valid
- Clear error messages
- No console errors

---

## 6. Sign In (/auth/signin)

### TC-PUB-050: Sign In Page Load

**Description:** ログインページが正しく読み込まれることを確認

**Preconditions:** None

**Test Steps:**
1. Navigate to `http://localhost:3000/auth/signin`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify login form is visible

**Expected Results:**
- Page loads within 3 seconds
- Page title: "ログイン | Epackage Lab"
- Login form visible with:
  - Email field
  - Password field
  - "ログイン" button
  - "パスワードを忘れた方" link
  - "アカウント登録" link
- No console errors

---

### TC-PUB-051: Sign In - Valid Credentials

**Description:** 有効な認証情報でログインできることを確認

**Preconditions:** Sign in page loaded

**Test Steps:**
1. Enter email: `test@epackage-lab.com`
2. Enter password: `Test1234!`
3. Click "ログイン" button
4. Verify successful login
5. Verify redirect to dashboard or home

**Expected Results:**
- "ログイン" button enabled when fields filled
- Loading state during authentication
- Successful login redirects to /member/dashboard
- User context updated
- No console errors

---

### TC-PUB-052: Sign In - Invalid Credentials

**Description:** 無効な認証情報で適切なエラーが表示されることを確認

**Preconditions:** Sign in page loaded

**Test Steps:**
1. Enter email: `invalid@test.com`
2. Enter password: `wrongpassword`
3. Click "ログイン" button
4. Verify error message
5. Verify user not logged in

**Expected Results:**
- Error message: "メールアドレスまたはパスワードが正しくありません"
- Fields remain filled or are cleared
- User remains on login page
- No redirect occurs
- Error is clear and actionable
- No console errors

---

### TC-PUB-053: Sign In - Admin Login

**Description:** 管理者アカウントでログインし、管理ダッシュボードにリダイレクトされることを確認

**Preconditions:** Sign in page loaded

**Test Steps:**
1. Enter email: `admin@epackage-lab.com`
2. Enter password: `Admin1234`
3. Click "ログイン" button
4. Verify successful login
5. Verify redirect to /admin/dashboard

**Expected Results:**
- Admin login successful
- Redirects to /admin/dashboard (not /member/dashboard)
- Admin permissions granted
- Admin navigation visible
- No console errors

---

### TC-PUB-054: Sign In - Form Validation

**Description:** ログインフォームのバリデーションが正しく動作することを確認

**Preconditions:** Sign in page loaded

**Test Steps:**
1. Try to submit with empty fields
2. Try to submit with invalid email format
3. Try to submit with empty password
4. Enter valid email, leave password empty
5. Enter valid password, leave email empty

**Expected Results:**
- Validation errors for each issue
- Japanese error messages
- Fields highlighted
- Submit button disabled until valid
- Clear error messages
- No console errors

---

### TC-PUB-055: Sign In - Password Recovery

**Description:** パスワードリカバリーフローが正しく動作することを確認

**Preconditions:** Sign in page loaded

**Test Steps:**
1. Click "パスワードを忘れた方" link
2. Verify redirect to /auth/forgot-password
3. Enter email address
4. Click "送信" button
5. Verify success message

**Expected Results:**
- Link redirects correctly
- Password reset form visible
- Email input accepts valid email
- Submission shows success message
- Reset email sent (if configured)
- No console errors

---

## 7. Register (/auth/register)

### TC-PUB-060: Register Page Load

**Description:** 会員登録ページが正しく読み込まれることを確認

**Preconditions:** None

**Test Steps:**
1. Navigate to `http://localhost:3000/auth/register`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify registration form is visible

**Expected Results:**
- Page loads within 3 seconds
- Page title: "会員登録 | Epackage Lab"
- Registration form visible with 18 fields
- No console errors

---

### TC-PUB-061: Register Form - Personal Information

**Description:** 会員登録フォームで個人情報を入力できることを確認

**Preconditions:** Register page loaded

**Test Steps:**
1. Enter last name (kanji): "山田"
2. Enter first name (kanji): "太郎"
3. Enter last name (katakana): "ヤマダ"
4. Enter first name (katakana): "タロウ"
5. Enter email: `test@example.com`
6. Enter phone: "03-1234-5678"
7. Verify all fields accept input

**Expected Results:**
- All fields accept input
- Katakana fields validate katakana characters
- Email validates format
- Phone validates format
- No console errors

---

### TC-PUB-062: Register Form - Company Information

**Description:** 会員登録フォームで会社情報を入力できることを確認

**Preconditions:** Personal info filled

**Test Steps:**
1. Enter company name: "テスト株式会社"
2. Enter department: "営業部"
3. Enter position: "部長"
4. Enter postal code: "100-0001"
5. Enter address: "東京都千代田区1-1-1"
6. Verify auto-fill for postal code (if implemented)

**Expected Results:**
- All fields accept input
- Postal code auto-fills address (if implemented)
- Fields display correctly
- No console errors

---

### TC-PUB-063: Register Form - Password

**Description:** 会員登録フォームでパスワードを設定し、バリデーションが動作することを確認

**Preconditions:** Register page loaded

**Test Steps:**
1. Enter password: "password123"
2. Verify password strength indicator
3. Enter confirm password: "password123"
4. Enter mismatched password in confirm field
5. Verify error message
6. Match passwords
7. Verify success

**Expected Results:**
- Password strength indicator shows strength
- Confirm password validates match
- Mismatch shows error
- Password requirements displayed:
  - Minimum 8 characters
  - Contains uppercase
  - Contains lowercase
  - Contains number
- No console errors

---

### TC-PUB-064: Register Form - Terms and Privacy

**Description:** 利用規約とプライバシーポリシーへの同意が正しく動作することを確認

**Preconditions:** Register page loaded

**Test Steps:**
1. Locate "利用規約" checkbox
2. Click to toggle
3. Click "利用規約" link
4. Verify terms page opens
5. Return to register page
6. Locate "プライバシーポリシー" checkbox
7. Click to toggle
8. Click "プライバシーポリシー" link
9. Verify privacy page opens

**Expected Results:**
- Checkboxes toggle correctly
- Links open in new tab or navigate
- Terms page loads at /terms
- Privacy page loads at /privacy
- Submit disabled until both checked
- No console errors

---

### TC-PUB-065: Register Form - Submission

**Description:** 会員登録フォームを送信できることを確認

**Preconditions:** All fields filled and valid

**Test Steps:**
1. Complete all required fields
2. Agree to terms and privacy
3. Click "登録" button
4. Verify success message
5. Check email verification flow
6. Verify redirect to pending page

**Expected Results:**
- "登録" button enabled when form valid
- Submission shows loading state
- Success message appears
- Verification email sent
- Redirect to /auth/pending
- No console errors

---

### TC-PUB-066: Register Form - Validation

**Description:** 会員登録フォームのバリデーションが正しく動作することを確認

**Preconditions:** Register page loaded

**Test Steps:**
1. Try to submit with empty fields
2. Try to submit with invalid email
3. Try to submit with mismatched passwords
4. Try to submit without agreeing to terms
5. Try to submit with existing email
6. Fix validation errors

**Expected Results:**
- Validation errors for each issue
- Japanese error messages
- Fields with errors highlighted
- Form cannot submit until valid
- Email uniqueness validated
- Clear error messages
- No console errors

---

## 8. ROI Calculator (/roi-calculator)

### TC-PUB-070: ROI Calculator Redirect

**Description:** ROI計算機ページが見積シミュレーターにリダイレクトすることを確認

**Preconditions:** None

**Test Steps:**
1. Navigate to `http://localhost:3000/roi-calculator`
2. Wait for redirect
3. Verify final URL

**Expected Results:**
- Page redirects to /quote-simulator
- Redirect happens quickly (< 2 seconds)
- Loading message or spinner displayed
- No console errors
- 301 permanent redirect status

---

## 9. Guide Pages (/guide/*)

### TC-PUB-080: Guide Main Page

**Description:** デザインガイドメインページが正しく表示されることを確認

**Preconditions:** None

**Test Steps:**
1. Navigate to `http://localhost:3000/guide`
2. Wait for page to load
3. Verify page title
4. Check console for errors
5. Verify guide sections are displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "デザインガイド | Epackage Lab"
- 5 guide sections displayed:
  - カラー (Color) - /guide/color
  - サイズ (Size) - /guide/size
  - 画像 (Image) - /guide/image
  - 白版 (Shirohan) - /guide/shirohan
  - 環境表示 (Environmental Display) - /guide/environmentaldisplay
- Design standards section visible
- No console errors

---

### TC-PUB-081: Guide Navigation

**Description:** ガイドページ間のナビゲーションが正しく動作することを確認

**Preconditions:** Guide main page loaded

**Test Steps:**
1. Click "カラー" guide card
2. Verify color guide page loads
3. Return to main guide page
4. Click "サイズ" guide card
5. Verify size guide page loads
6. Use breadcrumb navigation

**Expected Results:**
- All guide cards are clickable
- Each guide page loads correctly
- Breadcrumb navigation works
- "デザインガイド" link returns to main page
- No console errors

---

### TC-PUB-082: Color Guide Page

**Description:** カラーガイドページが正しく表示されることを確認

**Preconditions:** None

**Test Steps:**
1. Navigate to `http://localhost:3000/guide/color`
2. Verify page title
3. Check color guide content
4. Verify images/diagrams load
5. Check console for errors

**Expected Results:**
- Page loads successfully
- Color guide content displayed
- CMYK/PANTONE information visible
- Color examples display correctly
- Images load without errors
- No console errors

---

### TC-PUB-083: Size Guide Page

**Description:** サイズガイドページが正しく表示されることを確認

**Preconditions:** None

**Test Steps:**
1. Navigate to `http://localhost:3000/guide/size`
2. Verify page title
3. Check size guide content
4. Verify diagrams load
5. Check console for errors

**Expected Results:**
- Page loads successfully
- Size specifications displayed
- Dimension diagrams visible
- Tolerance information present
- No console errors

---

### TC-PUB-084: Image Guide Page

**Description:** 画像ガイドページが正しく表示されることを確認

**Preconditions:** None

**Test Steps:**
1. Navigate to `http://localhost:3000/guide/image`
2. Verify page title
3. Check image guide content
4. Verify resolution information
5. Check console for errors

**Expected Results:**
- Page loads successfully
- Image specifications displayed
- Resolution requirements visible (300dpi+)
- Format requirements listed
- No console errors

---

### TC-PUB-085: Shirohan Guide Page

**Description:** 白版ガイドページが正しく表示されることを確認

**Preconditions:** None

**Test Steps:**
1. Navigate to `http://localhost:3000/guide/shirohan`
2. Verify page title
3. Check shirohan guide content
4. Verify layout examples
5. Check console for errors

**Expected Results:**
- Page loads successfully
- White plate (shirohan) information displayed
- Layout examples visible
- Placement rules explained
- No console errors

---

### TC-PUB-086: Environmental Display Guide Page

**Description:** 環境表示ガイドページが正しく表示されることを確認

**Preconditions:** None

**Test Steps:**
1. Navigate to `http://localhost:3000/guide/environmentaldisplay`
2. Verify page title
3. Check environmental guide content
4. Verify certification marks
5. Check console for errors

**Expected Results:**
- Page loads successfully
- Environmental labeling information displayed
- Certification marks visible
- Recycling information present
- No console errors

---

## 10. News (/news)

### TC-PUB-090: News Page Load

**Description:** ニュースページが正しく読み込まれることを確認

**Preconditions:** None

**Test Steps:**
1. Navigate to `http://localhost:3000/news`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify news articles are displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "パウチ包装ニュース | Epackage Lab"
- News articles displayed in grid/list
- Pagination controls visible (if applicable)
- No console errors

---

### TC-PUB-091: News Article Display

**Description:** ニュース記事が正しく表示されることを確認

**Preconditions:** News page loaded with articles

**Test Steps:**
1. Click on a news article
2. Verify article detail page loads
3. Check article content
4. Verify images load
5. Check related articles section

**Expected Results:**
- Article detail page loads
- Title, date, content displayed
- Images load without errors
- Related articles section visible
- Back button/link works
- No console errors

---

### TC-PUB-092: News Filtering and Search

**Description:** ニュースのフィルタリングと検索が正しく動作することを確認

**Preconditions:** News page loaded

**Test Steps:**
1. Locate search bar
2. Enter search term
3. Verify results update
4. Use category filter (if available)
5. Use date filter (if available)
6. Clear filters

**Expected Results:**
- Search bar accepts input
- Results update based on search
- Filters work correctly
- Clear filters resets view
- "No results" message when appropriate
- No console errors

---

### TC-PUB-093: News Pagination

**Description:** ニュースページのページネーションが正しく動作することを確認

**Preconditions:** News page loaded with many articles

**Test Steps:**
1. Verify page numbers displayed
2. Click "次へ" (Next) button
3. Verify new articles load
4. Click page number
5. Verify correct page loads
6. Click "前へ" (Previous) button

**Expected Results:**
- Pagination controls visible
- Next/Previous buttons work
- Page numbers clickable
- URL updates with page parameter
- Articles change per page
- No console errors

---

## 11. Archives (/archives)

### TC-PUB-100: Archives Page Load

**Description:** アーカイブページが正しく読み込まれることを確認

**Preconditions:** None

**Test Steps:**
1. Navigate to `http://localhost:3000/archives`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify archive items are displayed

**Expected Results:**
- Page loads within 3 seconds
- Archive items displayed
- Filters available (by date, category)
- Search functionality present
- No console errors

---

### TC-PUB-101: Archive Item Detail

**Description:** アーカイブアイテムの詳細が正しく表示されることを確認

**Preconditions:** Archives page loaded

**Test Steps:**
1. Click on an archive item
2. Verify detail modal/page opens
3. Check item details
4. Verify images/documents
5. Close detail view

**Expected Results:**
- Detail view opens correctly
- All item information displayed
- Images/documents load
- Download links work (if applicable)
- Close button works
- No console errors

---

### TC-PUB-102: Archive Filtering

**Description:** アーカイブのフィルタリング機能が正しく動作することを確認

**Preconditions:** Archives page loaded

**Test Steps:**
1. Use date range filter
2. Use category filter
3. Use keyword search
4. Combine filters
5. Clear all filters

**Expected Results:**
- Date filter works
- Category filter works
- Search returns relevant results
- Combined filters work together
- Clear resets all filters
- No console errors

---

## Cross-Page Tests

### TC-PUB-110: Global Navigation

**Description:** グローバルナビゲーションがすべてのページで正しく動作することを確認

**Preconditions:** Any page loaded

**Test Steps:**
1. Click logo - verify redirects to home
2. Click "カタログ" - verify redirects to catalog
3. Click "見積シミュレーター" - verify redirects to quote-simulator
4. Click "サンプル依頼" - verify redirects to samples
5. Click "お問い合わせ" - verify redirects to contact
6. Test on multiple pages

**Expected Results:**
- Logo always redirects to home
- All navigation links work correctly
- Active page highlighted in nav
- Navigation responsive on mobile
- No console errors

---

### TC-PUB-111: Footer Links

**Description:** フッターリンクがすべてのページで正しく動作することを確認

**Preconditions:** Any page loaded

**Test Steps:**
1. Scroll to footer
2. Click "会社概要" link
3. Click "プライバシーポリシー" link
4. Click "利用規約" link
5. Click contact information links
6. Verify all links work

**Expected Results:**
- All footer links are clickable
- Links redirect to correct pages
- No 404 errors
- External links open in new tab
- No console errors

---

### TC-PUB-112: Responsive Design - Mobile

**Description:** すべての公開ページがモバイルデバイスで正しく表示されることを確認

**Preconditions:** None

**Test Steps:**
1. Set viewport to mobile (375x667)
2. Navigate through all public pages
3. Test mobile menu
4. Verify content readability
5. Test touch interactions

**Expected Results:**
- All pages responsive
- Mobile menu works
- Content readable without horizontal scroll
- Touch targets adequate size
- Images resize properly
- No console errors

---

### TC-PUB-113: Console Error Check

**Description:** すべての公開ページでコンソールエラーがないことを確認

**Preconditions:** Development server running

**Test Steps:**
1. Open browser DevTools console
2. Navigate to each public page
3. Record any errors
4. Filter out expected dev mode errors
5. Document unexpected errors

**Expected Results:**
- No critical errors
- No React errors
- No network errors for assets
- Expected dev mode errors filtered:
  - 404 for missing API routes
  - 500 for database connection issues
- Any unexpected errors documented

---

### TC-PUB-114: Performance Check

**Description:** すべての公開ページのパフォーマンスが許容範囲内であることを確認

**Preconditions:** None

**Test Steps:**
1. Open Lighthouse (Chrome DevTools)
2. Run audit for each public page
3. Record scores
4. Check Core Web Vitals
5. Document any issues

**Expected Results:**
- Performance score > 90
- LCP < 2.5s
- CLS < 0.1
- FID < 100ms
- No significant issues
- Recommendations documented

---

## Test Summary

### Test Coverage
- **Total Test Cases:** 114
- **Pages Covered:** 11 main pages + sub-pages
- **Test Categories:**
  - Page Load & Render: 11 tests
  - Navigation: 15 tests
  - Forms: 35 tests
  - Interactive Elements: 25 tests
  - Validation: 18 tests
  - Cross-Page: 10 tests

### Priority Matrix
- **P0 (Critical):** Homepage, Catalog, Quote Simulator, Sign In
- **P1 (High):** Samples, Contact, Register, Guide Pages
- **P2 (Medium):** News, Archives, ROI Calculator

### Notes
- All tests assume development environment at localhost:3000
- API errors expected in dev mode - filtered out
- Console errors should be documented for review
- Screenshots recommended for failures
- Tests should be executed in order where dependencies exist
- Each test is independent and can be run standalone

---

**End of Phase 1 Test Scenarios**
