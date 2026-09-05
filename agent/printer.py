"""Printer adapters for the label agent.

Two print backends, selected by LABEL_PRINT_BACKEND:

- windows_spooler (office production default):
    Submits the already-rendered PNG through the official Brother Windows
    driver queue (GDI spooler). Verified working on the real QL-820NWB
    (DK-2205 62mm roll) where raw TCP fails on-printer with
    "Wrong Roll Type / Check the print data and try again".
- brother_ql_raw (explicit optional fallback):
    brother-ql-next CLI subprocess over raw TCP 9100 (GPL isolation).
    Kept for diagnostics/hardware where raw raster works; NOT the office
    default (see 2026-09-05 office verification).
"""

from __future__ import annotations

import logging
import os
import shutil
import subprocess
import time
from dataclasses import dataclass
from pathlib import Path

log = logging.getLogger("label-agent.printer")

BACKEND_WINDOWS = "windows_spooler"
BACKEND_RAW = "brother_ql_raw"
VALID_BACKENDS = (BACKEND_WINDOWS, BACKEND_RAW)
DEFAULT_BACKEND = BACKEND_WINDOWS  # office default (raw TCP failed on real HW)

FORM_WIDTH_TENTHS_MM = 589  # 62mm-roll printable form (verified working in F2/F4)
MIN_PAGE_LENGTH_TENTHS_MM = 300  # 25.4mm continuous-tape safety minimum
LABEL_WIDTH_PX = 696  # 58.9mm printable width @300dpi

BROTHER_MODEL = os.environ.get("LABEL_PRINTER_MODEL", "QL-820NWB")
LABEL_SIZE = "62"  # 62mm continuous (raw backend only)

MAX_ATTEMPTS = 3
RETRY_BACKOFF_SECONDS = 5

# win32print GDI device-cap constants (fallback values match win32print)
HORZRES = 8   # printable width (device pixels)
VERTRES = 10  # printable height (device pixels)

RENDER_DPI = 300  # label_renderer renders at 300 dpi


class PrinterNotConfigured(RuntimeError):
    """LABEL_PRINTER_URL is missing or the brother_ql binary is absent."""


class WindowsSpoolerUnavailable(RuntimeError):
    """pywin32 is missing (non-Windows) or the Windows queue is not configured."""


@dataclass
class PrintResult:
    ok: bool
    attempts: int
    error: str | None = None


def get_backend() -> str:
    """Resolve LABEL_PRINT_BACKEND. Office default: windows_spooler."""
    backend = os.environ.get("LABEL_PRINT_BACKEND", DEFAULT_BACKEND).strip().lower()
    if backend not in VALID_BACKENDS:
        raise ValueError(
            f"LABEL_PRINT_BACKEND must be one of {VALID_BACKENDS}, got: {backend!r}"
        )
    return backend


# ---------------------------------------------------------------------------
# brother_ql raw TCP backend (explicit fallback, unchanged behavior)
# ---------------------------------------------------------------------------

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


def _print_raw_once(cmd: list[str], image_path: Path) -> tuple[bool, str]:
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if proc.returncode == 0:
        return True, ""
    return False, (proc.stderr or proc.stdout or "").strip()[-500:]


# ---------------------------------------------------------------------------
# Windows spooler backend (office production default)
# ---------------------------------------------------------------------------

def _load_windows_deps():
    """Lazy-import Windows print modules so Linux imports/tests still work."""
    try:
        import win32print  # type: ignore[import-untyped]
        import win32ui  # type: ignore[import-untyped]
        from PIL import ImageWin  # type: ignore[import-untyped]
    except ImportError as exc:
        raise WindowsSpoolerUnavailable(
            "Windows print modules unavailable "
            f"({exc}). Install on the office Windows PC: pip install pywin32"
        ) from exc
    return win32print, win32ui, ImageWin


def _page_tenths_mm(height_px: int, buffer_tenths: int = 15) -> int:
    """Convert rendered height (px @300dpi) to DEVMODE tenths-of-mm, +buffer."""
    return max(MIN_PAGE_LENGTH_TENTHS_MM,
               int(height_px * 254 / RENDER_DPI) + buffer_tenths)


def _windows_printer_name() -> str:
    name = os.environ.get("LABEL_WINDOWS_PRINTER_NAME", "").strip()
    if not name:
        raise WindowsSpoolerUnavailable(
            "LABEL_WINDOWS_PRINTER_NAME is not set "
            "(e.g. 'Brother QL-820NWB USB Setup')"
        )
    return name


