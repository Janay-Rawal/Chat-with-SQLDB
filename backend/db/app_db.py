import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Path to the App Database (users, history, etc.)
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "users.db"

# Ensure directory exists
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

# SQLAlchemy setup
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_app_db():
    print(f"🚀 Initializing App Database at: {DB_PATH}")
    Base.metadata.create_all(bind=engine)
