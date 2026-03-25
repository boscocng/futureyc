"""LLM wrapper using OpenRouter (OpenAI-compatible API).

Set STUB_LLM=true in .env to skip real API calls and return fake responses
from app/services/stubs.py — useful for frontend development and demos.
"""
from __future__ import annotations
import os
from typing import List, Dict

import openai

_client: openai.OpenAI | None = None


def _is_stub_mode() -> bool:
    return os.getenv("STUB_LLM", "").lower() in ("1", "true", "yes")


def _get_client() -> openai.OpenAI:
    global _client
    if _client is None:
        _client = openai.OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
        )
    return _client


def call_llm(system_prompt: str, messages: List[Dict[str, str]], user_profile: dict = None) -> str:
    if _is_stub_mode():
        from app.services import stubs
        return _stub_response(system_prompt, messages, stubs)

    client = _get_client()
    model = os.getenv("LLM_MODEL", "anthropic/claude-sonnet-4-20250514")

    formatted_messages = [{"role": "system", "content": system_prompt}] + [
        {"role": m["role"], "content": m["content"]} for m in messages
    ]

    response = client.chat.completions.create(
        model=model,
        messages=formatted_messages,
        max_tokens=4096,
        extra_headers={
            "HTTP-Referer": os.getenv("APP_URL", "http://localhost:5173"),
            "X-Title": "VibeForge",
        },
    )

    return response.choices[0].message.content


def _stub_response(system_prompt: str, messages: List[Dict[str, str]], stubs) -> str:
    """Route to the correct stub based on what the system prompt is for."""
    prompt_lower = system_prompt.lower()

    # Interview: system prompt mentions "interview" or "scope"
    if "interview" in prompt_lower:
        # Count how many assistant turns have already happened (= number of prior exchanges)
        turn = sum(1 for m in messages if m["role"] == "assistant")
        return stubs.get_interview_stub(turn)

    # Prompt generation: system prompt mentions "prompt engineer"
    if "prompt engineer" in prompt_lower:
        return stubs.get_generate_prompt_stub()

    # Task chat: system prompt mentions "task"
    if "task" in prompt_lower:
        last_user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        return stubs.get_task_chat_stub(last_user)

    # Scope chat: fallback
    last_user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
    return stubs.get_scope_chat_stub(last_user)
