/**
 * MCP API Security Tests
 *
 * Comprehensive security tests for Supabase MCP Execute API
 * Tests authentication, SQL keyword filtering, and injection pattern detection
 *
 * @test tests/unit/mcp-api-security.test.ts
 */

import { POST } from '@/app/api/supabase-mcp/execute/route';
import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/auth-helpers';
import { validateDevModeSafety } from '@/lib/env-validation';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@/lib/auth-helpers');
jest.mock('@/lib/env-validation');

describe('MCP API Security - /api/supabase-mcp/execute', () => {
  let mockRequest: NextRequest;
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful environment validation
    (validateDevModeSafety as jest.Mock).mockImplementation(() => {});

    // Create mock Supabase client
    mockSupabase = {
      rpc: jest.fn(),
    };
    (createServiceClient as jest.Mock).mockReturnValue(mockSupabase);

    // Mock successful admin authentication
    (verifyAdminAuth as jest.Mock).mockResolvedValue({
      userId: 'admin-123',
      role: 'ADMIN',
      status: 'ACTIVE',
      isDevMode: false,
    });
  });

  describe('SECURITY LAYER 1: Environment Validation', () => {
    it('should return 500 when dev mode is enabled in production', async () => {
      (validateDevModeSafety as jest.Mock).mockImplementation(() => {
        throw new Error('Dev mode enabled in production');
      });

      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'SELECT 1',
          params: [],
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-token',
        },
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe('CONFIG_ERROR');
      expect(validateDevModeSafety).toHaveBeenCalled();
    });

    it('should pass environment validation in safe configuration', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'SELECT 1',
          params: [],
        }),
      });

      await POST(mockRequest);

      expect(validateDevModeSafety).toHaveBeenCalled();
    });
  });

  describe('SECURITY LAYER 2: Authentication', () => {
    it('should return 401 when no authentication is provided', async () => {
      (verifyAdminAuth as jest.Mock).mockResolvedValue(null);

      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'SELECT 1',
          params: [],
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toBe('Admin authentication required');
    });

    it('should return 401 when authentication fails', async () => {
      (verifyAdminAuth as jest.Mock).mockResolvedValue(null);

      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'SELECT 1',
          params: [],
        }),
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(verifyAdminAuth).toHaveBeenCalled();
    });

    it('should allow access with valid admin authentication', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'SELECT * FROM profiles LIMIT 10',
          params: [],
        }),
      });

      const response = await POST(mockRequest);

      expect(response.status).not.toBe(401);
      expect(verifyAdminAuth).toHaveBeenCalled();
    });
  });

  describe('SECURITY LAYER 3: Request Validation', () => {
    it('should return 400 for invalid JSON', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: 'invalid json{{{',
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_JSON');
    });

    it('should return 400 when query is missing', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          params: [],
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_QUERY');
    });

    it('should return 400 when params is not an array', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'SELECT 1',
          params: 'not-an-array',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_PARAMS');
    });

    it('should return 400 for queries exceeding 10000 characters', async () => {
      const longQuery = 'SELECT 1'.repeat(5000); // > 10000 chars

      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: longQuery,
          params: [],
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('QUERY_TOO_LONG');
    });
  });

  describe('SECURITY LAYER 4: Dangerous SQL Keyword Detection', () => {
    const dangerousKeywords = [
      'DROP',
      'DELETE',
      'TRUNCATE',
      'ALTER',
      'GRANT',
      'REVOKE',
      'CREATE',
      'INSERT',
      'UPDATE',
      'EXECUTE',
      'SCRIPT',
      'EXEC',
    ];

    dangerousKeywords.forEach((keyword) => {
      it(`should block ${keyword} keyword with 403`, async () => {
        const maliciousQuery = `SELECT * FROM users WHERE id = 1; ${keyword} TABLE profiles;`;

        mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
          method: 'POST',
          body: JSON.stringify({
            query: maliciousQuery,
            params: [],
          }),
        });

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error.code).toBe('DANGEROUS_SQL');
        expect(data.error.message).toContain(keyword);
      });
    });

    it('should block DROP TABLE command', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'DROP TABLE users',
          params: [],
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.code).toBe('DANGEROUS_SQL');
    });

    it('should block DELETE FROM command', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'DELETE FROM quotations WHERE id = $1',
          params: ['qt-123'],
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.message).toContain('DELETE');
    });

    it('should block ALTER TABLE command', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'ALTER TABLE users ADD COLUMN malicious TEXT',
          params: [],
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.message).toContain('ALTER');
    });

    it('should allow SELECT queries', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'SELECT * FROM profiles WHERE id = $1',
          params: ['user-123'],
        }),
      });

      const response = await POST(mockRequest);

      expect(response.status).not.toBe(403);
    });
  });

  describe('SECURITY LAYER 5: SQL Injection Pattern Detection', () => {
    it('should detect and block SQL comment injection (--)', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'SELECT * FROM users WHERE id = $1 -- malicious code',
          params: ['1'],
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.code).toBe('INVALID_SQL_PATTERN');
    });

    it('should detect and block multi-line comment injection (/* */)', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'SELECT * FROM users WHERE id = $1 /* malicious */',
          params: ['1'],
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.code).toBe('INVALID_SQL_PATTERN');
    });

    it('should detect and block semicolon + DROP pattern', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: "SELECT * FROM users WHERE id = '1'; DROP TABLE profiles--",
          params: [],
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      // DROP keyword is detected before pattern check
      expect(data.error.code).toBe('DANGEROUS_SQL');
    });

    it('should detect and block semicolon + DELETE pattern', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: "SELECT * FROM users WHERE id = '1'; DELETE FROM logs--",
          params: [],
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      // DELETE keyword is detected before pattern check
      expect(data.error.code).toBe('DANGEROUS_SQL');
    });

    it('should detect and block semicolon + ALTER pattern', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: "SELECT * FROM users WHERE id = '1'; ALTER TABLE users--",
          params: [],
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      // ALTER keyword is detected before pattern check
      expect(data.error.code).toBe('DANGEROUS_SQL');
    });
  });

  describe('SECURITY LAYER 6: Audit Logging', () => {
    it('should log all SQL execution attempts', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'SELECT * FROM profiles LIMIT 10',
          params: [],
        }),
      });

      await POST(mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[MCP] SQL execution audit:',
        expect.objectContaining({
          userId: 'admin-123',
          role: 'ADMIN',
          queryLength: expect.any(Number),
          paramCount: 0,
          executionTimeMs: expect.any(Number),
          success: true,
          timestamp: expect.any(String),
        })
      );

      consoleSpy.mockRestore();
    });

    it('should log dangerous keyword detection attempts', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'DROP TABLE users',
          params: [],
        }),
      });

      await POST(mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[MCP] Dangerous SQL keyword detected:',
        expect.objectContaining({
          userId: 'admin-123',
          role: 'ADMIN',
          keyword: 'DROP',
          queryPreview: expect.any(String),
          timestamp: expect.any(String),
        })
      );

      consoleSpy.mockRestore();
    });

    it('should log injection pattern detection attempts', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'SELECT * FROM users WHERE id = $1 -- malicious',
          params: ['1'],
        }),
      });

      await POST(mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[MCP] SQL injection pattern detected:',
        expect.objectContaining({
          userId: 'admin-123',
          pattern: expect.any(String),
          queryPreview: expect.any(String),
        })
      );

      consoleSpy.mockRestore();
    });

    it('should log unauthorized access attempts', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      (verifyAdminAuth as jest.Mock).mockResolvedValue(null);

      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'SELECT 1',
          params: [],
        }),
      });

      await POST(mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith('[MCP] Unauthorized access attempt');

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for SQL execution errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: {
          message: 'SQL execution failed',
          code: 'SQL_ERROR',
          details: 'Invalid syntax',
        },
      });

      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'INVALID SQL QUERY',
          params: [],
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('SQL_ERROR');
    });

    it('should include execution time in successful response', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [{ id: 1, name: 'Test' }],
        error: null,
      });

      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute', {
        method: 'POST',
        body: JSON.stringify({
          query: 'SELECT * FROM profiles LIMIT 1',
          params: [],
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.executionTimeMs).toBeDefined();
      expect(typeof data.executionTimeMs).toBe('number');
    });
  });

  describe('Method Not Allowed', () => {
    it('should return 405 for GET requests', async () => {
      const { GET } = require('@/app/api/supabase-mcp/execute/route');
      mockRequest = new NextRequest('http://localhost:3000/api/supabase-mcp/execute');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error.code).toBe('METHOD_NOT_ALLOWED');
    });
  });
});
