"""Printer adapter: prints label PNGs via brother-ql-next CLI (GPL isolation).

The brother-ql CLI is invoked as a *subprocess* so this project is not a
derivative work of the GPL library. Transport: raw TCP 9100 to the printer
(officially supported per Brother User's Guide p.187, Custom Raw Port).
"""

from __future__ import annotations

import os
import shutil
import subprocess
import time
from dataclasses import dataclass
from pathlib import Path

BROTHER_MODEL = os.environ.get("LABEL_PRINTER_MODEL", "QL-820NWB")
LABEL_SIZE = "62"  # 62mm continuous

MAX_ATTEMPTS = 3
RETRY_BACKOFF_SECONDS = 5


class PrinterNotConfigured(RuntimeError):
    """LABEL_PRINTER_URL is missing or the brother_ql binary is absent."""


@dataclass
class PrintResult:
    ok: bool
    attempts: int
    error: str | None = None


def _printer_url() -> str:
    url = os.environ.get("LABEL_PRINTER_URL", "").strip()
    return url


def build_print_command(image_path: Path) -> list[str]:
    """Build the brother_ql CLI invocation (subprocess boundary for GPL)."""
    url = _printer_url()
    if not url:
        raise PrinterNotConfigured("LABEL_PRINTER_URL is not set (e.g. tcp://192.168.1.50:9100)")
    exe = shutil.which("brother_ql")
    if not exe:
        raise PrinterNotConfigured("brother_ql CLI not found on PATH (pip install brother-ql-next)")
    return [
        exe,
        "--backend", "network",
        "--model", BROTHER_MODEL,
        "--printer", url,
        "print",
        "--label", LABEL_SIZE,
        str(image_path),
    ]


def print_label(image_path: str | os.PathLike[str],
                max_attempts: int = MAX_ATTEMPTS) -> PrintResult:
    """Print one label image with retry. Never raises for printer failures;
    returns a PrintResult so the caller can persist printed/failed state."""
    img = Path(image_path)
    if not img.exists():
        return PrintResult(ok=False, attempts=0, error=f"image not found: {img}")

    last_error = ""
    attempts = 0
    try:
        cmd = build_print_command(img)
    except PrinterNotConfigured as exc:
        return PrintResult(ok=False, attempts=0, error=str(exc))

    while attempts < max_attempts:
        attempts += 1
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if proc.returncode == 0:
            return PrintResult(ok=True, attempts=attempts)
        last_error = (proc.stderr or proc.stdout or "").strip()[-500:]
        if attempts < max_attempts:
            time.sleep(RETRY_BACKOFF_SECONDS * attempts)

    return PrintResult(ok=False, attempts=attempts, error=last_error or "unknown error")
