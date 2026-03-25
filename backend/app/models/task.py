from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from enum import Enum


class TaskStatus(str, Enum):
    defining = "defining"
    planned = "planned"
    prompt_ready = "prompt_ready"
    in_progress = "in_progress"
    done = "done"


class TaskCreate(BaseModel):
    project_id: str
    title: str
    status: TaskStatus = TaskStatus.defining
    display_order: int = 0


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[TaskStatus] = None
    task_summary: Optional[str] = None
    implementation_plan: Optional[str] = None
    generated_prompt: Optional[str] = None
    display_order: Optional[int] = None


class TaskOut(BaseModel):
    id: str
    project_id: str
    title: str
    status: TaskStatus
    task_summary: Optional[str]
    implementation_plan: Optional[str]
    generated_prompt: Optional[str]
    display_order: int
    created_at: datetime
    updated_at: datetime
