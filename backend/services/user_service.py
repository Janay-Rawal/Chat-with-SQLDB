import bcrypt
import secrets
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy import text
from sqlalchemy.orm import Session
from models.user import User
from db.app_db import SessionLocal, init_app_db, engine

def init_db():
    # Now uses SQLAlchemy metadata to create all tables in users.db
    init_app_db()
    ensure_user_columns()

def ensure_user_columns():
    """Ensure the new columns exist in the users table for SQLite."""
    columns_to_add = [
        ("is_verified", "BOOLEAN DEFAULT 0"),
        ("verification_token", "VARCHAR"),
        ("verification_token_expiry", "DATETIME"),
        ("reset_password_token", "VARCHAR"),
        ("reset_password_expiry", "DATETIME")
    ]
    
    with engine.connect() as conn:
        # Check existing columns
        result = conn.execute(text("PRAGMA table_info(users)"))
        existing_columns = [row[1] for row in result]
        
        for col_name, col_type in columns_to_add:
            if col_name not in existing_columns:
                print(f"🛠 Adding column {col_name} to users table...")
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
        conn.commit()

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_user(email: str, password: str) -> Optional[User]:
    """Create a new user with email verification token."""
    hashed = hash_password(password)
    verification_token = secrets.token_urlsafe(32)
    # Token expires in 24 hours
    expiry = datetime.utcnow() + timedelta(hours=24)
    
    db = SessionLocal()
    try:
        user = User(
            email=email, 
            password_hash=hashed, 
            plan="FREE",
            is_verified=False,
            verification_token=verification_token,
            verification_token_expiry=expiry
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        print(f"Error creating user: {e}")
        db.rollback()
        return None
    finally:
        db.close()

def verify_user_email(token: str) -> bool:
    """Validate token and mark user as verified."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(
            User.verification_token == token,
            User.verification_token_expiry > datetime.utcnow()
        ).first()
        
        if not user:
            return False
        
        user.is_verified = True
        user.verification_token = None
        user.verification_token_expiry = None
        db.commit()
        return True
    except Exception:
        db.rollback()
        return False
    finally:
        db.close()

def create_password_reset_token(email: str) -> Optional[str]:
    """Generate a password reset token for a user."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        
        token = secrets.token_urlsafe(32)
        user.reset_password_token = token
        # Reset token expires in 1 hour
        user.reset_password_expiry = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        return token
    except Exception:
        db.rollback()
        return None
    finally:
        db.close()

def reset_user_password(token: str, new_password: str) -> bool:
    """Reset user password using a valid token."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(
            User.reset_password_token == token,
            User.reset_password_expiry > datetime.utcnow()
        ).first()
        
        if not user:
            return False
        
        user.password_hash = hash_password(new_password)
        user.reset_password_token = None
        user.reset_password_expiry = None
        db.commit()
        return True
    except Exception:
        db.rollback()
        return False
    finally:
        db.close()

def get_user_by_email(email: str) -> Optional[User]:
    """Fetch user by email using SQLAlchemy."""
    db = SessionLocal()
    try:
        return db.query(User).filter(User.email == email).first()
    finally:
        db.close()

def get_user_by_id(user_id: int) -> Optional[User]:
    """Fetch user by ID using SQLAlchemy."""
    db = SessionLocal()
    try:
        return db.query(User).filter(User.id == user_id).first()
    finally:
        db.close()

def update_user_plan(user_id: int, plan: str) -> bool:
    """Update user plan in database."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        user.plan = plan.upper()
        db.commit()
        return True
    except Exception:
        db.rollback()
        return False
    finally:
        db.close()


