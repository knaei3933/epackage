/**
 * Dev Mode Authentication Helper for Playwright Tests
 *
 * 開発モードでの認証をサポートするヘルパー関数
 */

/**
 * Check if dev mode is enabled
 */
export function isDevMode(): boolean {
  const isNonProduction = process.env.NODE_ENV !== 'production';
  const isDevMode = isNonProduction && process.env.ENABLE_DEV_MOCK_AUTH === 'true';
  return isDevMode;
}

/**
 * Setup dev mode authentication in browser context
 * Sets mock user cookies for testing without real authentication
 */
export async function setupDevModeAuth(page: any, role: 'ADMIN' | 'MEMBER' = 'MEMBER') {
  if (!isDevMode()) {
    return;
  }

  const mockUserId = role === 'ADMIN' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002';
  const mockEmail = role === 'ADMIN' ? 'admin@epackage-lab.com' : 'member@test.com';

  // Set mock cookies
  await page.context().addCookies([
    {
      name: 'dev-mock-user-id',
      value: mockUserId,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
    {
      name: 'sb-access-token',
      value: 'mock-access-token-' + Date.now(),
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);

  // Set localStorage
  await page.evaluate(([email, userId, userRole]) => {
    localStorage.setItem('dev-user', JSON.stringify({
      id: userId,
      email: email,
      role: userRole,
      status: 'ACTIVE'
    }));
  }, [mockEmail, mockUserId, role]);
}

/**
 * Authenticate and navigate to a page
 * Uses dev mode if enabled, otherwise performs real login
 */
export async function authenticateAndNavigate(page: any, options: {
  email: string;
  password: string;
  redirectPath?: string;
} = { email: 'admin@epackage-lab.com', password: 'Admin123!' }) {
  const { email, password, redirectPath } = options;
  const role = email.includes('admin') ? 'ADMIN' : 'MEMBER';

  // Check if dev mode is enabled
  if (isDevMode()) {
    await setupDevModeAuth(page, role);
    const targetPath = redirectPath || (role === 'ADMIN' ? '/admin/dashboard' : '/member/dashboard');
    await page.goto(targetPath);
    return;
  }

  // Perform real login
  await page.goto('/auth/signin');

  // Fill login form
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for navigation
  const targetPath = redirectPath || (role === 'ADMIN' ? '/admin/dashboard' : '/member/dashboard');
  await page.waitForURL(`**${targetPath}`, { timeout: 10000 });
}

/**
 * Clear auth cookies and storage
 */
export async function clearAuth(page: any) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
