from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from enum import Enum


class ProjectStatus(str, Enum):
    interviewing = "interviewing"
    active = "active"
    archived = "archived"


class ProjectCreate(BaseModel):
    user_id: str
    name: str
    status: ProjectStatus = ProjectStatus.interviewing


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[ProjectStatus] = None
    scope_summary: Optional[str] = None
    scope_detail: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    interview_transcript: Optional[list] = None


class ProjectOut(BaseModel):
    id: str
    user_id: str
    name: str
    status: ProjectStatus
    scope_summary: Optional[str]
    scope_detail: Optional[str]
    tech_stack: List[str]
    interview_transcript: Optional[list]
    created_at: datetime
    updated_at: datetime
