from __future__ import annotations
from typing import List

from fastapi import APIRouter, HTTPException

from app.database import get_db
from app.models.task import TaskOut, TaskUpdate
from app.services import db_service as db

router = APIRouter()


@router.get("/projects/{project_id}/tasks", response_model=List[TaskOut])
def list_project_tasks(project_id: str):
    with get_db() as conn:
        project = db.get_project(conn, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        tasks = db.list_tasks_by_project(conn, project_id)
    return tasks


@router.get("/tasks/{task_id}", response_model=TaskOut)
def get_task(task_id: str):
    with get_db() as conn:
        task = db.get_task(conn, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: str, body: TaskUpdate):
    with get_db() as conn:
        task = db.get_task(conn, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        fields = body.model_dump(exclude_none=True)
        if fields:
            task = db.update_task(conn, task_id, **fields)
    return task


@router.delete("/tasks/{task_id}", response_model=TaskOut)
def archive_task(task_id: str):
    with get_db() as conn:
        task = db.get_task(conn, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        task = db.update_task(conn, task_id, status="done")
    return task
