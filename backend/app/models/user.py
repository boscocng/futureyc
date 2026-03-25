from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum


class UserRole(str, Enum):
    student = "student"
    educator = "educator"
    pm = "pm"
    developer = "developer"
    designer = "designer"
    founder = "founder"
    other = "other"


# --- User ---

class UserCreate(BaseModel):
    name: str
    role: UserRole


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[UserRole] = None


class UserOut(BaseModel):
    id: str
    name: str
    role: UserRole
    created_at: datetime
    updated_at: datetime


# --- Skill Profile ---

class SkillProfileCreate(BaseModel):
    frontend_comfort: int = Field(0, ge=0, le=4)
    backend_comfort: int = Field(0, ge=0, le=4)
    database_comfort: int = Field(0, ge=0, le=4)
    devops_comfort: int = Field(0, ge=0, le=4)
    mobile_comfort: int = Field(0, ge=0, le=4)
    data_science_comfort: int = Field(0, ge=0, le=4)
    general_coding_comfort: int = Field(0, ge=0, le=4)
    known_languages: List[str] = []
    known_frameworks: List[str] = []
    ai_tools: List[str] = []
    project_interests: List[str] = []
    raw_onboarding_answers: dict = {}


class SkillProfileUpdate(BaseModel):
    frontend_comfort: Optional[int] = Field(None, ge=0, le=4)
    backend_comfort: Optional[int] = Field(None, ge=0, le=4)
    database_comfort: Optional[int] = Field(None, ge=0, le=4)
    devops_comfort: Optional[int] = Field(None, ge=0, le=4)
    mobile_comfort: Optional[int] = Field(None, ge=0, le=4)
    data_science_comfort: Optional[int] = Field(None, ge=0, le=4)
    general_coding_comfort: Optional[int] = Field(None, ge=0, le=4)
    known_languages: Optional[List[str]] = None
    known_frameworks: Optional[List[str]] = None
    ai_tools: Optional[List[str]] = None
    project_interests: Optional[List[str]] = None
    raw_onboarding_answers: Optional[dict] = None


class SkillProfileOut(BaseModel):
    id: str
    user_id: str
    frontend_comfort: int
    backend_comfort: int
    database_comfort: int
    devops_comfort: int
    mobile_comfort: int
    data_science_comfort: int
    general_coding_comfort: int
    known_languages: List[str]
    known_frameworks: List[str]
    ai_tools: List[str]
    project_interests: List[str]
    raw_onboarding_answers: dict
