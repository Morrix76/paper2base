import base64
from collections.abc import Callable

import fitz

MAX_PAGES = 10
TARGET_DPI = 150


def _dpi_matrix() -> fitz.Matrix:
    scale = TARGET_DPI / 72.0
    return fitz.Matrix(scale, scale)


def pdf_bytes_to_png_base64_list(
    pdf_bytes: bytes,
    *,
    max_pages: int = MAX_PAGES,
    progress_cb: Callable[[int, int], None] | None = None,
) -> list[str]:
    """
    Rasterize up to `max_pages` PDF pages to PNG at TARGET_DPI, return base64-encoded strings (no data URL prefix).
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        raise ValueError("Unable to open or read the PDF.") from e

    try:
        if doc.page_count < 1:
            raise ValueError("The PDF contains no pages.")
        n = min(doc.page_count, max_pages)
        mat = _dpi_matrix()
        out: list[str] = []
        for i in range(n):
            if progress_cb:
                progress_cb(i + 1, n)
            page = doc.load_page(i)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            png = pix.tobytes("png")
            out.append(base64.b64encode(png).decode("ascii"))
        return out
    finally:
        doc.close()
