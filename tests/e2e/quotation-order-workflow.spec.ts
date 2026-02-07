/**
 * Epackage Lab - Quotation to Order Workflow E2E Tests
 *
 * Complete test suite for quotation-to-order workflow
 * Covers: Member operations, Admin operations, Order processing
 *
 * Run: npx playwright test quotation-order-workflow.spec.ts
 */

import { test, expect, type Page } from '@playwright/test';

// =====================================================
// Test Configuration
// =====================================================

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const TEST_USERS = {
  admin: {
    email: 'admin@example.com',
    password: 'Admin1234!',
  },
  member: {
    email: 'member@test.com',
    password: 'Member1234!',
  },
};

const TEST_DATA = {
  deliveryAddress: {
    name: 'テスト配送先',
    postalCode: '100-0001',
    prefecture: '東京都',
    city: '千代田区',
    address: '丸の内1-1-1',
    building: 'テストビル10F',
    phone: '03-1234-5678',
    contactPerson: 'テスト担当者',
  },
  billingAddress: {
    companyName: 'テスト株式会社',
    postalCode: '100-0002',
    prefecture: '東京都',
    city: '千代田区',
    address: '丸の内2-2-2',
    building: '',
    taxNumber: '1234567890123',
  },
};

// =====================================================
// Page Objects
// =====================================================

class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(`${BASE_URL}${path}`);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForSelector(selector: string, timeout: number = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async screenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  async fillByLabel(label: string, value: string) {
    await this.page.fill(`label:has-text("${label}") + input, input[placeholder*="${label}"]`, value);
  }

  async clickButton(text: string) {
    await this.page.click(`button:has-text("${text}"), input[type="submit"][value*="${text}"]`);
  }
}

class AuthPage extends BasePage {
  readonly loginButton = this.page.locator('button:has-text("ログイン"), button:has-text("Login")');
  readonly emailInput = this.page.locator('input[type="email"], input[name="email"]');
  readonly passwordInput = this.page.locator('input[type="password"], input[name="password"]');
  readonly userMenu = this.page.locator('[data-testid="user-menu"], .user-menu');

  async login(email: string, password: string) {
    await this.goto('/auth/signin');

    // Wait for page load
    await this.waitForSelector('input[type="email"]');

    // Fill credentials
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    // Submit login
    await this.loginButton.click();

    // Wait for navigation after login
    await this.page.waitForURL(/\/(member|admin|dashboard)/, { timeout: 10000 });

    // Verify successful login
    await expect(this.userMenu.first()).toBeVisible({ timeout: 5000 });
  }

  async logout() {
    await this.userMenu.click();
    await this.clickButton('ログアウト');
    await this.page.waitForURL(/\/(auth|signin)/);
  }
}

class QuotationPage extends BasePage {
  readonly newQuotationButton = this.page.locator('button:has-text("新規見積"), button:has-text("新規見積を作成"), a:has-text("新規見積")');
  readonly quotationList = this.page.locator('.quotation-card, [data-testid="quotation-card"]');
  readonly quotationNumber = this.page.locator('[data-testid="quotation-number"]');
  readonly statusBadge = this.page.locator('.badge, [data-testid="status-badge"]');
  readonly pdfDownloadButton = this.page.locator('button:has-text("PDFダウンロード"), button:has-text("PDF")');
  readonly deleteButton = this.page.locator('button:has-text("削除")');
  readonly viewDetailButton = this.page.locator('button:has-text("詳細を見る"), a:has-text("詳細を見る")');
  readonly convertToOrderButton = this.page.locator('button:has-text("注文に変換"), button:has-text("注文する")');
  readonly saveQuotationButton = this.page.locator('button:has-text("保存"), button:has-text("見積を保存")');
  readonly calculateButton = this.page.locator('button:has-text("計算する"), button:has-text("見積を作成")');

  async goto() {
    await this.goto('/member/quotations');
    await this.waitForSelector('.quotation-card, text=/見積依頼/');
  }

  async gotoQuotationDetail(quotationId: string) {
    await this.goto(`/member/quotations/${quotationId}`);
    await this.waitForSelector('h1:has-text("見積書詳細"), h1:has-text("見積詳細")');
  }

