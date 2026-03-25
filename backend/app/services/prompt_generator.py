"""Generate an implementation prompt for a task."""
from __future__ import annotations

from app.services.llm_service import call_llm


def _build_prompt_gen_system(user: dict, profile: dict, project: dict, task: dict) -> str:
    general = profile.get("general_coding_comfort", 0)
    tech_stack = ", ".join(project.get("tech_stack") or []) or "not defined"
    languages = ", ".join(profile.get("known_languages", [])) or "none"
    frameworks = ", ".join(profile.get("known_frameworks", [])) or "none"

    return f"""You are a prompt engineer. Your job is to generate a detailed, copy-paste-ready implementation prompt that a developer (or AI coding assistant) can use to build the described task.

PROJECT: {project.get("name", "Untitled")}
TECH STACK: {tech_stack}
PROJECT SCOPE:
{project.get("scope_summary") or "No scope defined."}

TASK: {task.get("title", "Untitled")}
SUMMARY: {task.get("task_summary") or "No summary."}
IMPLEMENTATION PLAN:
{task.get("implementation_plan") or "No plan."}

USER PROFILE:
- Coding comfort: {general}/4
- Known languages: {languages}
- Known frameworks: {frameworks}

INSTRUCTIONS:
Generate a comprehensive implementation prompt that includes:
1. A clear goal statement
2. Technical requirements (languages, frameworks, libraries to use)
3. Step-by-step implementation instructions
4. File structure suggestions if applicable
5. Key code patterns or approaches to follow
6. Edge cases and error handling to consider
7. Testing suggestions

The prompt should be:
- Self-contained — someone reading it should have all the context they need
- Specific — reference exact technologies from the tech stack
- Appropriately detailed for the user's coding comfort level
- Written in markdown format for readability

Output ONLY the prompt text. No preamble, no "Here's the prompt:", just the prompt itself."""


def generate_prompt(user: dict, profile: dict, project: dict, task: dict) -> str:
    system = _build_prompt_gen_system(user, profile, project, task)
    messages = [{"role": "user", "content": "Generate the implementation prompt for this task."}]
    return call_llm(system, messages, profile)
