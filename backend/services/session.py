from typing import Dict, List
from models.schemas import ChatMessage

# Simple in-memory store: session_id -> list of messages
# For production, swap this with Redis or a lightweight DB
_sessions: Dict[str, List[ChatMessage]] = {}


def get_history(session_id: str) -> List[ChatMessage]:
    return _sessions.get(session_id, [])


def append_message(session_id: str, message: ChatMessage) -> None:
    if session_id not in _sessions:
        _sessions[session_id] = []
    _sessions[session_id].append(message)


def clear_history(session_id: str) -> None:
    _sessions.pop(session_id, None)


def get_context_string(session_id: str, max_turns: int = 6) -> str:
    """Return the last N turns as a plain-text context block for the LLM prompt."""
    history = get_history(session_id)[-max_turns:]
    if not history:
        return ""
    lines = []
    for msg in history:
        prefix = "User" if msg.role == "user" else "Assistant"
        lines.append(f"{prefix}: {msg.content}")
    return "\n".join(lines)