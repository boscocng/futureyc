import sqlite3
from contextlib import contextmanager
from pathlib import Path

DATABASE_PATH = Path(__file__).resolve().parent.parent / "vibeforge.db"


@contextmanager
def get_db():
    conn = sqlite3.connect(str(DATABASE_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
    finally:
        conn.close()


def init_db():
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('student','educator','pm','developer','designer','founder','other')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS user_skill_profile (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL UNIQUE,
                frontend_comfort INTEGER NOT NULL DEFAULT 0 CHECK(frontend_comfort BETWEEN 0 AND 4),
                backend_comfort INTEGER NOT NULL DEFAULT 0 CHECK(backend_comfort BETWEEN 0 AND 4),
                database_comfort INTEGER NOT NULL DEFAULT 0 CHECK(database_comfort BETWEEN 0 AND 4),
                devops_comfort INTEGER NOT NULL DEFAULT 0 CHECK(devops_comfort BETWEEN 0 AND 4),
                mobile_comfort INTEGER NOT NULL DEFAULT 0 CHECK(mobile_comfort BETWEEN 0 AND 4),
                data_science_comfort INTEGER NOT NULL DEFAULT 0 CHECK(data_science_comfort BETWEEN 0 AND 4),
                general_coding_comfort INTEGER NOT NULL DEFAULT 0 CHECK(general_coding_comfort BETWEEN 0 AND 4),
                known_languages TEXT DEFAULT '[]',
                known_frameworks TEXT DEFAULT '[]',
                ai_tools TEXT DEFAULT '[]',
                project_interests TEXT DEFAULT '[]',
                raw_onboarding_answers TEXT DEFAULT '{}',
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'interviewing' CHECK(status IN ('interviewing','active','archived')),
                scope_summary TEXT,
                scope_detail TEXT,
                tech_stack TEXT DEFAULT '[]',
                interview_transcript TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                title TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'defining' CHECK(status IN ('defining','planned','prompt_ready','in_progress','done')),
                task_summary TEXT,
                implementation_plan TEXT,
                generated_prompt TEXT,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id)
            );

            CREATE TABLE IF NOT EXISTS task_messages (
                id TEXT PRIMARY KEY,
                task_id TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('user','assistant')),
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks(id)
            );

            CREATE TABLE IF NOT EXISTS scope_messages (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('user','assistant')),
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id)
            );
        """)
