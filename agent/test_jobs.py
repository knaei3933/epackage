"""Unit tests for batch decision logic (U3 in the test spec)."""

from datetime import date, datetime, timedelta, timezone

from jobs import is_batch_candidate, is_stale_printing, run_due

JST = timezone(timedelta(hours=9))
UTC = timezone.utc

# Fixed cutoff: 2026-09-08 17:00 JST = 08:00 UTC
CUTOFF = datetime(2026, 9, 8, 8, 0, tzinfo=UTC)


def _dest(prints, created_at="2026-09-08T05:00:00+00:00"):
    return {"id": "d1", "request": {"created_at": created_at}, "label_prints": prints}


def test_candidate_when_no_prints():
    assert is_batch_candidate(_dest(None), CUTOFF) is True
    assert is_batch_candidate(_dest([]), CUTOFF) is True


def test_not_candidate_when_printed():
    assert is_batch_candidate(_dest([{"status": "printed"}]), CUTOFF) is False


def test_not_candidate_when_pending():
    assert is_batch_candidate(_dest([{"status": "pending"}]), CUTOFF) is False


def test_not_candidate_when_printing():
    assert is_batch_candidate(_dest([{"status": "printing"}]), CUTOFF) is False


def test_candidate_when_all_failed():
    dest = _dest([{"status": "failed"}, {"status": "failed"}])
    assert is_batch_candidate(dest, CUTOFF) is True


def test_not_candidate_when_mixed_failed_printed():
    dest = _dest([{"status": "failed"}, {"status": "printed"}])
    assert is_batch_candidate(dest, CUTOFF) is False


def test_not_candidate_when_created_after_cutoff():
    # 17:01 JST intake must NOT be batch-printed even if the agent restarts.
    late = datetime.fromisoformat("2026-09-08T08:01:00+00:00")
    dest = _dest([], created_at=late.isoformat())
    assert is_batch_candidate(dest, CUTOFF) is False


def test_candidate_when_created_just_before_cutoff():
    just_before = "2026-09-08T07:59:59+00:00"
    assert is_batch_candidate(_dest([], created_at=just_before), CUTOFF) is True


def test_not_candidate_when_created_at_missing():
    assert is_batch_candidate({"id": "d1", "label_prints": []}, CUTOFF) is False


# --- schedule due (weekday 17:00 JST, weekend boundary) ---

def test_run_due_at_1700_weekday():
    tue1700 = datetime(2026, 9, 8, 17, 0, tzinfo=JST)
    assert run_due(tue1700, last_batch_date=None) is True
    assert run_due(tue1700, last_batch_date=date(2026, 9, 7)) is True
    assert run_due(tue1700, last_batch_date=date(2026, 9, 8)) is False


def test_not_due_before_1700():
    tue1659 = datetime(2026, 9, 8, 16, 59, tzinfo=JST)
    assert run_due(tue1659, last_batch_date=None) is False


def test_weekend_never_runs():
    sat1700 = datetime(2026, 9, 5, 17, 0, tzinfo=JST)
    sun1200 = datetime(2026, 9, 6, 12, 0, tzinfo=JST)
    assert run_due(sat1700, last_batch_date=None) is False
    assert run_due(sun1200, last_batch_date=None) is False


def test_monday_covers_weekend_gap():
    mon1700 = datetime(2026, 9, 7, 17, 0, tzinfo=JST)
    assert run_due(mon1700, last_batch_date=date(2026, 9, 4)) is True


def test_run_due_after_1700_same_day_idempotent():
    tue1830 = datetime(2026, 9, 8, 18, 30, tzinfo=JST)
    assert run_due(tue1830, last_batch_date=date(2026, 9, 8)) is False


# --- stale printing recovery ---

def test_stale_after_10min():
    now = datetime(2026, 9, 8, 8, 0, tzinfo=UTC)
    started = now - timedelta(minutes=11)
    assert is_stale_printing(started, now) is True


def test_not_stale_within_10min():
    now = datetime(2026, 9, 8, 8, 0, tzinfo=UTC)
    started = now - timedelta(minutes=5)
    assert is_stale_printing(started, now) is False


def test_none_started_is_stale():
    now = datetime(2026, 9, 8, 8, 0, tzinfo=UTC)
    assert is_stale_printing(None, now) is True