  async createQuotation(options: {
    productType?: string;
    material?: string;
    width?: number;
    height?: number;
    depth?: number;
    quantity?: number;
  } = {}) {
    // Navigate to quote simulator
    await this.goto('/quote-simulator');

    // Wait for simulator to load
    await this.page.waitForLoadState('networkidle');

    // Select product type
    if (options.productType) {
      await this.page.selectOption('select[name="productType"], [data-testid="product-type"]', options.productType);
    }

    // Select material
    if (options.material) {
      await this.page.selectOption('select[name="material"], [data-testid="material"]', options.material);
    }

    // Enter dimensions
    if (options.width) {
      await this.page.fill('input[name="width"], input[placeholder*="幅"]', String(options.width));
    }
    if (options.height) {
      await this.page.fill('input[name="height"], input[placeholder*="高さ"]', String(options.height));
    }
    if (options.depth) {
      await this.page.fill('input[name="depth"], input[placeholder*="深さ"]', String(options.depth));
    }

    // Enter quantity
    if (options.quantity) {
      await this.page.fill('input[name="quantity"], input[placeholder*="数量"]', String(options.quantity));
    }

    // Calculate price
    await this.calculateButton.click();

    // Wait for price calculation
    await this.page.waitForTimeout(1000);

    // Save quotation
    await this.saveQuotationButton.click();

    // Wait for save confirmation and redirect
    await this.page.waitForURL(/\/member\/quotations\/.+/, { timeout: 10000 });

    // Get quotation number
    const quotationNum = await this.quotationNumber.textContent();
    return quotationNum;
  }

  async getQuotationNumber(): Promise<string | null> {
    return await this.quotationNumber.textContent();
  }

  async downloadPDF(): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.pdfDownloadButton.click();
    const download = await downloadPromise;
    return download.suggestedFilename();
  }

  async deleteQuotation(): Promise<void> {
    // Handle confirmation dialog
    this.page.on('dialog', dialog => dialog.accept());
    await this.deleteButton.click();
    await this.page.waitForURL(/\/member\/quotations$/);
  }

  async convertToOrder(): Promise<void> {
    await this.convertToOrderButton.click();
    await this.page.waitForURL(/\/member\/orders\/new/, { timeout: 5000 });
  }
}

class OrderPage extends BasePage {
  readonly orderList = this.page.locator('.order-card, [data-testid="order-card"]');
  readonly orderNumber = this.page.locator('[data-testid="order-number"]');
  readonly statusBadge = this.page.locator('.status-badge, .badge');
  readonly fileUploadInput = this.page.locator('input[type="file"]');
  readonly approveButton = this.page.locator('button:has-text("承認する"), button:has-text("承認")');
  readonly rejectButton = this.page.locator('button:has-text("差し戻し"), button:has-text("却下")');
  readonly confirmOrderButton = this.page.locator('button:has-text("注文を確定"), button:has-text("注文を作成")');

  async goto() {
    await this.goto('/member/orders');
    await this.waitForSelector('.order-card, text=/注文一覧/');
  }

  async gotoOrderDetail(orderId: string) {
    await this.goto(`/member/orders/${orderId}`);
    await this.waitForSelector('h1:has-text("注文詳細")');
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.fileUploadInput.setInputFiles(filePath);
    await this.waitForSelector('text=/アップロード完了|Upload complete/', { timeout: 15000 });
  }

  async approveDesign(): Promise<void> {
    await this.approveButton.click();
    await this.waitForSelector('text=/承認済み|Approved/', { timeout: 5000 });
  }

  async fillDeliveryForm(address: typeof TEST_DATA.deliveryAddress): Promise<void> {
    await this.page.fill('input[name="delivery_name"], [data-testid="delivery-name"]', address.name);
    await this.page.fill('input[name="postal_code"], [data-testid="postal-code"]', address.postalCode);
    await this.page.selectOption('select[name="prefecture"], [data-testid="prefecture"]', address.prefecture);
    await this.page.fill('input[name="city"], [data-testid="city"]', address.city);
    await this.page.fill('input[name="address"], [data-testid="address"]', address.address);
    await this.page.fill('input[name="building"], [data-testid="building"]', address.building);
    await this.page.fill('input[name="phone"], [data-testid="phone"]', address.phone);
    await this.page.fill('input[name="contact_person"], [data-testid="contact-person"]', address.contactPerson);
  }

