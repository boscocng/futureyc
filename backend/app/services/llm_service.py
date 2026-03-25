"""Thin wrapper around the Anthropic SDK."""
from __future__ import annotations
import os
from typing import List, Dict

import anthropic

MODEL = "claude-sonnet-4-20250514"


def call_llm(system_prompt: str, messages: List[Dict[str, str]], user_profile: dict) -> str:
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    api_messages = [
        {"role": m["role"], "content": m["content"]}
        for m in messages
    ]

    response = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system=system_prompt,
        messages=api_messages,
    )

    return response.content[0].text
