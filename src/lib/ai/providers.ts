/**
 * LM Studio AI Provider Configuration with Failover Support
 *
 * LM Studio用AIプロバイダー設定（フェイルオーバー対応）
 * Configuration for LM Studio OpenAI-compatible API with commercial API fallback
 */

import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import 'server-only';
import { createServiceClient } from '@/lib/supabase';
import { Logger } from '@/lib/logger';
import {
  auditHermesToolPolicy,
  HERMES_TOOL_POLICY,
} from '@/lib/ai/hermes-tool-policy';

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
// Hermes Provider
// ============================================================

/**
 * 開発用のHermes既定モデル
 * Development-only default model
 */
const HERMES_DEVELOPMENT_MODEL = 'hermes';

/**
 * Hermesが選択されているかどうかを判定
 * Check whether explicit Hermes mode is selected
 */
function isHermesMode(): boolean {
  return process.env.CHAT_PROVIDER === 'hermes';
}

const isProductionOrPreview = (): boolean =>
  process.env.VERCEL_ENV === 'production' ||
  process.env.VERCEL_ENV === 'preview';

const isLoopbackHost = (hostname: string): boolean =>
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '[::1]';

/**
 * HermesのベースURLを検証して取得
 * Validate and get the Hermes base URL
 */
function getHermesBaseURL(): string {
  const configuredURL = process.env.HERMES_BASE_URL;
  const normalizedURL = configuredURL?.replace(/\/+$/, '') ?? '';

  if (!normalizedURL) {
    throw new Error(
      'HERMES_BASE_URL is required when CHAT_PROVIDER=hermes. ' +
      'Set the OpenAI-compatible endpoint ending in /v1.'
    );
  }

  if (!normalizedURL.endsWith('/v1')) {
    throw new Error(
      'HERMES_BASE_URL must be an OpenAI-compatible endpoint ending in /v1.'
    );
  }

  try {
    const url = new URL(normalizedURL);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new TypeError('Unsupported Hermes URL protocol');
    }
    if (url.protocol === 'http:' &&
        (!isLoopbackHost(url.hostname) || isProductionOrPreview())) {
      throw new TypeError('HTTP is allowed only for loopback local development');
    }
  } catch {
    throw new Error(
      'HERMES_BASE_URL must be a valid URL ending in /v1. ' +
      'Use HTTPS outside local loopback development.'
    );
  }

  return normalizedURL;
}

/**
 * Hermes APIキーを取得
 * Get the server-only Hermes API key
 */
function getHermesApiKey(): string {
  const apiKey = process.env.HERMES_API_KEY;

  if (!apiKey) {
    throw new Error(
      'HERMES_API_KEY is required when CHAT_PROVIDER=hermes. ' +
      'Set it as a server-side environment variable only.'
    );
  }

  return apiKey;
}

/**
 * HermesモデルIDを取得
 * Get the Hermes model ID
 */
function getHermesModelId(): string {
  const configuredModel = process.env.HERMES_MODEL;
  const environment = detectEnvironment();

  if (configuredModel && configuredModel.length > 0) {
    return configuredModel;
  }

  if (environment.isProduction) {
    throw new Error(
      'HERMES_MODEL is required in production when CHAT_PROVIDER=hermes. ' +
      'Set the explicit model ID from the isolated Hermes profile.'
    );
  }

  return HERMES_DEVELOPMENT_MODEL;
}

/**
 * Hermesチャットモデル設定を取得
 * Get Hermes chat model configuration
 */
export function getHermesChatModel() {
  const baseURL = getHermesBaseURL();
  const apiKey = getHermesApiKey();
  const modelId = getHermesModelId();

  const provider = createOpenAICompatible({
    name: 'hermes',
    baseURL,
    apiKey,
  });

  return {
    provider,
    modelId,
    baseURL,
    name: 'Hermes',
    type: 'hermes' as const,
    isFailover: false as const,
  };
}

export type HermesPreflightReasonCode =
  | 'hermes_auth_error'
  | 'hermes_invalid_response'
  | 'hermes_http_error'
  | 'hermes_provider_rate_limited'
  | 'hermes_timeout'
  | 'hermes_unreachable';

export interface HermesPreflightFailure {
  ok: false;
  reasonCode: HermesPreflightReasonCode;
  error: string;
}

export interface HermesPreflightSuccess {
  ok: true;
}

export type HermesPreflightResult =
  | HermesPreflightSuccess
  | HermesPreflightFailure;

