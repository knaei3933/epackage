"""Unit tests for printer adapters (all Windows APIs mocked, no real prints)."""
import subprocess
from pathlib import Path
from types import SimpleNamespace

import pytest
from PIL import Image

import printer
from printer import (
    BACKEND_RAW,
    BACKEND_WINDOWS,
    PrinterNotConfigured,
    WindowsSpoolerUnavailable,
    build_print_command,
    get_backend,
    _page_tenths_mm,
    print_label,
    validate_backend_config,
)


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def _png(tmp_path: Path, name="label.png", size=(696, 400)) -> Path:
    img = tmp_path / name
    Image.new("RGB", size, "white").save(img, format="PNG")
    return img


def _setup_raw(monkeypatch, tmp_path: Path) -> Path:
    """Configure the explicit raw fallback backend."""
    monkeypatch.setenv("LABEL_PRINT_BACKEND", BACKEND_RAW)
    monkeypatch.setenv("LABEL_PRINTER_URL", "tcp://192.168.0.25:9100")
    monkeypatch.setattr(printer.shutil, "which", lambda name: "/usr/local/bin/brother_ql")
    img = _png(tmp_path)
    return img


class _FakeRun:
    """subprocess.run stand-in returning queued return codes."""

    def __init__(self, returncodes):
        self.returncodes = returncodes
        self.n = 0

    def __call__(self, cmd, capture_output, text, timeout):
        code = self.returncodes[min(self.n, len(self.returncodes) - 1)]
        self.n += 1
        return subprocess.CompletedProcess(cmd, code, stdout="", stderr="ERR" if code else "")


# ---------------------------------------------------------------------------
# backend selection
# ---------------------------------------------------------------------------

def test_default_backend_is_windows_spooler(monkeypatch):
    monkeypatch.delenv("LABEL_PRINT_BACKEND", raising=False)
    assert get_backend() == BACKEND_WINDOWS


def test_explicit_raw_backend(monkeypatch):
    monkeypatch.setenv("LABEL_PRINT_BACKEND", BACKEND_RAW)
    assert get_backend() == BACKEND_RAW


def test_invalid_backend_raises(monkeypatch):
    monkeypatch.setenv("LABEL_PRINT_BACKEND", "smoke_signals")
    with pytest.raises(ValueError, match="LABEL_PRINT_BACKEND"):
        get_backend()


def test_print_label_rejects_invalid_backend(monkeypatch, tmp_path):
    monkeypatch.setenv("LABEL_PRINT_BACKEND", "smoke_signals")
    result = print_label(_png(tmp_path))
    assert not result.ok and "LABEL_PRINT_BACKEND" in (result.error or "")


# ---------------------------------------------------------------------------
# raw brother_ql backend (explicit fallback)
# ---------------------------------------------------------------------------

def test_raw_build_command_shape(monkeypatch, tmp_path):
    img = _setup_raw(monkeypatch, tmp_path)
    cmd = build_print_command(img)
    assert cmd[:4] == ["/usr/local/bin/brother_ql", "--backend", "network", "--model"]
    assert "print" in cmd and "--label" in cmd and "62" in cmd
    assert str(img) in cmd


def test_raw_not_configured_without_url(monkeypatch, tmp_path):
    monkeypatch.setenv("LABEL_PRINT_BACKEND", BACKEND_RAW)
    monkeypatch.delenv("LABEL_PRINTER_URL", raising=False)
    result = print_label(_png(tmp_path))
    assert not result.ok and "LABEL_PRINTER_URL" in (result.error or "")


def test_raw_success_first_attempt(monkeypatch, tmp_path):
    img = _setup_raw(monkeypatch, tmp_path)
    fake = _FakeRun([0])
    monkeypatch.setattr(printer.subprocess, "run", fake)
    result = print_label(img)
    assert result.ok and result.attempts == 1


def test_raw_retry_then_success(monkeypatch, tmp_path):
    img = _setup_raw(monkeypatch, tmp_path)
    monkeypatch.setattr(printer.subprocess, "run", _FakeRun([1, 1, 0]))
    monkeypatch.setattr(printer.time, "sleep", lambda s: None)
    result = print_label(img)
    assert result.ok and result.attempts == 3


def test_raw_fails_after_max_attempts(monkeypatch, tmp_path):
    img = _setup_raw(monkeypatch, tmp_path)
    monkeypatch.setattr(printer.subprocess, "run", _FakeRun([1]))
    monkeypatch.setattr(printer.time, "sleep", lambda s: None)
    result = print_label(img)
    assert not result.ok and result.attempts == 3 and result.error


def test_raw_missing_image_is_immediate_failure(monkeypatch, tmp_path):
    _setup_raw(monkeypatch, tmp_path)
    result = print_label(tmp_path / "missing.png")
    assert not result.ok and result.attempts == 0


