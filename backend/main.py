from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from pathlib import Path
import sqlite3

from sqlalchemy import create_engine
from langchain_community.agent_toolkits import create_sql_agent, SQLDatabaseToolkit
from langchain_community.utilities import SQLDatabase
from langchain.agents.agent_types import AgentType
from langchain_groq import ChatGroq

app = FastAPI(title="SQL Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

LOCAL_DB = "USE_LOCALDB"
MYSQL = "USE_MYSQL"


class ChatRequest(BaseModel):
    query: str
    api_key: str
    db_type: str
    mysql_host: Optional[str] = None
    mysql_user: Optional[str] = None
    mysql_password: Optional[str] = None
    mysql_db: Optional[str] = None


def configure_db(req: ChatRequest) -> SQLDatabase:
    if req.db_type == LOCAL_DB:
        dbfilepath = (Path(__file__).parent / "student.db").absolute()
        creator = lambda: sqlite3.connect(f"file:{dbfilepath}?mode=ro", uri=True)
        return SQLDatabase(create_engine("sqlite:///", creator=creator))

    elif req.db_type == MYSQL:
        missing = [f for f, v in [
            ("mysql_host", req.mysql_host),
            ("mysql_user", req.mysql_user),
            ("mysql_password", req.mysql_password),
            ("mysql_db", req.mysql_db),
        ] if not v]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing MySQL fields: {', '.join(missing)}")
        uri = (f"mysql+mysqlconnector://{req.mysql_user}:{req.mysql_password}"
               f"@{req.mysql_host}/{req.mysql_db}")
        return SQLDatabase(create_engine(uri))

    raise HTTPException(status_code=400, detail="Invalid db_type")


@app.post("/chat")
async def chat(req: ChatRequest):
    if not req.api_key:
        raise HTTPException(status_code=400, detail="GROQ API key is required.")
    if not req.query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        llm = ChatGroq(
            groq_api_key=req.api_key.strip(),
            model_name="llama-3.3-70b-versatile",
            streaming=False,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize LLM: {e}")

    try:
        db = configure_db(req)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB connection failed: {e}")

    try:
        toolkit = SQLDatabaseToolkit(db=db, llm=llm)
        agent = create_sql_agent(
            llm=llm,
            toolkit=toolkit,
            verbose=True,
            agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        )
        response = agent.run(req.query)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {e}")


@app.get("/health")
def health():
    return {"status": "ok"}