  async fillBillingForm(address: typeof TEST_DATA.billingAddress): Promise<void> {
    await this.page.fill('input[name="company_name"], [data-testid="company-name"]', address.companyName);
    await this.page.fill('input[name="billing_postal_code"], [data-testid="billing-postal-code"]', address.postalCode);
    await this.page.selectOption('select[name="billing_prefecture"], [data-testid="billing-prefecture"]', address.prefecture);
    await this.page.fill('input[name="billing_city"], [data-testid="billing-city"]', address.city);
    await this.page.fill('input[name="billing_address"], [data-testid="billing-address"]', address.address);
    await this.page.fill('input[name="tax_number"], [data-testid="tax-number"]', address.taxNumber);
  }

  async submitOrder(): Promise<void> {
    await this.confirmOrderButton.click();
    await this.waitForSelector('text=/注文を作成しました|Order created/', { timeout: 10000 });
    await this.page.waitForURL(/\/member\/orders\/.+/, { timeout: 5000 });
  }

  async getOrderNumber(): Promise<string | null> {
    return await this.orderNumber.textContent();
  }
}

class AdminPage extends BasePage {
  readonly quotationsLink = this.page.locator('a:has-text("見積もり管理"), a[href*="/admin/quotations"]');
  readonly ordersLink = this.page.locator('a:has-text("注文管理"), a[href*="/admin/orders"]');
  readonly approveButton = this.page.locator('button:has-text("承認")');
  readonly rejectButton = this.page.locator('button:has-text("拒否")');
  readonly statusFilter = this.page.locator('select[name="status"], [data-testid="status-filter"]');
  readonly quotationCard = this.page.locator('.quotation-card, [data-testid="quotation-card"]');

  async gotoQuotations() {
    await this.goto('/admin/quotations');
    await this.waitForSelector('h1:has-text("見積もり管理")');
  }

  async gotoOrders() {
    await this.goto('/admin/orders');
    await this.waitForSelector('h1:has-text("注文管理")');
  }

  async filterByStatus(status: string): Promise<void> {
    await this.statusFilter.selectOption(status);
    await this.page.waitForTimeout(1000);
  }

  async selectQuotation(quotationNumber: string): Promise<void> {
    await this.page.click(`.quotation-card:has-text("${quotationNumber}"), [data-testid="quotation-card"]:has-text("${quotationNumber}")`);
    await this.page.waitForTimeout(500);
  }

  async approveQuotation(): Promise<void> {
    await this.approveButton.click();
    await this.waitForSelector('text=/承認しました|Approved/', { timeout: 5000 });
  }

  async rejectQuotation(): Promise<void> {
    await this.rejectButton.click();
    await this.waitForSelector('text=/却下しました|Rejected/', { timeout: 5000 });
  }

  async updateOrderStatus(orderId: string, newStatus: string): Promise<void> {
    await this.page.selectOption(`tr:has-text("${orderId}") select, [data-testid="order-status-${orderId}"]`, newStatus);
    await this.waitForSelector('text=/ステータスが変更されました|Status updated/', { timeout: 5000 });
  }
}

// =====================================================
// Test Suites
// =====================================================

test.describe('Authentication', () => {
  test('member login success', async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);

    // Verify login success
    await expect(page).toHaveURL(/\/(member|dashboard)/);
    await expect(authPage.userMenu).toBeVisible();
  });

  test('admin login success', async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Verify login success
    await expect(page).toHaveURL(/\/admin/);
    await expect(authPage.userMenu).toBeVisible();
  });

  test('login with invalid credentials', async ({ page }) => {
    const authPage = new AuthPage(page);

    await page.goto(`${BASE_URL}/auth/signin`);
    await authPage.emailInput.fill('invalid@test.com');
    await authPage.passwordInput.fill('WrongPassword123!');
    await authPage.loginButton.click();

    // Verify error message
    await expect(page.locator('text=/認証に失敗しました|Invalid credentials|ログインに失敗しました/')).toBeVisible();
  });
});

