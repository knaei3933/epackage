/**
 * @jest-environment node
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  HERMES_TOOL_POLICY,
  EXPECTED_HERMES_TOOL_NAMES,
  HERMES_HARD_BLOCKED_TOOL_NAMES,
  auditHermesToolPolicy,
  normalizeHermesToolPolicy,
} from '@/lib/ai/hermes-tool-policy';
import trackedPolicy from '../../../../config/hermes-tool-policy.json';

const disabledRow = (name: string, tools: string[] = []) => ({
  name,
  label: name,
  description: `${name} capability`,
  enabled: false,
  configured: false,
  tools,
});

describe('Hermes tool policy', () => {
  it('is the exact empty policy', () => {
    expect(HERMES_TOOL_POLICY).toEqual(trackedPolicy);
    expect(EXPECTED_HERMES_TOOL_NAMES).toEqual([]);
    expect(HERMES_HARD_BLOCKED_TOOL_NAMES).toEqual(trackedPolicy.hard_blocked_toolset_names);
    expect(HERMES_HARD_BLOCKED_TOOL_NAMES.length).toBeGreaterThan(0);
    expect(
      readFileSync(
        resolve(__dirname, '../hermes-tool-policy.ts'),
        'utf8',
      ).includes('.omx'),
    ).toBe(false);
  });

  it('accepts the Hermes list response when every capability row is disabled', () => {
    const audit = auditHermesToolPolicy({
      object: 'list',
      platform: 'api_server',
      data: HERMES_HARD_BLOCKED_TOOL_NAMES.map((name) => disabledRow(
        name,
        name === 'file' ? ['file.read', 'file.write'] : [],
      )),
    });

    expect(audit).toEqual({
      object: 'audit',
      platform: 'hermes',
      data: {
        accepted: true,
        reason: 'empty-policy',
        enabledToolNames: [],
        concreteTools: [],
      },
    });
  });

  it('normalizes enabled rows before the exact-empty rejection', () => {
    const result = normalizeHermesToolPolicy([
      { name: 'z-tool', enabled: true },
      { name: 'a-tool', enabled: true },
    ]);

    expect(result).toEqual({
      ok: false,
      reason: 'unknown-enabled',
    });
  });

  it('rejects malformed and prohibited manifests without leaking row data', () => {
    const empty = { object: 'list', platform: 'api_server', data: [] };

    expect(auditHermesToolPolicy(null).data).toMatchObject({
      accepted: false,
      reason: 'malformed',
      enabledToolNames: [],
      concreteTools: [],
    });
    expect(auditHermesToolPolicy({ ...empty, object: 'other' }).data.accepted).toBe(false);
    expect(auditHermesToolPolicy({ ...empty, data: 'tools' }).data.reason).toBe('malformed');
    expect(auditHermesToolPolicy({ ...empty, data: [{ name: 'tool' }] }).data.reason).toBe('malformed');
    expect(auditHermesToolPolicy({
      ...empty,
      data: [
        { name: 'same', enabled: true },
        { name: 'same', enabled: true },
      ],
    }).data.reason).toBe('duplicate');
    expect(auditHermesToolPolicy({
      ...empty,
      data: [{ name: 'unexpected', enabled: true }],
    }).data.reason).toBe('unknown-enabled');
    expect(auditHermesToolPolicy({
      ...empty,
      data: [{ name: 'blocked', enabled: false }],
    }).data).toMatchObject({ accepted: true, reason: 'empty-policy', enabledToolNames: [] });
  });

  it('rejects malformed disabled rows but ignores disabled duplicates and tools', () => {
    const base = { object: 'list', platform: 'api_server' };

    expect(auditHermesToolPolicy({
      ...base,
      data: [{ ...disabledRow('web'), tools: 'browser.open' }],
    }).data.reason).toBe('malformed');
    expect(auditHermesToolPolicy({
      ...base,
      data: [disabledRow('web'), disabledRow('web')],
    }).data.accepted).toBe(true);
  });

  it('rejects unknown, hard-blocked, duplicate enabled rows and enabled concrete tools', () => {
    const response = (data: unknown[]) => ({
      object: 'list',
      platform: 'api_server',
      data,
    });

    expect(auditHermesToolPolicy(response([
      { name: 'unexpected', enabled: true },
    ])).data.reason).toBe('unknown-enabled');
    expect(auditHermesToolPolicy(response([
      { name: 'web', enabled: true },
    ])).data.reason).toBe('hard-blocked');
    expect(auditHermesToolPolicy(response([
      { name: 'unexpected', enabled: true },
      { name: 'unexpected', enabled: true },
    ])).data.reason).toBe('duplicate');
    expect(auditHermesToolPolicy(response([
      { name: 'unexpected', enabled: true, tools: ['external.action'] },
    ])).data.accepted).toBe(false);
  });
});
