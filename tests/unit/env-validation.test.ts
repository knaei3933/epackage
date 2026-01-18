/**
 * Environment Variable Validation Tests
 *
 * Comprehensive tests for environment validation and security checks
 * Tests production/development detection, dev mode safety, and feature flags
 *
 * @test tests/unit/env-validation.test.ts
 */

import {
  isProductionEnvironment,
  isDevelopmentEnvironment,
  validateDevModeSafety,
  isDevModeSafe,
  validateRequiredEnvVars,
  validateSupabaseEnv,
  isFeatureEnabled,
  SECURITY_FLAGS,
  validateOnStartup,
  _setTestEnv,
  _clearTestEnv,
} from '@/lib/env-validation';

describe('Environment Validation - env-validation.ts', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Store original environment
    originalEnv = { ...process.env };

    // Clear test environment
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Production Environment Detection', () => {
    it('should detect production via NODE_ENV', () => {
      process.env.NODE_ENV = 'production';

      expect(isProductionEnvironment()).toBe(true);
    });

    it('should detect production via APP_URL with prod pattern', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_URL = 'https://prod.example.com';

      expect(isProductionEnvironment()).toBe(true);
    });

    it('should detect production via APP_URL with production pattern', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_URL = 'https://production.example.com';

      expect(isProductionEnvironment()).toBe(true);
    });

    it('should detect production via APP_URL with example.com', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';

      expect(isProductionEnvironment()).toBe(true);
    });

    it('should detect production via non-localhost APP_URL', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_URL = 'https://myapp.vercel.app';

      expect(isProductionEnvironment()).toBe(true);
    });

    it('should detect production via VERCEL_ENV', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
      process.env.VERCEL_ENV = 'production';

      expect(isProductionEnvironment()).toBe(true);
    });

    it('should not detect production in development environment', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
      process.env.VERCEL_ENV = 'preview';

      expect(isProductionEnvironment()).toBe(false);
    });

    it('should not detect production when no production indicators present', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

      expect(isProductionEnvironment()).toBe(false);
    });
  });

  describe('Development Environment Detection', () => {
    it('should detect development environment', () => {
      process.env.NODE_ENV = 'development';

      expect(isDevelopmentEnvironment()).toBe(true);
    });

    it('should not detect development in production', () => {
      process.env.NODE_ENV = 'production';

      expect(isDevelopmentEnvironment()).toBe(false);
    });

    it('should not detect development in test environment', () => {
      process.env.NODE_ENV = 'test';

      expect(isDevelopmentEnvironment()).toBe(false);
    });
  });

  describe('Dev Mode Safety Validation', () => {
    it('should throw error when dev mode is enabled in production (NODE_ENV)', () => {
      process.env.NODE_ENV = 'production';
      process.env.ENABLE_DEV_MOCK_AUTH = 'true';

      expect(() => validateDevModeSafety()).toThrow('CRITICAL: Dev mode (ENABLE_DEV_MOCK_AUTH) is enabled in production environment');
    });

    it('should throw error when dev mode is enabled in production (APP_URL)', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_URL = 'https://prod.example.com';
      process.env.ENABLE_DEV_MOCK_AUTH = 'true';

      expect(() => validateDevModeSafety()).toThrow('CRITICAL: Dev mode (ENABLE_DEV_MOCK_AUTH) is enabled in production environment');
    });

    it('should throw error when dev mode is enabled in production (VERCEL_ENV)', () => {
      process.env.NODE_ENV = 'development';
      process.env.VERCEL_ENV = 'production';
      process.env.ENABLE_DEV_MOCK_AUTH = 'true';

      expect(() => validateDevModeSafety()).toThrow('CRITICAL: Dev mode (ENABLE_DEV_MOCK_AUTH) is enabled in production environment');
    });

    it('should not throw error when dev mode is disabled in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.ENABLE_DEV_MOCK_AUTH = 'false';

      expect(() => validateDevModeSafety()).not.toThrow();
    });

    it('should not throw error when dev mode is enabled in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
      process.env.ENABLE_DEV_MOCK_AUTH = 'true';

      expect(() => validateDevModeSafety()).not.toThrow();
    });

    it('should not throw error when dev mode is disabled in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
      process.env.ENABLE_DEV_MOCK_AUTH = 'false';

      expect(() => validateDevModeSafety()).not.toThrow();
    });

    it('should include detailed error message with current settings', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_APP_URL = 'https://prod.example.com';
      process.env.ENABLE_DEV_MOCK_AUTH = 'true';
      process.env.VERCEL_ENV = 'production';

      try {
        validateDevModeSafety();
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toContain('NODE_ENV:');
        expect(error.message).toContain('NEXT_PUBLIC_APP_URL:');
        expect(error.message).toContain('ENABLE_DEV_MOCK_AUTH:');
        expect(error.message).toContain('VERCEL_ENV:');
        expect(error.message).toContain('Action required:');
      }
    });
  });

  describe('Dev Mode Safety Check (Non-throwing)', () => {
    it('should return false when dev mode is enabled in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.ENABLE_DEV_MOCK_AUTH = 'true';

      expect(isDevModeSafe()).toBe(false);
    });

    it('should return true when dev mode is disabled in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.ENABLE_DEV_MOCK_AUTH = 'false';

      expect(isDevModeSafe()).toBe(true);
    });

    it('should return true when dev mode is enabled in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
      process.env.ENABLE_DEV_MOCK_AUTH = 'true';

      expect(isDevModeSafe()).toBe(true);
    });
  });

  describe('Required Environment Variables Validation', () => {
    it('should validate all required variables are present', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.example.com';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

      const result = validateRequiredEnvVars([
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
      ]);

      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should detect missing required variables', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.example.com';
      // NEXT_PUBLIC_SUPABASE_ANON_KEY is missing
      // SUPABASE_SERVICE_ROLE_KEY is missing

      const result = validateRequiredEnvVars([
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
      ]);

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      expect(result.missing).toContain('SUPABASE_SERVICE_ROLE_KEY');
    });

    it('should return all variables as missing when none are set', () => {
      const result = validateRequiredEnvVars([
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      ]);

      expect(result.valid).toBe(false);
      expect(result.missing).toHaveLength(2);
    });

    it('should handle empty array of required variables', () => {
      const result = validateRequiredEnvVars([]);

      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });
  });

  describe('Supabase Environment Validation', () => {
    it('should validate valid Supabase configuration', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'valid-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

      const result = validateSupabaseEnv();

      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
      expect(result.invalid).toEqual([]);
    });

    it('should detect missing required Supabase variables', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const result = validateSupabaseEnv();

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('NEXT_PUBLIC_SUPABASE_URL');
      expect(result.missing).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    });

    it('should detect invalid Supabase URL format', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-valid-url';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'valid-key';

      const result = validateSupabaseEnv();

      expect(result.valid).toBe(false);
      expect(result.invalid.length).toBeGreaterThan(0);
      expect(result.invalid[0]).toContain('NEXT_PUBLIC_SUPABASE_URL');
    });

    it('should handle missing optional service role key', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'valid-anon-key';
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const result = validateSupabaseEnv();

      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });
  });

  describe('Feature Flags', () => {
    it('should detect enabled feature flag with "true"', () => {
      process.env.USE_PARAMETERIZED_QUERIES = 'true';

      expect(isFeatureEnabled('USE_PARAMETERIZED_QUERIES')).toBe(true);
    });

    it('should detect enabled feature flag with "1"', () => {
      process.env.MCP_AUTH_REQUIRED = '1';

      expect(isFeatureEnabled('MCP_AUTH_REQUIRED')).toBe(true);
    });

    it('should detect disabled feature flag with "false"', () => {
      process.env.STRICT_ENV_VALIDATION = 'false';

      expect(isFeatureEnabled('STRICT_ENV_VALIDATION')).toBe(false);
    });

    it('should detect disabled feature flag with "0"', () => {
      process.env.UNIFIED_AUTH_MIDDLEWARE = '0';

      expect(isFeatureEnabled('UNIFIED_AUTH_MIDDLEWARE')).toBe(false);
    });

    it('should detect disabled feature flag when not set', () => {
      delete process.env.CUSTOM_FEATURE_FLAG;

      expect(isFeatureEnabled('CUSTOM_FEATURE_FLAG')).toBe(false);
    });

    it('should expose SECURITY_FLAGS object', () => {
      expect(SECURITY_FLAGS).toBeDefined();
      expect(SECURITY_FLAGS).toHaveProperty('USE_PARAMETERIZED_QUERIES');
      expect(SECURITY_FLAGS).toHaveProperty('MCP_AUTH_REQUIRED');
      expect(SECURITY_FLAGS).toHaveProperty('STRICT_ENV_VALIDATION');
      expect(SECURITY_FLAGS).toHaveProperty('UNIFIED_AUTH_MIDDLEWARE');
    });
  });

  describe('Startup Validation', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should pass all validations in safe development environment', () => {
      // Ensure we're in a server-like environment (not browser)
      const originalWindow = global.window;
      delete (global as any).window;

      try {
        process.env.NODE_ENV = 'development';
        process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
        process.env.ENABLE_DEV_MOCK_AUTH = 'true';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'valid-key';

        expect(() => validateOnStartup()).not.toThrow();

        // Check that logs were called
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('[ENV]')
        );
      } finally {
        // Restore window
        if (originalWindow) {
          global.window = originalWindow;
        }
      }
    });

    it('should fail when dev mode is enabled in production', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      try {
        process.env.NODE_ENV = 'production';
        process.env.ENABLE_DEV_MOCK_AUTH = 'true';

        expect(() => validateOnStartup()).toThrow();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[ENV] ✗ Dev mode safety check failed'),
          expect.any(Error)
        );
      } finally {
        if (originalWindow) {
          global.window = originalWindow;
        }
      }
    });

    it('should fail when required Supabase variables are missing', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      try {
        process.env.NODE_ENV = 'production';
        process.env.ENABLE_DEV_MOCK_AUTH = 'false';
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        expect(() => validateOnStartup()).toThrow();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[ENV] ✗ Supabase environment validation failed'),
          expect.any(Array)
        );
      } finally {
        if (originalWindow) {
          global.window = originalWindow;
        }
      }
    });

    it('should log security feature flags', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      try {
        process.env.NODE_ENV = 'development';
        process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'valid-key';

        validateOnStartup();

        expect(consoleLogSpy).toHaveBeenCalledWith(
          '[ENV] Security feature flags:',
          expect.any(Object)
        );
      } finally {
        if (originalWindow) {
          global.window = originalWindow;
        }
      }
    });

    it('should log environment info', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      try {
        process.env.NODE_ENV = 'development';
        process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'valid-key';
        process.env.VERCEL_ENV = 'preview';

        validateOnStartup();

        // Verify the log was called (not exact match due to dynamic evaluation)
        expect(consoleLogSpy).toHaveBeenCalledWith(
          '[ENV] Environment info:',
          expect.any(Object)
        );
      } finally {
        if (originalWindow) {
          global.window = originalWindow;
        }
      }
    });

    it('should return early in client-side environment', () => {
      // Mock window object
      const originalWindow = global.window;
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      });

      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'valid-key';

      expect(() => validateOnStartup()).not.toThrow();
      // Should not log anything when called from client-side
      expect(consoleLogSpy).not.toHaveBeenCalled();

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('Test Helper Functions', () => {
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it('_setTestEnv should set environment variables in test environment', () => {
      process.env.NODE_ENV = 'test';

      _setTestEnv({
        TEST_VAR: 'test-value',
        ANOTHER_VAR: 'another-value',
      });

      expect(process.env.TEST_VAR).toBe('test-value');
      expect(process.env.ANOTHER_VAR).toBe('another-value');
    });

    it('_setTestEnv should warn when not in test environment', () => {
      process.env.NODE_ENV = 'development';

      _setTestEnv({ TEST_VAR: 'test-value' });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ENV] _setTestEnv should only be used in test environment')
      );
    });

    it('_clearTestEnv should delete specified environment variables in test environment', () => {
      process.env.NODE_ENV = 'test';
      process.env.TEST_VAR = 'test-value';
      process.env.ANOTHER_VAR = 'another-value';

      _clearTestEnv('TEST_VAR', 'ANOTHER_VAR');

      expect(process.env.TEST_VAR).toBeUndefined();
      expect(process.env.ANOTHER_VAR).toBeUndefined();
    });

    it('_clearTestEnv should warn when not in test environment', () => {
      process.env.NODE_ENV = 'development';

      _clearTestEnv('TEST_VAR');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ENV] _clearTestEnv should only be used in test environment')
      );
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical production environment', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_APP_URL = 'https://prod.example.com';
      process.env.VERCEL_ENV = 'production';
      process.env.ENABLE_DEV_MOCK_AUTH = 'false';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'prod-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'prod-service-role';
      process.env.USE_PARAMETERIZED_QUERIES = 'true';
      process.env.MCP_AUTH_REQUIRED = 'true';

      expect(isProductionEnvironment()).toBe(true);
      expect(isDevelopmentEnvironment()).toBe(false);
      expect(isDevModeSafe()).toBe(true);
      expect(validateSupabaseEnv().valid).toBe(true);
      // Test feature flags directly instead of SECURITY_FLAGS constant
      expect(isFeatureEnabled('USE_PARAMETERIZED_QUERIES')).toBe(true);
      expect(isFeatureEnabled('MCP_AUTH_REQUIRED')).toBe(true);
    });

    it('should handle typical development environment', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
      process.env.ENABLE_DEV_MOCK_AUTH = 'true';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dev-anon-key';

      expect(isProductionEnvironment()).toBe(false);
      expect(isDevelopmentEnvironment()).toBe(true);
      expect(isDevModeSafe()).toBe(true);
      expect(validateSupabaseEnv().valid).toBe(true);
    });

    it('should handle Vercel preview environment', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_APP_URL = 'https://preview-git-branch.vercel.app';
      process.env.VERCEL_ENV = 'preview';
      process.env.ENABLE_DEV_MOCK_AUTH = 'false';

      // Vercel preview URLs are detected as production (not localhost)
      expect(isProductionEnvironment()).toBe(true);
      expect(isDevModeSafe()).toBe(true);
    });
  });
});
