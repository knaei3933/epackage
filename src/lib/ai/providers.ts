/**
 * LM Studio AI Provider Configuration with Failover Support
 *
 * LM Studio用AIプロバイダー設定（フェイルオーバー対応）
 * Configuration for LM Studio OpenAI-compatible API with commercial API fallback
 */

import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createServiceClient } from '@/lib/supabase';
import { Logger } from '@/lib/logger';

const logger = new Logger({ component: 'ai/providers' });

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
// Commercial API Providers (Failover)
// ============================================================

/**
 * フェイルオーバーが有効かどうかをチェック
 * Check if failover is enabled
 */
function isFailoverEnabled(): boolean {
  return process.env.FAILOVER_ENABLED !== 'false';
}

/**
 * フェイルオーバープロバイダータイプを取得
 * Get failover provider type from environment
 */
function getFailoverProviderType(): 'openai-mini' | 'anthropic-haiku' {
  const provider = process.env.FAILOVER_PROVIDER || 'openai-mini';
  if (provider === 'anthropic-haiku') return 'anthropic-haiku';
  return 'openai-mini';
}

/**
 * OpenAIプロバイダーを作成（GPT-4o mini）
 * Create OpenAI provider for failover
 */
function createOpenAIProvider() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for OpenAI failover');
  }
  return createOpenAI({
    apiKey,
  });
}

/**
 * Anthropicプロバイダーを作成（Claude 3 Haiku）
 * Create Anthropic provider for failover
 */
function createAnthropicProvider() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required for Anthropic failover');
  }
  return createAnthropic({
    apiKey,
  });
}

// ============================================================
// System Prompts
// ============================================================

/**
 * システムプロンプトを取得（フェイルオーバー対応）
 * Get system prompt with failover support
 *
 * @param isFailover - フェイルオーバー中かどうか / Whether in failover mode
 * @returns システムプロンプト / System prompt
 */
export const getSystemPrompt = (isFailover: boolean): string => {
  if (isFailover) {
    // フェイルオーバー時の簡易プロンプト
    return 'Epackage Labコンシェルジュ。簡潔に回答。見積もり→/quote-simulator 問い合わせ→/contact 電話→050-1793-6500';
  }

  // 通常時のフルプロンプト
  return `Epackage Labコンシェルジュです。1〜2文で簡潔に回答。

【CTA】
- 見積もり→[見積もりツール](https://package-lab.com/quote-simulator)をご利用ください
- 詳細問い合わせ→担当者切り替え提案

【有人切り替え】
"担当者""専門家""相談""電話"含まれる場合、担当者へ案内

【基本】
- 電話:050-1793-6500
- ウェブ:https://package-lab.com

【重要】URLは必ずマークダウンリンク形式[テキスト](URL)で記述してください。`;
};

// ============================================================
// Failover Log Recording
// ============================================================

interface FailoverLogOptions {
  originalErrorMessage?: string;
  originalErrorCode?: string;
  userMessagePreview?: string;
  sessionId?: string;
  responseTimeMs?: number;
  status: 'failed' | 'success' | 'error';
  resolved?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * フェイルオーバーログを記録
 * Record failover event to database
 */
async function logFailoverEvent(
  failoverProvider: string,
  options: FailoverLogOptions
): Promise<void> {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase
      .from('chatbot_failover_logs')
      .insert({
        original_provider: 'lmstudio',
        original_error_message: options.originalErrorMessage,
        original_error_code: options.originalErrorCode,
        failover_provider: failoverProvider,
        failover_enabled: isFailoverEnabled(),
        user_message_preview: options.userMessagePreview?.substring(0, 200),
        session_id: options.sessionId,
        response_time_ms: options.responseTimeMs,
        status: options.status,
        resolved: options.resolved ?? false,
        metadata: options.metadata ?? {},
      });

    if (error) {
      logger.error('Failed to log failover event', { error });
    }
  } catch (err) {
    // ログ記録エラーは元の処理に影響しないように無視
    // Ignore logging errors to avoid affecting main process
    logger.warn('Failed to record failover log', { error: err });
  }
}

// ============================================================
// Failover Chat Model Configuration
// ============================================================

/**
 * フェイルオーバー用のモデル設定を取得
 * Get failover chat model configuration
 */
function getFailoverModelConfig() {
  const providerType = getFailoverProviderType();

  if (providerType === 'anthropic-haiku') {
    const provider = createAnthropicProvider();
    return {
      provider,
      modelId: 'claude-3-5-haiku-20241022',
      name: 'Claude 3.5 Haiku (Failover)',
      type: 'anthropic-haiku' as const,
    };
  }

  // Default: OpenAI GPT-4o mini
  const provider = createOpenAIProvider();
  return {
    provider,
    modelId: 'gpt-4o-mini',
    name: 'GPT-4o mini (Failover)',
    type: 'openai-mini' as const,
  };
}

// ============================================================
// Enhanced Chat Model with Failover
// ============================================================

export interface FailoverChatModelConfig {
  provider: ReturnType<typeof createOpenAICompatible | typeof createOpenAI | typeof createAnthropic>;
  modelId: string;
  baseURL?: string;
  name: string;
  type?: 'lmstudio' | 'openai-mini' | 'anthropic-haiku';
  isFailover: boolean;
}

interface GetChatModelWithFailoverOptions {
  sessionId?: string;
  logFailover?: boolean;
}

/**
 * フェイルオーバー対応のチャットモデル設定を取得
 * Get chat model configuration with automatic failover
 *
 * @param options - オプション / Options
 * @returns チャットモデル設定 / Chat model configuration
 */
export async function getChatModelWithFailover(
  options: GetChatModelWithFailoverOptions = {}
): Promise<FailoverChatModelConfig> {
  const { sessionId, logFailover = true } = options;

  // フェイルオーバーが無効な場合は通常のLM Studioのみ
  // If failover is disabled, use LM Studio only
  if (!isFailoverEnabled()) {
    const config = getChatModel();
    return {
      ...config,
      isFailover: false,
      type: 'lmstudio',
    };
  }

  // LM Studio設定を試行
  // Try LM Studio configuration
  try {
    const config = getChatModel();
    return {
      ...config,
      isFailover: false,
      type: 'lmstudio',
    };
  } catch (error) {
    // LM Studioが利用できない場合、フェイルオーバー
    // When LM Studio is unavailable, failover to commercial API
    logger.warn('LM Studio unavailable, failing over to commercial API', {
      error: error instanceof Error ? error.message : String(error),
    });

    const failoverConfig = getFailoverModelConfig();

    // フェイルオーバーログを記録
    // Record failover event
    if (logFailover) {
      await logFailoverEvent(failoverConfig.type, {
        originalErrorMessage: error instanceof Error ? error.message : String(error),
        originalErrorCode: error instanceof Error ? error.name : undefined,
        sessionId,
        status: 'failed',
        resolved: true,
      });
    }

    return {
      ...failoverConfig,
      isFailover: true,
    };
  }
}

/**
 * LM Studioのヘルスチェック
 * Health check for LM Studio
 */
export async function checkLMStudioHealth(): Promise<boolean> {
  try {
    const baseURL = getBaseURL();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒タイムアウト

    const response = await fetch(`${baseURL}/models`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================================
// Type Exports
// ============================================================

export type ChatModelConfig = ReturnType<typeof getChatModel>;
export type FailoverChatModelConfigType = FailoverChatModelConfig;