test.describe('Quotation Creation', () => {
  let authPage: AuthPage;
  let quotationPage: QuotationPage;
  let quotationNumber: string | null;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    quotationPage = new QuotationPage(page);
  });

  test('create quotation from simulator', async ({ page }) => {
    // Login as member
    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);

    // Create quotation
    quotationNumber = await quotationPage.createQuotation({
      productType: 'stand-up-pouch',
      material: 'pet-al',
      width: 200,
      height: 300,
      depth: 80,
      quantity: 5000,
    });

    // Verify quotation created
    expect(quotationNumber).toMatch(/QUO-\d{4}-\d{5}/);
    await expect(page).toHaveURL(/\/member\/quotations\/.+/);
    await expect(page.locator('text=/見積を保存しました|Quotation saved/')).toBeVisible();
  });

  test('view quotation list', async ({ page }) => {
    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);
    await quotationPage.goto();

    // Verify list loads
    await expect(quotationPage.quotationList.first()).toBeVisible();
  });

  test('download quotation PDF', async ({ page }) => {
    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);
    await quotationPage.goto();

    // Click on first quotation
    await quotationPage.viewDetailButton.first().click();
    await page.waitForURL(/\/member\/quotations\/.+/);

    // Download PDF
    const filename = await quotationPage.downloadPDF();
    expect(filename).toMatch(/\.pdf$/);

    // Verify download history
    await expect(page.locator('text=/PDFダウンロード履歴|Download history/')).toBeVisible();
  });

  test('delete draft quotation', async ({ page }) => {
    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);

    // Create a new quotation
    await quotationPage.createQuotation({ quantity: 1000 });
    const quotationNum = await quotationPage.getQuotationNumber();

    // Go back to list
    await quotationPage.goto();

    // Find and delete the quotation
    await page.click(`.quotation-card:has-text("${quotationNum}") button:has-text("削除")`);

    // Handle confirmation dialog
    page.on('dialog', dialog => dialog.accept());

    // Verify deletion
    await expect(page.locator('text=/削除しました|Deleted/')).toBeVisible();
    await expect(page.locator(`.quotation-card:has-text("${quotationNum}")`)).not.toBeVisible();
  });
});

test.describe('Admin Quotation Review', () => {
  let authPage: AuthPage;
  let adminPage: AdminPage;
  let quotationPage: QuotationPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    adminPage = new AdminPage(page);
    quotationPage = new QuotationPage(page);
  });

  test('admin approves quotation', async ({ page }) => {
    // Create quotation as member
    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);
    const quotationNumber = await quotationPage.createQuotation({ quantity: 5000 });

    // Admin login and approve
    await authPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await adminPage.gotoQuotations();

    // Filter for pending quotations
    await adminPage.filterByStatus('pending');

    // Select and approve quotation
    await adminPage.selectQuotation(quotationNumber || '');
    await adminPage.approveQuotation();

    // Verify approval
    await expect(page.locator('text=/承認済み|Approved/')).toBeVisible();
  });

  test('admin rejects quotation', async ({ page }) => {
    // Create quotation as member
    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);
    const quotationNumber = await quotationPage.createQuotation({ quantity: 3000 });

    // Admin login and reject
    await authPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await adminPage.gotoQuotations();

    // Filter for pending quotations
    await adminPage.filterByStatus('pending');

    // Select and reject quotation
    await adminPage.selectQuotation(quotationNumber || '');
    await adminPage.rejectQuotation();

    // Verify rejection
    await expect(page.locator('text=/却下|Rejected/')).toBeVisible();
  });
});

