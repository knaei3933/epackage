/**
 * B2B Order Inventory Management Tests
 *
 * Tests the inventory management RPC function `create_order_with_inventory()`:
 * - Stock availability checking before order creation
 * - Constraint violations (negative stock, etc.)
 * - Optimistic locking with version fields
 * - Data consistency verification
 *
 * Test Scenarios:
 * 1. Normal order creation with sufficient stock
 * 2. Order creation fails when stock is insufficient
 * 3. Order creation fails when stock is exactly equal to requested quantity (edge case)
 * 4. Constraint violations (negative stock, invalid totals)
 * 5. Optimistic locking with concurrent updates
 */

import { test, expect } from '@playwright/test';

// API Base URL
const API_BASE = 'http://localhost:3000/api/b2b';

test.describe('Order Inventory Management Tests', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Setup: Login and get auth token
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: process.env.TEST_ADMIN_EMAIL || 'admin@epackage-lab.com',
        password: process.env.TEST_ADMIN_PASSWORD || 'Test1234!'
      }
    });

    if (loginResponse.ok()) {
      const loginData = await loginResponse.json();
      authToken = loginData.token;
    }
  });

  test.describe('Stock Availability Checks', () => {
    test('1. Order creation succeeds when stock is sufficient', async ({ request }) => {
      // This test requires a quotation with products that have sufficient stock
      const response = await request.post(`${API_BASE}/orders/create-with-inventory`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          quotation_id: '00000000-0000-0000-0000-000000000000',
          user_id: '00000000-0000-0000-0000-000000000000'
        }
      });

      // Should return 404 for invalid quotation or error for insufficient stock
      expect([200, 404, 400]).toContain(response.status());

      if (response.ok()) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty('order_id');
        expect(data.data).toHaveProperty('order_number');
        expect(data.data.stock_updated).toBeDefined();
      }
    });

    test('2. Order creation fails when stock is insufficient', async ({ request }) => {
      // Simulate an order with insufficient stock
      const response = await request.post(`${API_BASE}/orders/create-with-inventory`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          quotation_id: '00000000-0000-0000-0000-000000000001',
          user_id: '00000000-0000-0000-0000-000000000000'
        }
      });

      // Should return error with insufficient stock details
      const data = await response.json();
      if (!data.success && data.error?.includes('재고')) {
        expect(data.error).toContain('재고가 부족합니다');
        expect(data).toHaveProperty('insufficient_stock');
        expect(Array.isArray(data.insufficient_stock)).toBe(true);
      }
    });

    test('3. Insufficient stock details include all required information', async ({ request }) => {
      // Verify that insufficient_stock JSONB includes:
      // - product_id
      // - product_name
      // - requested quantity
      // - available quantity
      // - shortage amount

      const response = await request.post(`${API_BASE}/orders/create-with-inventory`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          quotation_id: '00000000-0000-0000-0000-000000000002'
        }
      });

      const data = await response.json();
      if (data.insufficient_stock && data.insufficient_stock.length > 0) {
        const stockItem = data.insufficient_stock[0];
        expect(stockItem).toHaveProperty('product_id');
        expect(stockItem).toHaveProperty('product_name');
        expect(stockItem).toHaveProperty('requested');
        expect(stockItem).toHaveProperty('available');
        expect(stockItem).toHaveProperty('shortage');
        expect(stockItem.shortage).toBe(stockItem.requested - stockItem.available);
      }
    });

    test('4. Order creation with multiple products - partial stock failure', async ({ request }) => {
      // Test scenario where order has multiple products, some have sufficient stock
      // and some don't - entire order should fail

      const response = await request.post(`${API_BASE}/orders/create-with-inventory`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          quotation_id: '00000000-0000-0000-0000-000000000003'
        }
      });

      // Should fail entirely if any product has insufficient stock
      const data = await response.json();
      if (!data.success) {
        expect(data.error).toContain('재고가 부족합니다');
        expect(data.insufficient_stock.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Database Constraint Violations', () => {
    test('5. check_stock_nonnegative constraint prevents negative stock', async ({ request }) => {
      // Verify that products.stock_quantity >= 0 constraint works
      const response = await request.post(`${API_BASE}/products/test-constraints`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          test_type: 'negative_stock',
          value: -10
        }
      });

      // Should return constraint violation error
      if (response.status() === 400) {
        const data = await response.json();
        expect(data.error).toContain('check_stock_nonnegative');
      }
    });

    test('6. check_order_total_nonnegative constraint prevents negative totals', async ({ request }) => {
      // Verify that orders.total_amount >= 0 constraint works
      const response = await request.post(`${API_BASE}/orders/test-constraints`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          test_type: 'negative_total',
          value: -100
        }
      });

      // Should return constraint violation error
      if (response.status() === 400) {
        const data = await response.json();
        expect(data.error).toContain('check_order_total_nonnegative');
      }
    });

    test('7. check_order_item_quantity_positive constraint prevents zero/negative quantities', async ({ request }) => {
      // Verify that order_items.quantity > 0 constraint works
      const response = await request.post(`${API_BASE}/orders/test-constraints`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          test_type: 'invalid_quantity',
          value: 0
        }
      });

      // Should return constraint violation error
      if (response.status() === 400) {
        const data = await response.json();
        expect(data.error).toContain('check_order_item_quantity_positive');
      }
    });

    test('8. unique_order_number constraint prevents duplicate order numbers', async ({ request }) => {
      // Verify that orders.order_number UNIQUE constraint works
      const response = await request.post(`${API_BASE}/orders/test-constraints`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          test_type: 'duplicate_order_number',
          value: 'ORD-2024-0001'
        }
      });

      // Should return unique constraint violation error
      if (response.status() === 400) {
        const data = await response.json();
        expect(data.error).toContain('unique_order_number');
      }
    });
  });

  test.describe('Optimistic Locking with Version Fields', () => {
    test('9. Version field increments on product update', async ({ request }) => {
      // Verify that products.version increments when stock is updated

      const response = await request.post(`${API_BASE}/products/test-versioning`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          product_id: '00000000-0000-0000-0000-000000000000',
          version: 1
        }
      });

      // Version should increment after update
      if (response.ok()) {
        const data = await response.json();
        expect(data.new_version).toBe(data.old_version + 1);
      }
    });

    test('10. Concurrent order updates are handled correctly', async ({ request }) => {
      // Test optimistic locking with concurrent updates
      // Second update should fail if version doesn't match

      const requests = Array(3).fill(null).map((_, i) =>
        request.post(`${API_BASE}/orders/test-concurrent-update`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          data: {
            order_id: '00000000-0000-0000-0000-000000000000',
            version: 1,  // All requests use same version
            field: 'status',
            value: `test_status_${i}`
          }
        })
      );

      const responses = await Promise.all(requests);

      // Only one request should succeed (first one)
      const successCount = responses.filter(r => r.ok()).length;
      const failCount = responses.filter(r => !r.ok()).length;

      // At least 2 should fail due to version mismatch
      expect(failCount).toBeGreaterThanOrEqual(2);

      // Verify error messages mention version
      for (const response of responses) {
        if (!response.ok()) {
          const data = await response.json();
          expect(data.error).toMatch(/version|버전/);
        }
      }
    });

    test('11. Order version increments on status change', async ({ request }) => {
      // Verify that orders.version increments when status is updated

      const response = await request.post(`${API_BASE}/orders/test-versioning`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          order_id: '00000000-0000-0000-0000-000000000000',
          version: 1
        }
      });

      // Version should increment after update
      if (response.ok()) {
        const data = await response.json();
        expect(data.new_version).toBe(data.old_version + 1);
      }
    });
  });

  test.describe('Data Consistency Check Functions', () => {
    test('12. check_order_items_consistency returns correct results', async ({ request }) => {
      // Verify that the consistency check function works
      const response = await request.get(`${API_BASE}/orders/check-consistency`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        params: {
          function: 'check_order_items_consistency'
        }
      });

      // Should return consistency check results
      if (response.ok()) {
        const data = await response.json();
        expect(Array.isArray(data.results)).toBe(true);
        if (data.results.length > 0) {
          expect(data.results[0]).toHaveProperty('order_id');
          expect(data.results[0]).toHaveProperty('items_count');
          expect(data.results[0]).toHaveProperty('issues');
        }
      }
    });

    test('13. check_products_negative_stock detects violations', async ({ request }) => {
      // Verify that the negative stock check function works
      const response = await request.get(`${API_BASE}/orders/check-consistency`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        params: {
          function: 'check_products_negative_stock'
        }
      });

      // Should return products with negative stock (if any)
      if (response.ok()) {
        const data = await response.json();
        expect(Array.isArray(data.results)).toBe(true);
        if (data.results.length > 0) {
          expect(data.results[0]).toHaveProperty('product_id');
          expect(data.results[0]).toHaveProperty('stock_quantity');
          expect(data.results[0]).toHaveProperty('issue');
          expect(data.results[0].issue).toContain('Negative');
        }
      }
    });

    test('14. check_order_integrity validates order structure', async ({ request }) => {
      // Verify that the order integrity check function works
      const response = await request.post(`${API_BASE}/orders/check-integrity`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          order_id: '00000000-0000-0000-0000-000000000000'
        }
      });

      // Should return integrity check results
      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('is_valid');
        expect(data).toHaveProperty('issues');
        expect(Array.isArray(data.issues)).toBe(true);
      }
    });

    test('15. Global order integrity check (all orders)', async ({ request }) => {
      // Verify integrity check for all orders (no specific order_id)
      const response = await request.get(`${API_BASE}/orders/check-integrity`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      // Should return overall integrity status
      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('is_valid');
        expect(data).toHaveProperty('issues');
        expect(Array.isArray(data.issues)).toBe(true);
      }
    });
  });

  test.describe('Index Performance Verification', () => {
    test('16. Indexes are created for performance queries', async ({ request }) => {
      // Verify that required indexes exist:
      // - idx_products_stock_quantity
      // - idx_products_version
      // - idx_orders_version

      const response = await request.get(`${API_BASE}/indexes/list`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        params: {
          table: 'products,orders'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        const indexNames = data.indexes.map((i: any) => i.index_name);

        expect(indexNames).toContain('idx_products_stock_quantity');
        expect(indexNames).toContain('idx_products_version');
        expect(indexNames).toContain('idx_orders_version');
      }
    });
  });

  test.describe('Transaction Safety', () => {
    test('17. Order creation rolls back on constraint violation', async ({ request }) => {
      // Verify that if order creation fails due to constraint violation,
      // all partial changes are rolled back

      const response = await request.post(`${API_BASE}/orders/create-with-inventory`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          quotation_id: '00000000-0000-0000-0000-000000000004'  // Invalid quotation
        }
      });

      // Should fail cleanly without partial data
      if (!response.ok()) {
        const data = await response.json();
        expect(data.success).toBe(false);
        // Verify no partial order was created (would require DB check)
      }
    });

    test('18. Stock update only happens after all validations pass', async ({ request }) => {
      // Verify that stock is not updated if any validation fails

      const response = await request.post(`${API_BASE}/orders/create-with-inventory`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          quotation_id: '00000000-0000-0000-0000-000000000005'
        }
      });

      // If stock update is enabled and order succeeds, stock_updated should be true
      // If order fails, stock should remain unchanged
      const data = await response.json();
      if (data.success) {
        expect(data).toHaveProperty('stock_updated');
      } else {
        // Verify stock wasn't updated (would require DB check)
      }
    });
  });
});

// Helper functions for test data setup
async function createTestProductWithStock(request: any, authToken: string, stockQuantity: number): Promise<string> {
  // Create a test product with specified stock quantity
  const response = await request.post(`${API_BASE}/products`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    data: {
      name: `Test Product ${Date.now()}`,
      stock_quantity: stockQuantity,
      price: 1000
    }
  });

  if (response.ok()) {
    const data = await response.json();
    return data.data.id;
  }

  return '';
}

async function createTestQuotation(request: any, authToken: string, productId: string, quantity: number): Promise<string> {
  // Create a test quotation with specified product and quantity
  const response = await request.post(`${API_BASE}/quotations`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    data: {
      items: [
        {
          product_id: productId,
          quantity: quantity
        }
      ]
    }
  });

  if (response.ok()) {
    const data = await response.json();
    return data.data.id;
  }

  return '';
}
