/**
 * Redaction and fail-closed scanning for performance evidence.
 * Credential values are supplied only through process-local maps and are never logged.
 */

export type SecretValues = Readonly<Record<string, string>>;
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const SENSITIVE_KEYS = new Set([
  'authorization',
  'cookie',
  'cookies',
  'set-cookie',
  'session',
  'sessionid',
  'session_id',
  'sessionid',
  'sessiontoken',
  'session_token',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'idtoken',
  'id_token',
  'jwt',
  'storagestate',
  'storage_state',
  'signature',
  'sig',
]);

const KEY_PATTERNS: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  { name: 'jwt', pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g },
  { name: 'authorization-header', pattern: /\b(authorization|proxy-authorization)\s*:\s*[^\s",;]+/gi },
  { name: 'cookie-header', pattern: /\b(set-cookie|cookie)\s*:\s*[^\r\n]+/gi },
  { name: 'storage-state-json', pattern: /\{[^"']*"cookies"\s*:\s*\[/gi },
  { name: 'supabase-auth-cookie', pattern: /\bsb-(?:access|refresh)-token\b/gi },
  {
    name: 'signed-url-or-token-query',
    pattern: /([?&](?:access_token|refresh_token|id_token|token|session_id|sessionid|sid|signature|sig|api_key|apikey|key)(?:=[^&\s"']*))|(\/storage\/v1\/object\/sign\/[^"'\s]+)/gi,
  },
];

const SUPABASE_TOKEN_PATTERNS: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  { name: 'jwt', pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g },
  { name: 'storage-state-json', pattern: /\{[^"']*"cookies"\s*:\s*\[/g },
  { name: 'supabase-auth-cookie', pattern: /\bsb-(?:access|refresh)-token\b/gi },
  {
    name: 'signed-url-or-token-query',
    pattern: /([?&](?:access_token|refresh_token|id_token|token|session_id|sessionid|sid|signature|sig|api_key|apikey|key)(?:=[^&\s"']*))|(\/storage\/v1\/object\/sign\/[^"'\s]+)/gi,
  },
];

function redactString(value: string, secrets: SecretValues): { value: string; redactions: number } {
  let output = value;
  let redactions = 0;

  for (const [label, secret] of Object.entries(secrets)) {
    if (secret.length >= 4) {
      const parts = output.split(secret);
      redactions += parts.length - 1;
      output = parts.join(`[REDACTED:${label.toUpperCase()}]`);
    }
  }

  for (const { name, pattern } of KEY_PATTERNS) {
    output = output.replace(pattern, () => {
      redactions += 1;
      return `[REDACTED:${name.toUpperCase()}]`;
    });
  }

  return { value: output, redactions };
}

export function redactJson<T>(input: T, secrets: SecretValues = {}): { value: T; redactionsApplied: number } {
  let redactionsApplied = 0;

  const walk = (value: unknown, key = ''): JsonValue | undefined => {
    if (value === null || value === undefined) return null;
    if (Array.isArray(value)) return value.map(item => walk(item) ?? null);

    if (typeof value === 'object') {
      const output: { [key: string]: JsonValue } = {};
      for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>)) {
        if (SENSITIVE_KEYS.has(childKey.toLowerCase())) {
          redactionsApplied += 1;
          output[childKey] = '[REDACTED]';
        } else {
          output[childKey] = walk(childValue, childKey) ?? null;
        }
      }
      return output;
    }

    if (typeof value === 'string') {
      const result = redactString(value, secrets);
      redactionsApplied += result.redactions;
      return result.value;
    }

    return value as JsonValue;
  };

  return { value: walk(input) as T, redactionsApplied };
}

export interface SecretFinding {
  path: string;
  pattern: string;
  excerpt: string;
}

/** Scans already-redacted JSON and throws for any known credential carrier. */
export function scanRedactedJson(value: unknown, path = '$'): SecretFinding[] {
  const findings: SecretFinding[] = [];

  const scanString = (input: string, currentPath: string) => {
    for (const { name, pattern } of SUPABASE_TOKEN_PATTERNS) {
      pattern.lastIndex = 0;
      const match = pattern.exec(input);
      if (match) {
        findings.push({
          path: currentPath,
          pattern: name,
          excerpt: `${input.slice(Math.max(0, match.index - 12), match.index + 24)}...`,
        });
      }
    }
  };

  const walk = (input: unknown, currentPath: string): void => {
    if (typeof input === 'string') {
      scanString(input, currentPath);
      return;
    }
    if (Array.isArray(input)) {
      input.forEach((item, index) => walk(item, `${currentPath}[${index}]`));
      return;
    }
    if (input && typeof input === 'object') {
      for (const [key, child] of Object.entries(input as Record<string, unknown>)) {
        if (SENSITIVE_KEYS.has(key.toLowerCase())) {
          findings.push({ path: `${currentPath}.${key}`, pattern: 'sensitive-key', excerpt: '[key]' });
        }
        walk(child, `${currentPath}.${key}`);
      }
    }
  };

  walk(value, path);
  if (findings.length > 0) {
    const detail = findings.map(item => `${item.path}: ${item.pattern}`).join('; ');
    throw new Error(`SECRET_SCAN_FAILED: ${detail}`);
  }
  return findings;
}

export function readCredentialFromEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`MISSING_EPHEMERAL_CREDENTIAL: ${name}`);
  }
  return value;
}
