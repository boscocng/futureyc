"""Process raw onboarding answers into a multi-dimensional skill profile."""
from __future__ import annotations
from typing import Any, Dict, List


# Framework → skill dimension mapping
_FRONTEND_FRAMEWORKS = {"react", "vue", "angular", "next.js"}
_BACKEND_FRAMEWORKS = {"django", "fastapi", "flask", "express", "spring", "rails", ".net", "laravel"}
_MOBILE_FRAMEWORKS = {"react native", "flutter", "swift", "kotlin"}
_DB_INDICATORS = {"postgresql", "mongodb", "sql", "sqlite", "mysql", "redis"}
_DEVOPS_INDICATORS = {"docker", "aws", "vercel", "kubernetes", "gcp", "azure", "terraform", "netlify"}
_DATA_SCIENCE_INDICATORS = {"pandas", "jupyter", "tensorflow", "pytorch", "r", "scikit-learn", "numpy"}

# Role → dimension boosts
_ROLE_BOOSTS: Dict[str, Dict[str, int]] = {
    "developer": {
        "frontend_comfort": 1, "backend_comfort": 1, "database_comfort": 1,
        "devops_comfort": 1, "mobile_comfort": 1, "data_science_comfort": 1,
        "general_coding_comfort": 1,
    },
    "data_scientist": {"data_science_comfort": 1, "general_coding_comfort": 1},
    "educator": {},
    "student": {},
    "pm": {},
    "designer": {"frontend_comfort": 1},
    "founder": {},
    "other": {},
}


def _clamp(val: int, lo: int = 0, hi: int = 4) -> int:
    return max(lo, min(hi, val))


def _coding_comfort_to_score(level: int) -> int:
    """Map 1-5 slider to 0-4 comfort score."""
    return _clamp(level - 1, 0, 4)


def _has_any(selections: List[str], indicators: set) -> bool:
    return any(s.lower() in indicators for s in selections)


def compute_skill_profile(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Take raw onboarding answers and return computed profile fields."""

    name: str = raw.get("name", "")
    role: str = raw.get("role", "other")
    coding_level: int = raw.get("coding_comfort", 1)
    languages: List[str] = raw.get("languages", [])
    frameworks: List[str] = raw.get("frameworks", [])
    ai_tools: List[str] = raw.get("ai_tools", [])
    project_interests: List[str] = raw.get("project_interests", [])

    general = _coding_comfort_to_score(coding_level)

    # Start all dimensions at 0
    frontend = 0
    backend = 0
    database = 0
    devops = 0
    mobile = 0
    data_science = 0

    # Infer from frameworks / languages
    all_tools = [s.lower() for s in languages + frameworks]

    if _has_any(frameworks, _FRONTEND_FRAMEWORKS):
        frontend = max(2, general)
    if _has_any(frameworks, _BACKEND_FRAMEWORKS):
        backend = max(2, general)
    if _has_any(languages + frameworks, _DB_INDICATORS):
        database = max(2, general)
    if _has_any(languages + frameworks, _DEVOPS_INDICATORS):
        devops = max(1, general)
    if _has_any(languages + frameworks, _MOBILE_FRAMEWORKS):
        mobile = max(2, general)
    if _has_any(languages + frameworks, _DATA_SCIENCE_INDICATORS):
        data_science = max(2, general)

    # Role-based boosts
    boosts = _ROLE_BOOSTS.get(role, {})
    general = _clamp(general + boosts.get("general_coding_comfort", 0))
    frontend = _clamp(frontend + boosts.get("frontend_comfort", 0))
    backend = _clamp(backend + boosts.get("backend_comfort", 0))
    database = _clamp(database + boosts.get("database_comfort", 0))
    devops = _clamp(devops + boosts.get("devops_comfort", 0))
    mobile = _clamp(mobile + boosts.get("mobile_comfort", 0))
    data_science = _clamp(data_science + boosts.get("data_science_comfort", 0))

    return {
        "name": name,
        "role": role,
        "general_coding_comfort": general,
        "frontend_comfort": frontend,
        "backend_comfort": backend,
        "database_comfort": database,
        "devops_comfort": devops,
        "mobile_comfort": mobile,
        "data_science_comfort": data_science,
        "known_languages": languages,
        "known_frameworks": frameworks,
        "ai_tools": ai_tools,
        "project_interests": project_interests,
    }
