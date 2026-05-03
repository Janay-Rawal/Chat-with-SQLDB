from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from db.app_db import Base

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    session_id = Column(String, index=True)
    db_type = Column(String, nullable=True) # 'USE_LOCALDB' or 'USE_MYSQL'
    role = Column(String)  # 'user' or 'assistant'
    content = Column(Text)
    sql_query = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    chart_data = Column(Text, nullable=True)  # Store as JSON string
    timestamp = Column(DateTime, default=datetime.utcnow)
