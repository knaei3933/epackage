"""Label agent entry point: poll loop + weekday 17:00 JST batch.

Run on the office Windows PC (see README.md). Requires .env with
SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / LABEL_PRINTER_URL.
"""

from __future__ import annotations

import logging
import os
import tempfile
import time
from datetime import date, datetime, time as dtime, timezone
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

from jobs import (
    BATCH_HOUR,
    JST,
    claim_job,
    create_batch_jobs,
    fetch_batch_destinations,
    fetch_pending_jobs,
    is_batch_candidate,
    mark_failed,
    mark_printed,
    requeue_stale_printing,
    run_due,
)
from label_renderer import render_label
from printer import print_label, validate_backend_config

load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
log = logging.getLogger("label-agent")

POLL_INTERVAL_SECONDS = 60


def process_pending(sb) -> None:
    """Claim and print every pending job, then persist the outcome."""
    for job in fetch_pending_jobs(sb):
        job_id = job["id"]
        dest = job["destination"]
        request_number = (dest.get("request") or {}).get("request_number", "?")
        if not claim_job(sb, job_id, current_attempts=job.get("attempts", 0)):
            continue  # claimed elsewhere / no longer pending
        log.info("printing job=%s dest=%s (%s)", job_id, dest["id"], request_number)

        fd, tmp_name = tempfile.mkstemp(prefix=f"label_{job_id[:8]}_", suffix=".png")
        os.close(fd)
        out = Path(tmp_name)
        try:
            render_label(
                dest.get("postal_code"),
                dest["address"],
                dest.get("company_name"),
                dest["contact_person"],
                out,
            )
            result = print_label(out)
            if result.ok:
                # CAS printing -> printed (no-op when requeued meanwhile)
                if mark_printed(sb, job_id):
                    log.info("printed job=%s attempts=%s", job_id, result.attempts)
                else:
                    log.warning("job=%s printed but was requeued concurrently", job_id)
            else:
                if mark_failed(sb, job_id, result.error or "unknown"):
                    log.warning("failed job=%s attempts=%s err=%s",
                                job_id, result.attempts, result.error)
                else:
                    log.warning("job=%s failure persisted after concurrent requeue", job_id)
        except Exception as exc:  # noqa: BLE001 - persist any failure
            mark_failed(sb, job_id, str(exc))
            log.exception("job=%s crashed: %s", job_id, exc)
        finally:
            out.unlink(missing_ok=True)  # PII label images never linger


def _today_cutoff_utc(now: datetime) -> datetime:
    """Today's 17:00 JST as UTC (batch intake cutoff, F5 boundary)."""
    jst_now = now.astimezone(JST)
    cutoff_jst = datetime.combine(jst_now.date(), dtime(BATCH_HOUR), tzinfo=JST)
    return cutoff_jst.astimezone(timezone.utc)


def run_batch_if_due(sb, last_batch_date: date | None) -> date | None:
    """Create and process the 17:00 JST weekday batch. Returns updated marker."""
    now = datetime.now(timezone.utc)
    if not run_due(now.astimezone(JST), last_batch_date):
        return last_batch_date
    log.info("batch due (%s) - collecting destinations", now.astimezone(JST).isoformat())
    destinations = fetch_batch_destinations(sb)
    cutoff = _today_cutoff_utc(now)
    candidates = [d["id"] for d in destinations if is_batch_candidate(d, cutoff)]
    created = create_batch_jobs(sb, candidates)
    log.info("batch: %d destinations, %d jobs created", len(candidates), created)
    return now.astimezone(JST).date()


def main() -> None:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise SystemExit("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing (.env)")
    backend = validate_backend_config()  # fail fast with actionable message
    sb = create_client(url, key)
    log.info("label agent started (backend=%s, poll=%ss, batch=%02d:00 JST weekdays)",
             backend, POLL_INTERVAL_SECONDS, BATCH_HOUR)

    last_batch_date: date | None = None
    while True:
        try:
            requeue_stale_printing(sb, datetime.now(timezone.utc))
            last_batch_date = run_batch_if_due(sb, last_batch_date)
            process_pending(sb)
        except KeyboardInterrupt:
            log.info("stopped by user")
            break
        except Exception:  # noqa: BLE001 - keep the loop alive
            log.exception("loop error; retrying next interval")
        time.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
