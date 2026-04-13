PDF_MAGIC = b"%PDF-"
PDF_MAX_SNIFF_BYTES = 2048


def is_pdf_bytes(data: bytes) -> bool:
    if not data:
        return False
    head = data[:PDF_MAX_SNIFF_BYTES]
    return PDF_MAGIC in head
