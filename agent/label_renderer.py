"""Label renderer for Brother QL-820NWBc (62mm continuous roll, DK-22205).

Renders a recipient address label at 696 px width (58.9 mm printable area
@ 300 dpi per Brother Raster Command Reference v1.01, media ID 259).

Label content (from deep-interview spec, binding):
  postal code, address, company name, contact person (no phone number).
"""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# 62 mm continuous tape @300dpi: printable 696 dots (58.9 mm).
LABEL_WIDTH_PX = 696
DPI = 300

# Common JP-capable fonts across Windows (office PC) and Linux (dev/CI).
_FONT_CANDIDATES = [
    # Windows
    r"C:\Windows\Fonts\meiryo.ttc",
    r"C:\Windows\Fonts\Meiryo.ttc",
    r"C:\Windows\Fonts\YugothM.ttc",
    r"C:\Windows\Fonts\YuGothM.ttc",
    r"C:\Windows\Fonts\msgothic.ttc",
    # Linux
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
]

_BOLD_FONT_CANDIDATES = [
    r"C:\Windows\Fonts\meiryob.ttc",
    r"C:\Windows\Fonts\Meiryo-Bold.ttf",
    r"C:\Windows\Fonts\YugothB.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc",
]


def resolve_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Resolve a JP-capable TTF. Env override: LABEL_FONT_PATH.

    Raises RuntimeError when no JP-capable font exists: printing tofu glyphs
    and marking the job 'printed' would mask a real failure.
    """
    candidates = ([os.environ["LABEL_FONT_PATH"]] if os.environ.get("LABEL_FONT_PATH") else [])
    candidates += _BOLD_FONT_CANDIDATES if bold else _FONT_CANDIDATES
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    raise RuntimeError(
        "No Japanese-capable font found. Install Meiryo (Windows) / Noto Sans CJK (Linux) "
        "or set LABEL_FONT_PATH in .env."
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


def render_label(
    postal_code: str | None,
    address: str,
    company_name: str | None,
    contact_person: str,
    output_path: str | os.PathLike[str],
) -> Path:
    """Render one recipient label and save as PNG. Returns the file path.

    Layout (top to bottom):
      1. Postal code  - large, boxed
      2. Address      - wrapped body text
      3. Company name - bold, larger (optional)
      4. Contact      - "様" honorific appended when missing
    """
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)

    postal = (postal_code or "").strip()
    company = (company_name or "").strip()
    contact = (contact_person or "").strip()
    if not address or not address.strip():
        raise ValueError("address is required")

    font_postal = resolve_font(72, bold=True)
    font_body = resolve_font(40)
    font_company = resolve_font(48, bold=True)

    inner_width = LABEL_WIDTH_PX - 2 * 40  # 40px side padding
    postal_lines = wrap_text(postal, font_postal, inner_width) if postal else []
    address_lines = wrap_text(address.strip(), font_body, inner_width)
    company_lines = wrap_text(company, font_company, inner_width) if company else []
    display_contact = contact if contact.endswith("様") else f"{contact} 様"
    contact_lines = wrap_text(display_contact, font_company, inner_width)

    line_gap = 14
    block_gap = 26
    top_padding = 36
    postal_box_h = 110 if postal_lines else 0
    h = top_padding
    h += postal_box_h + block_gap if postal_lines else 0
    h += len(address_lines) * (font_body.size + line_gap) + block_gap
    h += len(company_lines) * (font_company.size + line_gap) + (block_gap if company_lines else 0)
    h += len(contact_lines) * (font_company.size + line_gap)
    h += top_padding  # bottom padding

    img = Image.new("RGB", (LABEL_WIDTH_PX, h), "white")
    draw = ImageDraw.Draw(img)

    y = top_padding
    if postal_lines:
        draw.rectangle([40, y, LABEL_WIDTH_PX - 40, y + postal_box_h], outline="black", width=4)
        py = y + (postal_box_h - font_postal.size) // 2
        for pline in postal_lines:
            draw.text((56, py), pline, font=font_postal, fill="black")
            py += font_postal.size
        y += postal_box_h + block_gap

    for aline in address_lines:
        draw.text((40, y), aline, font=font_body, fill="black")
        y += font_body.size + line_gap
    y += block_gap

    for cline in company_lines:
        draw.text((40, y), cline, font=font_company, fill="black")
        y += font_company.size + line_gap

    for i, cl in enumerate(contact_lines):
        draw.text((40, y), cl, font=font_company, fill="black")
        y += font_company.size + (line_gap if i < len(contact_lines) - 1 else 0)

    img.save(out, format="PNG")
    return out
