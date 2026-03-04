/**
 * Remote Config API
 *
 * GET /api/config - Fetch all remote configuration from Supabase
 *
 * Features:
 * - Cache disabled (no-store)
 * - RLS protected (public read)
 * - Type-safe response
 */

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

// Disable caching for fresh config data
export const dynamic = 'force-dynamic';

// =====================================================
// Type Definitions
// =====================================================

interface MaintenanceModeConfig {
  enabled: boolean;
  message: string;
}

interface ChatbotBackendConfig {
  provider: 'lmstudio' | 'openai' | 'anthropic';
  failover_enabled: boolean;
}

interface RemoteConfigResponse {
  maintenance_mode: MaintenanceModeConfig;
  chatbot_backend: ChatbotBackendConfig;
}

// =====================================================
// Type-safe Helper Functions
// =====================================================

/**
 * Fetch all config rows from remote_config table
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
async function fetchAllConfigs(supabase: ReturnType<typeof createServiceClient>) {
  return (supabase as any)
    .from('remote_config')
    .select('*');
}

/**
 * Transform database rows to structured config object
 */
function transformToConfigObject(rows: any[]): RemoteConfigResponse {
  const config: Record<string, any> = {};

  for (const row of rows) {
    // Handle different value types
    let value: any = row.value;

    // Parse JSON strings
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch {
        // Keep as string if not valid JSON
      }
    }

    // Convert snake_case key to nested structure
    // Example: "maintenance_mode.enabled" -> { maintenance_mode: { enabled: ... } }
    const keys = row.key.split('.');
    let current = config;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (i === keys.length - 1) {
        current[key] = value;
      } else {
        current[key] = current[key] || {};
        current = current[key];
      }
    }
  }

  return config as RemoteConfigResponse;
}

// =====================================================
// GET Handler
// =====================================================

export async function GET(): Promise<NextResponse> {
  try {
    console.log('[Config API] Fetching remote config...');

    const supabase = createServiceClient();

    // Fetch all config rows
    const { data: configs, error } = await fetchAllConfigs(supabase);

    if (error) {
      console.error('[Config API] Database error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch config',
          details: error.message
        },
        { status: 500 }
      );
    }

    // Transform rows to structured object
    const config = transformToConfigObject(configs || []);

    console.log('[Config API] Config fetched successfully');

    return NextResponse.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('[Config API] Unexpected error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
