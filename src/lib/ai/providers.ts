/**
 * LM Studio AI Provider Configuration
 *
 * LM Studio用AIプロバイダー設定
 * Configuration for LM Studio OpenAI-compatible API
 */

import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

// ============================================================
// Environment Detection
// ============================================================

interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  hasBaseUrl: boolean;
}

/**
 * 現在の環境を検出
 * Detect current environment
 */
function detectEnvironment(): EnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV;
  const vercelEnv = process.env.VERCEL_ENV;

  return {
    isDevelopment: nodeEnv === 'development' && vercelEnv !== 'production' && vercelEnv !== 'preview',
    isProduction: vercelEnv === 'production' || (nodeEnv === 'production' && !vercelEnv),
    hasBaseUrl: Boolean(process.env.LMSTUDIO_BASE_URL && process.env.LMSTUDIO_BASE_URL.length > 0),
  };
}

// ============================================================
// LM Studio Provider
// ============================================================

/**
 * LM StudioのベースURLを取得
 * Get LM Studio base URL
 */
function getBaseURL(): string {
  const env = process.env.LMSTUDIO_BASE_URL;

  if (env && env.length > 0) {
    return env;
  }

  // デフォルト値
  // Default value
  return 'http://localhost:1234/v1';
}

/**
 * LM Studioプロバイダーを作成
 * Create LM Studio provider
 */
export const lmstudio = createOpenAICompatible({
  name: 'lmstudio',
  baseURL: getBaseURL(),
});

// ============================================================
// Chat Model Configuration
// ============================================================

/**
 * チャット用モデル設定を取得
 * Get chat model configuration for LM Studio
 */
export function getChatModel() {
  const env = detectEnvironment();
  const baseURL = getBaseURL();

  // 本番環境でベースURLが設定されていない場合はエラー
  // Error if base URL is not configured in production
  if (env.isProduction && !env.hasBaseUrl) {
    throw new Error(
      'LMSTUDIO_BASE_URL is required in production. ' +
      'Please set LMSTUDIO_BASE_URL in your Vercel environment variables. ' +
      'Expected format: https://chatbot.package-lab.com/v1'
    );
  }

  return {
    provider: lmstudio,
    modelId: 'qwen/qwen3-vl-4b',
    baseURL: baseURL,
    name: env.isDevelopment ? 'LM Studio (Local)' : 'LM Studio (Cloudflare Tunnel)',
  };
}

// ============================================================
// Type Exports
// ============================================================

export type ChatModelConfig = ReturnType<typeof getChatModel>;
