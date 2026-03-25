from __future__ import annotations
import json
import logging
import re
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.database import get_db
from app.models.project import ProjectOut
from app.services import db_service as db
from app.services.llm_service import call_llm
from app.prompts.interview_system import build_interview_system_prompt

logger = logging.getLogger(__name__)

router = APIRouter()

COMPLETION_MARKER = "===INTERVIEW_COMPLETE==="


class MessageIn(BaseModel):
    role: str
    content: str


class InterviewMessageRequest(BaseModel):
    content: str
    history: List[MessageIn] = []


class InterviewMessageResponse(BaseModel):
    response: str
    interview_complete: bool
    project: Optional[ProjectOut] = None


def _parse_completion(text: str) -> Optional[dict]:
    """Extract JSON payload after the completion marker."""
    idx = text.find(COMPLETION_MARKER)
    if idx == -1:
        return None

    after = text[idx + len(COMPLETION_MARKER):]
    # Find the JSON block — look for first { to last }
    start = after.find("{")
    if start == -1:
        return None

    # Find matching closing brace
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


@router.post("/projects/{project_id}/interview/message", response_model=InterviewMessageResponse)
def send_interview_message(project_id: str, body: InterviewMessageRequest):
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

    # Build message list: history from client + new user message
    messages = [{"role": m.role, "content": m.content} for m in body.history]
    messages.append({"role": "user", "content": body.content})

    system_prompt = build_interview_system_prompt(user, profile)
    try:
        assistant_text = call_llm(system_prompt, messages, profile)
    except Exception as e:
        logger.exception("LLM call failed during interview")
        raise HTTPException(status_code=502, detail="AI service is temporarily unavailable. Please try again.")

    # Check for interview completion
    completion_data = _parse_completion(assistant_text)
    interview_complete = completion_data is not None
    updated_project = None

    if interview_complete:
        # Strip the marker + JSON from the display text
        display_text = assistant_text[:assistant_text.find(COMPLETION_MARKER)].strip()
        if not display_text:
            display_text = "Your project scope is ready! Here's what we've defined."

        # Build full transcript
        full_transcript = messages + [{"role": "assistant", "content": assistant_text}]

        with get_db() as conn:
            # Bulk-insert all messages into scope_messages
            for msg in full_transcript:
                db.create_scope_message(
                    conn,
                    project_id=project_id,
                    role=msg["role"],
                    content=msg["content"],
                )

            # Update project with scope data
            update_fields = {
                "status": "active",
                "scope_summary": completion_data.get("scope_summary", ""),
                "scope_detail": completion_data.get("scope_detail", ""),
                "tech_stack": completion_data.get("tech_stack", []),
                "interview_transcript": full_transcript,
            }
            updated_project = db.update_project(conn, project_id, **update_fields)

            # Create suggested tasks
            for i, task in enumerate(completion_data.get("suggested_tasks", [])):
                db.create_task(
                    conn,
                    project_id=project_id,
                    title=task.get("title", f"Task {i + 1}"),
                    status="planned",
                    display_order=i,
                )

        assistant_text = display_text

    return {
        "response": assistant_text,
        "interview_complete": interview_complete,
        "project": updated_project,
    }


@router.get("/projects/{project_id}/interview/messages")
def get_interview_messages(project_id: str):
    with get_db() as conn:
        project = db.get_project(conn, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        messages = db.list_scope_messages(conn, project_id)
    return messages
