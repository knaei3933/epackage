"""Label renderer for Brother QL-820NWBc (62mm continuous roll, DK-2205/22205).

Renders at 300 dpi; the printable width across the roll is 696 px (58.9 mm)
per Brother Raster Command Reference v1.01, media ID 259.

Label content (deep-interview spec): 〒 + postal code, address, company,
contact person. Auto-cut is handled by the driver per page.

Orientations (LABEL_ORIENTATION):
- "horizontal" (default): text lines run across the roll width; label length
  equals the stacked line heights (efficiency mode; the address font
  auto-sizes and feed waste stays minimal).
- "rotated": text lines run ALONG the roll length, rotated 90°.
"""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

LABEL_WIDTH_PX = 696   # printable width across the roll (58.9 mm @300dpi)
DPI = 300
POSTAL_MARK = "\u3012"  # 〒

_SIDE_PAD = 28
_TOP_PAD = 20
_LINE_GAP = 10
_BLOCK_GAP = 16

# Uniform text size bounds (px @300dpi). Every content line (postal, address,
# company, contact) renders at the SAME size so the label never looks jagged.
# 48px = ~11.5pt, 28px = ~6.7pt in Word terms.
_TEXT_SIZE_MAX = 48
_TEXT_SIZE_MIN = 28

# Horizontal (efficiency) mode: higher chars-per-line => smaller font/shorter label.
_ADDR_CHARS_DEFAULT = 45
_ADDR_CHARS_MIN = 8

# Rotated mode sizing (across-roll stack budget = 696 px)
_ROT_MARGIN = 24
_ROT_LINE_GAP = 18
_ROT_ADDR_FONT_DEFAULT = 60  # px; env LABEL_ROT_ADDR_FONT
_ROT_TRAILING_FEED_PX = 60  # 5mm feed margin so auto-cut cannot hit text

# Common CJK-capable fonts across Windows (office PC) and Linux (dev/CI).
# Korean labels are possible (member company/contact data), so KR-capable
# candidates are included alongside JP ones.
_FONT_CANDIDATES = [
    r"C:\Windows\Fonts\meiryo.ttc",
    r"C:\Windows\Fonts\Meiryo.ttc",
    r"C:\Windows\Fonts\malgun.ttf",
    r"C:\Windows\Fonts\malgunbd.ttf",
    r"C:\Windows\Fonts\msyh.ttc",
    r"C:\Windows\Fonts\msjh.ttc",
    r"C:\Windows\Fonts\YugothM.ttc",
    r"C:\Windows\Fonts\YuGothM.ttc",
    r"C:\Windows\Fonts\msgothic.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
]

_BOLD_FONT_CANDIDATES = [
    r"C:\Windows\Fonts\meiryob.ttc",
    r"C:\Windows\Fonts\Meiryo-Bold.ttf",
    r"C:\Windows\Fonts\malgunbd.ttf",
    r"C:\Windows\Fonts\msyhbd.ttc",
    r"C:\Windows\Fonts\YugothB.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc",
]

_CJK_PROBE_CHARS = "東ア가"  # kanji + kana + hangul coverage probe


def _has_cjk_glyphs(font_path: Path) -> bool:
    """True when the font can actually draw representative JP + KR glyphs.

    A font file can exist yet lack CJK glyphs (e.g. a Latin-only override via
    LABEL_FONT_PATH). Pillow then draws .notdef tofu boxes while the print job
    is still marked 'printed', silently shipping unreadable labels. We detect
    that by comparing each probe glyph's mask against the .notdef mask.
    """
    try:
        font = ImageFont.truetype(str(font_path), 40)
        notdef_mask = font.getmask("\uFFFF", mode="1")
        notdef = bytes(notdef_mask)
        for ch in _CJK_PROBE_CHARS:
            mask = font.getmask(ch, mode="1")
            data = bytes(mask)
            if data == notdef or not any(data):
                return False
        return True
    except OSError:
        return False

