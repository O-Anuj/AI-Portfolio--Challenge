# AI Portfolio Challenge

An interactive portfolio where recruiters chat with an AI representative of you. The AI answers honestly using **only** the information you provide — no hallucinations.

## Features

- **Candidate profile** — structured JSON with Pydantic validation
- **Groq LLM** — `llama-3.3-70b-versatile` with streaming responses
- **System prompt** — anti-hallucination rules, honest third-person answers
- **FastAPI backend** — streaming chat API
- **React frontend** — ChatGPT-style UI with auto-scroll
- **Conversation memory** — full history sent with each request
- **Job description matching** — paste a JD, analyze fit, ask follow-up questions

## Project Structure

```
ai-portfolio/
├── backend/
│   ├── app/
│   │   ├── main.py       # FastAPI routes
│   │   ├── llm.py        # Groq client + streaming
│   │   ├── models.py     # Pydantic models
│   │   └── prompts.py    # System prompt builder
│   ├── data/
│   │   └── candidate.json   # YOUR profile — edit this!
│   ├── .env.example
│   └── pyproject.toml
└── frontend/
    └── src/
        ├── App.jsx       # Chat UI
        └── api.js        # Fetch + streaming
```

## Setup

### 1. Edit your profile

Update `backend/data/candidate.json` with your real information.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Add your GROQ_API_KEY to .env

pip install -e .
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/profile` | Candidate profile JSON |
| POST | `/api/chat` | Streaming chat (plain text) |
| POST | `/api/job-match` | Structured JD fit analysis |

### Chat request body

```json
{
  "message": "Tell me about this candidate.",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "job_description": "optional JD text"
}
```

## Steps Covered

1. Candidate profile (JSON + Pydantic)
2. Groq API
3. System prompt engineering
4. FastAPI backend with streaming
5. React chat UI
6. Frontend ↔ backend connection
7. Conversation history / memory
8. Job description matching (optional structured JSON)

## Customization

- **Model**: change `MODEL` in `backend/app/llm.py`
- **CORS**: update origins in `backend/app/main.py`
- **Styling**: edit `frontend/src/App.css`
