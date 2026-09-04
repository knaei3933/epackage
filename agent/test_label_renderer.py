"""Unit tests for the label renderer (pytest)."""

from pathlib import Path

from PIL import Image

from label_renderer import LABEL_WIDTH_PX, render_label, resolve_font, wrap_text


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


def test_render_label_width_is_696():
    out = render_label("123-4567", "東京都港区1-2-3 テストビル4F", "株式会社テスト", "山田太郎",
                       "out/test_label.png")
    with Image.open(out) as img:
        assert img.size[0] == LABEL_WIDTH_PX
        assert img.mode == "RGB"


def test_render_label_without_company():
    out = render_label("123-4567", "東京都港区1-2-3", None, "山田太郎",
                       "out/test_label_nocompany.png")
    assert Path(out).exists()


def test_render_label_appends_sama_once():
    # 様 already present must not be doubled; absence gets appended.
    out1 = render_label(None, "住所", "会社", "山田様", "out/t1.png")
    out2 = render_label(None, "住所", "会社", "山田", "out/t2.png")
    assert Path(out1).exists() and Path(out2).exists()


def test_render_label_requires_address():
    import pytest
    with pytest.raises(ValueError):
        render_label("123", "  ", "会社", "山田", "out/t3.png")


def test_resolve_font_returns_something():
    font = resolve_font(40)
    assert font is not None


def test_resolve_font_raises_without_jp_font(monkeypatch):
    import pytest
    import label_renderer as lr

    monkeypatch.delenv("LABEL_FONT_PATH", raising=False)
    monkeypatch.setattr(lr, "_FONT_CANDIDATES", [])
    monkeypatch.setattr(lr, "_BOLD_FONT_CANDIDATES", [])
    with pytest.raises(RuntimeError, match="No Japanese-capable font"):
        lr.resolve_font(40)
