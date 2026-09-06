"""Unit tests for batch decision logic (U3 in the test spec)."""

from datetime import date, datetime, timedelta, timezone

from jobs import (
    claim_job,
    fetch_pending_jobs,
    is_batch_candidate,
    is_stale_printing,
    mark_printed,
    previous_weekday_cutoff_utc,
    run_due,
)

JST = timezone(timedelta(hours=9))
UTC = timezone.utc

# Fixed window: previous weekday cutoff Fri 2026-09-04 17:00 JST (= 08:00 UTC)
#                 today cutoff      Tue 2026-09-08 17:00 JST (= 08:00 UTC)
CUTOFF = datetime(2026, 9, 8, 8, 0, tzinfo=UTC)
LOWER = datetime(2026, 9, 4, 8, 0, tzinfo=UTC)


def _dest(prints, created_at="2026-09-08T05:00:00+00:00"):
    # 2026-09-08T05:00Z = Tue 14:00 JST -> inside [Fri17:00, Tue17:00) window
    return {"id": "d1", "request": {"created_at": created_at}, "label_prints": prints}


def test_candidate_when_no_prints():
    assert is_batch_candidate(_dest(None), CUTOFF, LOWER) is True
    assert is_batch_candidate(_dest([]), CUTOFF, LOWER) is True


def test_not_candidate_when_printed():
    assert is_batch_candidate(_dest([{"status": "printed"}]), CUTOFF, LOWER) is False


def test_not_candidate_when_pending():
    assert is_batch_candidate(_dest([{"status": "pending"}]), CUTOFF, LOWER) is False


def test_not_candidate_when_printing():
    assert is_batch_candidate(_dest([{"status": "printing"}]), CUTOFF, LOWER) is False


def test_candidate_when_all_failed():
    dest = _dest([{"status": "failed"}, {"status": "failed"}])
    assert is_batch_candidate(dest, CUTOFF, LOWER) is True


def test_not_candidate_when_mixed_failed_printed():
    dest = _dest([{"status": "failed"}, {"status": "printed"}])
    assert is_batch_candidate(dest, CUTOFF, LOWER) is False


def test_not_candidate_when_created_after_cutoff():
    # 17:01 JST intake must NOT be batch-printed even if the agent restarts.
    late = datetime.fromisoformat("2026-09-08T08:01:00+00:00")
    dest = _dest([], created_at=late.isoformat())
    assert is_batch_candidate(dest, CUTOFF, LOWER) is False


def test_candidate_when_created_just_before_cutoff():
    just_before = "2026-09-08T07:59:59+00:00"
    assert is_batch_candidate(_dest([], created_at=just_before), CUTOFF, LOWER) is True


def test_not_candidate_when_created_at_missing():
    assert is_batch_candidate({"id": "d1", "label_prints": []}, CUTOFF, LOWER) is False


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


# --- first-run backfill guard (previous weekday lower bound) ---

def test_not_candidate_when_created_before_lower_bound():
    hist = _dest([], created_at="2026-09-01T00:00:00+00:00")
    assert is_batch_candidate(hist, CUTOFF, LOWER) is False


def test_candidate_when_created_between_bounds():
    sun = _dest([], created_at="2026-09-06T03:00:00+00:00")  # Sun 12:00 JST
    assert is_batch_candidate(sun, CUTOFF, LOWER) is True


def test_not_candidate_exactly_at_lower_bound():
    at_lower = _dest([], created_at="2026-09-04T08:00:00+00:00")
    # exactly at Friday 17:00.000: NOT covered by Friday's batch (created<cutoff
    # is exclusive at that instant) -> belongs to the next window (inclusive).
    assert is_batch_candidate(at_lower, CUTOFF, LOWER) is True


def test_previous_weekday_cutoff_from_monday():
    mon = datetime(2026, 9, 7, 8, 0, tzinfo=UTC)
    assert previous_weekday_cutoff_utc(mon) == datetime(2026, 9, 4, 8, 0, tzinfo=UTC)


def test_previous_weekday_cutoff_from_tuesday():
    tue = datetime(2026, 9, 8, 8, 0, tzinfo=UTC)
    assert previous_weekday_cutoff_utc(tue) == datetime(2026, 9, 7, 8, 0, tzinfo=UTC)


def test_previous_weekday_cutoff_from_saturday():
    sat = datetime(2026, 9, 5, 8, 0, tzinfo=UTC)
    assert previous_weekday_cutoff_utc(sat) == datetime(2026, 9, 4, 8, 0, tzinfo=UTC)


class _FakeTable:
    def __init__(self, job):
        self.job = job
        self.conditions = []

    def select(self, _columns):
        return self

    def update(self, values):
        self.next_values = values
        return self

    def eq(self, field, value):
        self.conditions.append((field, value))
        return self

    def order(self, _field, **_options):
        return self

    def execute(self):
        if hasattr(self, "next_values"):
            if all(self.job.get(field) == value for field, value in self.conditions):
                self.job.update(self.next_values)
                self.data = [self.job]
            else:
                self.data = []
        else:
            self.data = [self.job] if self.job["status"] == "pending" else []
        return self


def test_L03_agent_claims_printable_job_and_marks_it_printed():
    job = {
        "id": "label-job-1",
        "attempts": 2,
        "status": "pending",
        "destination": {
            "id": "destination-1",
            "postal_code": "100-0001",
            "address": "東京都千代田区千代田1-1",
            "company_name": "株式会社サンプル",
            "contact_person": "山田 太郎",
        },
    }
    sb = type("FakeSupabase", (), {"table": lambda _self, _name: _FakeTable(job)})()

    pending_jobs = fetch_pending_jobs(sb)
    assert len(pending_jobs) == 1
    assert pending_jobs[0]["destination"]["contact_person"] == "山田 太郎"
    assert claim_job(sb, "label-job-1", current_attempts=2) is True
    assert job["status"] == "printing"
    assert job["attempts"] == 3
    assert mark_printed(sb, "label-job-1") is True
    assert job["status"] == "printed"
    assert claim_job(sb, "label-job-1") is False
    assert mark_printed(sb, "label-job-1") is False
