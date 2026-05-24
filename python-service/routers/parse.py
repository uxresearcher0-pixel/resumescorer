from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
from services.pdf_extractor import extract_pdf_text
from services.docx_extractor import extract_docx_text
from services.section_detector import detect_sections
import tempfile, os

router = APIRouter()

class ParseRequest(BaseModel):
    file_url: str
    file_type: str  # pdf | docx | txt

class ParseResponse(BaseModel):
    extracted_text: str
    word_count: int
    page_count: int | None
    sections: dict

@router.post("/parse", response_model=ParseResponse)
async def parse_resume(body: ParseRequest):
    """Download file from URL and extract text + sections."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(body.file_url)
            response.raise_for_status()
            file_bytes = response.content
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download file: {str(e)}")

    ext = body.file_type.lower()
    extracted_text = ""
    page_count = None

    with tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        if ext == "pdf":
            extracted_text, page_count = extract_pdf_text(tmp_path)
        elif ext == "docx":
            extracted_text = extract_docx_text(tmp_path)
        elif ext == "txt":
            extracted_text = file_bytes.decode("utf-8", errors="ignore")
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")
    finally:
        os.unlink(tmp_path)

    words = extracted_text.split()
    sections = detect_sections(extracted_text)

    return ParseResponse(
        extracted_text=extracted_text,
        word_count=len(words),
        page_count=page_count,
        sections=sections,
    )
