from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field

from app.models.user import UserOut, SkillProfileOut


class OnboardingPayload(BaseModel):
    name: str
    role: str
    coding_comfort: int = Field(ge=1, le=5)
    languages: List[str] = []
    frameworks: List[str] = []
    ai_tools: List[str] = []
    project_interests: List[str] = []


class UserWithProfile(BaseModel):
    user: UserOut
    profile: SkillProfileOut
