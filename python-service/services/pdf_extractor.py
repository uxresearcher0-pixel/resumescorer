from pdfminer.high_level import extract_text
from pdfminer.pdfpage import PDFPage
import io

def extract_pdf_text(file_path: str) -> tuple[str, int]:
    """Extract text and page count from a PDF file."""
    text = extract_text(file_path)

    # Count pages
    page_count = 0
    with open(file_path, "rb") as f:
        for _ in PDFPage.get_pages(f):
            page_count += 1

    # Clean up text
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    cleaned = "\n".join(lines)

    return cleaned, page_count
