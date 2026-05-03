import json
from typing import List
from models.schemas import ChatMessage
from models.chat_history import ChatHistory
from db.app_db import SessionLocal

def get_history(user_id: int, session_id: str) -> List[ChatMessage]:
    """Fetch session history from users.db."""
    db = SessionLocal()
    try:
        rows = db.query(ChatHistory).filter(
            ChatHistory.user_id == user_id,
            ChatHistory.session_id == session_id
        ).order_by(ChatHistory.timestamp.asc()).all()
        
        messages = []
        for row in rows:
            messages.append(ChatMessage(
                role=row.role,
                content=row.content,
                sql_query=row.sql_query,
                explanation=row.explanation,
                chart_data=json.loads(row.chart_data) if row.chart_data else None
            ))
        return messages
    finally:
        db.close()

def append_message(user_id: int, session_id: str, message: ChatMessage, db_type: str = None) -> None:
    """Save a new message to users.db."""
    db = SessionLocal()
    try:
        history_entry = ChatHistory(
            user_id=user_id,
            session_id=session_id,
            db_type=db_type,
            role=message.role,
            content=message.content,
            sql_query=message.sql_query,
            explanation=message.explanation,
            chart_data=json.dumps(message.chart_data) if message.chart_data else None
        )
        db.add(history_entry)
        db.commit()
    except Exception as e:
        print(f"⚠️ Failed to save message: {e}")
        db.rollback()
    finally:
        db.close()

def get_user_sessions(user_id: int):
    """Retrieve unique list of chat sessions for a user."""
    db = SessionLocal()
    try:
        from sqlalchemy import func
        # Get latest message for each session to sort by most recent
        subquery = db.query(
            ChatHistory.session_id,
            func.max(ChatHistory.timestamp).label("max_ts")
        ).filter(ChatHistory.user_id == user_id).group_by(ChatHistory.session_id).subquery()
        
        sessions = db.query(ChatHistory).join(
            subquery,
            (ChatHistory.session_id == subquery.c.session_id) & 
            (ChatHistory.timestamp == subquery.c.max_ts)
        ).order_by(ChatHistory.timestamp.desc()).all()
        
        return [{
            "session_id": s.session_id,
            "db_type": s.db_type,
            "last_message": s.content[:60] + "..." if len(s.content) > 60 else s.content,
            "timestamp": s.timestamp.isoformat()
        } for s in sessions]
    finally:
        db.close()

def clear_history(user_id: int, session_id: str) -> None:
    """Delete session history from users.db."""
    db = SessionLocal()
    try:
        db.query(ChatHistory).filter(
            ChatHistory.user_id == user_id,
            ChatHistory.session_id == session_id
        ).delete()
        db.commit()
    finally:
        db.close()

def clear_user_history(user_id: int) -> None:
    """Delete all history for a user from users.db."""
    db = SessionLocal()
    try:
        db.query(ChatHistory).filter(ChatHistory.user_id == user_id).delete()
        db.commit()
    finally:
        db.close()

def get_context_string(user_id: int, session_id: str, max_turns: int = 6) -> str:
    """Return the last N turns as a plain-text context block for the LLM prompt."""
    history = get_history(user_id, session_id)[-max_turns:]
    if not history:
        return ""
    lines = []
    for msg in history:
        prefix = "User" if msg.role == "user" else "Assistant"
        lines.append(f"{prefix}: {msg.content}")
    return "\n".join(lines)