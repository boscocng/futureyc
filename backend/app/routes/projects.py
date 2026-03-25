from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.database import get_db
from app.models.project import ProjectCreate, ProjectOut
from app.services import db_service as db

router = APIRouter()


class ProjectListItem(BaseModel):
    id: str
    name: str
    status: str
    scope_summary: Optional[str]
    created_at: str
    updated_at: str
    task_count: int


class ProjectDetail(ProjectOut):
    tasks: list


class CreateProjectBody(BaseModel):
    user_id: str
    name: str


@router.get("/users/{user_id}/projects", response_model=List[ProjectListItem])
def list_user_projects(user_id: str):
    with get_db() as conn:
        user = db.get_user(conn, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        projects = db.list_projects_by_user(conn, user_id)
        result = []
        for p in projects:
            if p["status"] == "archived":
                continue
            tasks = db.list_tasks_by_project(conn, p["id"])
            result.append({
                "id": p["id"],
                "name": p["name"],
                "status": p["status"],
                "scope_summary": p.get("scope_summary"),
                "created_at": p["created_at"],
                "updated_at": p["updated_at"],
                "task_count": len(tasks),
            })
        return result


@router.post("/projects", response_model=ProjectOut)
def create_project(body: CreateProjectBody):
    with get_db() as conn:
        user = db.get_user(conn, body.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        project = db.create_project(conn, user_id=body.user_id, name=body.name)
    return project


@router.get("/projects/{project_id}", response_model=ProjectDetail)
def get_project(project_id: str):
    with get_db() as conn:
        project = db.get_project(conn, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        tasks = db.list_tasks_by_project(conn, project_id)
    return {**project, "tasks": tasks}


@router.delete("/projects/{project_id}", response_model=ProjectOut)
def archive_project(project_id: str):
    with get_db() as conn:
        project = db.get_project(conn, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        project = db.update_project(conn, project_id, status="archived")
    return project
