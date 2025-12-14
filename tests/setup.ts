import { test as base, expect, type Page } from '@playwright/test';

// Define test fixtures
export const test = base.extend({
    // Add custom fixtures here if needed
    page: async ({ page }, use) => {
        // Set up Japanese locale for tests
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'language', {
                get: () => 'ja-JP',
            });
        });

        // Set up viewport
        await page.setViewportSize({ width: 1280, height: 720 });

        await use(page);
    },
});

export { expect };

// Test data fixtures
export const testUsers = {
    validUser: {
        name: 'テストユーザー',
        email: 'test@epackage-lab.jp',
        company: 'テスト株式会社',
        phone: '03-1234-5678',
    },
    sampleRequest: {
        products: ['段ボール箱A', '緩衝材B'],
        quantity: '100',
        purpose: '商品梱包用',
        deadline: '2024-02-01',
    },
    quoteRequest: {
        product: 'standard-box',
        size: { length: '300', width: '200', height: '150' },
        quantity: '500',
        material: '片面ライナーA',
    },
};

// Helper functions
export async function fillContactForm(page: Page, userData: any) {
    await page.fill('[data-testid="contact-name"]', userData.name);
    await page.fill('[data-testid="contact-email"]', userData.email);
    await page.fill('[data-testid="contact-company"]', userData.company);
    await page.fill('[data-testid="contact-phone"]', userData.phone);
}

export async function fillSampleRequestForm(page: Page, requestData: any) {
    for (const product of requestData.products) {
        await page.selectOption('[data-testid="sample-product"]', product);
        await page.click('[data-testid="add-sample"]');
    }
    await page.fill('[data-testid="sample-quantity"]', requestData.quantity);
    await page.fill('[data-testid="sample-purpose"]', requestData.purpose);
    await page.fill('[data-testid="sample-deadline"]', requestData.deadline);
}

export async function waitForPageLoad(page: Page) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // Wait for any animations
}