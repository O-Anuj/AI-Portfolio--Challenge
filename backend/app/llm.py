import json
import os
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq

from app.models import CandidateProfile, ChatMessage, JobMatchResult
from app.prompts import build_system_prompt

load_dotenv()

MODEL = "llama-3.3-70b-versatile"
DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "candidate.json"


def get_client() -> Groq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set. Add it to backend/.env")
    return Groq(api_key=api_key)


def load_profile() -> CandidateProfile:
    with open(DATA_PATH, encoding="utf-8") as f:
        data = json.load(f)
    return CandidateProfile(**data)


def build_messages(
    user_message: str,
    history: list[ChatMessage],
    job_description: str | None = None,
) -> list[dict]:
    profile = load_profile()
    system_prompt = build_system_prompt(profile, job_description)

    messages: list[dict] = [{"role": "system", "content": system_prompt}]

    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": user_message})
    return messages


def stream_chat(
    user_message: str,
    history: list[ChatMessage],
    job_description: str | None = None,
):
    client = get_client()
    messages = build_messages(user_message, history, job_description)

    stream = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        stream=True,
        max_tokens=2048,
    )

    for chunk in stream:
        content = chunk.choices[0].delta.content
        if content:
            yield content


def analyze_job_match(job_description: str) -> JobMatchResult:
    client = get_client()
    profile = load_profile()
    schema = JobMatchResult.model_json_schema()

    system_prompt = f"""You are an honest HR assistant. Compare the candidate profile against the job description.
Return ONLY valid JSON matching this schema:
{json.dumps(schema, indent=2)}

Rules:
- Only use skills/experience from the candidate profile
- Do not invent missing or matching skills
- match_score is 0-100 based on honest overlap
- should_interview should reflect genuine fit, not optimism"""

    user_prompt = f"""Candidate Profile:
{json.dumps(profile.model_dump(), indent=2)}

Job Description:
{job_description}

Analyze fit and return JSON."""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        max_tokens=1024,
    )

    raw = response.choices[0].message.content
    return JobMatchResult(**json.loads(raw))
