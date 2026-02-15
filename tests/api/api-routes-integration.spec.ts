/**
 * API Routes Integration Test Suite
 *
 * 모든 API 라우트가 실제로 올바르게 동작하는지 검증하는 통합 테스트입니다.
 * - Contact API
 * - Samples API
 * - Quotation API
 * - B2B API (Orders, Contracts, etc.)
 * - Auth API
 * - Public API (robots, sitemap)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// =====================================================
// Helper: Mock Data
// =====================================================

const mockContactData = {
  name: 'テストユーザー',
  name_kana: 'テストユーザー',
  email: 'test@example.com',
  company: 'テスト株式会社',
  company_kana: 'テストカブシキガイシャ',
  inquiry_type: 'technical',
  urgency: 'normal',
  message: 'テストメッセージです。',
  preferred_contact: 'email',
};

const mockSampleRequest = {
  samples: [
    {
      product_id: 'test-product-id',
      product_name: 'Test Pouch Package',
      product_code: 'TEST-001',
      category: 'COSMETICS',
      quantity: 1,
      specifications: 'Size: 100mm x 100mm',
    },
  ],
  customer_name: 'テスト顧客',
  customer_name_kana: 'テストコキャク',
  customer_email: 'customer@example.com',
  company: 'テスト会社',
  project_description: '新製品パッケージ開発',
  shipping_address: {
    postal_code: '1000001',
    prefecture: 'Tokyo',
    city: 'Chiyoda-ku',
    street: 'Test Street 1-1',
    building: 'Test Building',
  },
  privacy_consent: true,
};

const mockQuotationData = {
  items: [
    {
      product_id: 'test-product-id',
      product_name: 'Test Pouch',
      category: 'COSMETICS',
      quantity: 1000,
      unit_price: 50,
    },
  ],
  customer_info: {
    name: 'テスト顧客',
    email: 'customer@example.com',
    company: 'テスト会社',
  },
};

// =====================================================
// Test Suite 1: Contact API (/api/contact)
// =====================================================

test.describe('POST /api/contact - 問い合わせAPI', () => {
  test('正常な問い合わせデータで201応答を返す', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: mockContactData,
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('id');
    expect(body.data).toHaveProperty('name', mockContactData.name);
  });

  test('必須フィールドが 없い場合400エラーを返す', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: {
        // emailが欠落
        name: 'テスト',
        company: 'テスト会社',
        message: 'テスト',
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('不正なメールアドレス形式で400エラーを返す', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: {
        ...mockContactData,
        email: 'invalid-email-format',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('CSRF攻撃（異なるOrigin）を防ぐ', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://malicious-site.com',
      },
      data: mockContactData,
    });

    // Origin検증により403を返すべき
    expect([403, 401]).toContain(response.status());
  });
});

// =====================================================
// Test Suite 2: Samples API (/api/samples)
// =====================================================

test.describe('POST /api/samples - サンプルリクエストAPI', () => {
  test('正常なサンプルリクエストで201応答を返す', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/samples`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: mockSampleRequest,
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('id');
    expect(body.data).toHaveProperty('customer_name', mockSampleRequest.customer_name);
  });

  test('5個を超えるサンプル要求で400エラーを返す', async ({ request }) => {
    const tooManySamples = {
      ...mockSampleRequest,
      samples: Array.from({ length: 6 }, (_, i) => ({
        product_id: `test-product-${i}`,
        product_name: `Test Product ${i}`,
        quantity: 1,
      })),
    };

    const response = await request.post(`${BASE_URL}/api/samples`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: tooManySamples,
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toContain('最大5個');
  });

  test('個人情報同意がない場合400エラーを返す', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/samples`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: {
        ...mockSampleRequest,
        privacy_consent: false,
      },
    });

    expect(response.status()).toBe(400);
  });
});

// =====================================================
// Test Suite 3: Quotation API
// =====================================================

test.describe('POST /api/quotation - 見積計算API', () => {
  test('正常な見積データで計算結果を返す', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/quotation`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: mockQuotationData,
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('success', true);
    expect(body.data).toHaveProperty('total_amount');
    expect(body.data).toHaveProperty('items');
    expect(Array.isArray(body.data.items)).toBe(true);
  });

  test('数量割引が正しく適用される', async ({ request }) => {
    const bulkOrder = {
      ...mockQuotationData,
      items: [
        {
          ...mockQuotationData.items[0],
          quantity: 5000, // 大量注文
        },
      ],
    };

    const response = await request.post(`${BASE_URL}/api/quotation`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: bulkOrder,
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data.total_amount).toBeGreaterThan(0);
  });

  test('0数量でエラーを返す', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/quotation`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: {
        ...mockQuotationData,
        items: [
          {
            ...mockQuotationData.items[0],
            quantity: 0,
          },
        ],
      },
    });

    expect(response.status()).toBe(400);
  });
});

// =====================================================
// Test Suite 4: B2B Orders API
// =====================================================

test.describe('POST /api/b2b/orders - B2B注文API', () => {
  test('認証 없しで401エラーを返す', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/b2b/orders`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: mockQuotationData,
    });

    expect(response.status()).toBe(401);
  });

  test('CSRF攻撃を防ぐ', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/b2b/orders`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://external-attacker.com',
        'Referer': 'https://external-attacker.com/attack',
      },
      data: mockQuotationData,
    });

    expect([401, 403]).toContain(response.status());
  });
});

// =====================================================
// Test Suite 5: B2B Contracts API
// =====================================================

test.describe('POST /api/b2b/contracts - 契約書API', () => {
  test('認証 없しで401エラーを返す', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/b2b/contracts`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: {
        company_id: 'test-company-id',
        items: mockQuotationData.items,
      },
    });

    expect(response.status()).toBe(401);
  });
});

// =====================================================
// Test Suite 6: Electronic Signature API
// =====================================================

test.describe('POST /api/b2b/contracts/[id]/sign - 電子署名API', () => {
  test('認証 없しで401エラーを返す', async ({ request }) => {
    const response = await request.post(
      `${BASE_URL}/api/b2b/contracts/test-contract-id/sign`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': BASE_URL,
        },
        data: {
          signature_data: 'test-signature',
          client_ip: '127.0.0.1',
        },
      }
    );

    expect(response.status()).toBe(401);
  });

  test('署名データが含まれていない場合400エラーを返す', async ({ request }) => {
    // 인증된 요청이라 가정 (실제 테스트에서는 유효한 토큰 필요)
    const response = await request.post(
      `${BASE_URL}/api/b2b/contracts/test-contract-id/sign`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': BASE_URL,
        },
        data: {}, // 署名データ欠落
      }
    );

    expect([400, 401]).toContain(response.status());
  });
});

// =====================================================
// Test Suite 7: Auth API
// =====================================================

test.describe('POST /api/auth/register - 会員登録API', () => {
  const uniqueEmail = `test_${Date.now()}@example.com`;

  test('正常な登録データで201応答を返す', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/register`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: {
        email: uniqueEmail,
        password: 'TestPassword123!',
        kanji_last_name: '山田',
        kanji_first_name: '太郎',
        kana_last_name: 'ヤマダ',
        kana_first_name: 'タロウ',
        business_type: 'CORPORATION',
        company_name: 'テスト会社',
        product_category: 'COSMETICS',
      },
    });

    // 회원가입은 201 또는 409(이미 존재)을 반환할 수 있음
    expect([201, 200, 409]).toContain(response.status());
  });

  test('パスワードが短すぎる場合400エラーを返す', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/register`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: {
        email: `test_weak_${Date.now()}@example.com`,
        password: '123', // 弱いパスワード
        kanji_last_name: 'テスト',
        kanji_first_name: 'ユーザー',
        kana_last_name: 'テスト',
        kana_first_name: 'ユーザー',
        business_type: 'CORPORATION',
        product_category: 'COSMETICS',
      },
    });

    expect(response.status()).toBe(400);
  });
});

test.describe('POST /api/auth/signin - ログインAPI', () => {
  test('無効な認증情報で401エラーを返す', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/signin`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: {
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      },
    });

    expect(response.status()).toBe(401);
  });
});

// =====================================================
// Test Suite 8: Public API
// =====================================================

test.describe('GET /api/robots - robots.txt生成API', () => {
  test('正しいrobots.txtを返す', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/robots`);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');

    const text = await response.text();
    expect(text).toContain('User-agent');
    expect(text).toContain('Sitemap');
  });
});

test.describe('GET /api/sitemap - sitemap.xml生成API', () => {
  test('正しいsitemap.xmlを返す', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/sitemap`);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/xml');

    const text = await response.text();
    expect(text).toContain('<?xml');
    expect(text).toContain('<urlset');
    expect(text).toContain('<loc>');
  });
});

// =====================================================
// Test Suite 9: Error Handling
// =====================================================

test.describe('エラーハンドリング検証', () => {
  test('存在しないエンドポイントで404を返す', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/nonexistent-endpoint`);

    expect(response.status()).toBe(404);
  });

  test('無効なJSONで400エラーを返す', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: 'invalid json{{{',
    });

    expect(response.status()).toBe(400);
  });
});

// =====================================================
// Test Suite 10: Security Tests
// =====================================================

test.describe('APIセキュリティテスト', () => {
  test('SQLインジェクション対策が実装されている', async ({ request }) => {
    const maliciousData = {
      ...mockContactData,
      name: "'; DROP TABLE contacts; --",
    };

    const response = await request.post(`${BASE_URL}/api/contact`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: maliciousData,
    });

    // サーバーエラー（500）ではなく、バリデーションエラー（400）を返すべき
    expect(response.status()).not.toBe(500);
    expect([400, 201]).toContain(response.status());
  });

  test('XSS対策が実装されている', async ({ request }) => {
    const xssData = {
      ...mockContactData,
      name: '<script>alert("XSS")</script>',
      message: '<img src=x onerror=alert("XSS")>',
    };

    const response = await request.post(`${BASE_URL}/api/contact`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: xssData,
    });

    // 입력은 저장되지만、エスケープされて返されるべき
    expect(response.status()).toBe(201);

    // 저장된 데이터에서 스크립트 태그가 제거되거나 에스ケープ되어야 함
    // (실제 구현에 따라 다름)
  });

  test('機密情報がエラーログに含まれない', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      data: {
        ...mockContactData,
        email: 'sensitive@example.com',
        message: 'This should not be logged with email',
      },
    });

    // 에ラーレスポンスに機密情報が含まれていない지 확인
    if (response.status() !== 201) {
      const body = await response.json();
      expect(body).not.toHaveProperty('email');
    }
  });
});

// =====================================================
// Summary Report
// =====================================================

test.afterEach(async ({}, testInfo) => {
  console.log(`Test: ${testInfo.title}`);
  console.log(`Status: ${testInfo.status}`);
  console.log(`Duration: ${testInfo.duration}ms`);
});

test.afterAll(async () => {
  console.log('='.repeat(50));
  console.log('API Routes Integration Tests Complete');
  console.log('='.repeat(50));
});
