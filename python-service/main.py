from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import parse

app = FastAPI(
    title="ResumeFit AI - Resume Parser",
    description="Extracts text and sections from PDF, DOCX, and TXT resume files",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://resumefit.ai"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parse.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "resume-parser"}
