import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chat import router as chat_router
from routes.schema import router as schema_router
from routes.auth import router as auth_router
from db.app_db import init_app_db, DB_PATH
from db.query_db import DB_PATH as QUERY_DB_PATH
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="SQL Chat API", version="2.0.0")

@app.on_event("startup")
def startup():
    print(f"🚀 Starting backend...")
    print(f"📁 App Database: {DB_PATH}")
    print(f"📁 Query Database: {QUERY_DB_PATH}")
    init_app_db()
    from services.user_service import ensure_user_columns
    ensure_user_columns()


# Read allowed origins from env var (comma-separated list)
# e.g. ALLOWED_ORIGINS="https://your-app.vercel.app,http://localhost:5173"
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")
app.include_router(schema_router, prefix="/api")
app.include_router(auth_router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}