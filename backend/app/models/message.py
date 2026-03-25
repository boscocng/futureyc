from __future__ import annotations
from datetime import datetime
from typing import Literal
from pydantic import BaseModel


class TaskMessageCreate(BaseModel):
    task_id: str
    role: Literal["user", "assistant"]
    content: str


class TaskMessageOut(BaseModel):
    id: str
    task_id: str
    role: str
    content: str
    created_at: datetime


class ScopeMessageCreate(BaseModel):
    project_id: str
    role: Literal["user", "assistant"]
    content: str


class ScopeMessageOut(BaseModel):
    id: str
    project_id: str
    role: str
    content: str
    created_at: datetime
