/**
 * SQL Injection Prevention Tests
 *
 * Comprehensive tests for SQL injection prevention in supabase-sql.ts
 * Tests parameterized queries and validates malicious input handling
 *
 * @test tests/unit/sql-injection.test.ts
 */

import { executeSql, insertQuotationItems, insertQuotation } from '@/lib/supabase-sql';
import { createServiceClient } from '@/lib/supabase';

// Mock the Supabase client
jest.mock('@/lib/supabase', () => ({
  createServiceClient: jest.fn(),
}));

describe('SQL Injection Prevention - supabase-sql.ts', () => {
  let mockSupabase: any;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create mock Supabase client
    mockSupabase = {
      rpc: jest.fn(),
    };

    (createServiceClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('executeSql - Parameterized Query Protection', () => {
    it('should safely handle SQL injection in parameters', async () => {
      const maliciousInput = "'; DROP TABLE quotations; --";

      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await executeSql(
        'SELECT * FROM quotations WHERE id = $1',
        [maliciousInput]
      );

      // Verify the RPC was called with parameters
      expect(mockSupabase.rpc).toHaveBeenCalledWith('execute_sql', {
        sql_query: 'SELECT * FROM quotations WHERE id = $1',
        sql_params: [maliciousInput],
      });

      // Verify result structure
      expect(result).toHaveProperty('data');
      expect(result).not.toHaveProperty('error');
    });

    it('should prevent SQL injection via UNION SELECT', async () => {
      const unionInjection = "1' UNION SELECT username, password FROM users --";

      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await executeSql(
        'SELECT * FROM profiles WHERE id = $1',
        [unionInjection]
      );

      expect(result.data).toEqual([]);
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'execute_sql',
        expect.objectContaining({
          sql_query: expect.any(String),
          sql_params: [unionInjection],
        })
      );
    });

    it('should handle boolean logic injection attempts', async () => {
      const booleanInjection = "1' OR '1'='1";

      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await executeSql(
        'SELECT * FROM users WHERE id = $1',
        [booleanInjection]
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'execute_sql',
        expect.objectContaining({
          sql_params: [booleanInjection],
        })
      );
    });

    it('should safely handle comment-based injection attempts', async () => {
      const commentInjection = "1'-- comment";

      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await executeSql(
        'SELECT * FROM quotations WHERE id = $1',
        [commentInjection]
      );

      expect(result.data).toEqual([]);
    });

    it('should handle stacked query injection attempts', async () => {
      const stackedInjection = "1'; DELETE FROM users WHERE 1=1 --";

      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await executeSql(
        'SELECT * FROM profiles WHERE id = $1',
        [stackedInjection]
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'execute_sql',
        expect.objectContaining({
          sql_params: [stackedInjection],
        })
      );
    });
  });

  describe('insertQuotationItems - Complex Data Protection', () => {
    it('should safely insert items with malicious product names', async () => {
      const maliciousItems = [
        {
          quotation_id: 'qt-123',
          display_order: 1,
          product_name: "'; DROP TABLE quotation_items; --",
          category: 'injection-test',
          quantity: 1,
          unit_price: 1000,
          total_price: 1000,
          specifications: null,
          notes: null,
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: [{ id: 'item-1' }],
        error: null,
      });

      const result = await insertQuotationItems(maliciousItems);

      // Verify parameterized query was used
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'execute_sql',
        expect.objectContaining({
          sql_query: expect.stringContaining('INSERT INTO quotation_items'),
          sql_params: expect.arrayContaining([
            'qt-123',
            1,
            "'; DROP TABLE quotation_items; --", // Malicious input passed as parameter
            'injection-test',
          ]),
        })
      );
    });

    it('should handle multiple items with mixed malicious input', async () => {
      const mixedItems = [
        {
          quotation_id: 'qt-123',
          display_order: 1,
          product_name: 'Product 1',
          category: "1' OR '1'='1",
          quantity: 1,
          unit_price: 1000,
          total_price: 1000,
          specifications: null,
          notes: "'; --",
        },
        {
          quotation_id: 'qt-123',
          display_order: 2,
          product_name: "UNION SELECT * FROM users",
          category: 'normal',
          quantity: 2,
          unit_price: 2000,
          total_price: 4000,
          specifications: "'; DROP TABLE products; --",
          notes: null,
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await insertQuotationItems(mixedItems);

      // Verify all items were processed with parameters
      expect(mockSupabase.rpc).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
    });

    it('should safely handle special characters in specifications', async () => {
      const specialCharItems = [
        {
          quotation_id: 'qt-123',
          display_order: 1,
          product_name: 'Product with special chars',
          category: 'test',
          quantity: 1,
          unit_price: 1000,
          total_price: 1000,
          specifications: "Size: 10x20cm; Weight: 1.5kg; \"Special\" chars: '@#$%^&*()'",
          notes: 'Note with ; -- and /* */',
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await insertQuotationItems(specialCharItems);

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'execute_sql',
        expect.objectContaining({
          sql_params: expect.arrayContaining([
            expect.stringContaining(';'),
            expect.stringContaining('--'),
          ]),
        })
      );
    });

    it('should handle empty and null values safely', async () => {
      const edgeCaseItems = [
        {
          quotation_id: 'qt-123',
          display_order: 1,
          product_name: '',
          category: null,
          quantity: 0,
          unit_price: 0,
          total_price: 0,
          specifications: '',
          notes: null,
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await insertQuotationItems(edgeCaseItems);

      expect(mockSupabase.rpc).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
    });
  });

  describe('insertQuotation - Data Validation', () => {
    it('should safely handle malicious customer data', async () => {
      const maliciousQuotation = {
        user_id: "user-123'; DROP TABLE users; --",
        quotation_number: "QT-2024'; --",
        status: 'pending',
        customer_name: "'; DELETE FROM quotations; --",
        customer_email: "test@example.com'; DROP TABLE emails; --",
        customer_phone: "'; --",
        subtotal_amount: 1000,
        tax_amount: 100,
        total_amount: 1100,
        subtotal: 1000,
        notes: "'; EXECUTE xp_cmdshell('format c:'); --",
        valid_until: '2024-12-31',
        sent_at: '2024-01-01',
      };

      mockSupabase.rpc.mockResolvedValue({
        data: [{ id: 'qt-123' }],
        error: null,
      });

      const result = await insertQuotation(maliciousQuotation);

      // Verify all malicious input passed as parameters
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'execute_sql',
        expect.objectContaining({
          sql_query: expect.stringContaining('INSERT INTO quotations'),
          sql_params: expect.arrayContaining([
            "user-123'; DROP TABLE users; --",
            "QT-2024'; --",
            "'; DELETE FROM quotations; --",
            "test@example.com'; DROP TABLE emails; --",
          ]),
        })
      );
    });

    it('should handle email injection attempts', async () => {
      const emailInjection = {
        user_id: 'user-123',
        quotation_number: 'QT-2024-001',
        status: 'pending',
        customer_name: 'Test User',
        customer_email: "test@example.com'; UPDATE users SET password='hacked' WHERE email='admin@example.com'; --",
        customer_phone: null,
        subtotal_amount: 1000,
        tax_amount: 100,
        total_amount: 1100,
        subtotal: 1000,
        notes: null,
        valid_until: '2024-12-31',
        sent_at: '2024-01-01',
      };

      mockSupabase.rpc.mockResolvedValue({
        data: [{ id: 'qt-123' }],
        error: null,
      });

      const result = await insertQuotation(emailInjection);

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'execute_sql',
        expect.objectContaining({
          sql_params: expect.arrayContaining([
            expect.stringContaining('UPDATE users SET'),
          ]),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: {
          message: 'SQL execution failed',
          code: 'SQL_ERROR',
          details: 'Invalid syntax',
        },
      });

      const result = await executeSql('INVALID SQL', []);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('SQL execution failed');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Database connection failed'));

      const result = await executeSql('SELECT 1', []);

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('EXECUTE_ERROR');
    });
  });

  describe('Transaction Safety', () => {
    it('should safely execute transaction with multiple queries', async () => {
      const queries = [
        {
          query: 'INSERT INTO quotations (id) VALUES ($1)',
          params: ['qt-123'],
        },
        {
          query: 'INSERT INTO quotation_items (quotation_id, product_name) VALUES ($1, $2)',
          params: ['qt-123', "'; DROP TABLE products; --"],
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await executeSql(
        queries.map((q, i) => `-- Query ${i + 1}\n${q.query}`).join(';\n'),
        queries.flatMap((q) => q.params)
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'execute_sql',
        expect.objectContaining({
          sql_query: expect.stringContaining('-- Query'),
          sql_params: expect.arrayContaining([
            'qt-123',
            "'; DROP TABLE products; --",
          ]),
        })
      );
    });
  });
});
