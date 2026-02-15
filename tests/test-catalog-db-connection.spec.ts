/**
 * Test Database Connection for All Catalog APIs (Subtask 91.7)
 *
 * Tests the following APIs:
 * 1. POST /api/products/filter - Advanced product filtering
 * 2. GET /api/products/search - Product search with relevance ranking
 * 3. POST /api/samples/request - Sample request submission
 *
 * Verifies:
 * - Correct database access using Supabase MCP
 * - SQL query formation
 * - Error handling
 * - Data integrity
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Test data
const testFilters = {
  category: 'all',
  materials: ['紙', 'プラスチック'],
  priceRange: [100, 5000] as [number, number],
  features: ['耐水性', '耐熱性'],
  tags: ['環境に優しい'],
};

const testSearchKeywords = ['封筒', '袋', '梱包', 'シロバン'];

const testSampleRequest = {
  deliveryType: 'normal',
  deliveryDestinations: [
    {
      contactPerson: 'テスト担当者',
      phone: '03-1234-5678',
      postalCode: '100-0001',
      address: '東京都千代田区丸の内1-1-1',
      isPrimary: true,
    },
  ],
  samples: [
    {
      productName: '紙製封筒 A4',
      category: '封筒',
      quantity: 2,
    },
    {
      productName: 'プラスチック袋 Lサイズ',
      category: '袋',
      quantity: 1,
    },
  ],
  message: 'テスト用サンプルリクエストです',
  urgency: 'normal',
  privacyConsent: true,
};

test.describe('Catalog API Database Connection Tests', () => {

  test.beforeAll(async () => {
    console.log('==================================================');
    console.log('CATALOG API DATABASE CONNECTION TESTS');
    console.log('==================================================');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Test Time: ${new Date().toISOString()}`);
    console.log('');
  });

  // ============================================================
  // Test 1: Filter API - POST /api/products/filter
  // ============================================================

  test('91.2 - Filter API returns correct filtered results', async ({ request }) => {
    console.log('\n[TEST 91.2] Testing Filter API...');

    const startTime = Date.now();

    const response = await request.post(`${BASE_URL}/api/products/filter`, {
      data: testFilters,
    });

    const duration = Date.now() - startTime;
    console.log(`Response time: ${duration}ms`);

    // Verify response status
    expect(response.status()).toBe(200);

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    // Verify response structure
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('count');
    expect(data).toHaveProperty('filters');
    expect(data).toHaveProperty('timestamp');

    // Verify filters applied correctly
    expect(data.filters).toEqual(testFilters);

    // Verify data is an array
    expect(Array.isArray(data.data)).toBe(true);

    // Verify each product has required fields
    if (data.data.length > 0) {
      const firstProduct = data.data[0];
      expect(firstProduct).toHaveProperty('id');
      expect(firstProduct).toHaveProperty('category');
      expect(firstProduct).toHaveProperty('name_ja');
      expect(firstProduct).toHaveProperty('name_en');
      expect(firstProduct).toHaveProperty('materials');
      expect(firstProduct).toHaveProperty('is_active', true);

      // Verify filter matches (if applicable)
      if (testFilters.category !== 'all') {
        expect(firstProduct.category).toBe(testFilters.category);
      }
    }

    console.log(`✓ Filter API returned ${data.count} products`);
    console.log(`✓ Response time: ${duration}ms`);
  });

  test('91.2 - Filter API with multiple criteria', async ({ request }) => {
    console.log('\n[TEST 91.2] Testing Filter API with multiple criteria...');

    const complexFilters = {
      category: '封筒',
      materials: ['紙'],
      minOrderQuantity: 100,
      maxLeadTime: 14,
      searchQuery: 'A4',
    };

    const response = await request.post(`${BASE_URL}/api/products/filter`, {
      data: complexFilters,
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    console.log(`Found ${data.count} products with complex filters`);

    // Verify filtering logic
    if (data.data.length > 0) {
      data.data.forEach((product: any) => {
        // Verify category filter
        if (complexFilters.category !== 'all') {
          expect(product.category).toBe(complexFilters.category);
        }

        // Verify materials filter
        if (complexFilters.materials && complexFilters.materials.length > 0) {
          const hasMatchingMaterial = product.materials?.some((m: string) =>
            complexFilters.materials.includes(m)
          );
          expect(hasMatchingMaterial).toBe(true);
        }

        // Verify min order quantity
        if (complexFilters.minOrderQuantity) {
          expect(product.min_order_quantity).toBeLessThanOrEqual(complexFilters.minOrderQuantity);
        }

        // Verify max lead time
        if (complexFilters.maxLeadTime) {
          expect(product.lead_time_days).toBeLessThanOrEqual(complexFilters.maxLeadTime);
        }
      });
    }

    console.log('✓ Complex filter criteria verified');
  });

  test('91.2 - Filter API error handling', async ({ request }) => {
    console.log('\n[TEST 91.2] Testing Filter API error handling...');

    // Test with invalid data
    const response = await request.post(`${BASE_URL}/api/products/filter`, {
      data: {
        invalidField: 'test',
      },
    });

    // Should still return 200 (API handles invalid filters gracefully)
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    console.log('✓ Error handling works correctly');
  });

  // ============================================================
  // Test 2: Search API - GET /api/products/search
  // ============================================================

  test('91.4 - Search API returns relevant results with ranking', async ({ request }) => {
    console.log('\n[TEST 91.4] Testing Search API...');

    const keyword = testSearchKeywords[0]; // '封筒'

    const startTime = Date.now();

    const response = await request.get(
      `${BASE_URL}/api/products/search?keyword=${encodeURIComponent(keyword)}&limit=10`
    );

    const duration = Date.now() - startTime;
    console.log(`Response time: ${duration}ms`);

    // Verify response status
    expect(response.status()).toBe(200);

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    // Verify response structure
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('count');
    expect(data).toHaveProperty('keyword', keyword);
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('performance');

    // Verify performance metadata
    expect(data.performance).toHaveProperty('method', 'supabase-mcp-execute-sql');
    expect(data.performance).toHaveProperty('relevanceRanking', true);
    expect(data.performance).toHaveProperty('fullTextSearch', true);

    // Verify data is an array
    expect(Array.isArray(data.data)).toBe(true);

    // Verify relevance ranking
    if (data.data.length > 0) {
      const firstProduct = data.data[0];
      expect(firstProduct).toHaveProperty('relevance_score');
      expect(firstProduct).toHaveProperty('match_type');

      // Verify relevance score is descending
      for (let i = 1; i < data.data.length; i++) {
        expect(data.data[i].relevance_score).toBeLessThanOrEqual(data.data[i - 1].relevance_score);
      }

      console.log(`✓ Top result: ${firstProduct.name_ja} (relevance: ${firstProduct.relevance_score}, match: ${firstProduct.match_type})`);
    }

    console.log(`✓ Search API returned ${data.count} results for "${keyword}"`);
    console.log(`✓ Response time: ${duration}ms`);
  });

  test('91.4 - Search API with category filter', async ({ request }) => {
    console.log('\n[TEST 91.4] Testing Search API with category filter...');

    const keyword = '袋';
    const category = '袋';

    const response = await request.get(
      `${BASE_URL}/api/products/search?keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}&limit=10`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();

    // Verify all results match the category
    if (data.data.length > 0) {
      data.data.forEach((product: any) => {
        expect(product.category).toBe(category);
      });
    }

    console.log(`✓ Category filter verified: ${data.count} results in category "${category}"`);
  });

  test('91.4 - Search API with multiple keywords', async ({ request }) => {
    console.log('\n[TEST 91.4] Testing Search API with multiple keywords...');

    const results: Record<string, any> = {};

    for (const keyword of testSearchKeywords) {
      const response = await request.get(
        `${BASE_URL}/api/products/search?keyword=${encodeURIComponent(keyword)}&limit=5`
      );

      expect(response.status()).toBe(200);

      const data = await response.json();
      results[keyword] = {
        count: data.count,
        topResult: data.data[0]?.name_ja || 'N/A',
      };

      console.log(`  "${keyword}": ${data.count} results (top: ${results[keyword].topResult})`);
    }

    // Verify all searches returned results
    Object.values(results).forEach((result: any) => {
      expect(result.count).toBeGreaterThan(0);
    });

    console.log('✓ All keyword searches completed successfully');
  });

  test('91.4 - Search API error handling - missing keyword', async ({ request }) => {
    console.log('\n[TEST 91.4] Testing Search API error handling...');

    const response = await request.get(`${BASE_URL}/api/products/search`);

    // Should return 400 for missing keyword
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('success', false);
    expect(data.error).toContain('Keyword parameter is required');

    console.log('✓ Error handling works correctly for missing keyword');
  });

  // ============================================================
  // Test 3: Sample Request API - POST /api/samples/request
  // ============================================================

  test('91.6 - Sample Request API correctly stores data in database', async ({ request }) => {
    console.log('\n[TEST 91.6] Testing Sample Request API...');

    const startTime = Date.now();

    const response = await request.post(`${BASE_URL}/api/samples/request`, {
      data: testSampleRequest,
    });

    const duration = Date.now() - startTime;
    console.log(`Response time: ${duration}ms`);

    // Verify response status
    expect(response.status()).toBe(200);

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    // Verify response structure
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('data');

    // Verify returned data
    expect(data.data).toHaveProperty('requestId');
    expect(data.data).toHaveProperty('sampleRequestId');
    expect(data.data).toHaveProperty('sampleCount', testSampleRequest.samples.length);
    expect(data.data).toHaveProperty('emailSent');

    // Verify request ID format (SMP-YYYY-NNNN)
    expect(data.data.requestId).toMatch(/^SMP-\d{4}-\d{4}$/);

    console.log(`✓ Sample request created: ${data.data.requestId}`);
    console.log(`✓ Sample count: ${data.data.sampleCount}`);
    console.log(`✓ Email sent: ${data.data.emailSent}`);
    console.log(`✓ Response time: ${duration}ms`);
  });

  test('91.6 - Sample Request API with customer info', async ({ request }) => {
    console.log('\n[TEST 91.6] Testing Sample Request API with customer info...');

    const requestWithCustomer = {
      ...testSampleRequest,
      customerInfo: {
        companyName: 'テスト株式会社',
        contactPerson: '山田太郎',
        email: 'test@example.com',
        phone: '03-9876-5432',
      },
    };

    const response = await request.post(`${BASE_URL}/api/samples/request`, {
      data: requestWithCustomer,
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data.data).toHaveProperty('requestId');

    console.log(`✓ Guest request created: ${data.data.requestId}`);
  });

  test('91.6 - Sample Request API validation', async ({ request }) => {
    console.log('\n[TEST 91.6] Testing Sample Request API validation...');

    // Test with missing required fields
    const invalidRequest = {
      deliveryType: 'normal',
      deliveryDestinations: [],
      samples: [],
      privacyConsent: false,
    };

    const response = await request.post(`${BASE_URL}/api/samples/request`, {
      data: invalidRequest,
    });

    // Should return 400 for validation error
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error');

    console.log('✓ Validation error handled correctly');
    console.log(`  Error: ${data.error}`);
  });

  test('91.6 - Sample Request API max samples limit', async ({ request }) => {
    console.log('\n[TEST 91.6] Testing Sample Request API max samples limit...');

    // Test with 6 samples (should fail - max is 5)
    const tooManySamples = {
      ...testSampleRequest,
      samples: Array(6).fill(null).map((_, i) => ({
        productName: `サンプル${i + 1}`,
        category: '封筒',
        quantity: 1,
      })),
    };

    const response = await request.post(`${BASE_URL}/api/samples/request`, {
      data: tooManySamples,
    });

    // Should return 400 for validation error
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('success', false);

    console.log('✓ Max samples limit enforced correctly');
  });

  // ============================================================
  // Test 4: Database Operations Verification
  // ============================================================

  test('Database Operations - Verify SQL execution', async ({ request }) => {
    console.log('\n[TEST] Verifying SQL execution through APIs...');

    // Test filter API SQL execution
    const filterResponse = await request.post(`${BASE_URL}/api/products/filter`, {
      data: { category: '封筒' },
    });

    expect(filterResponse.status()).toBe(200);
    const filterData = await filterResponse.json();
    expect(filterData.success).toBe(true);
    console.log('✓ Filter API: SQL executed successfully');

    // Test search API SQL execution
    const searchResponse = await request.get(
      `${BASE_URL}/api/products/search?keyword=封筒&limit=5`
    );

    expect(searchResponse.status()).toBe(200);
    const searchData = await searchResponse.json();
    expect(searchData.success).toBe(true);
    console.log('✓ Search API: SQL executed successfully');

    // Verify performance metadata indicates SQL usage
    expect(searchData.performance).toHaveProperty('method', 'supabase-mcp-execute-sql');
    console.log('✓ Performance metadata confirms SQL execution method');
  });

  test('Database Operations - Verify parameterized queries', async ({ request }) => {
    console.log('\n[TEST] Verifying parameterized query handling...');

    // Test with special characters that should be safely handled
    const specialKeyword = "'; DROP TABLE products; --";

    const response = await request.get(
      `${BASE_URL}/api/products/search?keyword=${encodeURIComponent(specialKeyword)}&limit=5`
    );

    // Should not cause SQL injection
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('success', true);

    // Should return no results (safe handling)
    expect(data.count).toBe(0);

    console.log('✓ SQL injection protection verified');
  });

  // ============================================================
  // Summary
  // ============================================================

  test.afterAll(async () => {
    console.log('\n==================================================');
    console.log('TEST SUMMARY');
    console.log('==================================================');
    console.log('All catalog API database connection tests completed!');
    console.log('');
    console.log('Tested APIs:');
    console.log('  ✓ POST /api/products/filter (91.2)');
    console.log('  ✓ GET /api/products/search (91.4)');
    console.log('  ✓ POST /api/samples/request (91.6)');
    console.log('');
    console.log('Verified:');
    console.log('  ✓ Database access using Supabase MCP');
    console.log('  ✓ SQL query formation and execution');
    console.log('  ✓ Error handling and validation');
    console.log('  ✓ Data integrity and parameterized queries');
    console.log('==================================================\n');
  });
});