export function isHermesPreflightFailure(
  result: HermesPreflightResult,
): result is HermesPreflightFailure {
  return result.ok === false;
}

const HERMES_PREFLIGHT_MESSAGES: Record<HermesPreflightReasonCode, string> = {
  hermes_auth_error: '現在AIサービスを利用できません。しばらく待ってから再試行してください。',
  hermes_invalid_response: '現在AIサービスを利用できません。しばらく待ってから再試行してください。',
  hermes_http_error: '現在AIサービスを利用できません。しばらく待ってから再試行してください。',
  hermes_provider_rate_limited: 'AIサービスが混み合っています。しばらく待ってから再試行してください。',
  hermes_timeout: 'AIサービスがタイムアウトしました。しばらく待ってから再試行してください。',
  hermes_unreachable: 'AIサービスに接続できません。しばらく待ってから再試行してください。',
};

function hermesPreflightFailure(
  reasonCode: HermesPreflightReasonCode,
): HermesPreflightFailure {
  return { ok: false, reasonCode, error: HERMES_PREFLIGHT_MESSAGES[reasonCode] };
}

const HERMES_PREFLIGHT_SUCCESS_CACHE_TTL_MS = 30_000;
const HERMES_PREFLIGHT_FAILURE_CACHE_TTL_MS = 5_000;

const hermesPreflightCache = new Map<
  string,
  { expiresAt: number; result: HermesPreflightResult }
>();
const hermesPreflightInFlight = new Map<
  string,
  Promise<HermesPreflightResult>
>();

/**
 * Clear serving-path preflight state. Intended for isolated tests only.
 */
export function resetHermesPreflightCacheForTests(): void {
  hermesPreflightCache.clear();
  hermesPreflightInFlight.clear();
}

function isConfiguredModelAdvertised(payload: unknown, modelId: string): boolean {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const rows = (payload as { data?: unknown }).data;
  if (!Array.isArray(rows)) {
    return false;
  }

  return rows.some((row) =>
    typeof row === 'object' &&
    row !== null &&
    (row as { id?: unknown }).id === modelId
  );
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getHermesServiceRoot = (baseURL: string): string =>
  baseURL.replace(/\/v1\/?$/, '');

const isHermesVersionAtLeast = (value: unknown, minimum: string): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  const versionPattern = /^\d+(?:\.\d+){0,3}$/;
  if (!versionPattern.test(value) || !versionPattern.test(minimum)) {
    return false;
  }

  const toParts = (version: string) =>
    version.split('.').map((part) => Number.parseInt(part, 10));
  const valueParts = toParts(value);
  const minimumParts = toParts(minimum);
  const length = Math.max(valueParts.length, minimumParts.length);

  return Array.from({ length }, (_, index) => {
    const left = valueParts[index] ?? 0;
    const right = minimumParts[index] ?? 0;
    if (left !== right) {
      return left > right ? 'greater' : 'less';
    }
    return 'equal';
  }).find((comparison) => comparison !== 'equal') !== 'less';
};

