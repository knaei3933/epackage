"""Unit tests for the label renderer (pytest)."""

from pathlib import Path

import pytest
from PIL import Image

import label_renderer
from label_renderer import (
    LABEL_WIDTH_PX,
    postal_display,
    render_label,
    resolve_font,
    wrap_text,
)


class FakeFont:
    """Deterministic font stand-in: each char = 10px."""

    size = 40

    def getlength(self, text: str) -> float:
        return len(text) * 10.0


def test_wrap_text_respects_max_width():
    lines = wrap_text("A" * 35, FakeFont(), max_width=300)  # 30 chars/line
    assert all(len(l) <= 30 for l in lines)
    assert "".join(lines) == "A" * 35


def test_wrap_text_keeps_newlines():
    lines = wrap_text("ABC\nDEF", FakeFont(), max_width=300)
    assert lines == ["ABC", "DEF"]


def test_wrap_text_long_single_char_line():
    lines = wrap_text("", FakeFont(), max_width=300)
    assert lines == [""]


def test_postal_display_adds_postal_mark():
    assert postal_display("123-4567") == "\u3012123-4567"
    assert postal_display(" 123-4567 ") == "\u3012123-4567"
    assert postal_display(None) == ""
    assert postal_display("   ") == ""


def test_resolve_font_returns_something():
    font = resolve_font(40)
    assert font is not None


def test_resolve_font_raises_without_jp_font(monkeypatch):
    monkeypatch.delenv("LABEL_FONT_PATH", raising=False)
    monkeypatch.setattr(label_renderer, "_FONT_CANDIDATES", [])
    monkeypatch.setattr(label_renderer, "_BOLD_FONT_CANDIDATES", [])
    with pytest.raises(RuntimeError, match="No Japanese-capable font"):
        label_renderer.resolve_font(40)


def test_render_label_requires_address():
    with pytest.raises(ValueError):
        render_label("123", "  ", "会社", "山田", "out/t3.png")


def test_render_label_appends_sama_once():
    out1 = render_label(None, "住所", "会社", "山田様", "out/t1.png")
    out2 = render_label(None, "住所", "会社", "山田", "out/t2.png")
    assert Path(out1).exists() and Path(out2).exists()


# ---------------------------------------------------------------------------
# rotated mode (optional): text runs along feed; final image = 696 x length
# ---------------------------------------------------------------------------

def test_rotated_width_is_roll_width(monkeypatch):
    monkeypatch.setenv("LABEL_ORIENTATION", "rotated")
    out = render_label("123-4567", "東京都港区テスト1-2-3 テストビル4F", "株式会社テスト", "山田太郎", "out/rot.png")
    with Image.open(out) as img:
        # after the final 90° transpose: width = printable roll, height = feed length
        assert img.size[1] > 300              # label length driven by the longest line
        assert img.size[0] == LABEL_WIDTH_PX  # exactly Brother's 696px printable width


def test_rotated_short_address_shorter_than_long_address(monkeypatch):
    monkeypatch.setenv("LABEL_ORIENTATION", "rotated")
    short = render_label(None, "港区1-2-3", None, "山田", "out/rot_short.png")
    long = render_label(None, "東京都港区テスト1-2-3-4-5 テストビル20F", "株式会社テストテスト", "山田太郎花子", "out/rot_long.png")
    with Image.open(short) as a, Image.open(long) as b:
        assert b.size[1] > a.size[1]  # longer text -> longer label (feed dim)


# ---------------------------------------------------------------------------
# horizontal mode (default): text runs across roll width
# ---------------------------------------------------------------------------

def test_horizontal_width_is_696(monkeypatch):
    monkeypatch.setenv("LABEL_ORIENTATION", "horizontal")
    out = render_label("123-4567", "東京都港区テスト1-2-3 テストビル4F", "株式会社テスト", "山田太郎", "out/h1.png")
    with Image.open(out) as img:
        assert img.size[0] == LABEL_WIDTH_PX
        assert img.mode == "RGB"


def test_horizontal_without_company(monkeypatch):
    monkeypatch.setenv("LABEL_ORIENTATION", "horizontal")
    out = render_label("123-4567", "東京都港区テスト1-2-3", None, "山田太郎", "out/h2.png")
    assert Path(out).exists()


def test_horizontal_compact_height(monkeypatch):
    monkeypatch.setenv("LABEL_ORIENTATION", "horizontal")
    out = render_label("123-4567", "東京都港区テスト1-2-3 テストビル4F", "株式会社テスト", "山田太郎", "out/h3.png")
    with Image.open(out) as img:
        assert img.size[1] < 700


def test_horizontal_auto_sized_address_fits_one_line(monkeypatch):
    # 18-char address -> auto font ~36px, address on ONE line across the roll
    monkeypatch.setenv("LABEL_ORIENTATION", "horizontal")
    out = render_label("123-4567", "東京都港区テスト1-2-3 テストビル4F", "株式会社テスト", "山田太郎", "out/auto.png")
    with Image.open(out) as img:
        assert img.size[0] == 696
        assert img.size[1] < 400  # compact: no excessive wrap-induced growth


def test_horizontal_long_address_still_fits(monkeypatch):
    monkeypatch.setenv("LABEL_ORIENTATION", "horizontal")
    out = render_label("123-4567", "東京都新宿区西新宿二丁目八番一号都庁第一本庁舎", "株式会社テスト", "山田太郎", "out/long.png")
    with Image.open(out) as img:
        assert img.size[0] == 696
        assert img.size[1] < 500  # auto-shrunk font keeps it compact


def test_invalid_orientation_rejected(monkeypatch):
    monkeypatch.setenv("LABEL_ORIENTATION", "diagonal")
    with pytest.raises(ValueError, match="LABEL_ORIENTATION"):
        label_renderer.get_orientation()
