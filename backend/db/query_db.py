import sqlite3
from pathlib import Path
from typing import Optional

from sqlalchemy import create_engine, text, inspect
from langchain_community.utilities import SQLDatabase
from fastapi import HTTPException


LOCAL_DB = "USE_LOCALDB"
MYSQL = "USE_MYSQL"

# Path to the SQLite file — lives next to this file's parent (backend/)
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "student.db"

# Ensure directory exists
DB_PATH.parent.mkdir(parents=True, exist_ok=True)
print(f"📁 Local database path (student.db): {DB_PATH}")


def get_sql_database(
    db_type: str,
    mysql_host: Optional[str] = None,
    mysql_user: Optional[str] = None,
    mysql_password: Optional[str] = None,
    mysql_db: Optional[str] = None,
) -> SQLDatabase:
    try:
        if db_type == LOCAL_DB:
            creator = lambda: sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True, check_same_thread=False)
            return SQLDatabase(create_engine("sqlite:///", creator=creator))

        elif db_type == MYSQL:
            missing = [
                name for name, val in [
                    ("mysql_host", mysql_host),
                    ("mysql_user", mysql_user),
                    ("mysql_password", mysql_password),
                    ("mysql_db", mysql_db),
                ]
                if not val
            ]
            if missing:
                raise HTTPException(
                    status_code=400,
                    detail={"error": "Missing MySQL fields", "details": ", ".join(missing)},
                )
            uri = f"mysql+mysqlconnector://{mysql_user}:{mysql_password}@{mysql_host}/{mysql_db}"
            return SQLDatabase(create_engine(uri))

        raise HTTPException(status_code=400, detail={"error": "Invalid db_type"})

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={"error": "Database connection failed", "details": str(e)},
        )


def get_raw_engine(
    db_type: str,
    mysql_host: Optional[str] = None,
    mysql_user: Optional[str] = None,
    mysql_password: Optional[str] = None,
    mysql_db: Optional[str] = None,
):
    """Return a plain SQLAlchemy engine (for schema inspection)."""
    if db_type == LOCAL_DB:
        creator = lambda: sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
        return create_engine("sqlite:///", creator=creator)
    elif db_type == MYSQL:
        uri = f"mysql+mysqlconnector://{mysql_user}:{mysql_password}@{mysql_host}/{mysql_db}"
        return create_engine(uri)
    raise HTTPException(status_code=400, detail={"error": "Invalid db_type"})