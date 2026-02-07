# Epackage Lab - E2Eテスト実行ガイド (改善版 v2)

このガイドでは、改善されたPlaywright E2Eテストの実行方法について説明します。

## 📋 目次

- [改善版の概要](#改善版の概要)
- [前提条件](#前提条件)
- [クイックスタート](#クイックスタート)
- [テスト実行コマンド](#テスト実行コマンド)
- [テストカバレッジ](#テストカバレッジ)
- [トラブルシューティング](#トラブルシューティング)

---

## 改善版の概要

### v2 テストの改善点

| 項目 | v1 (オリジナル) | v2 (改善版) |
|------|----------------|-------------|
| セレクター | テキストベース | HTML属性ベース |
| ルート対応 | 一部不完全 | 実際のアプリに完全対応 |
| エラーハンドリング | 基本的 | 詳細なハンドリング |
| レスポンシブ | なし | あり（モバイル/タブレット） |
| パフォーマンス | なし | あり（読み込み時間計測） |

### テストファイル

```
tests/
├── e2e/
│   ├── quotation-order-workflow-v2.spec.ts       # ⭐ 改善版メインテスト
│   ├── quotation-order-workflow.spec.ts          # オリジナルテスト
│   ├── admin-specification-change.spec.ts        # 🔧 管理者仕様変更機能テスト
│   ├── member-specification-change.spec.ts        # 🔧 顧客仕様変更機能テスト
│   ├── admin-quotation-detail.spec.ts            # 📋 見積詳細機能テスト（404修正確認）
│   ├── global-setup.ts                           # ✅ 改善済み
│   └── global-teardown.ts                        # ✅ 改善済み
├── quotation-order-workflow-test-plan.md         # 詳細テスト計画書
├── test-data.ts                                  # テストデータ定義
└── README.md                                     # このファイル
```

---

## 前提条件

---

## 🎯 Overview

Complete end-to-end testing suite for the Quotation-to-Order workflow using Playwright.

---

## ⭐ 改善版v2 クイックスタート

### 1. 開発サーバーを起動

```bash
npm run dev
```

### 2. 改善版テストを実行

```bash
# 改善版テストのみ実行
npx playwright test quotation-order-workflow-v2.spec.ts

# UIモードで実行
npx playwright test quotation-order-workflow-v2.spec.ts --ui

# レポート付きで実行
npx playwright test quotation-order-workflow-v2.spec.ts --reporter=html
```

### v2 テストの特徴

- ✅ **安定したセレクター**: `input[type="email"]` など、属性ベースのセレクター使用
- ✅ **実際のルート構造**: `/auth/signin`, `/member/quotations` など実際のパスに対応
- ✅ **詳細なエラーハンドリング**: それぞれのテストで適切なエラーチェック
- ✅ **レスポンシブ対応**: モバイル (375x667) とタブレット (768x1024) のテスト含む
- ✅ **パフォーマンス計測**: ページ読み込み時間の測定

---

## ▶️ Running Tests (改善版v2)

| コマンド | 説明 |
|---------|------|
| `npx playwright test quotation-order-workflow-v2.spec.ts` | v2改善版テストを実行 |
| `npx playwright test -g "Authentication"` | 認証テストのみ |
| `npx playwright test -g "Page Navigation"` | ページナビゲーションテストのみ |
| `npx playwright test -g "Performance"` | パフォーマンステストのみ |
| `npx playwright test --project=chromium` | Chromiumのみで実行 |

---

## 📊 Test Coverage (v2)

| カテゴリ | テスト数 | ステータス |
|---------|---------|----------|
| 認証 - 基本 | 4 | ✅ |
| ページナビゲーション | 5 | ✅ |
| 見積もり表示 | 2 | ✅ |
| 注文表示 | 2 | ✅ |
| 管理者ダッシュボード | 3 | ✅ |
| 見積シミュレーター | 2 | ✅ |
| レスポンシブデザイン | 2 | ✅ |
| エラーハンドリング | 2 | ✅ |
| パフォーマンス | 2 | ✅ |
| **合計** | **24** | **✅** |

---

## 🔧 仕様変更機能 E2Eテスト

### 新機能テストファイル

| ファイル | 説明 | テスト数 |
|---------|------|---------|
| `admin-specification-change.spec.ts` | 管理者用仕様変更機能のE2Eテスト | 11 |
| `member-specification-change.spec.ts` | 顧客用仕様変更機能のE2Eテスト | 10 |
| `admin-quotation-detail.spec.ts` | 見積詳細表示と404エラー修正確認 | 7 |

### テスト実行コマンド

```bash
# 仕様変更機能テストをすべて実行
npx playwright test admin-specification-change.spec.ts member-specification-change.spec.ts

# 管理者仕様変更テストのみ
npx playwright test admin-specification-change.spec.ts

# 顧客仕様変更テストのみ
npx playwright test member-specification-change.spec.ts

# 見積詳細テスト（404修正確認）
npx playwright test admin-quotation-detail.spec.ts

# UIモードで実行
npx playwright test admin-specification-change.spec.ts --ui

# 詳細レポート付きで実行
npx playwright test admin-specification-change.spec.ts --reporter=html
```

### 仕様変更テストのカバレッジ

#### 管理者仕様変更機能 (admin-specification-change.spec.ts)

| ID | テスト名 | 説明 |
|----|---------|------|
| SC-001 | 注文詳細ページアクセス | 管理者が注文詳細ページにアクセスできる |
| SC-002 | 仕様変更ボタン表示 | 仕様変更ボタンが表示される |
| SC-003 | 仕様変更モーダル表示 | 仕様変更モーダルが正しく開く |
| SC-004 | 価格再計算 | 仕様を変更して価格が再計算される |
| SC-005 | 仕様変更確定 | 仕様変更を確定できる |
| SC-006 | 仕様変更履歴表示 | 仕様変更履歴が表示される |
| SC-007 | 変更理由必須 | 変更理由なしでは確定できない |
| SC-008 | キャンセル操作 | キャンセルで仕様変更を中止できる |
| SC-009 | 素材変更 | 素材を変更して価格を再計算できる |
| SC-010 | 後加工オプション変更 | 後加工オプションを変更できる |
| NT-001 | 顧客通知作成 | 仕様変更確定後に顧客に通知が作成される |

#### 顧客仕様変更機能 (member-specification-change.spec.ts)

| ID | テスト名 | 説明 |
|----|---------|------|
| MC-001 | 注文一覧アクセス | 顧客が注文一覧ページにアクセスできる |
| MC-002 | 仕様変更ボタン表示 | 注文詳細ページから仕様変更モーダルを開ける |
| MC-003 | 注文準備ページアクセス | 注文準備ページから仕様変更リクエストを送信できる |
| MC-004 | サイズ変更 | 仕様変更モーダルでサイズを変更できる |
| MC-005 | 仕様変更リクエスト送信 | 仕様変更リクエストを送信できる |
| MC-006 | 素材変更 | 素材変更で価格が再計算される |
| MC-007 | 後加工オプション変更 | 後加工オプション変更で価格が再計算される |
| MC-008 | 変更理由必須 | 変更理由なしではリクエスト送信できない |
| MC-009 | キャンセル操作 | キャンセルで仕様変更を中止できる |
| MC-010 | 価格増加メッセージ | 価格増加時のメッセージが正しく表示される |
| MN-001 | 管理者通知作成 | 仕様変更リクエスト送信後に管理者に通知が作成される |

#### 見積詳細機能 (admin-quotation-detail.spec.ts)

| ID | テスト名 | 説明 |
|----|---------|------|
| QD-001 | 見積一覧アクセス | 管理者が見積一覧ページにアクセスできる |
| QD-002 | 見積カード表示 | 見積カードが正しく表示される |
| QD-101 | 見積詳細パネル | 見積詳細パネルを開ける |
| QD-102 | 404エラー修正確認 | 見積詳細APIの404エラーが修正されている |
| QD-103 | 詳細情報表示 | 見積詳細情報が正しく表示される |
| QD-104 | 原価内訳表示 | 原価内訳が表示される |
| QD-105 | 詳細パネル閉じる | 見積詳細を閉じることができる |
| QD-201 | 認証ヘッダー送信 | Dev Modeで認証ヘッダーが正しく送信される |

### 仕様変更機能のテストデータ

```typescript
// tests/e2e/test-data.ts
export const TEST_USERS = {
  admin: {
    email: 'admin@epackage-lab.com',
    password: 'Admin123!',
    name: 'Admin User',
    role: 'admin',
  },
  member: {
    email: 'member@test.com',
    password: 'Member1234!',
    name: 'Test Member',
    role: 'member',
  },
};
```

---

## 🐛 トラブルシューティング (v2)

### 問題: サーバーが起動しない

```bash
# ポート3000を解放
npx kill-port 3000

# 再起動
npm run dev
```

### 問題: ログインテストが失敗する

1. `.env.local` で `NEXT_PUBLIC_DEV_MODE=false` になっていることを確認
2. テストユーザーがデータベースに存在することを確認:
   - member@test.com / Member1234!
   - admin@example.com / Admin1234!

### 問題: タイムアウトエラー

```bash
# タイムアウトを延長
npx playwright test --timeout=60000
```

---

## ▶️ Running Tests (オリジナルv1)

This test suite covers the complete business workflow:

1. **Authentication** - Member and Admin login/logout
2. **Quotation Creation** - Create, view, and manage quotations
3. **Admin Review** - Approve/reject quotations
4. **Order Creation** - Convert quotations to orders
5. **Data Upload** - Upload design files
6. **Order Processing** - Admin order management
7. **Approvals** - Design approval workflow
8. **Shipment** - Shipment tracking and delivery
9. **Completion** - Final order status and delivery notes

### Test Coverage

| Feature | Coverage | Status |
|---------|----------|--------|
| Authentication | ✅ | Complete |
| Quotation CRUD | ✅ | Complete |
| Admin Quotation Review | ✅ | Complete |
| Order Creation | ✅ | Complete |
| File Upload | 🟡 | Partial (needs test files) |
| Order Management | ✅ | Complete |
| Status Updates | ✅ | Complete |
| Shipment Tracking | 🟡 | Partial |
| Error Handling | ✅ | Complete |

---

## 📦 Prerequisites

### Required Software

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** (for version control)

### Application Requirements

- **Application Server**: Running on `http://localhost:3000`
- **Database**: Supabase or PostgreSQL instance
- **Test Users**: Admin and Member accounts created

### Test Users

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Admin1234! |
| Member | member@test.com | Member1234! |
| Korea Team | korea@package-lab.com | Korea1234! |

---

## 🚀 Installation

### 1. Install Dependencies

```bash
npm install --save-dev @playwright/test
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

For specific browsers:

```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

### 3. Verify Installation

```bash
npx playwright --version
```

---

## ▶️ Running Tests

### Run All Tests

```bash
npx playwright test
```

### Run Specific Test File

```bash
npx playwright test quotation-order-workflow.spec.ts
```

### Run Tests by Title

```bash
npx playwright test --grep "complete workflow"
```

### Run Tests in Specific Browser

```bash
# Chrome/Chromium
npx playwright test --project=chromium

# Firefox
npx playwright test --project=firefox

# Safari (WebKit)
npx playwright test --project=webkit
```

### Run Tests with UI (Debug Mode)

```bash
# Playwright Test UI
npx playwright test --ui

# headed mode (show browser)
npx playwright test --headed

# debug mode (step through)
npx playwright test --debug
```

### Run Tests with Different Reporters

```bash
# HTML report
npx playwright test --reporter=html

# JUnit XML
npx playwright test --reporter=junit

# JSON
npx playwright test --reporter=json

# Multiple reporters
npx playwright test --reporter=html --reporter=json
```

### View Test Results

```bash
# Open HTML report
npx playwright show-report

# Open last HTML report
npx show-report
```

---

## 📁 Test Structure

```
tests/
├── e2e/
│   ├── quotation-order-workflow.spec.ts    # Main E2E test suite
│   ├── global-setup.ts                     # Global test setup
│   ├── global-teardown.ts                  # Global test teardown
│   └── test-data.ts                        # Test data constants
├── pages/                                  # Page object models (optional)
│   ├── BasePage.ts
│   ├── AuthPage.ts
│   ├── QuotationPage.ts
│   ├── OrderPage.ts
│   └── AdminPage.ts
├── quotation-order-workflow-test-plan.md   # Comprehensive test plan
├── fixtures/                               # Test fixtures and data
└── test-files/                             # Sample files for upload tests
    ├── samples/
    │   ├── design.pdf
    │   ├── design.ai
    │   └── design.psd
    ├── invalid/
    │   ├── test.exe
    │   └── test.bat
    └── large/
        └── oversized.pdf
```

---

## ⚙️ Configuration

### Playwright Configuration

Edit `playwright.config.ts` to customize:

```typescript
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Base URL
  baseURL: 'http://localhost:3000',

  // Browser timeout
  timeout: 60000,

  // Retries
  retries: process.env.CI ? 2 : 0,

  // Reporter
  reporter: 'html',
});
```

### Environment Variables

Create a `.env` file in the project root:

```bash
# Application URL
BASE_URL=http://localhost:3000

# Test Users
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=Admin1234!
TEST_MEMBER_EMAIL=member@test.com
TEST_MEMBER_PASSWORD=Member1234!

# Database (if needed)
DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

---

## ✍️ Writing Tests

### Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test steps
    await page.click('button');
    await expect(page).toHaveURL(/expected-path/);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup after each test
  });
});
```

### Page Object Pattern

```typescript
class MyPage {
  constructor(private page: Page) {}

  readonly myButton = this.page.locator('button:has-text("Click me")');

  async goto() {
    await this.page.goto('/my-page');
  }

  async clickMyButton() {
    await this.myButton.click();
  }
}
```

### Best Practices

1. **Use Page Objects**: Create reusable page object classes
2. **Wait for Elements**: Use `waitForSelector` for dynamic content
3. **Assertions**: Always use explicit assertions
4. **Data Management**: Use test data constants, avoid hardcoding
5. **Cleanup**: Clean up test data after tests
6. **Screenshots**: Capture screenshots on failures
7. **Timeouts**: Set appropriate timeouts for network requests

---

## 🐛 Debugging

### Debug Mode

```bash
# Run with UI
npx playwright test --ui

# Run with browser visible
npx playwright test --headed

# Run with inspector
npx playwright test --debug
```

### Debugging Tips

1. **Use `page.pause()`**: Pause execution and inspect page
   ```typescript
   await page.pause();
   ```

2. **Take Screenshots**: Capture page state
   ```typescript
   await page.screenshot({ path: 'debug.png' });
   ```

3. **Console Logs**: View console output
   ```typescript
   page.on('console', msg => console.log(msg.text()));
   ```

4. **Network Logs**: Monitor API calls
   ```typescript
   page.on('request', request => console.log(request.url()));
   ```

5. **Slow Motion**: Slow down test execution
   ```typescript
   test.slow();
   ```

### Common Issues

| Issue | Solution |
|-------|----------|
| Tests timeout | Increase timeout in `playwright.config.ts` |
| Selector not found | Use more specific selectors or wait for element |
| Flaky tests | Add retries or wait for stable state |
| Authentication fails | Verify test user credentials and session handling |

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: test-results/html-report/
```

### Docker Example

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx playwright install --with-deps

CMD ["npx", "playwright", "test"]
```

### Running in Docker

```bash
docker build -t e2e-tests .
docker run --rm e2e-tests
```

---

## 📊 Test Reports

### HTML Report

```bash
# Generate and open report
npx playwright test --reporter=html
npx playwright show-report
```

### JUnit Report

For CI/CD integration:

```bash
npx playwright test --reporter=junit --reporter=json
```

### Custom Reporters

Create custom reporter in `playwright.config.ts`:

```typescript
reporter: [
  ['html'],
  ['json', { outputFile: 'results.json' }],
  ['junit', { outputFile: 'results.xml' }],
  ['list']
]
```

---

## 🛠️ Maintenance

### Regular Tasks

- **Weekly**: Review test failures and update tests
- **Monthly**: Review test coverage and add missing scenarios
- **Quarterly**: Major test suite refactoring and optimization

### Updating Tests

When application changes:

1. Update selectors in page objects
2. Add new tests for new features
3. Update test data as needed
4. Fix broken tests
5. Update documentation

### Test Data Management

- Clean up test data regularly
- Use unique identifiers for test data
- Archive old test results
- Maintain test file samples

---

## 📝 Test Documentation

### Test Plan

See `quotation-order-workflow-test-plan.md` for:
- Detailed test scenarios
- Step-by-step instructions
- Expected results
- Assertions and validation

### Test Scenarios

| ID | Scenario | Priority | Status |
|----|----------|----------|--------|
| AUTH-001 | Member Login | Critical | ✅ |
| QUOTE-001 | Create Quotation | Critical | ✅ |
| ADMIN-001 | Approve Quotation | Critical | ✅ |
| ORDER-001 | Create Order | Critical | ✅ |
| UPLOAD-001 | Upload Design File | Critical | 🟡 |
| SHIP-001 | Enter Shipment Info | High | ✅ |

---

## 🤝 Contributing

When adding new tests:

1. Follow existing test patterns
2. Use page object model
3. Add clear comments
4. Update test documentation
5. Run tests locally first
6. Ensure tests are flake-free

---

## 📞 Support

For questions or issues:

- Review test plan documentation
- Check Playwright docs: https://playwright.dev
- Open an issue in the project repository

---

## 📄 License

This test suite is part of the Epackage Lab project.

---

**Last Updated**: 2025-01-19
**Version**: 1.0.0
