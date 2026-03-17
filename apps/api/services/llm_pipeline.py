"""LangChain LLM pipeline — CV parsing and cover letter generation."""
import json
from typing import Any, Dict, Tuple

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional

from config import settings

# ── Models ────────────────────────────────────────────────────────────────

class ParsedCV(BaseModel):
    skills: List[str] = Field(description="Core technical and soft skills")
    tools: List[str] = Field(description="Software tools, frameworks, and platforms")
    experience_years: Optional[int] = Field(description="Total years of professional experience")
    education: List[str] = Field(description="Degree and institution pairs")
    experience: List[str] = Field(description="Key achievements with quantifiable metrics")


# ── LLM Configuration ─────────────────────────────────────────────────────

def get_llm(temperature: float = 0.2) -> ChatOpenAI:
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=temperature,
        api_key=settings.OPENAI_API_KEY,
    )


# ── CV Parser ─────────────────────────────────────────────────────────────

CV_PARSER_SYSTEM = """You are a precision CV parsing engine. 
Extract the following entities from the raw CV text provided by the user:
- Education: degree and institution pairs
- Experience: achievements WITH quantifiable metrics (numbers, percentages, revenue figures)
- Core Skills: technical and soft skills
- Tools: software, frameworks, languages, platforms

CRITICAL RULE: Output ONLY valid JSON. No markdown fences, no explanations, no preamble.
The JSON must conform exactly to this structure:
{format_instructions}
"""

CV_PARSER_HUMAN = """Parse this CV:

{cv_text}"""


async def parse_cv_text(cv_text: str) -> Dict[str, Any]:
    """
    Parse raw CV text into structured JSON using GPT-4o-mini.
    Returns a dict with keys: skills, tools, experience_years, education, experience.
    """
    parser = PydanticOutputParser(pydantic_object=ParsedCV)

    prompt = ChatPromptTemplate.from_messages([
        ("system", CV_PARSER_SYSTEM),
        ("human", CV_PARSER_HUMAN),
    ])

    llm = get_llm(temperature=0.0)
    chain = prompt | llm | parser

    result: ParsedCV = await chain.ainvoke({
        "format_instructions": parser.get_format_instructions(),
        "cv_text": cv_text[:8000],  # Token budget guard
    })

    return result.model_dump()


# ── Cover Letter Generator ────────────────────────────────────────────────

COVER_LETTER_SYSTEM = """You are an elite executive headhunter and ghostwriter with 25 years of experience 
placing C-suite and senior talent at Fortune 500 companies. 

Your cover letters are renowned for their precision, confidence, and ability to bypass 
Applicant Tracking Systems while resonating deeply with human hiring managers.

STRICT RULES:
1. Write EXACTLY 3 paragraphs — no more, no less
2. Map EXACTLY 3 specific requirements from the job description to the candidate's quantifiable achievements
3. Tone: assertive, highly professional, concise. NOT subservient or pleading
4. Do NOT use ANY of these clichéd phrases:
   - "I am writing to apply for"
   - "I am passionate about"
   - "I would be a great fit"
   - "To whom it may concern"
   - "I believe my skills"
5. Open with a bold, declarative statement about the candidate's value
6. Format in clean Markdown
7. Do NOT include date, address headers, or "Yours sincerely" — just the three paragraphs"""

COVER_LETTER_HUMAN = """Role: {job_title} at {company}

Job Description:
{job_description}

Candidate's Resume:
{resume_text}

Write the cover letter now:"""


async def generate_cover_letter_markdown(
    job_title: str,
    company: str,
    job_description: str,
    resume_text: str,
) -> str:
    """
    Generate an executive-quality cover letter mapped to the job description.
    Returns the letter as Markdown text.
    """
    prompt = ChatPromptTemplate.from_messages([
        ("system", COVER_LETTER_SYSTEM),
        ("human", COVER_LETTER_HUMAN),
    ])

    llm = get_llm(temperature=0.4)
    chain = prompt | llm

    result = await chain.ainvoke({
        "job_title": job_title,
        "company": company,
        "job_description": job_description[:4000],
        "resume_text": resume_text[:4000],
    })

    return result.content
