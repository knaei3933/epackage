/**
 * Sample label print helpers (admin)
 *
 * Pure logic shared by /api/admin/samples and the reprint API.
 * Unit-tested in tests/unit/admin-sample-labels.spec.ts (U1/I3).
 */

export interface DestinationPrintState {
  id: string;
  company_name: string | null;
  contact_person: string;
  postal_code: string | null;
  address: string;
  label_prints: { status: string }[] | null;
}

export interface ReprintInsert {
  destination_id: string;
  source: 'reprint';
  requested_by: string;
}

/**
 * Build reprint insert payloads for a sample request's destinations.
 * Idempotent (I3): destinations that already have a pending job are skipped.
 */
export function buildReprintInserts(
  destinations: DestinationPrintState[],
  requestedBy: string
): { inserts: ReprintInsert[]; skipped: number } {
  const inserts: ReprintInsert[] = [];
  let skipped = 0;
  for (const dest of destinations) {
    // Skip any ACTIVE job (pending/printing): a printing job can be requeued
    // to pending by stale recovery, which would then coexist with the new
    // pending reprint (double print). printed/failed remain reprintable.
    const hasActive = (dest.label_prints ?? []).some(
      (p) => p.status === 'pending' || p.status === 'printing'
    );
    if (hasActive) {
      skipped += 1;
      continue;
    }
    inserts.push({ destination_id: dest.id, source: 'reprint', requested_by: requestedBy });
  }
  return { inserts, skipped };
}

/** Aggregate print status for one destination (admin list display). */
export function destinationPrintStatus(printStates: { status: string }[] | null): string {
  const statuses = (printStates ?? []).map((p) => p.status);
  if (statuses.includes('pending')) return 'pending';
  if (statuses.includes('printing')) return 'printing';
  if (statuses.length > 0 && statuses.every((s) => s === 'printed')) return 'printed';
  if (statuses.length > 0 && statuses.every((s) => s === 'failed')) return 'failed';
  if (statuses.length === 0) return 'unprinted';
  return 'partial';
}

export interface SampleRequestListRow {
  id: string;
  request_number: string;
  created_at: string;
  status: string;
  user_id: string | null;
  destinations: DestinationPrintState[] | null;
}

export interface SampleRequestListItem {
  id: string;
  requestNumber: string;
  createdAt: string;
  status: string;
  customerName: string | null;
  destinationCount: number;
  printSummary: string; // e.g. "1/3 printed"
  destinations: {
    id: string;
    companyName: string | null;
    contactPerson: string;
    printStatus: string;
  }[];
}

/** Transform a DB row + optional member name into the client list shape (U1). */
export function transformSampleRequestRow(
  row: SampleRequestListRow,
  memberName: string | null
): SampleRequestListItem {
  const destinations = row.destinations ?? [];
  const perDest = destinations.map((d) => ({
    id: d.id,
    companyName: d.company_name,
    contactPerson: d.contact_person,
    printStatus: destinationPrintStatus(d.label_prints),
  }));
  const printed = perDest.filter((d) => d.printStatus === 'printed').length;
  return {
    id: row.id,
    requestNumber: row.request_number,
    createdAt: row.created_at,
    status: row.status,
    customerName: memberName,
    destinationCount: perDest.length,
    printSummary: `${printed}/${perDest.length}`,
    destinations: perDest,
  };
}
