import re

SECTION_PATTERNS = {
    "summary":        r"(summary|profile|objective|about me|professional summary)",
    "experience":     r"(experience|work experience|employment|career|work history)",
    "education":      r"(education|academic|qualifications|degrees)",
    "skills":         r"(skills|technical skills|competencies|expertise|technologies)",
    "projects":       r"(projects|portfolio|case studies|work samples)",
    "certifications": r"(certifications|licenses|credentials|certificates)",
    "contact":        r"(contact|personal info|get in touch)",
}

def detect_sections(text: str) -> dict:
    """Detect which resume sections are present and extract their content."""
    lines = text.splitlines()
    sections: dict[str, str] = {}
    current_section = None
    current_lines: list[str] = []

    def flush():
        if current_section and current_lines:
            sections[current_section] = "\n".join(current_lines).strip()

    for line in lines:
        clean = line.strip().lower()
        matched_section = None

        for section_name, pattern in SECTION_PATTERNS.items():
            if re.search(pattern, clean) and len(clean) < 60:
                matched_section = section_name
                break

        if matched_section:
            flush()
            current_section = matched_section
            current_lines = []
        elif current_section:
            current_lines.append(line)

    flush()

    # Extract contact info separately
    email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    phone_match = re.search(r"(\+?1?\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}", text)

    if email_match or phone_match:
        contact_parts = []
        if email_match:
            contact_parts.append(email_match.group())
        if phone_match:
            contact_parts.append(phone_match.group())
        sections["contact"] = " | ".join(contact_parts)

    return sections
