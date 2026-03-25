import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from app.database import init_db
from app.routes import health, onboarding, projects, interview, scope_chat, tasks, task_chat

load_dotenv()

logger = logging.getLogger("vibeforge")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again."},
    )


app.include_router(health.router, prefix="/api")
app.include_router(onboarding.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(interview.router, prefix="/api")
app.include_router(scope_chat.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(task_chat.router, prefix="/api")
