import policy from '../../../config/hermes-tool-policy.json';

export const HERMES_TOOL_POLICY = policy;
export const EXPECTED_HERMES_TOOL_NAMES: readonly string[] =
  policy.expected_enabled_toolset_names;
export const HERMES_HARD_BLOCKED_TOOL_NAMES: readonly string[] =
  policy.hard_blocked_toolset_names;

export interface HermesToolManifestRow {
  name: unknown;
  enabled: unknown;
  tools?: unknown;
}

export type HermesToolPolicyInput = {
  object: unknown;
  platform: unknown;
  data: unknown;
};

export type HermesToolPolicyNormalization =
  | {
      ok: true;
      reason: 'empty-policy';
      enabledToolNames: string[];
      concreteTools: string[];
    }
  | { ok: false; reason: 'malformed' | 'duplicate' | 'unknown-enabled' | 'hard-blocked' | 'non-empty' };

export interface HermesToolPolicyAudit {
  object: 'audit';
  platform: 'hermes';
  data: {
    accepted: boolean;
    reason: 'empty-policy' | 'malformed' | 'duplicate' | 'unknown-enabled' | 'hard-blocked' | 'non-empty';
    enabledToolNames: string[];
    concreteTools: string[];
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string' && item.length > 0);

const isValidManifestRow = (
  value: unknown,
): value is { name: string; enabled: boolean; tools?: string[] } =>
  isRecord(value) &&
  typeof value.name === 'string' && value.name.length > 0 &&
  typeof value.enabled === 'boolean' &&
  (value.tools === undefined || isStringArray(value.tools));

export function normalizeHermesToolPolicy(
  rows: unknown,
): HermesToolPolicyNormalization {
  if (!Array.isArray(rows) || !rows.every(isValidManifestRow)) {
    return { ok: false, reason: 'malformed' };
  }

  const enabledRows = rows.filter((row) => row.enabled === true);
  const seen = new Set<string>();
  const enabledToolNames: string[] = [];

  for (const row of enabledRows) {
    const { name } = row;
    if (seen.has(name)) {
      return { ok: false, reason: 'duplicate' };
    }
    seen.add(name);
    enabledToolNames.push(name);
  }

  if (enabledToolNames.some((name) => HERMES_HARD_BLOCKED_TOOL_NAMES.includes(name))) {
    return { ok: false, reason: 'hard-blocked' };
  }
  if (enabledRows.some((row) => row.tools !== undefined && row.tools.length > 0)) {
    return { ok: false, reason: 'non-empty' };
  }
  if (enabledToolNames.some((name) => !EXPECTED_HERMES_TOOL_NAMES.includes(name))) {
    return { ok: false, reason: 'unknown-enabled' };
  }

  const concreteTools = [...new Set(enabledRows.flatMap((row) => row.tools as string[] | undefined ?? []))]
    .sort((left, right) => left.localeCompare(right));

  return {
    ok: true,
    reason: 'empty-policy',
    enabledToolNames: enabledToolNames.sort((left, right) => left.localeCompare(right)),
    concreteTools,
  };
}

export function auditHermesToolPolicy(input: unknown): HermesToolPolicyAudit {
  const shape = isRecord(input) ? input : ({} as Record<string, unknown>);
  if (shape.object !== 'list' || shape.platform !== 'api_server') {
    return {
      object: 'audit',
      platform: 'hermes',
      data: {
        accepted: false,
        reason: 'malformed',
        enabledToolNames: [],
        concreteTools: [],
      },
    };
  }

  const normalized = normalizeHermesToolPolicy(shape.data);
  if (!normalized.ok) {
    return {
      object: 'audit',
      platform: 'hermes',
      data: {
        accepted: false,
        reason: normalized.reason,
        enabledToolNames: [],
        concreteTools: [],
      },
    };
  }

  return {
    object: 'audit',
    platform: 'hermes',
    data: {
      accepted: true,
      reason: 'empty-policy',
      enabledToolNames: normalized.enabledToolNames,
      concreteTools: normalized.concreteTools,
    },
  };
}
