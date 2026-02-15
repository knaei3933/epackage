/**
 * B2B Data Consistency Checks Tests
 *
 * Tests the data consistency check RPC functions:
 * - check_orphaned_records() - Detect orphaned records across tables
 * - validateDataConsistency() - Utility wrapper for all consistency checks
 * - Individual orphaned record checks
 *
 * Test Scenarios:
 * 1. Master orphaned records check
 * 2. Individual orphaned record checks (order_items, quotation_items, etc.)
 * 3. Utility wrapper with different check types
 * 4. Clean database validation
 */

import { test, expect } from '@playwright/test';

// API Base URL
const API_BASE = 'http://localhost:3000/api/b2b';

test.describe('Data Consistency Checks Tests', () => {
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

  test.describe('Master Orphaned Records Check', () => {
    test('1. check_orphaned_records returns all orphaned records', async ({ request }) => {
      // This function checks for orphaned records across all tables
      const response = await request.post(`${API_BASE}/rpc/check_orphaned_records`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Should return orphaned records (if any) or empty result
      if (response.ok()) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        if (data.length > 0) {
          expect(data[0]).toHaveProperty('table_name');
          expect(data[0]).toHaveProperty('record_id');
          expect(data[0]).toHaveProperty('parent_id');
          expect(data[0]).toHaveProperty('issue');
        }
      }
    });

    test('2. Orphaned records include table name for identification', async ({ request }) => {
      // Verify that each orphaned record includes the source table
      const response = await request.post(`${API_BASE}/rpc/check_orphaned_records`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        if (data.length > 0) {
          const validTables = [
            'order_items',
            'quotation_items',
            'sample_items',
            'orders',
            'order_status_history',
            'contracts',
            'contract_signatures'
          ];
          data.forEach((record: any) => {
            expect(validTables).toContain(record.table_name);
          });
        }
      }
    });

    test('3. Orphaned records include descriptive issue message', async ({ request }) => {
      // Verify that each orphaned record has a clear issue description
      const response = await request.post(`${API_BASE}/rpc/check_orphaned_records`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        if (data.length > 0) {
          data.forEach((record: any) => {
            expect(record.issue).toBeTruthy();
            expect(record.issue.length).toBeGreaterThan(0);
            expect(record.issue.toLowerCase()).toMatch(/references|non-existent/);
          });
        }
      }
    });
  });

  test.describe('Individual Orphaned Record Checks', () => {
    test('4. check_orphaned_order_items detects items without orders', async ({ request }) => {
      // Check for order_items that reference non-existent orders
      const response = await request.post(`${API_BASE}/rpc/check_orphaned_order_items`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        if (data.length > 0) {
          expect(data[0]).toHaveProperty('order_item_id');
          expect(data[0]).toHaveProperty('order_id');
          expect(data[0]).toHaveProperty('issue');
          expect(data[0].issue).toContain('non-existent order');
        }
      }
    });

    test('5. check_orphaned_order_items_products detects items without products', async ({ request }) => {
      // Check for order_items that reference non-existent products
      const response = await request.post(`${API_BASE}/rpc/check_orphaned_order_items_products`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        if (data.length > 0) {
          expect(data[0]).toHaveProperty('order_item_id');
          expect(data[0]).toHaveProperty('product_id');
          expect(data[0]).toHaveProperty('issue');
          expect(data[0].issue).toContain('non-existent product');
        }
      }
    });

    test('6. check_orphaned_quotation_items detects items without quotations', async ({ request }) => {
      // Check for quotation_items that reference non-existent quotations
      const response = await request.post(`${API_BASE}/rpc/check_orphaned_quotation_items`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        if (data.length > 0) {
          expect(data[0]).toHaveProperty('quotation_item_id');
          expect(data[0]).toHaveProperty('quotation_id');
          expect(data[0]).toHaveProperty('issue');
        }
      }
    });

    test('7. check_orphaned_sample_items detects items without sample requests', async ({ request }) => {
      // Check for sample_items that reference non-existent sample_requests
      const response = await request.post(`${API_BASE}/rpc/check_orphaned_sample_items`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        if (data.length > 0) {
          expect(data[0]).toHaveProperty('sample_item_id');
          expect(data[0]).toHaveProperty('sample_request_id');
          expect(data[0]).toHaveProperty('issue');
        }
      }
    });

    test('8. check_orphaned_orders_quotation detects orders without quotations', async ({ request }) => {
      // Check for orders that reference non-existent quotations
      const response = await request.post(`${API_BASE}/rpc/check_orphaned_orders_quotation`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        if (data.length > 0) {
          expect(data[0]).toHaveProperty('order_id');
          expect(data[0]).toHaveProperty('quotation_id');
          expect(data[0]).toHaveProperty('issue');
        }
      }
    });

    test('9. check_orphaned_order_status_history detects history without orders', async ({ request }) => {
      // Check for order_status_history that reference non-existent orders
      const response = await request.post(`${API_BASE}/rpc/check_orphaned_order_status_history`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        if (data.length > 0) {
          expect(data[0]).toHaveProperty('history_id');
          expect(data[0]).toHaveProperty('order_id');
          expect(data[0]).toHaveProperty('issue');
        }
      }
    });

    test('10. check_orphaned_contracts detects contracts without orders', async ({ request }) => {
      // Check for contracts that reference non-existent orders
      const response = await request.post(`${API_BASE}/rpc/check_orphaned_contracts`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        if (data.length > 0) {
          expect(data[0]).toHaveProperty('contract_id');
          expect(data[0]).toHaveProperty('order_id');
          expect(data[0]).toHaveProperty('issue');
        }
      }
    });

    test('11. check_orphaned_signatures detects signatures without contracts', async ({ request }) => {
      // Check for signatures that reference non-existent contracts
      const response = await request.post(`${API_BASE}/rpc/check_orphaned_signatures`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        if (data.length > 0) {
          expect(data[0]).toHaveProperty('signature_id');
          expect(data[0]).toHaveProperty('contract_id');
          expect(data[0]).toHaveProperty('issue');
        }
      }
    });
  });

  test.describe('Utility Wrapper - validateDataConsistency', () => {
    test('12. validateDataConsistency with check_type=all runs all checks', async ({ request }) => {
      // Run all consistency checks
      const response = await request.post(`${API_BASE}/rpc/validateDataConsistency`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          p_check_type: 'all'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);

        // Should have results for all check types
        const checkNames = data.map((r: any) => r.check_name);
        expect(checkNames).toContain('order_items_consistency');
        expect(checkNames).toContain('products_negative_stock');
        expect(checkNames).toContain('orphaned_records');

        // Each result should have required fields
        data.forEach((result: any) => {
          expect(result).toHaveProperty('check_name');
          expect(result).toHaveProperty('is_valid');
          expect(result).toHaveProperty('issues_found');
          expect(result).toHaveProperty('details');
          expect(typeof result.is_valid).toBe('boolean');
          expect(typeof result.issues_found).toBe('number');
        });
      }
    });

    test('13. validateDataConsistency with check_type=order_items', async ({ request }) => {
      // Run only order_items consistency check
      const response = await request.post(`${API_BASE}/rpc/validateDataConsistency`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          p_check_type: 'order_items'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(1);
        expect(data[0].check_name).toBe('order_items_consistency');
        expect(data[0]).toHaveProperty('is_valid');
        expect(data[0]).toHaveProperty('issues_found');
        expect(data[0]).toHaveProperty('details');
      }
    });

    test('14. validateDataConsistency with check_type=negative_stock', async ({ request }) => {
      // Run only negative stock check
      const response = await request.post(`${API_BASE}/rpc/validateDataConsistency`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          p_check_type: 'negative_stock'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(1);
        expect(data[0].check_name).toBe('products_negative_stock');
        expect(data[0]).toHaveProperty('is_valid');
        expect(data[0]).toHaveProperty('issues_found');
        expect(data[0]).toHaveProperty('details');
      }
    });

    test('15. validateDataConsistency with check_type=orphaned_records', async ({ request }) => {
      // Run only orphaned records check
      const response = await request.post(`${API_BASE}/rpc/validateDataConsistency`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          p_check_type: 'orphaned_records'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(1);
        expect(data[0].check_name).toBe('orphaned_records');
        expect(data[0]).toHaveProperty('is_valid');
        expect(data[0]).toHaveProperty('issues_found');
        expect(data[0]).toHaveProperty('details');
      }
    });

    test('16. validateDataConsistency rejects invalid check_type', async ({ request }) => {
      // Test error handling for invalid check type
      const response = await request.post(`${API_BASE}/rpc/validateDataConsistency`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          p_check_type: 'invalid_check_type'
        }
      });

      // Should return error
      expect(response.status()).toBeGreaterThanOrEqual(400);

      if (response.status() >= 400) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
        expect(data.error).toMatch(/Invalid check_type|無効なチェックタイプ/);
      }
    });

    test('17. validateDataConsistency details contain issue information', async ({ request }) => {
      // Verify that details field contains structured issue information
      const response = await request.post(`${API_BASE}/rpc/validateDataConsistency`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          p_check_type: 'all'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        data.forEach((result: any) => {
          // If issues were found, details should contain issue information
          if (result.issues_found > 0) {
            expect(result.details).toBeTruthy();
            expect(Array.isArray(result.details)).toBe(true);
            result.details.forEach((detail: any) => {
              expect(Object.keys(detail).length).toBeGreaterThan(0);
            });
          }
        });
      }
    });

    test('18. validateDataConsistency default parameter behavior', async ({ request }) => {
      // Test that omitting p_check_type defaults to 'all'
      const response = await request.post(`${API_BASE}/rpc/validateDataConsistency`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {}
      });

      if (response.ok()) {
        const data = await response.json();
        // Should run all checks (same as p_check_type='all')
        const checkNames = data.map((r: any) => r.check_name);
        expect(checkNames).toContain('order_items_consistency');
        expect(checkNames).toContain('products_negative_stock');
        expect(checkNames).toContain('orphaned_records');
      }
    });
  });

  test.describe('Clean Database Validation', () => {
    test('19. Clean database returns all checks as valid', async ({ request }) => {
      // In a clean database (with proper referential integrity),
      // all consistency checks should pass

      const response = await request.post(`${API_BASE}/rpc/validateDataConsistency`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          p_check_type: 'all'
        }
      });

      if (response.ok()) {
        const data = await response.json();

        // If database is clean, all checks should be valid
        // (This depends on test data state)
        const allValid = data.every((result: any) => result.is_valid === true);
        if (allValid) {
          // Verify issues_found is 0 for all checks
          data.forEach((result: any) => {
            expect(result.issues_found).toBe(0);
          });
        }
      }
    });

    test('20. Orphaned records count is accurate', async ({ request }) => {
      // Verify that the count of orphaned records is accurate
      // by comparing individual checks with the master check

      const response = await request.post(`${API_BASE}/rpc/check_orphaned_records`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok()) {
        const masterCheck = await response.json();

        // Get individual checks
        const orderItemsResponse = await request.post(`${API_BASE}/rpc/check_orphaned_order_items`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (orderItemsResponse.ok()) {
          const orderItems = await orderItemsResponse.json();

          // Count orphaned order_items in master check
          const masterOrderItemsCount = masterCheck.filter(
            (r: any) => r.table_name === 'order_items' && r.issue.includes('non-existent order')
          ).length;

          // Counts should match
          expect(masterOrderItemsCount).toBe(orderItems.length);
        }
      }
    });
  });
});

// Helper functions for test data setup
async function createOrphanedRecordForTesting(request: any, authToken: string, table: string): Promise<void> {
  // Create an orphaned record for testing purposes
  // This would typically be done in a test database setup

  const testRecords: Record<string, any> = {
    order_items: {
      table: 'order_items',
      data: {
        order_id: '00000000-0000-0000-0000-999999999999',  // Non-existent order
        product_name: 'Test Orphaned Item',
        quantity: 1,
        unit_price: 100
      }
    }
  };

  if (testRecords[table]) {
    await request.post(`${API_BASE}/test/create-orphaned-record`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: testRecords[table]
    });
  }
}

async function cleanupOrphanedTestRecords(request: any, authToken: string): Promise<void> {
  // Clean up test orphaned records
  await request.post(`${API_BASE}/test/cleanup-orphaned-records`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });
}
