# Epackage Lab Homepage - Comprehensive E2E Test Plan

## Document Information
- **Project**: Epackage Lab Website
- **Document Version**: 1.0
- **Created Date**: 2026-01-13
- **Test Suite**: homepage-comprehensive.spec.ts
- **Test Environment**: http://localhost:3002

## Executive Summary

This document provides a comprehensive test plan for the Epackage Lab homepage (http://localhost:3002/), a Japanese B2B packaging solution website. The homepage serves as the primary entry point for potential customers and features product showcases, manufacturing process information, CTAs, and company information.

### Test Scope
- **Total Test Cases**: 55+
- **Test Categories**: 10
- **Coverage Areas**: Navigation, Hero Section, Product Showcase, Manufacturing Process, CTA Section, Footer, Responsive Design, Accessibility, Performance, User Flows

### Key Features Tested
1. Navigation and header components
2. Hero section with statistics and CTAs
3. Product showcase section with dynamic content
4. Manufacturing process (4-step) display
5. CTA section with multiple action options
6. Footer with social links and newsletter
7. Announcement banners (conditional)
8. Responsive design across devices
9. Accessibility compliance
10. User interaction flows

---

## Application Overview

### Purpose
The Epackage Lab homepage is a marketing and lead generation page designed to:
- Showcase packaging products and capabilities
- Provide instant quote access
- Encourage sample requests
- Display manufacturing expertise
- Build trust through certifications and statistics
- Capture leads through contact forms and newsletter

### Target Audience
- Japanese B2B customers (manufacturing, food, cosmetics, electronics)
- Procurement managers
- Product development teams
- Quality assurance professionals

### Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Testing**: Playwright E2E
- **Animations**: Framer Motion

---

## Test Scenarios

## 1. Navigation & Header Tests

### Purpose
Verify all navigation elements work correctly and users can access all main sections of the site.

### Test Cases

#### [NAV-001] Logo should navigate to homepage

**Steps:**
1. Navigate to `http://localhost:3002/`
2. Locate the Epackage Lab logo in the header
3. Click on the logo
4. Verify the URL remains `http://localhost:3002/`

**Expected Results:**
- Logo is visible and clickable
- Clicking logo redirects to homepage
- Page reloads or stays on homepage

**Success Criteria:**
- Logo element exists
- Logo is an anchor tag with href="/"
- Clicking logo navigates to root URL

**Failure Conditions:**
- Logo not visible
- Logo not clickable
- Navigation fails

---

#### [NAV-002] All main navigation links should be visible

**Steps:**
1. Navigate to homepage
2. Verify each navigation item is visible:
   - ホーム (Home)
   - 製品カタログ (Product Catalog)
   - 会社概要 (Company Profile)
   - お見積り (Quote)
   - お問い合わせ (Contact)

**Expected Results:**
- All 5 navigation items are visible
- All items have appropriate icons (if configured)
- Items are properly aligned

**Success Criteria:**
- All navigation links present in DOM
- All links are visible (display != none)
- Links have proper text content

**Failure Conditions:**
- Any navigation item missing
- Items not visible
- Text not rendered correctly

---

#### [NAV-003] Navigation links should redirect to correct pages

**Steps:**
1. Navigate to homepage
2. For each navigation item:
   - Click the link
   - Verify URL matches expected destination
   - Navigate back to homepage
   - Repeat for next item

**Expected Results:**
- Each link navigates to correct URL:
  - ホーム → `/`
  - 製品カタログ → `/catalog`
  - 会社概要 → `/about`
  - お見積り → `/roi-calculator`
  - お問い合わせ → `/contact`

**Success Criteria:**
- All links navigate without errors
- Destination URLs match expectations
- Pages load successfully

**Failure Conditions:**
- 404 errors
- Incorrect redirects
- Broken navigation

---

#### [NAV-004] Active navigation state should be highlighted

**Steps:**
1. Navigate to homepage
2. Inspect the "ホーム" navigation link
3. Verify it has active state styling

**Expected Results:**
- Homepage link has active class
- Active link has different styling (color, background)
- Styling matches design specifications

**Success Criteria:**
- Active link has class containing `text-brixa-600` or similar
- Visual distinction from inactive links

**Failure Conditions:**
- No active state
- Wrong link marked as active
- Styling not applied

---

#### [NAV-005] Mobile menu toggle should exist and be functional

**Steps:**
1. Set viewport to mobile size (375x667)
2. Navigate to homepage
3. Locate mobile menu toggle button
4. Click the toggle button
5. Verify mobile navigation drawer appears

**Expected Results:**
- Hamburger menu button visible on mobile
- Clicking opens mobile navigation drawer
- Drawer contains all navigation items
- Clicking outside or pressing Escape closes drawer

**Success Criteria:**
- Menu button visible on mobile viewport
- Drawer animates in smoothly
- All navigation items accessible in drawer
- Drawer can be closed

**Failure Conditions:**
- Menu button not found
- Drawer doesn't open
- Navigation items missing from drawer

---

## 2. Hero Section Tests

### Purpose
Verify the hero section displays correctly and all CTAs function properly.

### Test Cases

#### [HERO-001] Hero section should be visible

**Steps:**
1. Navigate to homepage
2. Locate hero section containing main headline
3. Verify section is visible

**Expected Results:**
- Hero section is at top of page
- Full-width section with background image
- Content overlays background properly

**Success Criteria:**
- Hero section exists in DOM
- Section is visible (not display: none)
- Section has proper positioning

**Failure Conditions:**
- Hero section not found
- Section not visible
- Layout broken

---

#### [HERO-002] Main headline should be displayed correctly

**Steps:**
1. Navigate to homepage
2. Locate H1 heading
3. Verify text content: "あなたの製品を最適な包装で輝かせる"

**Expected Results:**
- H1 contains expected Japanese text
- Text is properly styled (font size, color)
- Text is readable against background

**Success Criteria:**
- H1 tag exists
- Text content matches specification
- Text is visible

**Failure Conditions:**
- H1 not found
- Text content incorrect
- Text not visible or unreadable

---

#### [HERO-003] Key statistics should be visible

**Steps:**
1. Navigate to homepage
2. Verify three key statistics are displayed:
   - "500" + "種以上製造可能" (500+ product types)
   - "10" + "早期納品" (10-day early delivery)
   - "100" + "社以上実績" (100+ companies served)

**Expected Results:**
- All three statistics visible
- Numbers prominently displayed
- Japanese labels properly formatted
- Statistics have appropriate icons

**Success Criteria:**
- All numbers visible
- All labels visible
- Proper icons (TrendingUp, Zap, Shield)
- Statistics in grid/flex layout

**Failure Conditions:**
- Any statistic missing
- Numbers not displayed
- Labels incorrect

---

#### [HERO-004] Hero CTA buttons should be visible and clickable

**Steps:**
1. Navigate to homepage
2. Verify three CTA buttons:
   - "製品を見る" (View Products)
   - "即時見積もり" (Instant Quote)
   - "無料サンプル" (Free Samples)

**Expected Results:**
- All three buttons visible
- Buttons have proper styling (gradient, icons)
- Buttons are clickable
- Hover effects work

**Success Criteria:**
- All buttons present in DOM
- All buttons visible
- All buttons enabled
- Proper styling applied

**Failure Conditions:**
- Buttons missing
- Buttons not clickable
- Styling broken

---

#### [HERO-005] Hero CTA buttons should navigate to correct pages

**Steps:**
1. Navigate to homepage
2. Click "製品を見る" button
3. Verify navigation to `/catalog`
4. Return to homepage
5. Click "即時見積もり" button
6. Verify navigation to `/quote-simulator`
7. Return to homepage
8. Click "無料サンプル" button
9. Verify navigation to `/samples`

**Expected Results:**
- "製品を見る" → `/catalog`
- "即時見積もり" → `/quote-simulator`
- "無料サンプル" → `/samples`
- All pages load successfully

**Success Criteria:**
- All buttons navigate correctly
- No 404 errors
- Smooth transitions

**Failure Conditions:**
- Incorrect navigation
- Broken links
- Navigation errors

---

#### [HERO-006] Trust indicators should be displayed

**Steps:**
1. Navigate to homepage
2. Scroll to trust indicators section
3. Verify following statistics:
   - "21日" + "平均納期" (21-day average lead time)
   - "100%" + "全検査合格" (100% inspection pass)
   - "30%" + "コスト削減" (30% cost reduction)

**Expected Results:**
- All three indicators visible
- Icons properly displayed (Clock, Shield, Calculator)
- Labels and descriptions in Japanese
- Proper color coding for each indicator

**Success Criteria:**
- All statistics present
- All labels visible
- Icons loaded
- Proper styling

**Failure Conditions:**
- Indicators missing
- Icons not loading
- Text not displayed

---

#### [HERO-007] Feature badges should be visible

**Steps:**
1. Navigate to homepage
2. Locate feature badges below trust indicators
3. Verify badges:
   - "食品包装対応" (Food packaging compatible)
   - "JIS規格対応" (JIS standard compatible)
   - "完全カスタマイズ" (Full customization)
   - "日本語サポート" (Japanese language support)

**Expected Results:**
- All four badges visible
- Each badge has checkmark icon
- Badges have rounded styling
- Hover effects work

**Success Criteria:**
- All badges present
- Icons visible
- Proper styling
- Interactive hover states

**Failure Conditions:**
- Badges missing
- Icons not displayed
- Styling broken

---

#### [HERO-008] Hero background image should load

**Steps:**
1. Navigate to homepage
2. Locate hero background image
3. Verify image loads successfully

**Expected Results:**
- Image with src containing "stand-pouch"
- Image loads without errors
- Image covers full hero section
- Gradient overlays applied properly

**Success Criteria:**
- Image element exists
- Image.complete === true
- naturalHeight > 0
- No console errors related to image

**Failure Conditions:**
- Image not found
- Image fails to load
- Broken image icon displayed

---

## 3. Product Showcase Section Tests

### Purpose
Verify the product showcase section displays featured products correctly.

### Test Cases

#### [PROD-001] Product showcase section should be visible

**Steps:**
1. Navigate to homepage
2. Scroll to product showcase section
3. Verify section heading: "あなたの製品に最適なパッケージソリューション"

**Expected Results:**
- Section visible after hero section
- Section has proper heading
- Section has gray/light background

**Success Criteria:**
- Section exists in DOM
- Heading text matches
- Section is visible

**Failure Conditions:**
- Section not found
- Heading incorrect
- Section not visible

---

#### [PROD-002] Product cards should be displayed

**Steps:**
1. Navigate to homepage
2. Wait for products to load (max 5 seconds)
3. Count product cards
4. Verify at least 1 product displayed

**Expected Results:**
- Product cards load dynamically
- Cards arranged in grid layout
- Each card has image, title, description
- Cards have proper spacing

**Success Criteria:**
- At least 1 product card visible
- Grid layout properly applied
- All cards have required content

**Failure Conditions:**
- No products displayed
- Layout broken
- Cards missing content

---

#### [PROD-003] Product cards should have required information

**Steps:**
1. Navigate to homepage
2. Wait for products to load
3. Select first product card
4. Verify contains:
   - Product name (h3)
   - Description text
   - Category badge
   - MOQ (Minimum Order Quantity)
   - Lead time
   - Feature tags

**Expected Results:**
- All required information present
- Information in Japanese
- Numbers formatted correctly (with commas)
- Icons displayed properly

**Success Criteria:**
- Product name visible
- Description text visible
- Category badge visible
- MOQ and lead time visible
- At least 3 feature tags

**Failure Conditions:**
- Missing information
- Text not displayed
- Formatting errors

---

#### [PROD-004] Product section CTA should navigate to catalog

**Steps:**
1. Navigate to homepage
2. Scroll to product showcase section
3. Locate "製品を見る" button below products
4. Click button
5. Verify navigation to `/catalog`

**Expected Results:**
- Button visible and clickable
- Click navigates to catalog page
- Catalog page loads successfully
- All products visible on catalog page

**Success Criteria:**
- Button exists
- Navigation successful
- Catalog page loads

**Failure Conditions:**
- Button not found
- Navigation fails
- Catalog page errors

---

#### [PROD-005] Product cards should be clickable

**Steps:**
1. Navigate to homepage
2. Wait for products to load
3. Click on first product card
4. Verify navigation to catalog or product detail

**Expected Results:**
- Product card is clickable
- Click navigates to `/catalog` or `/catalog/{slug}`
- Target page loads successfully
- Product information displayed correctly

**Success Criteria:**
- Card has click handler
- Navigation successful
- Target page loads

**Failure Conditions:**
- Card not clickable
- Navigation fails
- Target page errors

---

## 4. Manufacturing Process Section Tests

### Purpose
Verify the manufacturing process showcase displays all 4 steps correctly.

### Test Cases

#### [MANU-001] Manufacturing process section should be visible

**Steps:**
1. Navigate to homepage
2. Scroll to manufacturing process section
3. Verify section heading: "一貫したパウチ製造サービス"

**Expected Results:**
- Section visible below product showcase
- Section has timeline layout
- Section has proper heading

**Success Criteria:**
- Section exists
- Heading text matches
- Section visible

**Failure Conditions:**
- Section not found
- Heading incorrect
- Section not visible

---

#### [MANU-002] All 4 manufacturing steps should be displayed

**Steps:**
1. Navigate to homepage
2. Scroll to manufacturing process section
3. Verify each step is displayed:
   - Step 01: デジタル印刷 (Digital Printing)
   - Step 02: ラミネート加工 (Laminating)
   - Step 03: スリッティング/切断 (Slitting/Cutting)
   - Step 04: パウチ加工 (Pouch Forming)

**Expected Results:**
- All 4 steps visible
- Each step has number badge
- Each step has English subtitle
- Steps arranged in timeline format
- Images on alternating sides

**Success Criteria:**
- All 4 steps present
- Step numbers visible (01, 02, 03, 04)
- Japanese titles visible
- English subtitles visible

**Failure Conditions:**
- Steps missing
- Step numbers incorrect
- Titles not displayed

---

#### [MANU-003] Process images should load

**Steps:**
1. Navigate to homepage
2. Scroll to manufacturing process section
3. Locate all process images
4. Verify each image loads successfully

**Expected Results:**
- 4 images present (one per step)
- Images from `/images/` directory
- Images have proper alt text
- Images load without errors

**Success Criteria:**
- All images loaded (complete === true)
- naturalHeight > 0 for all images
- No console errors for images

**Failure Conditions:**
- Images not loading
- Broken image icons
- Console errors

---

#### [MANU-004] Process features should be listed

**Steps:**
1. Navigate to homepage
2. Scroll to manufacturing process section
3. Verify key features listed:
   - "HP Indigo 25000" (Digital printing)
   - "NON-VOC工法" (Laminating)
   - "島打刃設備" (Slitting)
   - Other features with checkmarks

**Expected Results:**
- Each step has 4 features listed
- Features have checkmark icons
- Features in 2-column grid
- Japanese text properly formatted

**Success Criteria:**
- Features visible for each step
- Checkmark icons present
- Grid layout applied

**Failure Conditions:**
- Features missing
- Icons not displayed
- Layout broken

---

#### [MANU-005] Quality statistics should be displayed

**Steps:**
1. Navigate to homepage
2. Scroll to bottom of manufacturing process section
3. Verify quality statistics:
   - "99.8%" + "品質合格率" (Quality pass rate)
   - "24時間" + "生産リードタイム" (Production lead time)
   - "15年" + "平均従業年数" (Average employee years)
   - "ISO9001" + "国際品質規格" (International quality standard)

**Expected Results:**
- All 4 statistics visible
- Statistics in card layout
- Each has icon
- Numbers prominently displayed

**Success Criteria:**
- All statistics present
- All labels visible
- Icons loaded
- Proper styling

**Failure Conditions:**
- Statistics missing
- Icons not loading
- Labels incorrect

---

## 5. CTA Section Tests

### Purpose
Verify the CTA section provides multiple paths for user engagement.

### Test Cases

#### [CTA-001] CTA section should be visible

**Steps:**
1. Navigate to homepage
2. Scroll to CTA section
3. Verify section heading: "あなたの製品包装を今すぐ始めよう"

**Expected Results:**
- Section visible with gradient background
- Section has proper heading
- Section positioned before footer

**Success Criteria:**
- Section exists
- Heading text matches
- Section visible
- Gradient background applied

**Failure Conditions:**
- Section not found
- Heading incorrect
- Section not visible

---

#### [CTA-002] All CTA cards should be visible

**Steps:**
1. Navigate to homepage
2. Scroll to CTA section
3. Verify 4 CTA cards:
   - 製品カタログ (Product Catalog)
   - 価格計算 (Price Calculator)
   - 無料サンプル (Free Samples)
   - お問合せ (Contact)

**Expected Results:**
- All 4 cards visible
- Each card has icon
- Each card has title and description
- Cards in horizontal row on desktop
- Cards stack on mobile

**Success Criteria:**
- All cards present
- All cards visible
- Proper layout

**Failure Conditions:**
- Cards missing
- Layout broken
- Icons not displayed

---

#### [CTA-003] CTA cards should navigate to correct pages

**Steps:**
1. Navigate to homepage
2. Click each CTA card and verify navigation:
   - 製品カタログ → `/catalog`
   - 価格計算 → `/roi-calculator`
   - 無料サンプル → `/samples`
   - お問合せ → `/contact`

**Expected Results:**
- All cards navigate correctly
- Pages load successfully
- No 404 errors

**Success Criteria:**
- All links work
- All destinations reachable

**Failure Conditions:**
- Broken links
- Incorrect navigation
- Page load errors

---

#### [CTA-004] Trust indicators should be displayed

**Steps:**
1. Navigate to homepage
2. Scroll to bottom of CTA section
3. Verify trust indicators:
   - 24時間対応 (24-hour support)
   - 無料相談 (Free consultation)
   - 100社以上実績 (100+ companies track record)
   - 専門スタッフ (Expert staff)

**Expected Results:**
- All 4 indicators visible
- Each has checkmark icon
- Text in Japanese
- Proper spacing

**Success Criteria:**
- All indicators present
- Icons visible
- Text readable

**Failure Conditions:**
- Indicators missing
- Icons not displayed

---

## 6. Announcement Banner Tests

### Purpose
Verify announcement banners display when announcements exist.

### Test Cases

#### [ANNC-001] Announcement banner should be conditionally displayed

**Steps:**
1. Navigate to homepage
2. Check for announcement banner presence
3. If present, verify content
4. If absent, verify no errors

**Expected Results:**
- Banner displays when announcements exist in database
- Banner hidden when no announcements
- No console errors when absent
- Proper styling when present (color-coded by category)

**Success Criteria:**
- No errors when banner absent
- Proper display when present
- Correct categorization (notice, update, promotion, maintenance)

**Failure Conditions:**
- Errors when banner absent
- Incorrect display when present

---

## 7. Footer Tests

### Purpose
Verify footer contains all required information and functions correctly.

### Test Cases

#### [FOOT-001] Footer should be visible

**Steps:**
1. Navigate to homepage
2. Scroll to bottom of page
3. Verify footer element exists

**Expected Results:**
- Footer visible at page bottom
- Footer has proper background
- Footer contains multiple sections

**Success Criteria:**
- Footer element exists
- Footer is visible
- Footer has proper structure

**Failure Conditions:**
- Footer not found
- Footer not visible

---

#### [FOOT-002] Company information should be displayed

**Steps:**
1. Navigate to homepage
2. Scroll to footer
3. Verify company information:
   - Company name: "Epackage Lab"
   - Email: "info@epackage-lab.com"
   - Phone: "+81-80-6942-7235"
   - Address: "兵庫県明石市上ノ丸2-11-21-102"

**Expected Results:**
- All information visible
- Email is clickable (mailto:)
- Phone number formatted correctly
- Address in Japanese

**Success Criteria:**
- Company name visible
- Email visible and clickable
- Phone visible
- Address visible

**Failure Conditions:**
- Information missing
- Email not clickable
- Incorrect information

---

#### [FOOT-003] All social media links should be visible

**Steps:**
1. Navigate to homepage
2. Scroll to footer social media section
3. Verify all 5 social links:
   - Facebook
   - Twitter
   - LinkedIn
   - Instagram
   - YouTube

**Expected Results:**
- All 5 platforms visible
- Each has proper icon
- Each has proper color on hover
- Links open in new tabs

**Success Criteria:**
- All platforms present
- Icons loaded
- Hover effects work

**Failure Conditions:**
- Platforms missing
- Icons not loading
- Links not working

---

#### [FOOT-004] Social media links should open in new tabs

**Steps:**
1. Navigate to homepage
2. Locate Facebook link in footer
3. Verify has target="_blank"
4. Verify has rel="noopener noreferrer"

**Expected Results:**
- Social links open in new tabs
- Security attributes present

**Success Criteria:**
- target="_blank" attribute present
- rel="noopener noreferrer" present

**Failure Conditions:**
- Links open in same tab
- Security attributes missing

---

#### [FOOT-005] Privacy links should be visible and functional

**Steps:**
1. Navigate to homepage
2. Scroll to footer privacy section
3. Verify all 4 privacy links:
   - 個人情報保護方針 → `/privacy`
   - 利用規約 → `/terms`
   - 特定商取引法 → `/legal`
   - 社会的責任 → `/csr`

**Expected Results:**
- All links visible
- Each link has icon
- Each link has description
- All links navigate correctly

**Success Criteria:**
- All links present
- All links functional
- Correct destinations

**Failure Conditions:**
- Links missing
- Navigation fails
- 404 errors

---

#### [FOOT-006] Newsletter subscription form should be visible

**Steps:**
1. Navigate to homepage
2. Scroll to footer newsletter section
3. Verify email input field
4. Verify subscribe button

**Expected Results:**
- Email input visible with placeholder
- Subscribe button visible
- Form has proper styling
- Icons displayed

**Success Criteria:**
- Input field present
- Subscribe button present
- Placeholder text correct

**Failure Conditions:**
- Form elements missing
- Placeholder incorrect

---

#### [FOOT-007] Newsletter form should accept valid email

**Steps:**
1. Navigate to homepage
2. Scroll to footer
3. Enter valid email: "test@example.com"
4. Click subscribe button
5. Verify form submission

**Expected Results:**
- Form accepts valid email
- Button shows loading state
- Form submits without errors
- Success message or redirect

**Success Criteria:**
- No validation errors
- Form submits
- No console errors

**Failure Conditions:**
- Validation rejects valid email
- Form doesn't submit
- Console errors

---

#### [FOOT-008] Newsletter form should reject invalid email

**Steps:**
1. Navigate to homepage
2. Scroll to footer
3. Enter invalid email: "invalid-email"
4. Click subscribe button
5. Verify validation error

**Expected Results:**
- Browser validation prevents submission
- Input shows invalid state
- Error message displayed

**Success Criteria:**
- Form validation works
- Submission prevented
- Error feedback provided

**Failure Conditions:**
- Invalid email accepted
- No validation
- No error message

---

#### [FOOT-009] Back to top button should appear on scroll

**Steps:**
1. Navigate to homepage
2. Verify back-to-top button not visible
3. Scroll down 500px
4. Verify button becomes visible
5. Click button
6. Verify scroll to top

**Expected Results:**
- Button hidden initially
- Button appears after scrolling
- Clicking scrolls to top
- Smooth scroll animation

**Success Criteria:**
- Button visibility changes
- Scroll to top works
- scrollTop === 0 after click

**Failure Conditions:**
- Button not appearing
- Click not working
- No scroll to top

---

#### [FOOT-010] Copyright notice should be displayed

**Steps:**
1. Navigate to homepage
2. Scroll to footer bottom bar
3. Verify copyright text includes current year
4. Verify "全著作権所有" or "copyright" text

**Expected Results:**
- Current year displayed (e.g., "2026")
- Copyright text visible
- Company name mentioned

**Success Criteria:**
- Year matches current year
- Copyright text present
- Proper formatting

**Failure Conditions:**
- Year incorrect
- Copyright text missing

---

## 8. Responsive Design Tests

### Purpose
Verify homepage displays correctly across all device sizes.

### Test Cases

#### [RESP-001] Homepage should load on desktop

**Steps:**
1. Set viewport to 1920x1080
2. Navigate to homepage
3. Verify page loads without errors
4. Verify layout is correct

**Expected Results:**
- Full-width layout
- Navigation visible in header
- 3-column product grid
- Horizontal CTA cards
- All content visible

**Success Criteria:**
- No console errors
- Layout matches design
- All sections visible

**Failure Conditions:**
- Layout broken
- Console errors
- Content overflow

---

#### [RESP-002] Homepage should load on tablet

**Steps:**
1. Set viewport to 768x1024
2. Navigate to homepage
3. Verify page loads without errors
4. Verify layout adapts

**Expected Results:**
- Layout adapts to tablet
- 2-column product grid
- Stacked CTA cards
- All content accessible

**Success Criteria:**
- No horizontal scroll
- All content visible
- Proper spacing

**Failure Conditions:**
- Horizontal scroll required
- Content cut off
- Layout broken

---

#### [RESP-003] Homepage should load on mobile

**Steps:**
1. Set viewport to 375x667
2. Navigate to homepage
3. Verify page loads without errors
4. Verify mobile layout

**Expected Results:**
- Single column layout
- Hamburger menu visible
- Stacked product cards
- Stacked CTA cards
- Touch-friendly buttons

**Success Criteria:**
- No horizontal scroll
- All content accessible
- Proper touch targets

**Failure Conditions:**
- Horizontal scroll
- Content not accessible
- Touch targets too small

---

#### [RESP-004] Navigation should be responsive

**Steps:**
1. Test on desktop viewport (1920x1080)
2. Verify horizontal navigation visible
3. Switch to mobile viewport (375x667)
4. Verify hamburger menu appears
5. Test mobile menu open/close

**Expected Results:**
- Desktop: horizontal nav visible
- Mobile: hamburger menu visible
- Mobile menu opens drawer
- Drawer contains all nav items

**Success Criteria:**
- Proper nav for each viewport
- Mobile menu functional
- All items accessible

**Failure Conditions:**
- Wrong nav type for viewport
- Mobile menu broken

---

## 9. Accessibility Tests

### Purpose
Verify homepage meets accessibility standards.

### Test Cases

#### [A11Y-001] Page should have proper heading structure

**Steps:**
1. Navigate to homepage
2. Verify only one H1 exists
3. Verify H2, H3 hierarchy is logical
4. Verify no skipped heading levels

**Expected Results:**
- Exactly one H1 (main headline)
- H2s for major sections
- H3s for subsections
- Logical hierarchy maintained

**Success Criteria:**
- H1 count === 1
- No skipped levels
- Proper nesting

**Failure Conditions:**
- Multiple H1s
- Skipped levels
- Poor hierarchy

---

#### [A11Y-002] Images should have alt text

**Steps:**
1. Navigate to homepage
2. Locate all img elements
3. Verify each has alt attribute
4. Verify alt text is descriptive

**Expected Results:**
- All images have alt attribute
- Alt text describes image content
- Decorative images have empty alt

**Success Criteria:**
- All images have alt
- Alt text not null
- Alt text descriptive

**Failure Conditions:**
- Missing alt attributes
- Empty alt for informative images
- Non-descriptive alt text

---

#### [A11Y-003] Links should have accessible names

**Steps:**
1. Navigate to homepage
2. Locate all links with href
3. Verify each has text content or aria-label
4. Verify names are descriptive

**Expected Results:**
- All links have accessible names
- Names describe link destination
- No "click here" links

**Success Criteria:**
- Text content or aria-label present
- Names are meaningful

**Failure Conditions:**
- Unnamed links
- Non-descriptive names

---

#### [A11Y-004] Buttons should have accessible labels

**Steps:**
1. Navigate to homepage
2. Locate all button elements
3. Verify each has text content or aria-label
4. Verify labels describe button action

**Expected Results:**
- All buttons have labels
- Labels describe button purpose
- Icon buttons have aria-label

**Success Criteria:**
- Text or aria-label present
- Labels are descriptive

**Failure Conditions:**
- Unlabeled buttons
- Non-descriptive labels

---

#### [A11Y-005] Form inputs should have labels

**Steps:**
1. Navigate to homepage
2. Locate all input elements
3. Verify each has associated label or placeholder
4. Verify labels describe input purpose

**Expected Results:**
- All inputs have labels
- Labels properly associated
- Placeholders provide additional context

**Success Criteria:**
- Label or placeholder present
- Association correct (for/id matching)

**Failure Conditions:**
- Unlabeled inputs
- No placeholder or label

---

## 10. Performance Tests

### Purpose
Verify homepage loads quickly and efficiently.

### Test Cases

#### [PERF-001] Page should load within acceptable time

**Steps:**
1. Navigate to homepage
2. Measure time to load
3. Wait for network idle
4. Verify load time < 5 seconds

**Expected Results:**
- Page loads within 5 seconds
- All resources loaded
- No console errors

**Success Criteria:**
- Load time < 5000ms
- Network idle achieved
- No errors

**Failure Conditions:**
- Load time exceeds 5s
- Resources fail to load
- Console errors

---

#### [PERF-002] Critical images should load

**Steps:**
1. Navigate to homepage
2. Wait for hero background image
3. Verify image loaded successfully
4. Check image dimensions

**Expected Results:**
- Hero image loads
- Image has proper dimensions
- No image errors

**Success Criteria:**
- Image.complete === true
- naturalHeight > 0
- No console errors

**Failure Conditions:**
- Image fails to load
- Broken image icon
- Console errors

---

## 11. User Interaction Flow Tests

### Purpose
Verify common user workflows work correctly.

### Test Cases

#### [FLOW-001] Complete navigation flow

**Steps:**
1. Navigate to homepage
2. Click "製品を見る"
3. Verify on catalog page
4. Click back button
5. Verify on homepage
6. Click "即時見積もり"
7. Verify on quote simulator

**Expected Results:**
- All navigations work
- Back button works
- URLs update correctly
- Pages load successfully

**Success Criteria:**
- All clicks navigate correctly
- Browser history works
- No navigation errors

**Failure Conditions:**
- Navigation fails
- URLs incorrect
- Pages don't load

---

#### [FLOW-002] Sample request flow from homepage

**Steps:**
1. Navigate to homepage
2. Click "無料サンプル" button
3. Verify navigation to samples page
4. Verify samples page loads

**Expected Results:**
- Button navigates to /samples
- Samples page loads
- Sample request form visible

**Success Criteria:**
- Navigation successful
- Samples page functional

**Failure Conditions:**
- Navigation fails
- Samples page errors

---

#### [FLOW-003] Contact flow from homepage

**Steps:**
1. Navigate to homepage
2. Click "お問合せ" in CTA section
3. Verify navigation to contact page
4. Verify contact form loads

**Expected Results:**
- Navigates to /contact
- Contact page loads
- Form fields visible

**Success Criteria:**
- Navigation successful
- Contact page functional

**Failure Conditions:**
- Navigation fails
- Contact page errors

---

#### [FLOW-004] Newsletter subscription flow

**Steps:**
1. Navigate to homepage
2. Scroll to footer
3. Enter email: "test@example.com"
4. Click subscribe button
5. Verify form submission

**Expected Results:**
- Form accepts email
- Button shows loading state
- Form submits
- Success feedback shown

**Success Criteria:**
- No validation errors
- Submission completes
- Feedback provided

**Failure Conditions:**
- Validation fails
- Submission fails
- No feedback

---

## 12. SEO & Metadata Tests

### Purpose
Verify homepage has proper SEO metadata.

### Test Cases

#### [SEO-001] Page should have proper title

**Steps:**
1. Navigate to homepage
2. Get page title
3. Verify title contains "Epackage Lab"
4. Verify title is descriptive

**Expected Results:**
- Title includes company name
- Title includes key keywords
- Title length < 60 characters

**Success Criteria:**
- Title contains "Epackage Lab"
- Title is meaningful
- Title not empty

**Failure Conditions:**
- Title missing
- Title too generic
- Title too long

---

#### [SEO-002] Page should have meta description

**Steps:**
1. Navigate to homepage
2. Get meta description content
3. Verify description exists
4. Verify description is descriptive

**Expected Results:**
- Meta description present
- Description length > 50 characters
- Description includes keywords
- Description < 160 characters

**Success Criteria:**
- Description exists
- Length appropriate
- Keywords included

**Failure Conditions:**
- Description missing
- Description too short/long

---

#### [SEO-003] Page should have canonical URL

**Steps:**
1. Navigate to homepage
2. Locate canonical link tag
3. Verify href attribute

**Expected Results:**
- Canonical link present
- Points to correct URL
- No duplicate canonical tags

**Success Criteria:**
- Link tag exists
- href attribute present
- Valid URL format

**Failure Conditions:**
- Canonical missing
- Wrong URL
- Multiple canonicals

---

## 13. Edge Cases & Error Handling Tests

### Purpose
Verify homepage handles edge cases gracefully.

### Test Cases

#### [EDGE-001] Should handle missing images gracefully

**Steps:**
1. Intercept and block image requests
2. Navigate to homepage
3. Verify page still loads
4. Verify fallbacks displayed

**Expected Results:**
- Page loads despite missing images
- Fallback icons/placeholder shown
- No console errors blocking page

**Success Criteria:**
- Page functional
- Fallbacks visible
- No critical errors

**Failure Conditions:**
- Page breaks
- Console errors prevent functionality

---

#### [EDGE-002] Should handle rapid navigation clicks

**Steps:**
1. Navigate to homepage
2. Rapidly click multiple navigation links
3. Verify no errors occur
4. Verify final navigation completes

**Expected Results:**
- No JavaScript errors
- No race conditions
- Final navigation completes

**Success Criteria:**
- No console errors
- Navigation works
- No broken state

**Failure Conditions:**
- Console errors
- Navigation breaks
- State corruption

---

#### [EDGE-003] Should handle scroll behavior

**Steps:**
1. Navigate to homepage
2. Scroll to bottom rapidly
3. Scroll to top rapidly
4. Verify no layout issues
5. Verify all animations complete

**Expected Results:**
- Smooth scrolling
- No layout shifts
- Animations complete
- No performance issues

**Success Criteria:**
- Scroll works smoothly
- No jank
- All elements render

**Failure Conditions:**
- Janky scrolling
- Layout shifts
- Missing content

---

## Test Execution

### Prerequisites
1. Development server running on `http://localhost:3002`
2. Playwright installed and configured
3. Test database populated with sample data
4. Environment variables configured

### Running Tests

```bash
# Run all homepage tests
npx playwright test homepage-comprehensive.spec.ts

# Run specific test suite
npx playwright test homepage-comprehensive.spec.ts --grep "[NAV-001]"

# Run with UI
npx playwright test homepage-comprehensive.spec.ts --ui

# Run with debug
npx playwright test homepage-comprehensive.spec.ts --debug

# Run specific device
npx playwright test homepage-comprehensive.spec.ts --project="Mobile Chrome"
```

### Expected Results
- All tests should pass
- No console errors
- No network errors
- All interactions functional

---

## Test Maintenance

### When to Update Tests
- New features added to homepage
- Navigation structure changes
- Content or copy changes
- New sections added
- Layout changes
- Component refactoring

### Regular Review Schedule
- Monthly: Review and update test data
- Quarterly: Full test suite audit
- As needed: Update for new features

---

## Known Limitations

### Test Data Dependency
- Tests assume database has featured products
- Empty database may cause some tests to fail
- Mock data recommended for consistent testing

### Dynamic Content
- Announcement banners are conditional
- Product data may vary
- Some tests may need adjustment based on actual data

### Browser Compatibility
- Tests focus on modern browsers
- Legacy browsers not tested
- Mobile browsers tested via device emulation

---

## Success Metrics

### Pass Rate Target
- Target: 100% test pass rate
- Minimum acceptable: 95%
- Below 95%: Investigation required

### Performance Targets
- Page load time: < 3 seconds
- Time to interactive: < 5 seconds
- First contentful paint: < 2 seconds

### Accessibility Targets
- WCAG 2.1 AA compliance
- All images have alt text
- All interactive elements accessible

---

## Conclusion

This comprehensive test plan covers all critical aspects of the Epackage Lab homepage, ensuring a high-quality user experience across all devices and browsers. Regular execution and maintenance of these tests will help identify regressions and ensure continuous quality improvement.

For questions or updates to this test plan, please contact the QA team.
