import { test, expect, Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Use the OS temp dir so this works on win32 (not just WSL/Linux /tmp).
const SCREENSHOT_DIR = path.join(os.tmpdir(), 'e2e-screenshots');
const ADMIN_EMAIL = 'admin@epackage-lab.com';
const ADMIN_PASS = 'Admin123!';

function shot(page: Page, name: string) {
  const dir = path.join(SCREENSHOT_DIR);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.png`);
  // fullPage screenshot がブラウザの canvas 上限（Mobile Safari は 32767px）を超える場合は
  // viewport-only screenshot にフォールバックしてテストを継続する（視覚検証が主目的のため）。
  return page.screenshot({ path: file, fullPage: true }).catch(() =>
    page.screenshot({ path: file, fullPage: false })
  );
}

test.describe.configure({ mode: 'serial' });

test.describe('Full Lifecycle E2E - Visual Verification', () => {
  test('01 Homepage - landing page', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('domcontentloaded');
    await shot(page, '01-homepage');
    await expect(page).toHaveTitle(/Epackage|Lab/i);
  });

  test('02 Login page', async ({ page }) => {
    await page.goto('http://localhost:3000/member/login');
    await page.waitForLoadState('domcontentloaded');
    await shot(page, '02-login-page');
    // Check for login form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput.first()).toBeVisible({ timeout: 10000 });
  });

  test('03 Admin login + dashboard', async ({ page }) => {
    // Login via UI
    await page.goto('http://localhost:3000/member/login');
    await page.waitForLoadState('domcontentloaded');
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passInput = page.locator('input[type="password"], input[name="password"]').first();
    await emailInput.fill(ADMIN_EMAIL);
    await passInput.fill(ADMIN_PASS);
    await shot(page, '03a-login-filled');
    await passInput.press('Enter');
    await page.waitForTimeout(3000);
    // firefox で認証直後のリダイレクト競合により page.goto が NS_BINDING_ABORTED で
    // 中断することがあるため、domcontentloaded 待ち + 1 回リトライで吸収する。
    const gotoDashboard = () =>
      page.goto('http://localhost:3000/admin/dashboard', { waitUntil: 'domcontentloaded' });
    try {
      await gotoDashboard();
    } catch {
      await gotoDashboard();
    }
    await page.waitForTimeout(2000);
    await shot(page, '03b-admin-dashboard');
  });

  test('04 Admin - quotations list', async ({ page, context }) => {
    // Login via API and set cookies
    await loginViaApi(context);
    await page.goto('http://localhost:3000/admin/quotations');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await shot(page, '04-admin-quotations');
  });

  test('05 Admin - orders list', async ({ page, context }) => {
    await loginViaApi(context);
    await page.goto('http://localhost:3000/admin/orders');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await shot(page, '05-admin-orders');
  });

  test('06 Admin - shipments', async ({ page, context }) => {
    await loginViaApi(context);
    await page.goto('http://localhost:3000/admin/shipments');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await shot(page, '06-admin-shipments');
  });

  test('07 Admin - settings (integrations tab)', async ({ page, context }) => {
    await loginViaApi(context);
    await page.goto('http://localhost:3000/admin/settings');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await shot(page, '07a-settings-default');
    // Try clicking integrations tab
    const integTab = page.locator('text=外部連携').or(page.locator('text=외부 연동')).or(page.locator('text=Integrations')).first();
    if (await integTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await integTab.click();
      await page.waitForTimeout(2000);
      await shot(page, '07b-settings-integrations');
    }
  });

  test('08 Admin - google-drive settings', async ({ page, context }) => {
    await loginViaApi(context);
    await page.goto('http://localhost:3000/admin/settings/google-drive');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await shot(page, '08-google-drive-settings');
  });

  test('09 Member - dashboard', async ({ page, context }) => {
    await loginViaApi(context);
    await page.goto('http://localhost:3000/member/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await shot(page, '09-member-dashboard');
  });

  test('10 Member - quotations list', async ({ page, context }) => {
    await loginViaApi(context);
    await page.goto('http://localhost:3000/member/quotations');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await shot(page, '10-member-quotations');
  });

  test('11 Member - quotation request form', async ({ page, context }) => {
    await loginViaApi(context);
    await page.goto('http://localhost:3000/member/quotations/request');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await shot(page, '11-quotation-request-form');
  });

  test('12 Member - orders list', async ({ page, context }) => {
    await loginViaApi(context);
    await page.goto('http://localhost:3000/member/orders');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await shot(page, '12-member-orders-list');
  });

  test('13 Member - orders history', async ({ page, context }) => {
    await loginViaApi(context);
    await page.goto('http://localhost:3000/member/orders/history');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await shot(page, '13-orders-history');
  });

  test('14 Member - new order form', async ({ page, context }) => {
    await loginViaApi(context);
    await page.goto('http://localhost:3000/member/orders/new');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await shot(page, '14-new-order-form');
  });

  test('15 Member - profile', async ({ page, context }) => {
    await loginViaApi(context);
    await page.goto('http://localhost:3000/member/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await shot(page, '15-member-profile');
  });

  test('16 Member - deliveries', async ({ page, context }) => {
    await loginViaApi(context);
    await page.goto('http://localhost:3000/member/deliveries');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await shot(page, '16-member-deliveries');
  });

  test('17 Member - invoices', async ({ page, context }) => {
    await loginViaApi(context);
    await page.goto('http://localhost:3000/member/invoices');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await shot(page, '17-member-invoices');
  });

  test('18 Member - contracts', async ({ page, context }) => {
    await loginViaApi(context);
    await page.goto('http://localhost:3000/member/contracts');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await shot(page, '18-member-contracts');
  });

  test('19 Admin - order detail (existing order)', async ({ page, context }) => {
    await loginViaApi(context);
    // Get first order from API
    const resp = await page.request.get('http://localhost:3000/api/admin/orders?limit=1');
    const body = await resp.json();
    const orderId = body?.data?.[0]?.id || body?.orders?.[0]?.id;
    if (orderId) {
      await page.goto(`http://localhost:3000/admin/orders/${orderId}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      await shot(page, '19-admin-order-detail');
    }
  });

  test('20 Member - order detail (existing order)', async ({ page, context }) => {
    await loginViaApi(context);
    const resp = await page.request.get('http://localhost:3000/api/admin/orders?limit=1');
    const body = await resp.json();
    const orderId = body?.data?.[0]?.id || body?.orders?.[0]?.id;
    if (orderId) {
      await page.goto(`http://localhost:3000/member/orders/${orderId}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      await shot(page, '20-member-order-detail');
    }
  });

  test('21 Member - quotation request (deep inspection)', async ({ page, context }) => {
    await loginViaApi(context);
    await page.goto('http://localhost:3000/member/quotations/request');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    // Check what form fields exist
    const labels = await page.locator('label, .label, [class*="label"]').allTextContents();
    console.log('QUOTATION FORM LABELS:', JSON.stringify(labels.slice(0, 30)));
    const buttons = await page.locator('button, a[href*="submit"], input[type="submit"]').allTextContents();
    console.log('QUOTATION FORM BUTTONS:', JSON.stringify(buttons.slice(0, 15)));
    const selects = await page.locator('select').count();
    console.log('SELECT count:', selects);
    await shot(page, '21-quotation-request-detailed');
  });

  test('22 Signup page', async ({ page }) => {
    await page.goto('http://localhost:3000/member/signup');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await shot(page, '22-signup-page');
  });

  test('23 Quote simulator', async ({ page }) => {
    await page.goto('http://localhost:3000/quote-simulator');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await shot(page, '23-quote-simulator');
  });
});

async function loginViaApi(context: BrowserContext) {
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const sbAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  // Read from env file (resolve relative to CWD so it works on win32, not just WSL)
  const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
  const getUrl = (envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1] || '').replace(/["']/g, '').trim();
  const getAnon = (envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1] || '').replace(/["']/g, '').trim();

  const resp = await fetch(`${getUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': getAnon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS }),
  });
  const data = await resp.json() as any;
  if (!data.access_token) throw new Error('Login failed: ' + JSON.stringify(data));

  const payload = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    token_type: 'bearer',
    expires_in: data.expires_in || 3600,
    expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
  };
  const cookieVal = 'base64-' + Buffer.from(JSON.stringify(payload)).toString('base64');
  const cookieName = 'sb-ijlgpzjdfipzmjvawofp-auth-token';

  await context.addCookies([{
    name: cookieName,
    value: cookieVal,
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'Lax',
    expires: payload.expires_at,
  }]);
}
