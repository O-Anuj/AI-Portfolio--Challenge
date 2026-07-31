from pydantic import BaseModel, Field, HttpUrl


class Education(BaseModel):
    degree: str
    field: str
    institution: str
    year: str
    cgpa: str | None = None


class Project(BaseModel):
    name: str
    description: str
    technologies: list[str]
    highlights: list[str] = Field(default_factory=list)


class Experience(BaseModel):
    title: str
    company: str
    duration: str
    description: str


class Certification(BaseModel):
    name: str
    issuer: str
    year: str


class SocialLinks(BaseModel):
    github: str | None = None
    linkedin: str | None = None
    email: str | None = None
    portfolio: str | None = None


class CandidateProfile(BaseModel):
    name: str
    headline: str
    summary: str
    education: list[Education]
    skills: list[str]
    projects: list[Project]
    experience: list[Experience]
    achievements: list[str]
    certifications: list[Certification]
    social_links: SocialLinks


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = Field(default_factory=list)
    job_description: str | None = None


class JobMatchResult(BaseModel):
    is_suitable: bool
    match_score: int = Field(..., ge=0, le=100)
    matching_skills: list[str]
    missing_skills: list[str]
    strengths: list[str]
    should_interview: bool
    summary: str
