from pydantic import BaseModel
from typing import Optional, List, Any


class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    db_type: str = "USE_LOCALDB"
    mysql_host: Optional[str] = None
    mysql_user: Optional[str] = None
    mysql_password: Optional[str] = None
    mysql_db: Optional[str] = None


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str
    sql_query: Optional[str] = None
    explanation: Optional[str] = None
    chart_data: Optional[Any] = None


class ChatResponse(BaseModel):
    session_id: str
    answer: str
    sql_query: Optional[str] = None
    explanation: Optional[str] = None
    chart_data: Optional[Any] = None
    data: Optional[List[Any]] = None
    followups: Optional[List[str]] = None
    insights: Optional[List[str]] = None
    cached: Optional[bool] = False


class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None


class TableColumn(BaseModel):
    name: str
    type: str
    nullable: bool = True


class TableSchema(BaseModel):
    name: str
    columns: List[TableColumn]
    row_count: int = 0


class SchemaResponse(BaseModel):
    tables: List[TableSchema]