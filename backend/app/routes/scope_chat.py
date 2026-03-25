from __future__ import annotations
import json
import logging
from typing import List, Optional

import openai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.database import get_db
from app.models.project import ProjectOut
from app.models.task import TaskOut
from app.services import db_service as db
from app.services.llm_service import call_llm
from app.prompts.scope_chat_system import build_scope_chat_prompt

logger = logging.getLogger(__name__)

router = APIRouter()

TASK_MARKER = "===TASK_CREATED==="
SCOPE_MARKER = "===SCOPE_UPDATED==="


class ScopeChatRequest(BaseModel):
    content: str


class ScopeChatResponse(BaseModel):
    response: str
    created_task: Optional[TaskOut] = None
    updated_scope: Optional[ProjectOut] = None


def _extract_json_after(text: str, marker: str) -> Optional[dict]:
    idx = text.find(marker)
    if idx == -1:
        return None
    after = text[idx + len(marker):]
    start = after.find("{")
    if start == -1:
        return None
    depth = 0
    for i, ch in enumerate(after[start:], start):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(after[start:i + 1])
                except json.JSONDecodeError:
                    return None
    return None


def _strip_marker_block(text: str, marker: str) -> str:
    idx = text.find(marker)
    if idx == -1:
        return text
    return text[:idx].strip()


@router.post("/projects/{project_id}/scope/message", response_model=ScopeChatResponse)
def send_scope_message(project_id: str, body: ScopeChatRequest):
    with get_db() as conn:
        project = db.get_project(conn, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        user = db.get_user(conn, project["user_id"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        profile = db.get_skill_profile_by_user(conn, project["user_id"])
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        tasks = db.list_tasks_by_project(conn, project_id)

        # Load existing scope_messages as chat history
        existing = db.list_scope_messages(conn, project_id)
        messages = [{"role": m["role"], "content": m["content"]} for m in existing]
        messages.append({"role": "user", "content": body.content})

    system_prompt = build_scope_chat_prompt(user, profile, project, tasks)
    try:
        assistant_text = call_llm(system_prompt, messages, profile)
    except openai.AuthenticationError:
        logger.exception("OpenRouter authentication failed during scope chat")
        raise HTTPException(status_code=502, detail="AI service authentication failed. Check your OPENROUTER_API_KEY.")
    except openai.RateLimitError:
        logger.exception("OpenRouter rate limit hit during scope chat")
        raise HTTPException(status_code=429, detail="AI service rate limit reached. Please try again shortly.")
    except openai.APIError:
        logger.exception("OpenRouter API error during scope chat")
        raise HTTPException(status_code=502, detail="AI service is temporarily unavailable. Please try again.")

    # Detect markers
    task_data = _extract_json_after(assistant_text, TASK_MARKER)
    scope_data = _extract_json_after(assistant_text, SCOPE_MARKER)

    # Clean display text
    display_text = assistant_text
    if task_data:
        display_text = _strip_marker_block(display_text, TASK_MARKER)
    if scope_data:
        display_text = _strip_marker_block(display_text, SCOPE_MARKER)
    if not display_text:
        display_text = assistant_text

    created_task = None
    updated_scope = None

    with get_db() as conn:
        # Persist both messages
        db.create_scope_message(conn, project_id=project_id, role="user", content=body.content)
        db.create_scope_message(conn, project_id=project_id, role="assistant", content=assistant_text)

        # Create task if detected
        if task_data:
            task_count = len(db.list_tasks_by_project(conn, project_id))
            new_task = db.create_task(
                conn,
                project_id=project_id,
                title=task_data.get("title", "New Task"),
                status="planned",
                display_order=task_count,
            )
            # Update the task with summary and plan
            if task_data.get("task_summary") or task_data.get("implementation_plan"):
                new_task = db.update_task(
                    conn,
                    new_task["id"],
                    task_summary=task_data.get("task_summary"),
                    implementation_plan=task_data.get("implementation_plan"),
                )
            created_task = new_task

        # Update scope if detected
        if scope_data:
            updated_scope = db.update_project(
                conn,
                project_id,
                scope_summary=scope_data.get("scope_summary"),
                scope_detail=scope_data.get("scope_detail"),
            )

    return {
        "response": display_text,
        "created_task": created_task,
        "updated_scope": updated_scope,
    }


@router.get("/projects/{project_id}/scope/messages")
def get_scope_messages(project_id: str):
    with get_db() as conn:
        project = db.get_project(conn, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        messages = db.list_scope_messages(conn, project_id)
    return messages
