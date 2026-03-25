from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chat import router as chat_router
from routes.schema import router as schema_router

app = FastAPI(title="SQL Chat API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")
app.include_router(schema_router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}