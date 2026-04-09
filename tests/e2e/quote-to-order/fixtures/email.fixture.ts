import { test as base, APIRequestContext } from '@playwright/test';

/**
 * Email Testing Fixtures for E2E Testing
 *
 * Provides helper functions to fetch and manage test emails
 * via the /api/test/emails endpoint.
 *
 * @example
 * ```ts
 * test('email test', async ({ page, waitForEmail }) => {
 *   await page.goto('/some-page');
 *   await page.click('button[type="submit"]');
 *
 *   const email = await waitForEmail('test@example.com');
 *   expect(email.subject).toContain('確認');
 * });
 * ```
 */

// =====================================================
// Type Definitions
// =====================================================

type TestEmail = {
  id: string;
  to: string;
  subject: string;
  body: string;
  html?: string;
  timestamp: string;
  read: boolean;
};

type EmailFixtures = {
  testEmails: (recipient: string) => Promise<TestEmail[]>;
  waitForEmail: (recipient: string, options?: {
    timeout?: number;
    subjectContains?: string;
    pollInterval?: number;
  }) => Promise<TestEmail>;
  clearTestEmails: (recipient: string) => Promise<void>;
};

// =====================================================
// Helper Functions
// =====================================================

/**
 * Fetch emails for a recipient from /api/test/emails endpoint
 */
async function fetchEmails(
  request: APIRequestContext,
  recipient: string
): Promise<TestEmail[]> {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  const response = await request.get(`${baseURL}/api/test/emails?recipient=${encodeURIComponent(recipient)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch emails: ${response.status} ${response.statusText()}`);
  }

  const data = await response.json();
  return data.emails || [];
}

/**
 * Poll for email with timeout
 */
async function pollForEmail(
  request: APIRequestContext,
  recipient: string,
  options: {
    timeout?: number;
    subjectContains?: string;
    pollInterval?: number;
  } = {}
): Promise<TestEmail> {
  const {
    timeout = 30000,
    subjectContains,
    pollInterval = 1000,
  } = options;

  const startTime = Date.now();
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  console.log(`[email.fixture] Waiting for email to ${recipient} (timeout: ${timeout}ms)`);

  while (Date.now() - startTime < timeout) {
    const emails = await fetchEmails(request, recipient);

    // Filter by subject if provided
    const matchingEmails = subjectContains
      ? emails.filter(email => email.subject.includes(subjectContains))
      : emails;

    if (matchingEmails.length > 0) {
      console.log(`[email.fixture] Found email: ${matchingEmails[0].subject}`);
      return matchingEmails[0];
    }

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error(
    `Timeout waiting for email to ${recipient}` +
    (subjectContains ? ` with subject containing "${subjectContains}"` : '')
  );
}

/**
 * Clear all emails for a recipient
 */
async function clearEmails(
  request: APIRequestContext,
  recipient: string
): Promise<void> {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  const response = await request.delete(`${baseURL}/api/test/emails?recipient=${encodeURIComponent(recipient)}`);

  if (!response.ok) {
    throw new Error(`Failed to clear emails: ${response.status} ${response.statusText()}`);
  }

  console.log(`[email.fixture] Cleared emails for ${recipient}`);
}

// =====================================================
// Fixtures
// =====================================================

export const test = base.extend<EmailFixtures>({
  // Fetch all emails for a recipient
  testEmails: async ({ request }, use) => {
    const helper = async (recipient: string) => {
      const emails = await fetchEmails(request, recipient);
      console.log(`[email.fixture] Fetched ${emails.length} emails for ${recipient}`);
      return emails;
    };

    await use(helper);
  },

  // Wait for email with polling
  waitForEmail: async ({ request }, use) => {
    const helper = async (
      recipient: string,
      options?: {
        timeout?: number;
        subjectContains?: string;
        pollInterval?: number;
      }
    ) => {
      return await pollForEmail(request, recipient, options);
    };

    await use(helper);
  },

  // Clear test emails for cleanup
  clearTestEmails: async ({ request }, use) => {
    const helper = async (recipient: string) => {
      await clearEmails(request, recipient);
    };

    await use(helper);
  },
});

// =====================================================
// Export
// =====================================================

export const expect = test.expect;
export type { TestEmail };
