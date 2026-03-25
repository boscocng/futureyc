"""CRUD helpers for every table. All functions take a sqlite3 connection."""
from __future__ import annotations
import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.database import get_db


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id() -> str:
    return str(uuid.uuid4())


def _row_to_dict(row) -> Optional[Dict[str, Any]]:
    if row is None:
        return None
    return dict(row)


# ── JSON field helpers ──────────────────────────────────────────────

_JSON_FIELDS_SKILL = {
    "known_languages", "known_frameworks", "ai_tools",
    "project_interests", "raw_onboarding_answers",
}
_JSON_FIELDS_PROJECT = {"tech_stack", "interview_transcript"}


def _serialize_json_fields(data: dict, json_fields: set) -> dict:
    out = dict(data)
    for k in json_fields:
        if k in out and out[k] is not None:
            out[k] = json.dumps(out[k])
    return out


def _deserialize_json_fields(data: Optional[dict], json_fields: set) -> Optional[dict]:
    if data is None:
        return None
    out = dict(data)
    for k in json_fields:
        if k in out and out[k] is not None:
            out[k] = json.loads(out[k])
    return out


# ── Generic helpers ─────────────────────────────────────────────────

def _insert(conn, table: str, data: dict) -> dict:
    cols = ", ".join(data.keys())
    placeholders = ", ".join(["?"] * len(data))
    conn.execute(f"INSERT INTO {table} ({cols}) VALUES ({placeholders})", list(data.values()))
    conn.commit()
    return _get_by_id(conn, table, data["id"])


def _get_by_id(conn, table: str, row_id: str) -> Optional[dict]:
    cur = conn.execute(f"SELECT * FROM {table} WHERE id = ?", (row_id,))
    return _row_to_dict(cur.fetchone())


def _update(conn, table: str, row_id: str, data: dict) -> Optional[dict]:
    if not data:
        return _get_by_id(conn, table, row_id)
    sets = ", ".join(f"{k} = ?" for k in data.keys())
    vals = list(data.values()) + [row_id]
    conn.execute(f"UPDATE {table} SET {sets} WHERE id = ?", vals)
    conn.commit()
    return _get_by_id(conn, table, row_id)


def _list_by(conn, table: str, column: str, value: str, order: str = "created_at") -> List[dict]:
    cur = conn.execute(f"SELECT * FROM {table} WHERE {column} = ? ORDER BY {order}", (value,))
    return [_row_to_dict(r) for r in cur.fetchall()]


# ═══════════════════════════════════════════════════════════════════
#  USERS
# ═══════════════════════════════════════════════════════════════════

def create_user(conn, *, name: str, role: str) -> dict:
    data = {"id": _new_id(), "name": name, "role": role,
            "created_at": _now(), "updated_at": _now()}
    return _insert(conn, "users", data)


def get_user(conn, user_id: str) -> Optional[dict]:
    return _get_by_id(conn, "users", user_id)


def update_user(conn, user_id: str, **fields) -> Optional[dict]:
    fields = {k: v for k, v in fields.items() if v is not None}
    if fields:
        fields["updated_at"] = _now()
    return _update(conn, "users", user_id, fields)


def list_users(conn) -> List[dict]:
    cur = conn.execute("SELECT * FROM users ORDER BY created_at")
    return [_row_to_dict(r) for r in cur.fetchall()]


# ═══════════════════════════════════════════════════════════════════
#  USER SKILL PROFILE
# ═══════════════════════════════════════════════════════════════════

def create_skill_profile(conn, *, user_id: str, **fields) -> dict:
    data = {"id": _new_id(), "user_id": user_id, **fields}
    data = _serialize_json_fields(data, _JSON_FIELDS_SKILL)
    return _deserialize_json_fields(_insert(conn, "user_skill_profile", data), _JSON_FIELDS_SKILL)


def get_skill_profile(conn, profile_id: str) -> Optional[dict]:
    return _deserialize_json_fields(_get_by_id(conn, "user_skill_profile", profile_id), _JSON_FIELDS_SKILL)


