from __future__ import annotations
import json
import logging
from typing import Optional

import openai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.database import get_db
from app.models.task import TaskOut
from app.services import db_service as db
from app.services.llm_service import call_llm
from app.services.prompt_generator import generate_prompt as gen_prompt
from app.prompts.task_chat_system import build_task_chat_prompt

logger = logging.getLogger(__name__)

router = APIRouter()

TASK_MARKER = "===TASK_UPDATED==="


class TaskChatRequest(BaseModel):
    content: str


class TaskChatResponse(BaseModel):
    response: str
    updated_task: Optional[TaskOut] = None


class GeneratePromptResponse(BaseModel):
    task: TaskOut


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


@router.post("/tasks/{task_id}/message", response_model=TaskChatResponse)
def send_task_message(task_id: str, body: TaskChatRequest):
    with get_db() as conn:
        task = db.get_task(conn, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        project = db.get_project(conn, task["project_id"])
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        user = db.get_user(conn, project["user_id"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        profile = db.get_skill_profile_by_user(conn, project["user_id"])
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        # Load existing task messages as chat history
        existing = db.list_task_messages(conn, task_id)
        messages = [{"role": m["role"], "content": m["content"]} for m in existing]
        messages.append({"role": "user", "content": body.content})

    system_prompt = build_task_chat_prompt(user, profile, project, task)
    try:
        assistant_text = call_llm(system_prompt, messages, profile)
    except openai.AuthenticationError:
        logger.exception("OpenRouter authentication failed during task chat")
        raise HTTPException(status_code=502, detail="AI service authentication failed. Check your OPENROUTER_API_KEY.")
    except openai.RateLimitError:
        logger.exception("OpenRouter rate limit hit during task chat")
        raise HTTPException(status_code=429, detail="AI service rate limit reached. Please try again shortly.")
    except openai.APIError:
        logger.exception("OpenRouter API error during task chat")
        raise HTTPException(status_code=502, detail="AI service is temporarily unavailable. Please try again.")

    # Detect marker
    task_data = _extract_json_after(assistant_text, TASK_MARKER)

    # Clean display text
    display_text = assistant_text
    if task_data:
        display_text = _strip_marker_block(display_text, TASK_MARKER)
    if not display_text:
        display_text = assistant_text

    updated_task = None

    with get_db() as conn:
        # Persist both messages
        db.create_task_message(conn, task_id=task_id, role="user", content=body.content)
        db.create_task_message(conn, task_id=task_id, role="assistant", content=assistant_text)

        # Update task if detected
        if task_data:
            update_fields = {}
            if task_data.get("title"):
                update_fields["title"] = task_data["title"]
            if task_data.get("task_summary"):
                update_fields["task_summary"] = task_data["task_summary"]
            if task_data.get("implementation_plan"):
                update_fields["implementation_plan"] = task_data["implementation_plan"]
            if update_fields:
                updated_task = db.update_task(conn, task_id, **update_fields)

    return {
        "response": display_text,
        "updated_task": updated_task,
    }


@router.get("/tasks/{task_id}/messages")
def get_task_messages(task_id: str):
    with get_db() as conn:
        task = db.get_task(conn, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        messages = db.list_task_messages(conn, task_id)
    return messages


@router.post("/tasks/{task_id}/generate-prompt", response_model=GeneratePromptResponse)
def generate_task_prompt(task_id: str):
    with get_db() as conn:
        task = db.get_task(conn, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        project = db.get_project(conn, task["project_id"])
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        user = db.get_user(conn, project["user_id"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        profile = db.get_skill_profile_by_user(conn, project["user_id"])
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

    try:
        prompt_text = gen_prompt(user, profile, project, task)
    except openai.AuthenticationError:
        logger.exception("OpenRouter authentication failed during prompt generation")
        raise HTTPException(status_code=502, detail="AI service authentication failed. Check your OPENROUTER_API_KEY.")
    except openai.RateLimitError:
        logger.exception("OpenRouter rate limit hit during prompt generation")
        raise HTTPException(status_code=429, detail="AI service rate limit reached. Please try again shortly.")
    except openai.APIError:
        logger.exception("OpenRouter API error during prompt generation")
        raise HTTPException(status_code=502, detail="AI service is temporarily unavailable. Please try again.")

    with get_db() as conn:
        updated = db.update_task(conn, task_id, generated_prompt=prompt_text, status="prompt_ready")

    return {"task": updated}