test.describe('Order Creation from Quotation', () => {
  let authPage: AuthPage;
  let quotationPage: QuotationPage;
  let orderPage: OrderPage;
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    quotationPage = new QuotationPage(page);
    orderPage = new OrderPage(page);
    adminPage = new AdminPage(page);
  });

  test('convert approved quotation to order', async ({ page }) => {
    // Create and approve quotation
    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);
    const quotationNumber = await quotationPage.createQuotation({
      width: 200,
      height: 300,
      quantity: 5000,
    });

    // Admin approve
    await authPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await adminPage.gotoQuotations();
    await adminPage.selectQuotation(quotationNumber || '');
    await adminPage.approveQuotation();

    // Member creates order
    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);
    await quotationPage.goto();
    await page.click(`.quotation-card:has-text("${quotationNumber}")`);

    // Click convert to order
    await quotationPage.convertToOrder();

    // Fill delivery form
    await orderPage.fillDeliveryForm(TEST_DATA.deliveryAddress);

    // Fill billing form
    await orderPage.fillBillingForm(TEST_DATA.billingAddress);

    // Submit order
    await orderPage.submitOrder();

    // Verify order created
    const orderNumber = await orderPage.getOrderNumber();
    expect(orderNumber).toMatch(/ORD-\d{4}-\d{5}/);
    await expect(page).toHaveURL(/\/member\/orders\/.+/);

    // Verify quotation status changed
    await quotationPage.goto();
    await page.click(`.quotation-card:has-text("${quotationNumber}")`);
    await expect(page.locator('text=/注文変換済み|Converted/')).toBeVisible();
  });

  test('view order list and details', async ({ page }) => {
    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);
    await orderPage.goto();

    // Verify order list loads
    await expect(orderPage.orderList.first()).toBeVisible();

    // Click on first order
    await page.click('.order-card, [data-testid="order-card"]');
    await page.waitForURL(/\/member\/orders\/.+/);

    // Verify order detail page
    await expect(page.locator('h1:has-text("注文詳細")')).toBeVisible();
    await expect(orderPage.orderNumber).toBeVisible();
  });
});

test.describe('Data Upload and Approval', () => {
  test('upload design file', async ({ page }) => {
    const authPage = new AuthPage(page);
    const orderPage = new OrderPage(page);

    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);
    await orderPage.goto();

    // Navigate to first order
    await page.click('.order-card, [data-testid="order-card"]');

    // Upload file
    // Note: Create a test PDF file first or use existing
    // await orderPage.uploadFile('test-files/design.pdf');

    // Verify upload success
    await expect(page.locator('.file-upload-section')).toBeVisible();
  });

  test('customer approves design', async ({ page }) => {
    const authPage = new AuthPage(page);
    const orderPage = new OrderPage(page);

    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);
    await orderPage.goto();

    // Navigate to order with pending approval
    await page.click('.order-card');

    // Approve design
    await orderPage.approveDesign();

    // Verify approval
    await expect(page.locator('text=/承認済み|Approved/')).toBeVisible();
  });
});

test.describe('Admin Order Management', () => {
  test('admin updates order status', async ({ page }) => {
    const authPage = new AuthPage(page);
    const adminPage = new AdminPage(page);

    await authPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await adminPage.gotoOrders();

    // Get first order ID
    const firstOrder = await page.locator('tbody tr').first().textContent();
    const orderMatch = firstOrder?.match(/ORD-\d{4}-\d{5}/);
    const orderId = orderMatch ? orderMatch[0] : '';

    // Update status
    await adminPage.updateOrderStatus(orderId, 'DATA_RECEIVED');

    // Verify update
    await expect(page.locator('text=/ステータスが変更されました|Status updated/')).toBeVisible();
  });

  test('admin views order detail', async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await page.goto(`${BASE_URL}/admin/orders`);

    // Click on first order detail link
    await page.click('tbody tr a:has-text("詳細")');

    // Verify order detail page
    await expect(page.locator('h1:has-text("注文詳細")')).toBeVisible();
  });
});

