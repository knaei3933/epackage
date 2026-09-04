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
# Windows spooler backend (office production default) - all win32 APIs faked
# ---------------------------------------------------------------------------

class FakeDC:
    def __init__(self, caps, fail_times=0):
        self.caps = caps
        self.fail_times = fail_times
        self.calls = []

    def CreatePrinterDC(self, name):
        self.calls.append(("CreatePrinterDC", name))

    def GetDeviceCaps(self, cap):
        self.calls.append(("GetDeviceCaps", cap))
        return self.caps[cap]

    def StartDoc(self, doc):
        if self.fail_times > 0:
            self.fail_times -= 1
            raise RuntimeError("spooler error (simulated)")
        self.calls.append(("StartDoc", doc))

    def StartPage(self):
        self.calls.append(("StartPage",))

    def GetHandleOutput(self):
        return 4242

    def EndPage(self):
        self.calls.append(("EndPage",))

    def EndDoc(self):
        self.calls.append(("EndDoc",))

    def DeleteDC(self):
        self.calls.append(("DeleteDC",))


class FakeDib:
    drawn = None

    def __init__(self, img):
        FakeDib.drawn = None
        self.img = img

    def draw(self, handle, box):
        FakeDib.drawn = {"handle": handle, "box": box, "size": self.img.size}


def _setup_windows(monkeypatch, tmp_path: Path, caps=None, fail_times=0) -> Path:
    monkeypatch.setenv("LABEL_PRINT_BACKEND", BACKEND_WINDOWS)
    monkeypatch.setenv("LABEL_WINDOWS_PRINTER_NAME", "Brother QL-820NWB USB Setup")
    dc = FakeDC(caps or {printer.HORZRES: 696, printer.VERTRES: 2000}, fail_times=fail_times)
    win32print = SimpleNamespace(HORZRES=printer.HORZRES, VERTRES=printer.VERTRES)
    win32ui = SimpleNamespace(CreateDC=lambda: dc)
    imagewin = SimpleNamespace(Dib=FakeDib)
    monkeypatch.setattr(printer, "_load_windows_deps", lambda: (win32print, win32ui, imagewin))
    monkeypatch.setattr(printer.time, "sleep", lambda s: None)
    return _png(tmp_path)


def test_windows_success_first_attempt(monkeypatch, tmp_path):
    img = _setup_windows(monkeypatch, tmp_path)
    result = print_label(img)
    assert result.ok and result.attempts == 1
    drawn = FakeDib.drawn
    assert drawn is not None and drawn["handle"] == 4242
    # aspect-fit into the 696-wide page, top-aligned
    x, y, x2, y2 = drawn["box"]
    assert x2 - x <= 696 and y == 0
    assert x2 > x and y2 > y


def test_windows_retry_then_success(monkeypatch, tmp_path):
    img = _setup_windows(monkeypatch, tmp_path, fail_times=2)
    result = print_label(img)
    assert result.ok and result.attempts == 3


def test_windows_fails_after_max_attempts(monkeypatch, tmp_path):
    img = _setup_windows(monkeypatch, tmp_path, fail_times=99)
    result = print_label(img)
    assert not result.ok and result.attempts == 3 and "spooler error" in (result.error or "")


def test_windows_missing_printer_name(monkeypatch, tmp_path):
    monkeypatch.setenv("LABEL_PRINT_BACKEND", BACKEND_WINDOWS)
    monkeypatch.delenv("LABEL_WINDOWS_PRINTER_NAME", raising=False)
    result = print_label(_png(tmp_path))
    assert not result.ok and "LABEL_WINDOWS_PRINTER_NAME" in (result.error or "")


def test_windows_deps_missing(monkeypatch, tmp_path):
    monkeypatch.setenv("LABEL_PRINT_BACKEND", BACKEND_WINDOWS)
    monkeypatch.setenv("LABEL_WINDOWS_PRINTER_NAME", "Brother QL-820NWB USB Setup")

    def _raise():
        raise WindowsSpoolerUnavailable("pywin32 not available")

    monkeypatch.setattr(printer, "_load_windows_deps", _raise)
    result = print_label(_png(tmp_path))
    assert not result.ok and "pywin32" in (result.error or "")


def test_windows_missing_image_is_immediate_failure(monkeypatch, tmp_path):
    _setup_windows(monkeypatch, tmp_path)
    result = print_label(tmp_path / "missing.png")
    assert not result.ok and result.attempts == 0


# ---------------------------------------------------------------------------
# startup validation (main.py fail-fast)
# ---------------------------------------------------------------------------

def test_validate_windows_ok(monkeypatch):
    monkeypatch.setenv("LABEL_PRINT_BACKEND", BACKEND_WINDOWS)
    monkeypatch.setenv("LABEL_WINDOWS_PRINTER_NAME", "Brother QL-820NWB USB Setup")
    win32print = SimpleNamespace(HORZRES=8, VERTRES=10)
    monkeypatch.setattr(
        printer, "_load_windows_deps",
        lambda: (win32print, SimpleNamespace(), SimpleNamespace(Dib=object)),
    )
    assert validate_backend_config() == BACKEND_WINDOWS


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
