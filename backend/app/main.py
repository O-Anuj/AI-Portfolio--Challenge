import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.llm import analyze_job_match, load_profile, stream_chat
from app.models import ChatRequest, JobMatchResult

app = FastAPI(title="AI Portfolio API", version="1.0.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/profile")
def get_profile():
    return load_profile().model_dump()


@app.post("/api/chat")
def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    def generate():
        try:
            for token in stream_chat(
                request.message,
                request.history,
                request.job_description,
            ):
                yield token
        except ValueError as e:
            yield f"\n\n[Error: {e}]"
        except Exception as e:
            yield f"\n\n[Error: {e}]"

    return StreamingResponse(generate(), media_type="text/plain")


class JobMatchRequest(BaseModel):
    job_description: str


@app.post("/api/job-match", response_model=JobMatchResult)
def job_match(request: JobMatchRequest):
    if not request.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")

    try:
        return analyze_job_match(request.job_description)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job match failed: {e}") from e



