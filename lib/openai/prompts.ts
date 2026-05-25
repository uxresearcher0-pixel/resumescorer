export function buildAnalysisPrompt(
  resumeText: string,
  jobDescriptionText: string
): string {
  return `You are an expert ATS resume analyst and career coach with 15 years of experience in recruiting and talent acquisition.

RESUME TEXT:
---
${resumeText}
---

JOB DESCRIPTION:
---
${jobDescriptionText}
---

Analyze the resume against the job description and return ONLY a valid JSON object with this exact structure. No prose, no markdown, no explanation — pure JSON:

{
  "keyword_match": {
    "matched": ["string"],
    "missing": [
      { "keyword": "string", "importance": "required|preferred", "category": "technical|soft|tool|domain|certification" }
    ]
  },
  "skills": {
    "matched": ["string"],
    "missing": ["string"]
  },
  "ats_issues": [
    { "issue": "string", "severity": "low|medium|high", "recommendation": "string" }
  ],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "experience_relevance_notes": "string",
  "bullet_rewrites": [
    { "original": "string", "rewritten": "string", "section": "string", "improvement": "string" }
  ],
  "section_suggestions": [
    { "section": "string", "suggestion": "string", "priority": "high|medium|low" }
  ],
  "scores": {
    "keyword": 0,
    "skills": 0,
    "experience": 0,
    "impact": 0
  },
  "failure_reasons": [
    {
      "rank": 1,
      "reason": "string (specific reason why this resume would be rejected — e.g. 'Missing 3 required technical skills: Kubernetes, Terraform, AWS Lambda')",
      "category": "keywords|skills|experience|formatting|ats|impact",
      "impact": "high|medium|low",
      "fix": "string (concrete, specific action to fix this — e.g. 'Add a Projects section showing Kubernetes deployment experience')"
    }
  ],
  "gap_analysis": {
    "keyword": "string (1-2 sentences explaining exactly why the keyword score is low — be specific about which required keywords are missing)",
    "skills": "string (1-2 sentences on skill gaps — name the missing skills explicitly)",
    "experience": "string (1-2 sentences on experience relevance gap — years, job title mismatch, missing domain experience)",
    "impact": "string (1-2 sentences on weak impact — lack of metrics, passive verbs, missing quantification)",
    "overall": "string (2-3 sentence overall verdict — would a recruiter shortlist this resume? Why or why not?)"
  },
  "improvement_roadmap": [
    {
      "week": 1,
      "focus": "string (e.g. 'Add missing keywords and skills')",
      "actions": ["string (specific action)"],
      "score_impact": "string (e.g. 'Keyword score: +15 pts, Overall: +8 pts')"
    },
    {
      "week": 2,
      "focus": "string",
      "actions": ["string"],
      "score_impact": "string"
    },
    {
      "week": 3,
      "focus": "string",
      "actions": ["string"],
      "score_impact": "string"
    }
  ]
}

Rules:
- bullet_rewrites: max 5 bullets, pick the weakest ones
- failure_reasons: max 5, ranked 1 (most damaging) to 5 (least damaging). Be brutally honest and specific — vague reasons like "improve your resume" are useless
- gap_analysis: each field must reference specific missing items from the job description — do not be generic
- improvement_roadmap: must be realistic and ordered by impact. Week 1 = highest-ROI changes
- keyword score: 0-100 based on how many required/preferred keywords appear
- skills score: 0-100 based on skill coverage
- experience score: 0-100 based on relevance of job titles, years, and responsibilities
- impact score: 0-100 based on use of metrics, numbers, and strong action verbs
- Return ONLY the JSON`;
}

export function buildBulletRewritePrompt(
  originalBullet: string,
  jobTitle: string,
  section: string
): string {
  return `Rewrite the following resume bullet point to be more impactful for a ${jobTitle} role.

Rules:
- Start with a strong action verb (Designed, Led, Built, Increased, Reduced, etc.)
- Add specific metrics or numbers if plausible (percentages, time savings, user counts, revenue)
- Be concise — max 2 lines
- Match the tone of ${section} section
- Return ONLY the rewritten bullet point, nothing else

Original bullet: ${originalBullet}`;
}

export function buildSectionSuggestionsPrompt(
  resumeText: string,
  jobTitle: string,
  missingSections: string[]
): string {
  return `You are a resume expert. Based on this ${jobTitle} resume, provide specific improvement suggestions for these sections: ${missingSections.join(", ")}.

RESUME:
---
${resumeText}
---

Return a JSON array of objects: [{ "section": "string", "suggestion": "string" }]
Be specific, actionable, and tailored to a ${jobTitle} role. Return ONLY the JSON array.`;
}
