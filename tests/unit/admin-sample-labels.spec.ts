/**
 * Unit tests: sample label print helpers (U1/I3 in test spec)
 * - U1: transformSampleRequestRow payload correctness
 * - I3: buildReprintInserts idempotency (pending skip)
 */

import {
  buildReprintInserts,
  destinationPrintStatus,
  transformSampleRequestRow,
  type SampleRequestListRow,
} from '@/lib/admin/sample-labels';

describe('buildReprintInserts (I3 idempotency)', () => {
  const requestedBy = 'admin-uuid-1';

  it('creates inserts for destinations without prints', () => {
    const dests = [
      { id: 'd1', company_name: null, contact_person: '山田', postal_code: null, address: 'a', label_prints: [] },
      { id: 'd2', company_name: null, contact_person: '鈴木', postal_code: null, address: 'b', label_prints: null },
    ];
    const { inserts, skipped } = buildReprintInserts(dests, requestedBy);
    expect(inserts).toHaveLength(2);
    expect(inserts[0]).toEqual({ destination_id: 'd1', source: 'reprint', requested_by: requestedBy });
    expect(skipped).toBe(0);
  });

  it('skips destinations that already have a pending job', () => {
    const dests = [
      { id: 'd1', company_name: null, contact_person: '山田', postal_code: null, address: 'a', label_prints: [{ status: 'pending' }] },
      { id: 'd2', company_name: null, contact_person: '鈴木', postal_code: null, address: 'b', label_prints: [{ status: 'printed' }] },
    ];
    const { inserts, skipped } = buildReprintInserts(dests, requestedBy);
    expect(inserts).toHaveLength(1);
    expect(inserts[0].destination_id).toBe('d2');
    expect(skipped).toBe(1);
  });

  it('skips destinations with an in-flight printing job (BLOCKER fix: requeue race)', () => {
    const dests = [
      { id: 'd1', company_name: null, contact_person: '山田', postal_code: null, address: 'a', label_prints: [{ status: 'printing' }] },
    ];
    const { inserts, skipped } = buildReprintInserts(dests, requestedBy);
    expect(inserts).toHaveLength(0);
    expect(skipped).toBe(1);
  });

  it('allows reprinting printed/failed destinations (reprint semantics)', () => {
    const dests = [
      { id: 'd1', company_name: null, contact_person: '山田', postal_code: null, address: 'a', label_prints: [{ status: 'printed' }, { status: 'failed' }] },
    ];
    const { inserts } = buildReprintInserts(dests, requestedBy);
    expect(inserts).toHaveLength(1);
  });
});

describe('destinationPrintStatus', () => {
  it.each([
    [null, 'unprinted'],
    [[], 'unprinted'],
    [[{ status: 'pending' }], 'pending'],
    [[{ status: 'printed' }], 'printed'],
    [[{ status: 'failed' }], 'failed'],
    [[{ status: 'printed' }, { status: 'failed' }], 'partial'],
  ])('%j -> %s', (prints, expected) => {
    expect(destinationPrintStatus(prints as { status: string }[] | null)).toBe(expected);
  });
});

describe('transformSampleRequestRow (U1)', () => {
  const baseRow: SampleRequestListRow = {
    id: 'req-1',
    request_number: 'SMP-2026-0001',
    created_at: '2026-09-04T01:00:00Z',
    status: 'received',
    user_id: 'user-1',
    destinations: [
      { id: 'd1', company_name: '株式会社A', contact_person: '山田太郎', postal_code: '100-0001', address: '東京', label_prints: [{ status: 'printed' }] },
      { id: 'd2', company_name: null, contact_person: '鈴木花子', postal_code: null, address: '大阪', label_prints: null },
    ],
  };

  it('maps row + member name to list item', () => {
    const item = transformSampleRequestRow(baseRow, '山田太郎');
    expect(item.requestNumber).toBe('SMP-2026-0001');
    expect(item.customerName).toBe('山田太郎');
    expect(item.destinationCount).toBe(2);
    expect(item.printSummary).toBe('1/2');
    expect(item.destinations[0].printStatus).toBe('printed');
    expect(item.destinations[1].printStatus).toBe('unprinted');
  });

  it('guest rows have null customerName', () => {
    const item = transformSampleRequestRow({ ...baseRow, user_id: null }, null);
    expect(item.customerName).toBeNull();
  });
});
