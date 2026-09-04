"""Unit tests for the printer adapter (subprocess mocked, no real printer)."""

import subprocess
from pathlib import Path

import printer
from printer import build_print_command, print_label


def _fake_run(returncodes: list[int]):
    calls = {"n": 0}

    def run(cmd, capture_output, text, timeout):
        code = returncodes[min(calls["n"], len(returncodes) - 1)]
        calls["n"] += 1
        return subprocess.CompletedProcess(cmd, code, stdout="", stderr="ERR" if code else "")

    run.calls = calls  # type: ignore[attr-defined]
    return run


def setup_env(monkeypatch, tmp_path: Path):
    monkeypatch.setenv("LABEL_PRINTER_URL", "tcp://192.168.1.50:9100")
    monkeypatch.setattr(printer.shutil, "which", lambda name: "/usr/local/bin/brother_ql")
    img = tmp_path / "label.png"
    img.write_bytes(b"png")
    return img


def test_build_command_shape(monkeypatch, tmp_path):
    img = setup_env(monkeypatch, tmp_path)
    cmd = build_print_command(img)
    assert cmd[:4] == ["/usr/local/bin/brother_ql", "--backend", "network", "--model"]
    assert "print" in cmd and "--label" in cmd and "62" in cmd
    assert str(img) in cmd


def test_not_configured_without_url(monkeypatch, tmp_path):
    monkeypatch.delenv("LABEL_PRINTER_URL", raising=False)
    img = tmp_path / "label.png"
    img.write_bytes(b"png")
    result = print_label(img)
    assert not result.ok and "LABEL_PRINTER_URL" in (result.error or "")


def test_success_first_attempt(monkeypatch, tmp_path):
    img = setup_env(monkeypatch, tmp_path)
    fake = _fake_run([0])
    monkeypatch.setattr(printer.subprocess, "run", fake)
    result = print_label(img)
    assert result.ok and result.attempts == 1


def test_retry_then_success(monkeypatch, tmp_path):
    img = setup_env(monkeypatch, tmp_path)
    fake = _fake_run([1, 1, 0])
    monkeypatch.setattr(printer.subprocess, "run", fake)
    monkeypatch.setattr(printer.time, "sleep", lambda s: None)
    result = print_label(img)
    assert result.ok and result.attempts == 3


def test_fails_after_max_attempts(monkeypatch, tmp_path):
    img = setup_env(monkeypatch, tmp_path)
    fake = _fake_run([1])
    monkeypatch.setattr(printer.subprocess, "run", fake)
    monkeypatch.setattr(printer.time, "sleep", lambda s: None)
    result = print_label(img)
    assert not result.ok and result.attempts == 3 and result.error


def test_missing_image_is_immediate_failure(monkeypatch, tmp_path):
    setup_env(monkeypatch, tmp_path)
    result = print_label(tmp_path / "missing.png")
    assert not result.ok and result.attempts == 0
