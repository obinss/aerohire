"""
Semantic match scoring using OpenAI text-embedding-3-small and cosine similarity.
"""
import asyncio
from typing import Tuple

import numpy as np
from openai import AsyncOpenAI

from config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

EMBEDDING_MODEL = "text-embedding-3-small"
BATCH_TIMEOUT = 30  # seconds


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """Pure numpy cosine similarity between two vectors."""
    a = np.array(vec_a, dtype=np.float32)
    b = np.array(vec_b, dtype=np.float32)
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot / (norm_a * norm_b))


async def _embed(text: str) -> list[float]:
    """Get embedding vector for a single text string."""
    response = await client.embeddings.create(
        input=text[:8191],  # model context limit
        model=EMBEDDING_MODEL,
    )
    return response.data[0].embedding


async def compute_match_score(
    resume_text: str,
    job_description: str,
) -> Tuple[float, str]:
    """
    Compute semantic similarity between a candidate's resume and a job description.

    Returns:
        Tuple of (score_0_to_1, explanation_string)

    Algorithm:
        1. Embed resume_text using text-embedding-3-small
        2. Embed job_description using text-embedding-3-small
        3. Compute cosine similarity
        4. Apply a mild calibration curve to spread scores more meaningfully
    """
    # Fetch both embeddings concurrently
    resume_vec, job_vec = await asyncio.gather(
        _embed(resume_text),
        _embed(job_description),
    )

    raw_similarity = cosine_similarity(resume_vec, job_vec)

    # Calibration: raw cosine similarity for semantic text embeddings tends to cluster
    # between 0.7–0.95. We rescale to a 0–1 range with floor at 0.6 meaning 0%
    # and anything above 0.95 as a near-perfect match.
    floor = 0.60
    ceil_val = 0.96
    calibrated = max(0.0, (raw_similarity - floor) / (ceil_val - floor))
    calibrated = min(1.0, calibrated)

    # Generate simple explanation text
    if calibrated >= 0.90:
        explanation = "Exceptional alignment. The candidate's profile closely mirrors the core requirements."
    elif calibrated >= 0.75:
        explanation = "Strong match. Key skills and experience align well with the job description."
    elif calibrated >= 0.55:
        explanation = "Moderate match. Some relevant experience, but gaps exist in key areas."
    else:
        explanation = "Low alignment. The role requirements differ significantly from the candidate's profile."

    return calibrated, explanation