def _submit_via_spooler_once(image_path: Path, doc_name: str) -> None:
    """One spooler submission through the official Brother driver queue.

    PROVEN path (F2/F4 prints succeeded): SetPrinter adjusts the queue page
    size (62mm x content length), then win32ui CreatePrinterDC renders the
    label through the official driver.
    """
    printer_name = _windows_printer_name()
    from PIL import Image  # Windows-side import

    img = Image.open(image_path).convert("RGB")

    win32print, win32ui, ImageWin = _load_windows_deps()
    img_width, img_height = img.size
    if img_width != LABEL_WIDTH_PX:
        raise RuntimeError(
            f"label image width must be {LABEL_WIDTH_PX}px @300dpi, got {img_width}px"
        )

    # 1) dynamic page size via SetPrinter (proven in F2/F4)
    h = win32print.OpenPrinter(printer_name, {"DesiredAccess": win32print.PRINTER_ALL_ACCESS})
    try:
        info = win32print.GetPrinter(h, 2)
        dm = info.get("pDevMode")
        if dm is not None:
            dm.PaperWidth = FORM_WIDTH_TENTHS_MM            # 589 (58.9mm printable)
            dm.PaperLength = _page_tenths_mm(img.size[1])   # feed = content height + buffer
            dm.PaperSize = 256                              # driver snaps to its 62mm form
            dm.Orientation = 1                              # DMORIENT_PORTRAIT: no driver rotation
            dm.Fields = int(getattr(dm, "Fields", 0)) | 0x2 | 0x4 | 0x8
            info["pDevMode"] = dm
            win32print.SetPrinter(h, 2, info, 0)
    finally:
        win32print.ClosePrinter(h)

    # 2) GDI coordinates are printer-device pixels, not renderer pixels. Query
    # the resolved custom page and scale to the printable rectangle; this keeps
    # physical size correct even when a driver defaults to 600dpi.
    hdc = win32ui.CreateDC()
    try:
        hdc.CreatePrinterDC(printer_name)
        page_w = hdc.GetDeviceCaps(getattr(win32print, "HORZRES", HORZRES))
        page_h = hdc.GetDeviceCaps(getattr(win32print, "VERTRES", VERTRES))
        if page_w <= 0 or page_h <= 0:
            raise RuntimeError(
                f"Printer queue reported invalid page size {page_w}x{page_h} "
                "(check the queue default paper form = 62mm continuous)"
            )
        scale = min(page_w / img_width, page_h / img_height)
        draw_w = max(1, int(img_width * scale))
        draw_h = max(1, int(img_height * scale))
        hdc.StartDoc(doc_name)
        hdc.StartPage()
        dib = ImageWin.Dib(img)
        dib.draw(hdc.GetHandleOutput(), (0, 0, draw_w, draw_h))
        hdc.EndPage()
        hdc.EndDoc()
    finally:
        hdc.DeleteDC()


def validate_backend_config() -> str:
    """Fail fast at agent startup with an actionable message."""
    backend = get_backend()
    if backend == BACKEND_WINDOWS:
        _windows_printer_name()  # raises with guidance if missing
        if os.name != "nt":
            raise WindowsSpoolerUnavailable(
                "windows_spooler backend requires Windows (office PC)."
            )
    else:
        if not _printer_url():
            raise PrinterNotConfigured(
                "LABEL_PRINTER_URL is required for LABEL_PRINT_BACKEND=brother_ql_raw"
            )
    return backend


# ---------------------------------------------------------------------------
# Public entry point (used by main.py) - backend routing with shared retry
# ---------------------------------------------------------------------------

def print_label(image_path: str | os.PathLike[str],
                max_attempts: int = MAX_ATTEMPTS) -> PrintResult:
    """Print one label image with retry. Never raises for printer failures;
    returns a PrintResult so the caller can persist printed/failed state."""
    img = Path(image_path)
    if not img.exists():
        return PrintResult(ok=False, attempts=0, error=f"image not found: {img}")

    try:
        backend = get_backend()
    except ValueError as exc:
        return PrintResult(ok=False, attempts=0, error=str(exc))

    last_error = ""
    attempts = 0
    while attempts < max_attempts:
        attempts += 1
        try:
            if backend == BACKEND_WINDOWS:
                _submit_via_spooler_once(img, doc_name=f"sample-label-{img.stem}")
                return PrintResult(ok=True, attempts=attempts)
            cmd = build_print_command(img)
            ok, err = _print_raw_once(cmd, img)
            if ok:
                return PrintResult(ok=True, attempts=attempts)
            last_error = err
        except PrinterNotConfigured as exc:  # configuration errors: no retry
            return PrintResult(ok=False, attempts=attempts, error=str(exc))
        except WindowsSpoolerUnavailable as exc:  # same: config-level
            return PrintResult(ok=False, attempts=attempts, error=str(exc))
        except Exception as exc:  # noqa: BLE001 - submission error: retry
            last_error = f"{type(exc).__name__}: {exc}"
            log.warning("print attempt %d/%d failed: %s", attempts, max_attempts, last_error)
        if attempts < max_attempts:
            time.sleep(RETRY_BACKOFF_SECONDS * attempts)

    return PrintResult(ok=False, attempts=attempts, error=last_error or "unknown error")
