import io
import logging
import zipfile
from enum import Enum
from pathlib import Path

from app.services.pdf_validation import is_pdf_bytes

logger = logging.getLogger(__name__)


class FileCategory(str, Enum):
    PDF = "pdf"
    DOCX = "docx"
    XLSX = "xlsx"
    JPEG = "jpeg"
    PNG = "png"


_KNOWN_EXTENSIONS = frozenset({".pdf", ".docx", ".xlsx", ".jpg", ".jpeg", ".png"})

_EXTENSION_FOR_CATEGORY: dict[FileCategory, frozenset[str]] = {
    FileCategory.PDF: frozenset({".pdf"}),
    FileCategory.DOCX: frozenset({".docx"}),
    FileCategory.XLSX: frozenset({".xlsx"}),
    FileCategory.JPEG: frozenset({".jpg", ".jpeg"}),
    FileCategory.PNG: frozenset({".png"}),
}


def _classify_ooxml_zip(data: bytes) -> FileCategory | None:
    try:
        zf = zipfile.ZipFile(io.BytesIO(data))
        names = set(zf.namelist())
    except (zipfile.BadZipFile, OSError, ValueError) as e:
        logger.error(
            "file_validation: PK header but zip parse failed: %s (len=%s)",
            e,
            len(data),
        )
        return None
    if "word/document.xml" in names:
        return FileCategory.DOCX
    if "xl/workbook.xml" in names:
        return FileCategory.XLSX
    sample = sorted(names)[:25]
    logger.error(
        "file_validation: OOXML zip without word/document.xml or xl/workbook.xml; "
        "name_count=%s sample=%s",
        len(names),
        sample,
    )
    return None


def detect_category_from_bytes(data: bytes) -> FileCategory | None:
    if not data or len(data) < 4:
        return None
    if is_pdf_bytes(data):
        return FileCategory.PDF
    if len(data) >= 8 and data[:8] == b"\x89PNG\r\n\x1a\n":
        return FileCategory.PNG
    if len(data) >= 3 and data[:3] == b"\xff\xd8\xff":
        return FileCategory.JPEG
    if data[:4] == b"PK\x03\x04":
        return _classify_ooxml_zip(data)
    head = data[: min(24, len(data))].hex()
    logger.error(
        "file_validation: unknown magic (len=%s first_bytes_hex=%s)",
        len(data),
        head,
    )
    return None


def validate_upload(data: bytes, filename: str | None) -> FileCategory:
    if not data:
        logger.error("file_validation: empty body (filename=%r)", filename)
        raise ValueError("Empty file.")

    cat = detect_category_from_bytes(data)
    if cat is None:
        logger.error(
            "file_validation: unsupported type after magic sniff (filename=%r size=%s)",
            filename,
            len(data),
        )
        raise ValueError("Unsupported file type or unreadable content.")

    if filename:
        ext = Path(filename).suffix.lower()
        if ext in _KNOWN_EXTENSIONS and ext not in _EXTENSION_FOR_CATEGORY[cat]:
            logger.error(
                "file_validation: extension mismatch detected=%s filename_ext=%r path=%r",
                cat.value,
                ext,
                filename,
            )
            raise ValueError(
                "File content does not match the file extension. "
                "Use a genuine PDF, Word, Excel, or image file."
            )

    logger.debug("file_validation: ok category=%s filename=%r", cat.value, filename)
    return cat


_ALLOWED_CONTENT_TYPES = frozenset(
    {
        "application/pdf",
        "application/x-pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/octet-stream",
        "binary/octet-stream",
    }
)


def is_allowed_upload_content_type(content_type: str | None) -> bool:
    if not content_type:
        return True
    base = content_type.split(";")[0].strip().lower()
    return base in _ALLOWED_CONTENT_TYPES
