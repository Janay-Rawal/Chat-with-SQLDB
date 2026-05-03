from sqlalchemy import Column, Integer, String, Boolean, DateTime
from db.app_db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    plan = Column(String, nullable=False, default="FREE")
    
    # Email Verification
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    verification_token_expiry = Column(DateTime, nullable=True)

    # Password Reset
    reset_password_token = Column(String, nullable=True)
    reset_password_expiry = Column(DateTime, nullable=True)