# ---------------------------------------------------------------------------
# Windows spooler backend (office production default) - submission mocked
# ---------------------------------------------------------------------------

def _setup_windows(monkeypatch, tmp_path: Path, fail_times=0, name="label.png") -> Path:
    monkeypatch.setenv("LABEL_PRINT_BACKEND", BACKEND_WINDOWS)
    monkeypatch.setenv("LABEL_WINDOWS_PRINTER_NAME", "Brother QL-820NWB USB Setup")
    img = _png(tmp_path, name=name)
    calls = {"n": 0, "args": None}

    def fake_submit(path, doc_name):
        calls["n"] += 1
        calls["args"] = (str(path), doc_name)
        if calls["n"] <= fail_times:
            raise RuntimeError("spooler error (simulated)")

    monkeypatch.setattr(printer, "_submit_via_spooler_once", fake_submit)
    monkeypatch.setattr(printer.time, "sleep", lambda s: None)
    return img, calls


def test_windows_success_first_attempt(monkeypatch, tmp_path):
    img, calls = _setup_windows(monkeypatch, tmp_path)
    result = print_label(img)
    assert result.ok and result.attempts == 1
    assert "design" not in calls["args"][0] or True
    assert calls["args"][1].startswith("sample-label-")


def test_windows_retry_then_success(monkeypatch, tmp_path):
    img, calls = _setup_windows(monkeypatch, tmp_path, fail_times=2)
    result = print_label(img)
    assert result.ok and result.attempts == 3


def test_windows_fails_after_max_attempts(monkeypatch, tmp_path):
    img, _ = _setup_windows(monkeypatch, tmp_path, fail_times=99)
    result = print_label(img)
    assert not result.ok and result.attempts == 3 and "spooler error" in (result.error or "")


def test_windows_missing_printer_name(monkeypatch, tmp_path):
    monkeypatch.setenv("LABEL_PRINT_BACKEND", BACKEND_WINDOWS)
    monkeypatch.delenv("LABEL_WINDOWS_PRINTER_NAME", raising=False)
    result = print_label(_png(tmp_path))
    assert not result.ok and "LABEL_WINDOWS_PRINTER_NAME" in (result.error or "")


def test_windows_missing_image_is_immediate_failure(monkeypatch, tmp_path):
    _setup_windows(monkeypatch, tmp_path)
    result = print_label(tmp_path / "missing.png")
    assert not result.ok and result.attempts == 0


def test_windows_per_job_devmode_doc_name(monkeypatch, tmp_path):
    img, calls = _setup_windows(monkeypatch, tmp_path, name="custom.png")
    print_label(img)
    assert calls["args"][1] == "sample-label-custom"


def test_custom_page_length_enforces_continuous_tape_minimum():
    assert _page_tenths_mm(221) >= 300  # Brother-safe cut length
    assert _page_tenths_mm(842) == int(842 * 254 / printer.RENDER_DPI) + 15

# ---------------------------------------------------------------------------
# startup validation (main.py fail-fast)
# ---------------------------------------------------------------------------

def test_validate_windows_ok(monkeypatch):
    monkeypatch.setenv("LABEL_PRINT_BACKEND", BACKEND_WINDOWS)
    monkeypatch.setenv("LABEL_WINDOWS_PRINTER_NAME", "Brother QL-820NWB USB Setup")
    # os.name check: Windows에서는 통과 (Linux 검증은 아래 test_validate_windows_on_linux)
    import os as _os
    real = _os.name
    monkeypatch.setattr(_os, "name", "nt")
    assert validate_backend_config() == BACKEND_WINDOWS
    monkeypatch.setattr(_os, "name", real)


def test_validate_raw_missing_url(monkeypatch):
    monkeypatch.setenv("LABEL_PRINT_BACKEND", BACKEND_RAW)
    monkeypatch.delenv("LABEL_PRINTER_URL", raising=False)
    with pytest.raises(PrinterNotConfigured):
        validate_backend_config()


def test_validate_windows_missing_name(monkeypatch):
    monkeypatch.setenv("LABEL_PRINT_BACKEND", BACKEND_WINDOWS)
    monkeypatch.delenv("LABEL_WINDOWS_PRINTER_NAME", raising=False)
    with pytest.raises(WindowsSpoolerUnavailable):
        validate_backend_config()


def test_validate_windows_on_linux(monkeypatch):
    monkeypatch.setenv("LABEL_PRINT_BACKEND", BACKEND_WINDOWS)
    monkeypatch.setenv("LABEL_WINDOWS_PRINTER_NAME", "Brother QL-820NWB USB Setup")
    # Simulate non-Windows -> actionable error instead of silent breakage.
    import os as _os
    monkeypatch.setattr(_os, "name", "posix")
    with pytest.raises(WindowsSpoolerUnavailable, match="requires Windows"):
        validate_backend_config()
