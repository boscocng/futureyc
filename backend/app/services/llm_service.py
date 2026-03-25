"""LLM wrapper using OpenRouter (OpenAI-compatible API)."""
from __future__ import annotations
import os
from typing import List, Dict

import openai

_client: openai.OpenAI | None = None


def _get_client() -> openai.OpenAI:
    global _client
    if _client is None:
        _client = openai.OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
        )
    return _client


def call_llm(system_prompt: str, messages: List[Dict[str, str]], user_profile: dict = None) -> str:
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