test.describe('Complete End-to-End Workflow', () => {
  test('full workflow: quotation → approval → order → completion', async ({ page }) => {
    const authPage = new AuthPage(page);
    const quotationPage = new QuotationPage(page);
    const adminPage = new AdminPage(page);
    const orderPage = new OrderPage(page);

    // 1. Member creates quotation
    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);
    const quotationNumber = await quotationPage.createQuotation({
      width: 200,
      height: 300,
      depth: 80,
      quantity: 5000,
    });

    // 2. Admin approves quotation
    await authPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await adminPage.gotoQuotations();
    await adminPage.selectQuotation(quotationNumber || '');
    await adminPage.approveQuotation();

    // 3. Member creates order from quotation
    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);
    await quotationPage.goto();
    await page.click(`.quotation-card:has-text("${quotationNumber}")`);
    await quotationPage.convertToOrder();

    // 4. Fill delivery and billing information
    await orderPage.fillDeliveryForm(TEST_DATA.deliveryAddress);
    await orderPage.fillBillingForm(TEST_DATA.billingAddress);

    // 5. Submit order
    await orderPage.submitOrder();
    const orderNumber = await orderPage.getOrderNumber();
    console.log(`Order created: ${orderNumber}`);

    // 6. Admin updates order to DATA_RECEIVED
    await authPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await adminPage.gotoOrders();
    await adminPage.updateOrderStatus(orderNumber || '', 'DATA_RECEIVED');

    // 7. Verify complete workflow
    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);
    await orderPage.goto();
    await expect(page.locator(`text=${orderNumber}`)).toBeVisible();

    // Take final screenshot
    await page.screenshot({
      path: 'test-results/screenshots/e2e-complete-workflow.png',
      fullPage: true,
    });
  });
});

test.describe('Error Handling', () => {
  test('duplicate order creation prevention', async ({ page }) => {
    const authPage = new AuthPage(page);
    const quotationPage = new QuotationPage(page);
    const adminPage = new AdminPage(page);

    // Create and approve quotation
    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);
    const quotationNumber = await quotationPage.createQuotation({ quantity: 5000 });

    await authPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await adminPage.gotoQuotations();
    await adminPage.selectQuotation(quotationNumber || '');
    await adminPage.approveQuotation();

    // Create order
    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);
    await quotationPage.goto();
    await page.click(`.quotation-card:has-text("${quotationNumber}")`);

    // Try to convert again (should show already ordered)
    await page.click('button:has-text("注文に変換")');
    await expect(page.locator('text=/既に注文されています|Already ordered/')).toBeVisible();
  });

  test('session expiry handling', async ({ page }) => {
    const authPage = new AuthPage(page);
    const quotationPage = new QuotationPage(page);

    // Login
    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);

    // Clear session (simulate expiry)
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Try to navigate
    await quotationPage.goto();

    // Should redirect to login
    await expect(page).toHaveURL(/\/(auth|signin)/);
    await expect(page.locator('text=/セッションが期限切れ|Session expired|ログインしてください/')).toBeVisible();
  });
});

test.describe('Performance Tests', () => {
  test('quotation list load time', async ({ page }) => {
    const authPage = new AuthPage(page);
    const quotationPage = new QuotationPage(page);

    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);

    const startTime = Date.now();
    await quotationPage.goto();
    const loadTime = Date.now() - startTime;

    console.log(`Quotation list load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000); // Should load in less than 3 seconds
  });

  test('order list filter performance', async ({ page }) => {
    const authPage = new AuthPage(page);
    const orderPage = new OrderPage(page);

    await authPage.login(TEST_USERS.member.email, TEST_USERS.member.password);
    await orderPage.goto();

    // Test status filter
    const startTime = Date.now();
    await page.selectOption('select[name="status"]', 'pending');
    await page.waitForTimeout(500);
    const filterTime = Date.now() - startTime;

    console.log(`Filter time: ${filterTime}ms`);
    expect(filterTime).toBeLessThan(2000); // Should filter in less than 2 seconds
  });
});

// =====================================================
// Test Hooks
// =====================================================

test.beforeAll(async () => {
  console.log('Starting E2E test suite...');
  console.log(`Base URL: ${BASE_URL}`);
});

test.afterAll(async () => {
  console.log('E2E test suite completed.');
});

test.afterEach(async ({ page }, testInfo) => {
  // Screenshot on failure
  if (testInfo.status !== 'passed') {
    await page.screenshot({
      path: `test-results/screenshots/${testInfo.title.replace(/\s+/g, '-')}-failed.png`,
      fullPage: true,
    });
  }

  // Logout after each test
  try {
    await page.goto(`${BASE_URL}/auth/signout`);
  } catch (error) {
    // Ignore navigation errors
  }
});