def get_skill_profile_by_user(conn, user_id: str) -> Optional[dict]:
    cur = conn.execute("SELECT * FROM user_skill_profile WHERE user_id = ?", (user_id,))
    return _deserialize_json_fields(_row_to_dict(cur.fetchone()), _JSON_FIELDS_SKILL)


def update_skill_profile(conn, profile_id: str, **fields) -> Optional[dict]:
    fields = {k: v for k, v in fields.items() if v is not None}
    fields = _serialize_json_fields(fields, _JSON_FIELDS_SKILL)
    return _deserialize_json_fields(_update(conn, "user_skill_profile", profile_id, fields), _JSON_FIELDS_SKILL)


# ═══════════════════════════════════════════════════════════════════
#  PROJECTS
# ═══════════════════════════════════════════════════════════════════

def create_project(conn, *, user_id: str, name: str, status: str = "interviewing") -> dict:
    data = {"id": _new_id(), "user_id": user_id, "name": name, "status": status,
            "created_at": _now(), "updated_at": _now()}
    row = _insert(conn, "projects", data)
    return _deserialize_json_fields(row, _JSON_FIELDS_PROJECT)


def get_project(conn, project_id: str) -> Optional[dict]:
    return _deserialize_json_fields(_get_by_id(conn, "projects", project_id), _JSON_FIELDS_PROJECT)


def update_project(conn, project_id: str, **fields) -> Optional[dict]:
    fields = {k: v for k, v in fields.items() if v is not None}
    if fields:
        fields["updated_at"] = _now()
    fields = _serialize_json_fields(fields, _JSON_FIELDS_PROJECT)
    return _deserialize_json_fields(_update(conn, "projects", project_id, fields), _JSON_FIELDS_PROJECT)


def list_projects_by_user(conn, user_id: str) -> List[dict]:
    rows = _list_by(conn, "projects", "user_id", user_id)
    return [_deserialize_json_fields(r, _JSON_FIELDS_PROJECT) for r in rows]


# ═══════════════════════════════════════════════════════════════════
#  TASKS
# ═══════════════════════════════════════════════════════════════════

def create_task(conn, *, project_id: str, title: str, status: str = "defining",
                display_order: int = 0) -> dict:
    data = {"id": _new_id(), "project_id": project_id, "title": title,
            "status": status, "display_order": display_order,
            "created_at": _now(), "updated_at": _now()}
    return _insert(conn, "tasks", data)


def get_task(conn, task_id: str) -> Optional[dict]:
    return _get_by_id(conn, "tasks", task_id)


def update_task(conn, task_id: str, **fields) -> Optional[dict]:
    fields = {k: v for k, v in fields.items() if v is not None}
    if fields:
        fields["updated_at"] = _now()
    return _update(conn, "tasks", task_id, fields)


def list_tasks_by_project(conn, project_id: str) -> List[dict]:
    return _list_by(conn, "tasks", "project_id", project_id, order="display_order")


# ═══════════════════════════════════════════════════════════════════
#  TASK MESSAGES
# ═══════════════════════════════════════════════════════════════════

def create_task_message(conn, *, task_id: str, role: str, content: str) -> dict:
    data = {"id": _new_id(), "task_id": task_id, "role": role,
            "content": content, "created_at": _now()}
    return _insert(conn, "task_messages", data)


def get_task_message(conn, message_id: str) -> Optional[dict]:
    return _get_by_id(conn, "task_messages", message_id)


def list_task_messages(conn, task_id: str) -> List[dict]:
    return _list_by(conn, "task_messages", "task_id", task_id)


# ═══════════════════════════════════════════════════════════════════
#  SCOPE MESSAGES
# ═══════════════════════════════════════════════════════════════════

def create_scope_message(conn, *, project_id: str, role: str, content: str) -> dict:
    data = {"id": _new_id(), "project_id": project_id, "role": role,
            "content": content, "created_at": _now()}
    return _insert(conn, "scope_messages", data)


def get_scope_message(conn, message_id: str) -> Optional[dict]:
    return _get_by_id(conn, "scope_messages", message_id)


def list_scope_messages(conn, project_id: str) -> List[dict]:
    return _list_by(conn, "scope_messages", "project_id", project_id)