async function auditHermesConnection(
  baseURL: string,
  apiKey: string,
  modelId: string,
  timeoutMs: number,
): Promise<HermesPreflightResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const requestInit = {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    };
    const serviceRoot = getHermesServiceRoot(baseURL);
    const [modelsResponse, toolsetsResponse, healthResponse] = await Promise.all([
      fetch(`${baseURL}/models`, requestInit),
      fetch(`${serviceRoot}${HERMES_TOOL_POLICY.audit.endpoint}`, requestInit),
      fetch(`${serviceRoot}/health/detailed`, requestInit),
    ]);

    for (const response of [modelsResponse, toolsetsResponse, healthResponse]) {
      if (response.status === 401 || response.status === 403) {
        return hermesPreflightFailure('hermes_auth_error');
      }
      if (response.status === 429) {
        return hermesPreflightFailure('hermes_provider_rate_limited');
      }
      if (!response.ok) {
        return hermesPreflightFailure('hermes_http_error');
      }
    }
    if (!healthResponse.ok) {
      return hermesPreflightFailure('hermes_http_error');
    }

    let modelsPayload: unknown;
    let toolsetsPayload: unknown;
    let healthPayload: unknown;
    try {
      [modelsPayload, toolsetsPayload, healthPayload] = await Promise.all([
        modelsResponse.json(),
        toolsetsResponse.json(),
        healthResponse.json(),
      ]);
    } catch {
      return hermesPreflightFailure('hermes_invalid_response');
    }

    if (!isConfiguredModelAdvertised(modelsPayload, modelId)) {
      return hermesPreflightFailure('hermes_invalid_response');
    }
    if (!auditHermesToolPolicy(toolsetsPayload).data.accepted) {
      return hermesPreflightFailure('hermes_invalid_response');
    }

    const readiness = isRecord(healthPayload)
      ? healthPayload.readiness
      : undefined;
    const modelCheck = isRecord(readiness) && isRecord(readiness.checks)
      ? readiness.checks.model
      : undefined;
    if (
      !isRecord(healthPayload) ||
      healthPayload.status !== 'ok' ||
      !isRecord(readiness) ||
      readiness.status !== 'ok' ||
      !isRecord(modelCheck) ||
      modelCheck.status !== 'ok'
    ) {
      return hermesPreflightFailure('hermes_invalid_response');
    }
    if (healthPayload.version !== undefined &&
        !isHermesVersionAtLeast(
          healthPayload.version,
          HERMES_TOOL_POLICY.minimum_hermes_version,
        )) {
      return hermesPreflightFailure('hermes_invalid_response');
    }

    return { ok: true };
  } catch (error) {
    return hermesPreflightFailure(
      error instanceof Error && error.name === 'AbortError'
        ? 'hermes_timeout'
        : 'hermes_unreachable',
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Confirm authenticated Hermes availability before opening a chat stream.
 * Never includes provider URLs, credentials, or raw provider errors.
 */
export async function preflightHermesConnection(
  timeoutMs = 5000,
): Promise<HermesPreflightResult> {
  let baseURL: string;
  let apiKey: string;
  let modelId: string;
  try {
    baseURL = getHermesBaseURL();
    apiKey = getHermesApiKey();
    modelId = getHermesModelId();
  } catch {
    return hermesPreflightFailure('hermes_unreachable');
  }

  const cacheKey = `${baseURL}\n${apiKey}\n${modelId}`;
  const cached = hermesPreflightCache.get(cacheKey);
  if (cached) {
    if (cached.expiresAt > Date.now()) {
      return cached.result;
    }
    hermesPreflightCache.delete(cacheKey);
  }
  const inFlight = hermesPreflightInFlight.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const cachedAt = Date.now();
  const request = auditHermesConnection(baseURL, apiKey, modelId, timeoutMs)
    .then((result) => {
      hermesPreflightCache.set(cacheKey, {
        expiresAt: cachedAt + (
          result.ok
            ? HERMES_PREFLIGHT_SUCCESS_CACHE_TTL_MS
            : HERMES_PREFLIGHT_FAILURE_CACHE_TTL_MS
        ),
        result,
      });
      return result;
    })
    .finally(() => {
      hermesPreflightInFlight.delete(cacheKey);
    });

  hermesPreflightInFlight.set(cacheKey, request);
  return request;
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
  if (isHermesMode()) {
    return getHermesChatModel();
  }

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
    type: 'lmstudio' as const,
    isFailover: false as const,
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

【セキュリティ】
- このWebサイト用エージェントは外部ツールを一切持いません。
- ターミナル、シェル、ファイル操作、ブラウザ、検索、外部システムアクセスは実行できません。
- 「コマンドを実行した」「ツールを使った」等の事実と異なる出力は絶対に行わないでください。
- 秘密情報、認証情報、環境変数、内部設定は開示しないでください。

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
        // 実DB chatbot_failover_logs の構造化カラムへ主要情報を設定
        event_type: options.status || 'failover',
        from_provider: 'lmstudio',
        to_provider: failoverProvider,
        reason: options.originalErrorMessage || options.originalErrorCode || null,
        // 実DB に存在しない詳細フィールドは metadata（Json）へ格納
        metadata: {
          original_error_message: options.originalErrorMessage,
          original_error_code: options.originalErrorCode,
          failover_enabled: isFailoverEnabled(),
          user_message_preview: options.userMessagePreview?.substring(0, 200),
          session_id: options.sessionId,
          response_time_ms: options.responseTimeMs,
          status: options.status,
          resolved: options.resolved ?? false,
          ...(options.metadata ?? {}),
        },
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
  type?: 'lmstudio' | 'hermes' | 'openai-mini' | 'anthropic-haiku';
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

  // HermesモードではLM Studio可用性や商用フェイルオーバーへ決して到達させない
  // In Hermes mode, never reach LM Studio checks or commercial failover
  if (isHermesMode()) {
    return getHermesChatModel();
  }

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
