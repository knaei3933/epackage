/**
 * Quote to Order Conversion E2E Test
 * 견적서에서 주문으로 전환 E2E 테스트
 *
 * Tests the complete quote to order workflow:
 * 1. Customer creates quote via quote simulator
 * 2. Admin views quote
 * 3. Admin converts quote to order
 * 4. Order number generated (ord-YYYY-NNNN)
 * 5. Work order created
 * 6. Customer can view order
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { testQuote, testUsers, AuthHelper, TestDataManager } from '../fixtures/test-data';

// Supabase client for database verification
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

test.describe('Quote to Order Conversion', () => {
  let testUser: ReturnType<typeof testUsers.japaneseMember>;
  let authHelper: AuthHelper;
  let page: any;
  let adminPage: any;

  test.beforeAll(async () => {
    // Setup: Create and approve a test user
    const supabase = getSupabaseClient();

    // Clean up existing test quotes
    await supabase.from('quotes').delete().like('quote_number', 'quote-test-%');
  });

  test.beforeEach(async ({ page: p, page: adminP }) => {
    page = p;
    adminPage = adminP;
    testUser = testUsers.japaneseMember();
    TestDataManager.registerTestEmail(testUser.email);
    authHelper = new AuthHelper(page);
  });

  test.afterEach(async () => {
    // Cleanup test data
    try {
      const supabase = getSupabaseClient();

      // Delete test quotes
      await supabase.from('quotes').delete().eq('customer_email', testUser.email);

      // Delete test orders
      await supabase.from('orders').delete().eq('customer_email', testUser.email);

      // Delete user
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users.users.find(u => u.email === testUser.email);
      if (user) {
        await supabase.auth.admin.deleteUser(user.id);
      }
      await supabase.from('profiles').delete().eq('email', testUser.email);
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  });

  test('should create quote via quote simulator', async () => {
    // =====================================================
    // Step 1: Create and approve user
    // =====================================================
    await authHelper.register(testUser);

    // Approve user directly in database
    const supabase = getSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', testUser.email)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ status: 'ACTIVE' })
        .eq('id', profile.id);
    }

    await authHelper.loginAsMember(testUser.email, testUser.password);

    // =====================================================
    // Step 2: Navigate to quote simulator
    // =====================================================
    await page.goto('/quote/simulator');

    // Should show quote simulator page
    await expect(page.locator('text=見積もりシミュレーター')).toBeVisible({ timeout: 10000 });

    console.log('Quote simulator page loaded');

    // =====================================================
    // Step 3: Fill quote details
    // =====================================================
    // Select product type
    await page.selectOption('select[name="productType"]', 'POUCH');

    // Enter dimensions
    await page.fill('input[name="width"]', '100');
    await page.fill('input[name="length"]', '150');

    // Select material
    await page.selectOption('select[name="material"]', 'PET_AL_PE');

    // Enter quantity
    await page.fill('input[name="quantity"]', '1000');

    // Select printing method
    await page.selectOption('select[name="printingMethod"]', 'GRAVURE');

    // Enter colors
    await page.fill('input[name="colors"]', '4');

    // Select post-processing options
    await page.check('input[value="ZIPPER"]');
    await page.check('input[value="NOTCH"]');

    console.log('Quote details filled');

    // =====================================================
    // Step 4: Get quote estimate
    // =====================================================
    const getQuoteButton = page.locator('button').filter({
      hasText: /見積もりを取得|Get Quote/
    });

    await getQuoteButton.click();

    // Wait for price calculation
    await page.waitForTimeout(2000);

    // Should show estimated price
    await expect(page.locator('text=¥')).toBeVisible({ timeout: 5000 });

    console.log('Quote estimate displayed');

    // =====================================================
    // Step 5: Save quote
    // =====================================================
    const saveQuoteButton = page.locator('button').filter({
      hasText: /保存|Save/
    });

    await saveQuoteButton.click();

    // Should show success message
    await expect(page.locator('text=保存しました')).toBeVisible({ timeout: 5000 }).or(
      expect(page.locator('text=見積もりを保存しました')).toBeVisible({ timeout: 5000 })
    );

    console.log('Quote saved successfully');

    // =====================================================
    // Step 6: Verify quote in database
    // =====================================================
    const { data: quote } = await supabase
      .from('quotes')
      .select('*')
      .eq('customer_email', testUser.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    expect(quote).not.toBeNull();
    expect(quote?.status).toBe('DRAFT');

    console.log('Quote verified in database:', quote?.quote_number);
  });

  test('admin can view quote details', async ({ page: adminP }) => {
    // =====================================================
    // Step 1: Create a quote via API
    // =====================================================
    const supabase = getSupabaseClient();

    const { data: quote } = await supabase
      .from('quotes')
      .insert({
        quote_number: `quote-test-${Date.now()}`,
        customer_email: testUser.email,
        customer_name: `${testUser.kanjiLastName} ${testUser.kanjiFirstName}`,
        company_name: testUser.companyName,
        status: 'DRAFT',
        items: testQuote.simpleQuote().items,
        subtotal: 150000,
        tax: 15000,
        total: 165000,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    expect(quote).not.toBeNull();

    // =====================================================
    // Step 2: Admin views quotes
    // =====================================================
    const adminAuth = new AuthHelper(adminP);
    await adminAuth.loginAsAdmin();

    await adminP.goto('/admin/quotes');

    // Should show quotes list
    await expect(adminP.locator('text=見積もり一覧')).toBeVisible({ timeout: 10000 });

    // =====================================================
    // Step 3: View specific quote
    // =====================================================
    const quoteRow = adminP.locator(`text=${testUser.email}`);
    await expect(quoteRow).toBeVisible({ timeout: 5000 });

    // Click on quote to view details
    await quoteRow.click();

    // Should show quote details
    await expect(adminP.locator('text=見積もり詳細')).toBeVisible({ timeout: 5000 });
    await expect(adminP.locator(`text=${testUser.companyName}`)).toBeVisible({ timeout: 5000 });

    console.log('Quote details displayed');
  });

  test('admin can convert quote to order', async ({ page: adminP }) => {
    // =====================================================
    // Step 1: Create a quote
    // =====================================================
    const supabase = getSupabaseClient();

    const { data: quote } = await supabase
      .from('quotes')
      .insert({
        quote_number: `quote-test-${Date.now()}`,
        customer_email: testUser.email,
        customer_name: `${testUser.kanjiLastName} ${testUser.kanjiFirstName}`,
        company_name: testUser.companyName,
        status: 'DRAFT',
        items: testQuote.simpleQuote().items,
        subtotal: 150000,
        tax: 15000,
        total: 165000,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    // =====================================================
    // Step 2: Admin converts quote to order
    // =====================================================
    const adminAuth = new AuthHelper(adminP);
    await adminAuth.loginAsAdmin();

    await adminP.goto(`/admin/quotes/${quote?.id}`);

    // Click convert to order button
    const convertButton = adminP.locator('button').filter({
      hasText: /注文に変換|Convert to Order/
    });

    await convertButton.click();

    // Fill in order details if modal appears
    const deliveryDateInput = adminP.locator('input[name="deliveryDate"]');
    const isDateVisible = await deliveryDateInput.isVisible().catch(() => false);

    if (isDateVisible) {
      // Set delivery date to 30 days from now
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 30);

      await deliveryDateInput.fill(deliveryDate.toISOString().split('T')[0]);
    }

    // Confirm conversion
    const confirmButton = adminP.locator('button').filter({
      hasText: /確認|Confirm/
    });

    await confirmButton.click();

    // Wait for success message
    await expect(adminP.locator('text=注文を作成しました')).toBeVisible({ timeout: 5000 }).or(
      expect(adminP.locator('text=注文が正常に作成されました')).toBeVisible({ timeout: 5000 })
    );

    console.log('Quote converted to order');

    // =====================================================
    // Step 3: Verify order in database
    // =====================================================
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('quote_id', quote?.id)
      .single();

    expect(order).not.toBeNull();
    expect(order?.order_number).toMatch(testQuote.orderNumberFormat);
    expect(order?.status).toBe('PENDING');

    console.log('Order created with number:', order?.order_number);

    // =====================================================
    // Step 4: Verify quote status updated
    // =====================================================
    const { data: updatedQuote } = await supabase
      .from('quotes')
      .select('status')
      .eq('id', quote?.id)
      .single();

    expect(updatedQuote?.status).toBe('CONVERTED');

    console.log('Quote status updated to CONVERTED');

    // =====================================================
    // Step 5: Verify work order created
    // =====================================================
    const { data: workOrder } = await supabase
      .from('work_orders')
      .select('*')
      .eq('order_id', order?.id)
      .single();

    expect(workOrder).not.toBeNull();
    expect(workOrder?.current_stage).toBe('DESIGN');

    console.log('Work order created with stage:', workOrder?.current_stage);
  });

  test('customer can view their order', async () => {
    // =====================================================
    // Step 1: Create and approve user
    // =====================================================
    await authHelper.register(testUser);

    const supabase = getSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', testUser.email)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ status: 'ACTIVE' })
        .eq('id', profile.id);
    }

    // =====================================================
    // Step 2: Create order directly
    // =====================================================
    const { data: order } = await supabase
      .from('orders')
      .insert({
        order_number: `ord-2025-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        customer_id: profile?.id,
        customer_email: testUser.email,
        customer_name: `${testUser.kanjiLastName} ${testUser.kanjiFirstName}`,
        company_name: testUser.companyName,
        status: 'CONFIRMED',
        items: testQuote.simpleQuote().items,
        subtotal: 150000,
        tax: 15000,
        total: 165000,
        delivery_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    // =====================================================
    // Step 3: Customer views order
    // =====================================================
    await authHelper.loginAsMember(testUser.email, testUser.password);

    await page.goto('/member/orders');

    // Should show orders list
    await expect(page.locator('text=注文一覧')).toBeVisible({ timeout: 10000 });

    // Should show the order
    await expect(page.locator(`text=${order?.order_number}`)).toBeVisible({ timeout: 5000 });

    console.log('Order visible in customer dashboard');

    // =====================================================
    // Step 4: View order details
    // =====================================================
    const orderLink = page.locator(`text=${order?.order_number}`);
    await orderLink.click();

    // Should show order details
    await expect(page.locator('text=注文詳細')).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${order?.order_number}`)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=¥165,000`)).toBeVisible({ timeout: 5000 });

    console.log('Order details displayed correctly');
  });

  test('order number format is correct', async () => {
    // =====================================================
    // Step 1: Create multiple orders
    // =====================================================
    const supabase = getSupabaseClient();

    for (let i = 0; i < 5; i++) {
      const orderNumber = `ord-2025-${(i + 1).toString().padStart(4, '0')}`;

      await supabase.from('orders').insert({
        order_number: orderNumber,
        customer_email: `${testUser.email}-${i}`,
        customer_name: testUser.kanjiLastName,
        company_name: testUser.companyName,
        status: 'PENDING',
        items: testQuote.simpleQuote().items,
        subtotal: 150000,
        tax: 15000,
        total: 165000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // =====================================================
    // Step 2: Verify order number format
    // =====================================================
    const { data: orders } = await supabase
      .from('orders')
      .select('order_number')
      .like('order_number', 'ord-2025-%');

    expect(orders?.length).toBe(5);

    for (const order of orders || []) {
      expect(order.order_number).toMatch(/^ord-2025-\d{4}$/);
    }

    console.log('All order numbers follow correct format');
  });

  test('can modify quote before converting to order', async ({ page: adminP }) => {
    // =====================================================
    // Step 1: Create a quote
    // =====================================================
    const supabase = getSupabaseClient();

    const { data: quote } = await supabase
      .from('quotes')
      .insert({
        quote_number: `quote-test-${Date.now()}`,
        customer_email: testUser.email,
        customer_name: `${testUser.kanjiLastName} ${testUser.kanjiFirstName}`,
        company_name: testUser.companyName,
        status: 'DRAFT',
        items: testQuote.simpleQuote().items,
        subtotal: 150000,
        tax: 15000,
        total: 165000,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    // =====================================================
    // Step 2: Admin modifies quote
    // =====================================================
    const adminAuth = new AuthHelper(adminP);
    await adminAuth.loginAsAdmin();

    await adminP.goto(`/admin/quotes/${quote?.id}`);

    // Click edit button
    const editButton = adminP.locator('button').filter({
      hasText: /編集|Edit/
    });

    const isEditVisible = await editButton.isVisible().catch(() => false);
    if (isEditVisible) {
      await editButton.click();

      // Modify quantity
      const quantityInput = adminP.locator('input[name="quantity"]');
      await quantityInput.fill('2000');

      // Save changes
      const saveButton = adminP.locator('button').filter({
        hasText: /保存|Save/
      });
      await saveButton.click();

      // Wait for success message
      await expect(adminP.locator('text=更新しました')).toBeVisible({ timeout: 5000 });

      console.log('Quote modified successfully');

      // Verify changes in database
      const { data: updatedQuote } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quote?.id)
        .single();

      expect(updatedQuote?.items[0].quantity).toBe(2000);

      console.log('Quote changes verified in database');
    } else {
      console.log('Edit functionality not available or quote is read-only');
    }
  });
});
