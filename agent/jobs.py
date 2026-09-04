"""DB job operations for the label agent (Supabase).

Pure decision logic (batch candidates, schedule due, stale detection) is kept
separate from thin Supabase wrappers so the logic is unit-testable.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

JST = timezone(timedelta(hours=9))
BATCH_HOUR = 17  # weekdays 17:00 JST (deep-interview Round 12, binding)
BATCH_WEEKDAYS = {0, 1, 2, 3, 4}  # Mon-Fri
STALE_PRINTING_TIMEOUT = timedelta(minutes=10)


# ---------------------------------------------------------------------------
# Pure logic (unit-tested)
# ---------------------------------------------------------------------------

def is_batch_candidate(destination: dict[str, Any], cutoff_utc: datetime) -> bool:
    """True when the destination has no printed/pending/printing job.

    Batch semantics (PRD D2/D3): a destination is eligible when it has no
    label_prints rows at all, or when every row is 'failed' (retry the whole
    failed set). This naturally covers the Fri->Mon weekend gap.

    F5 boundary (BLOCKER fix): only requests created before today's 17:00 JST
    cutoff are eligible, so an agent restart after 17:00 never batch-prints
    after-cutoff intake.
    """
    prints = destination.get("label_prints") or []
    has_active = any(p.get("status") in ("pending", "printing", "printed") for p in prints)
    if has_active:
        return False
    request = destination.get("request") or {}
    created_at = request.get("created_at")
    if not created_at:
        return False  # cannot prove intake time -> defer to a later batch
    try:
        created = datetime.fromisoformat(str(created_at))
    except ValueError:
        return False
    if created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    return created < cutoff_utc


def run_due(now_jst: datetime, last_batch_date) -> bool:
    """True when the 17:00 JST weekday batch should run now."""
    if now_jst.weekday() not in BATCH_WEEKDAYS:
        return False
    if now_jst.hour < BATCH_HOUR:
        return False
    return last_batch_date != now_jst.date()


def is_stale_printing(started_at: datetime | None, now_utc: datetime) -> bool:
    """True when a 'printing' job has been stuck longer than the timeout."""
    if started_at is None:
        return True
    if started_at.tzinfo is None:
        started_at = started_at.replace(tzinfo=timezone.utc)
    return (now_utc - started_at) > STALE_PRINTING_TIMEOUT


# ---------------------------------------------------------------------------
# Thin Supabase wrappers (integration-verified, not unit-tested)
# ---------------------------------------------------------------------------

def fetch_pending_jobs(sb) -> list[dict[str, Any]]:
    """Pending print jobs joined with destination + request number."""
    res = (
        sb.table("label_prints")
        .select(
            "id, source, attempts, destination_id,"
            "destination:sample_request_destinations!inner("
            "  id, postal_code, address, company_name, contact_person,"
            "  request:sample_requests!inner(request_number))"
        )
        .eq("status", "pending")
        .order("created_at")
        .execute()
    )
    return res.data or []


def claim_job(sb, job_id: str, current_attempts: int = 0) -> bool:
    """Atomically move pending -> printing (persists attempts+1 on claim).

    False if another worker got it.
    """
    now = datetime.now(timezone.utc).isoformat()
    res = (
        sb.table("label_prints")
        .update({"status": "printing", "started_at": now, "attempts": current_attempts + 1})
        .eq("id", job_id)
        .eq("status", "pending")
        .execute()
    )
    return bool(res.data)


def mark_printed(sb, job_id: str) -> bool:
    """CAS printing -> printed. False when the job was requeued meanwhile."""
    res = sb.table("label_prints").update(
        {"status": "printed", "printed_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", job_id).eq("status", "printing").execute()
    return bool(res.data)


def mark_failed(sb, job_id: str, reason: str) -> bool:
    """CAS printing -> failed. False when the job was requeued meanwhile."""
    res = sb.table("label_prints").update(
        {"status": "failed", "failure_reason": reason[:500]}
    ).eq("id", job_id).eq("status", "printing").execute()
    return bool(res.data)


def requeue_stale_printing(sb, now_utc: datetime) -> int:
    """Requeue 'printing' jobs stuck beyond the timeout (agent crash recovery)."""
    cutoff = (now_utc - STALE_PRINTING_TIMEOUT).isoformat()
    res = (
        sb.table("label_prints")
        .update({"status": "pending", "started_at": None})
        .eq("status", "printing")
        .or_(f"started_at.is.null,started_at.lt.{cutoff}")  # null started_at also stale
        .execute()
    )
    return len(res.data or [])


def fetch_batch_destinations(sb) -> list[dict[str, Any]]:
    """All destinations with their label_prints statuses (client-side filter)."""
    res = (
        sb.table("sample_request_destinations")
        .select("id, request:sample_requests(created_at), label_prints(status)")
        .execute()
    )
    return res.data or []


def create_batch_jobs(sb, destination_ids: list[str]) -> int:
    """Insert pending batch jobs; unique pending index dedupes races."""
    created = 0
    for did in destination_ids:
        try:
            res = (
                sb.table("label_prints")
                .insert({"destination_id": did, "source": "batch"})
                .execute()
            )
            created += len(res.data or [])
        except Exception as exc:  # noqa: BLE001
            # Grounded fail-safe at the DB constraint boundary: only treat
            # unique violations (23505) as "already pending"; re-raise the rest
            # so real errors are not masked.
            if "23505" in str(getattr(exc, "code", "")) or "duplicate key" in str(exc).lower():
                continue
            raise
    return created