def resolve_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Resolve a CJK-capable TTF. Env override: LABEL_FONT_PATH.

    Validates that the chosen font actually contains JP/KR glyphs so tofu
    output cannot be silently marked as printed. LABEL_FONT_PATH is tried
    first, but a Latin-only override falls through to the standard list
    (with a logged warning) instead of printing squares.
    """
    candidates = [os.environ["LABEL_FONT_PATH"]] if os.environ.get("LABEL_FONT_PATH") else []
    candidates += _BOLD_FONT_CANDIDATES if bold else _FONT_CANDIDATES
    for path in candidates:
        p = Path(path)
        if p.exists() and _has_cjk_glyphs(p):
            return ImageFont.truetype(path, size)
    raise RuntimeError(
        "No CJK-capable font found (needs JP kanji/kana + KR hangul glyphs). "
        "Install Meiryo or Malgun Gothic (Windows) / Noto Sans CJK (Linux) "
        "or set LABEL_FONT_PATH to a CJK font in .env."
    )


def wrap_text(text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    """Greedy character wrapping that keeps CJK strings intact (no spaces)."""
    lines: list[str] = []
    for raw_line in text.splitlines() or [""]:
        current = ""
        for ch in raw_line:
            candidate = current + ch
            if font.getlength(candidate) <= max_width or not current:
                current = candidate
            else:
                lines.append(current)
                current = ch
        lines.append(current)
    return lines or [""]


def postal_display(postal_code: str | None) -> str:
    """Rendered postal text with the Japanese postal mark (〒)."""
    postal = (postal_code or "").strip()
    return f"{POSTAL_MARK}{postal}" if postal else ""


def _uniform_text_size(text: str, max_width: int, max_lines: int = 2) -> int:
    """Largest size (≤48, ≥28) at which `text` wraps to ≤ max_lines lines.

    Forcing ONE line shrank mixed JP/Latin addresses to ~5.5pt (unreadable);
    allowing a 2-line wrap keeps text large. Measured with real glyph
    advances (wrap_text), not a raw character count.
    """
    for size in range(_TEXT_SIZE_MAX, _TEXT_SIZE_MIN - 1, -1):
        if len(wrap_text(text, resolve_font(size), max_width)) <= max_lines:
            return size
    return _TEXT_SIZE_MIN


def get_orientation() -> str:
    o = os.environ.get("LABEL_ORIENTATION", "horizontal").strip().lower()
    if o not in ("rotated", "horizontal"):
        raise ValueError(f"LABEL_ORIENTATION must be 'rotated' or 'horizontal', got {o!r}")
    return o


# ---------------------------------------------------------------------------
# horizontal mode (across-roll text; label length = stacked line heights)
# ---------------------------------------------------------------------------

def _render_horizontal(
    postal_text: str,
    address: str,
    company: str,
    contact: str,
    output_path: Path,
) -> Path:
    """Horizontal layout: text lines run ACROSS the roll width (readable with
    the 62mm edge horizontal). All content lines share ONE uniform font size -
    the largest size at which the address fits on a single measured line.

    Line spacing uses the real glyph height (ascent+descent), so nothing clips.
    """
    if not address.strip():
        raise ValueError("address is required")

    inner_width = LABEL_WIDTH_PX - 2 * _SIDE_PAD
    text_size = _uniform_text_size(address.strip(), inner_width)
    font_addr = resolve_font(text_size)
    font_name = resolve_font(text_size, bold=True)
    font_postal = resolve_font(text_size, bold=True)

    def _lh(f):
        a, d = f.getmetrics()
        return a + d

    addr_lh = _lh(font_addr)
    name_lh = _lh(font_name)
    postal_lh = _lh(font_postal)

    postal_lines = wrap_text(postal_text, font_postal, inner_width) if postal_text else []
    address_lines = wrap_text(address.strip(), font_addr, inner_width)
    company_lines = wrap_text(company, font_name, inner_width) if company else []
    display_contact = contact if contact.endswith("様") else f"{contact} 様"
    contact_lines = wrap_text(display_contact, font_name, inner_width)

    line_gap = max(4, text_size // 8)
    block_gap = max(8, text_size // 4)
    top_pad = max(10, text_size // 3)
    postal_box_h = postal_lh + 12 if postal_lines else 0
    brand_font = resolve_font(18, bold=True)
    brand_text = "Epackage-lab"
    brand_lh = _lh(brand_font)
    brand_gap = max(6, text_size // 8)

    h = top_pad
    if postal_lines:
        h += postal_box_h + block_gap
    h += len(address_lines) * (addr_lh + line_gap) + block_gap
    h += len(company_lines) * (name_lh + line_gap)
    if company_lines:
        h += block_gap
    h += len(contact_lines) * (name_lh + line_gap)
    h += brand_gap + brand_lh
    h += top_pad

    img = Image.new("RGB", (LABEL_WIDTH_PX, h), "white")
    draw = ImageDraw.Draw(img)
    y = top_pad
    if postal_lines:
        draw.rectangle(
            [_SIDE_PAD, y, LABEL_WIDTH_PX - _SIDE_PAD, y + postal_box_h],
            outline="black", width=4,
        )
        py = y + (postal_box_h - postal_lh) // 2
        for pline in postal_lines:
            draw.text((_SIDE_PAD + 12, py), pline, font=font_postal, fill="black")
            py += postal_lh
        y += postal_box_h + block_gap
    for aline in address_lines:
        draw.text((_SIDE_PAD, y), aline, font=font_addr, fill="black")
        y += addr_lh + line_gap
    y += block_gap
    for cline in company_lines:
        draw.text((_SIDE_PAD, y), cline, font=font_name, fill="black")
        y += name_lh + line_gap
    if company_lines:
        y += block_gap - line_gap
    for i, cl in enumerate(contact_lines):
        draw.text((_SIDE_PAD, y), cl, font=font_name, fill="black")
        y += name_lh + (line_gap if i < len(contact_lines) - 1 else 0)

    # Right-aligned brand footer on every horizontal label.
    brand_w = int(brand_font.getlength(brand_text))
    draw.text(
        (LABEL_WIDTH_PX - _SIDE_PAD - brand_w, h - brand_lh),
        brand_text,
        font=brand_font,
        fill="black",
    )

    img.save(output_path, format="PNG")
    return output_path


# ---------------------------------------------------------------------------
# rotated mode (optional): lines run along the roll length; line height uses
# the 62mm roll width -> large readable characters at modest label length.
# ---------------------------------------------------------------------------

def _render_rotated(
    postal_text: str,
    address: str,
    company: str,
    contact: str,
    output_path: Path,
) -> Path:
    """Rotated layout: draw the label normally (horizontal text), then rotate
    the finished bitmap 90° so the text runs along the roll length.

    - No wrapping: each field is one continuous line (label length = longest
      line, e.g. the full address).
    - No overlap possible: lines are stacked with normal line spacing.
    """
    if not address.strip():
        raise ValueError("address is required")

    addr_font_size = max(20, int(os.environ.get("LABEL_ROT_ADDR_FONT", str(_ROT_ADDR_FONT_DEFAULT))))

    def fonts_for_size(size: int):
        font_addr = resolve_font(size)
        font_name = resolve_font(size, bold=True)
        return font_addr, font_name, font_name

    def build_lines(size: int):
        font_addr, font_name, font_postal = fonts_for_size(size)
        lines = []
        if postal_text:
            lines.append((postal_text, font_postal))
        lines.append((address.strip(), font_addr))
        if company:
            lines.append((company, font_name))
        if contact:
            display_contact = contact if contact.endswith("様") else f"{contact} 様"
            lines.append((display_contact, font_name))
        return lines

    def measured_height(lines) -> int:
        line_heights = sum(sum(f.getmetrics()) for _, f in lines)
        return (
            2 * _ROT_MARGIN
            + line_heights
            + _ROT_LINE_GAP * max(0, len(lines) - 1)
        )

    # The across-roll dimension is fixed to Brother's printable width. If the
    # requested fonts exceed that 696px budget, shrink them together instead
    # of emitting an undersized/cropped image.
    available_height = LABEL_WIDTH_PX
    lines = build_lines(addr_font_size)
    while addr_font_size > 20 and measured_height(lines) > available_height:
        addr_font_size = max(20, addr_font_size - 2)
        lines = build_lines(addr_font_size)

    line_gap = _ROT_LINE_GAP
    longest_line = max((int(f.getlength(t)) for t, f in lines), default=0)
    feed_length = longest_line + 2 * _ROT_MARGIN + _ROT_TRAILING_FEED_PX

    # Pre-rotation: width=feed length, height=across-roll printable width.
    # ROTATE_270 then makes the final PNG exactly 696px wide and avoids the
    # undersized page that caused partial printing on the Brother driver.
    img = Image.new("RGB", (feed_length, LABEL_WIDTH_PX), "white")
    draw = ImageDraw.Draw(img)
    content_height = measured_height(lines)
    brand_font = resolve_font(max(18, addr_font_size // 2))
    brand_text = "Epackage-lab"
    brand_height = sum(brand_font.getmetrics()) + 24
    y = max(_ROT_MARGIN, (LABEL_WIDTH_PX - brand_height - content_height) // 2)
    for text, font in lines:
        draw.text((_ROT_MARGIN, y), text, font=font, fill="black")
        y += sum(font.getmetrics()) + line_gap

    # Rotate 90° clockwise: text reads along the roll length when the label
    # is held with the 62mm edge horizontal.
    img = img.transpose(Image.ROTATE_270)
    brand_w = int(brand_font.getlength(brand_text)) + 8
    draw2 = ImageDraw.Draw(img)
    draw2.text((img.size[0] - brand_w - 12, img.size[1] - brand_font.size - 14),
               brand_text, font=brand_font, fill="black")
    img.save(output_path, format="PNG")
    return output_path


def render_label(
    postal_code: str | None,
    address: str,
    company_name: str | None,
    contact_person: str,
    output_path: str | os.PathLike[str],
) -> Path:
    """Render one recipient label and save as PNG. Returns the path."""
    out = Path(output_path)
    postal_text = postal_display(postal_code)
    company = (company_name or "").strip()
    contact = (contact_person or "").strip()

    if get_orientation() == "rotated":
        return _render_rotated(postal_text, address, company, contact, out)
    return _render_horizontal(postal_text, address, company, contact, out)
