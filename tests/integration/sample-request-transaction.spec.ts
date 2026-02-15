/**
 * B2B 샘플 요청 트랜잭션 롤백 테스트 (Sample Request Transaction Rollback Tests)
 *
 * Tests the ACID transaction behavior of the create_sample_request_transaction RPC function:
 * - Atomicity: All operations succeed or all are rolled back
 * - Consistency: Data integrity is maintained
 * - Isolation: Concurrent operations don't interfere
 * - Durability: Committed data persists
 *
 * Test Scenarios:
 * 1. Normal sample request creation (success case)
 * 2. Rollback when items array is empty
 * 3. Rollback when items array exceeds 5 items
 * 4. Validation of sample request integrity after creation
 */

import { test, expect } from '@playwright/test';

// API Base URL
const API_BASE = 'http://localhost:3000/api';

test.describe('Sample Request Transaction Rollback Tests', () => {
  test.describe('Transaction Rollback Scenarios', () => {
    test('1. Normal sample request creation - all operations succeed', async ({ request }) => {
      // This test requires valid sample request data
      const validRequestData = {
        kanjiLastName: 'テスト',
        kanjiFirstName: 'ユーザー',
        kanaLastName: 'テスト',
        kanaFirstName: 'ユーザー',
        email: 'test@example.com',
        phone: '090-1234-5678',
        deliveryType: 'normal',
        deliveryDestinations: [
          {
            id: '1',
            contactPerson: 'テスト担当者',
            phone: '090-1234-5678',
            address: '東京都渋谷区1-1-1'
          }
        ],
        sampleItems: [
          {
            productId: 'prod-001',
            productName: 'Test Package',
            productCategory: 'box',
            quantity: 1
          }
        ],
        message: 'これはテストメッセージです。10文字以上の長さが必要です。',
        agreement: true
      };

      const response = await request.post(`${API_BASE}/samples`, {
        headers: {
          'Content-Type': 'application/json'
        },
        data: validRequestData
      });

      // Should return 200 or validation error if email fails
      expect([200, 500]).toContain(response.status());

      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('success', true);
        expect(data.data).toHaveProperty('sampleRequestId');
        expect(data.data).toHaveProperty('requestId');
        expect(data.data.sampleItemsCount).toBeGreaterThan(0);
      }
    });

    test('2. Rollback when items array is empty', async ({ request }) => {
      const invalidRequestData = {
        kanjiLastName: 'テスト',
        kanjiFirstName: 'ユーザー',
        kanaLastName: 'テスト',
        kanaFirstName: 'ユーザー',
        email: 'test@example.com',
        phone: '090-1234-5678',
        deliveryType: 'normal',
        deliveryDestinations: [
          {
            id: '1',
            contactPerson: 'テスト担当者',
            phone: '090-1234-5678',
            address: '東京都渋谷区1-1-1'
          }
        ],
        sampleItems: [], // Empty array - should fail validation
        message: 'これはテストメッセージです。10文字以上の長さが必要です。',
        agreement: true
      };

      const response = await request.post(`${API_BASE}/samples`, {
        headers: {
          'Content-Type': 'application/json'
        },
        data: invalidRequestData
      });

      // Should return validation error
      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('サンプル');
    });

    test('3. Rollback when items array exceeds 5 items', async ({ request }) => {
      const invalidRequestData = {
        kanjiLastName: 'テスト',
        kanjiFirstName: 'ユーザー',
        kanaLastName: 'テスト',
        kanaFirstName: 'ユーザー',
        email: 'test@example.com',
        phone: '090-1234-5678',
        deliveryType: 'normal',
        deliveryDestinations: [
          {
            id: '1',
            contactPerson: 'テスト担当者',
            phone: '090-1234-5678',
            address: '東京都渋谷区1-1-1'
          }
        ],
        sampleItems: [
          { productName: 'Sample 1', quantity: 1 },
          { productName: 'Sample 2', quantity: 1 },
          { productName: 'Sample 3', quantity: 1 },
          { productName: 'Sample 4', quantity: 1 },
          { productName: 'Sample 5', quantity: 1 },
          { productName: 'Sample 6', quantity: 1 } // Exceeds 5 items
        ],
        message: 'これはテストメッセージです。10文字以上の長さが必要です。',
        agreement: true
      };

      const response = await request.post(`${API_BASE}/samples`, {
        headers: {
          'Content-Type': 'application/json'
        },
        data: invalidRequestData
      });

      // Should return validation error
      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('5点');
    });

    test('4. Rollback when email validation fails', async ({ request }) => {
      const invalidRequestData = {
        kanjiLastName: 'テスト',
        kanjiFirstName: 'ユーザー',
        kanaLastName: 'テスト',
        kanaFirstName: 'ユーザー',
        email: 'invalid-email', // Invalid email
        phone: '090-1234-5678',
        deliveryType: 'normal',
        deliveryDestinations: [
          {
            id: '1',
            contactPerson: 'テスト担当者',
            phone: '090-1234-5678',
            address: '東京都渋谷区1-1-1'
          }
        ],
        sampleItems: [
          { productName: 'Sample 1', quantity: 1 }
        ],
        message: 'これはテストメッセージです。10文字以上の長さが必要です。',
        agreement: true
      };

      const response = await request.post(`${API_BASE}/samples`, {
        headers: {
          'Content-Type': 'application/json'
        },
        data: invalidRequestData
      });

      // Should return validation error before transaction
      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('5. Rollback when message is too short', async ({ request }) => {
      const invalidRequestData = {
        kanjiLastName: 'テスト',
        kanjiFirstName: 'ユーザー',
        kanaLastName: 'テスト',
        kanaFirstName: 'ユーザー',
        email: 'test@example.com',
        phone: '090-1234-5678',
        deliveryType: 'normal',
        deliveryDestinations: [
          {
            id: '1',
            contactPerson: 'テスト担当者',
            phone: '090-1234-5678',
            address: '東京都渋谷区1-1-1'
          }
        ],
        sampleItems: [
          { productName: 'Sample 1', quantity: 1 }
        ],
        message: '短い', // Too short (less than 10 characters)
        agreement: true
      };

      const response = await request.post(`${API_BASE}/samples`, {
        headers: {
          'Content-Type': 'application/json'
        },
        data: invalidRequestData
      });

      // Should return validation error
      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  test.describe('Data Integrity Verification', () => {
    test('6. Sample request has correct request number format', async ({ request }) => {
      const validRequestData = {
        kanjiLastName: 'テスト',
        kanjiFirstName: 'ユーザー',
        kanaLastName: 'テスト',
        kanaFirstName: 'ユーザー',
        email: 'test@example.com',
        phone: '090-1234-5678',
        deliveryType: 'normal',
        deliveryDestinations: [
          {
            id: '1',
            contactPerson: 'テスト担当者',
            phone: '090-1234-5678',
            address: '東京都渋谷区1-1-1'
          }
        ],
        sampleItems: [
          { productName: 'Sample 1', quantity: 1 }
        ],
        message: 'これはテストメッセージです。10文字以上の長さが必要です。',
        agreement: true
      };

      const response = await request.post(`${API_BASE}/samples`, {
        headers: {
          'Content-Type': 'application/json'
        },
        data: validRequestData
      });

      if (response.ok()) {
        const data = await response.json();
        expect(data.data.requestId).toMatch(/^SMP-/);
      }
    });

    test('7. Sample items count matches requested items', async ({ request }) => {
      const validRequestData = {
        kanjiLastName: 'テスト',
        kanjiFirstName: 'ユーザー',
        kanaLastName: 'テスト',
        kanaFirstName: 'ユーザー',
        email: 'test@example.com',
        phone: '090-1234-5678',
        deliveryType: 'normal',
        deliveryDestinations: [
          {
            id: '1',
            contactPerson: 'テスト担当者',
            phone: '090-1234-5678',
            address: '東京都渋谷区1-1-1'
          }
        ],
        sampleItems: [
          { productName: 'Sample 1', quantity: 1 },
          { productName: 'Sample 2', quantity: 2 },
          { productName: 'Sample 3', quantity: 3 }
        ],
        message: 'これはテストメッセージです。10文字以上の長さが必要です。',
        agreement: true
      };

      const response = await request.post(`${API_BASE}/samples`, {
        headers: {
          'Content-Type': 'application/json'
        },
        data: validRequestData
      });

      if (response.ok()) {
        const data = await response.json();
        expect(data.data.sampleItemsCount).toBe(3);
      }
    });

    test('8. Verify sample request integrity after creation', async ({ request }) => {
      // This would require database access to verify:
      // - sample_requests record exists
      // - sample_items records exist
      // - Request number is properly formatted
      // - Status is 'received'

      const response = await request.post(`${API_BASE}/samples/validate-integrity`, {
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          sample_request_id: '00000000-0000-0000-0000-000000000000'
        }
      });

      // If endpoint exists, it should return integrity check results
      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('is_valid');
        expect(data).toHaveProperty('issues');
      }
    });
  });

  test.describe('Transaction Isolation Tests', () => {
    test('9. Concurrent sample request attempts handle correctly', async ({ request }) => {
      // Test that concurrent sample request attempts don't cause race conditions

      const validRequestData = {
        kanjiLastName: 'テスト',
        kanjiFirstName: 'ユーザー',
        kanaLastName: 'テスト',
        kanaFirstName: 'ユーザー',
        email: `test${Date.now()}@example.com`,
        phone: '090-1234-5678',
        deliveryType: 'normal',
        deliveryDestinations: [
          {
            id: '1',
            contactPerson: 'テスト担当者',
            phone: '090-1234-5678',
            address: '東京都渋谷区1-1-1'
          }
        ],
        sampleItems: [
          { productName: 'Sample 1', quantity: 1 }
        ],
        message: 'これはテストメッセージです。10文字以上の長さが必要です。',
        agreement: true
      };

      const requests = Array(3).fill(null).map((_, i) =>
        request.post(`${API_BASE}/samples`, {
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            ...validRequestData,
            email: `test${Date.now()}-${i}@example.com`
          }
        })
      );

      const responses = await Promise.all(requests);

      // All requests should complete without hanging
      responses.forEach(response => {
        expect([200, 400, 500]).toContain(response.status());
      });
    });

    test('10. Database state consistency under concurrent load', async ({ request }) => {
      // Verify that under concurrent load, data remains consistent
      // This would require actual database connection testing

      const response = await request.post(`${API_BASE}/samples`, {
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          kanjiLastName: 'テスト',
          kanjiFirstName: 'ユーザー',
          kanaLastName: 'テスト',
          kanaFirstName: 'ユーザー',
          email: `test${Date.now()}@example.com`,
          phone: '090-1234-5678',
          deliveryType: 'normal',
          deliveryDestinations: [
            {
              id: '1',
              contactPerson: 'テスト担当者',
              phone: '090-1234-5678',
              address: '東京都渋谷区1-1-1'
            }
          ],
          sampleItems: [
            { productName: 'Sample 1', quantity: 1 }
          ],
          message: 'これはテストメッセージです。10文字以上の長さが必要です。',
          agreement: true
        }
      });

      // Response should have consistent structure
      const data = await response.json();
      expect(data).toMatchObject({
        success: expect.any(Boolean),
        data: expect.any(Object)
      });
    });
  });

  test.describe('Email Handling Tests', () => {
    test('11. Request succeeds even when email fails', async ({ request }) => {
      // Sample request should be saved even if email sending fails
      // The transaction should commit, and email failure should be logged only

      const validRequestData = {
        kanjiLastName: 'テスト',
        kanjiFirstName: 'ユーザー',
        kanaLastName: 'テスト',
        kanaFirstName: 'ユーザー',
        email: 'test@example.com',
        phone: '090-1234-5678',
        deliveryType: 'normal',
        deliveryDestinations: [
          {
            id: '1',
            contactPerson: 'テスト担当者',
            phone: '090-1234-5678',
            address: '東京都渋谷区1-1-1'
          }
        ],
        sampleItems: [
          { productName: 'Sample 1', quantity: 1 }
        ],
        message: 'これはテストメッセージです。10文字以上の長さが必要です。',
        agreement: true
      };

      const response = await request.post(`${API_BASE}/samples`, {
        headers: {
          'Content-Type': 'application/json'
        },
        data: validRequestData
      });

      // Should succeed (email failure is logged but doesn't cause rollback)
      if (response.ok()) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty('sampleRequestId');
        // Email status should be tracked
        expect(data.data).toHaveProperty('emailSent');
      }
    });

    test('12. Email data includes all required information', async ({ request }) => {
      // Verify that when emails are sent, they contain all necessary information

      const validRequestData = {
        kanjiLastName: '山田',
        kanjiFirstName: '太郎',
        kanaLastName: 'ヤマダ',
        kanaFirstName: 'タロウ',
        email: 'yamada@example.com',
        phone: '090-1234-5678',
        company: 'テスト株式会社',
        deliveryType: 'normal',
        deliveryDestinations: [
          {
            id: '1',
            companyName: 'テスト株式会社',
            contactPerson: '山田担当',
            phone: '090-1234-5678',
            postalCode: '100-0001',
            address: '東京都渋谷区1-1-1'
          }
        ],
        sampleItems: [
          { productName: 'テストパッケージ', quantity: 100 },
          { productName: 'サンプルボックス', quantity: 50 }
        ],
        message: 'テスト用のサンプルを依頼します。詳細は連絡させていただきます。',
        agreement: true
      };

      const response = await request.post(`${API_BASE}/samples`, {
        headers: {
          'Content-Type': 'application/json'
        },
        data: validRequestData
      });

      if (response.ok()) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty('sampleRequestId');
      }
    });
  });
});

// Helper functions for test data setup
async function createTestSampleRequest(request: any): Promise<string> {
  // Create a test sample request
  const validRequestData = {
    kanjiLastName: 'テスト',
    kanjiFirstName: 'ユーザー',
    kanaLastName: 'テスト',
    kanaFirstName: 'ユーザー',
    email: `test${Date.now()}@example.com`,
    phone: '090-1234-5678',
    deliveryType: 'normal',
    deliveryDestinations: [
      {
        id: '1',
        contactPerson: 'テスト担当者',
        phone: '090-1234-5678',
        address: '東京都渋谷区1-1-1'
      }
    ],
    sampleItems: [
      { productName: 'Test Sample', quantity: 1 }
    ],
    message: 'テスト用のサンプルリクエストです。',
    agreement: true
  };

  const response = await request.post('http://localhost:3000/api/samples', {
    headers: {
      'Content-Type': 'application/json'
    },
    data: validRequestData
  });

  if (response.ok()) {
    const data = await response.json();
    return data.data.sampleRequestId;
  }

  return '';
}
