import bcrypt
from typing import Optional
from sqlalchemy import text
from models.user import User
from db.app_db import SessionLocal, init_app_db, engine


def init_db():
    init_app_db()
    ensure_user_columns()


def ensure_user_columns():
    """
    Ensure the users table has the required columns.
    Auto-verifies all existing rows (email verification is disabled).
    """
    columns_to_add = [
        ("is_verified",               "BOOLEAN DEFAULT 1"),
        ("verification_token",        "VARCHAR"),
        ("verification_token_expiry", "DATETIME"),
        ("reset_password_token",      "VARCHAR"),
        ("reset_password_expiry",     "DATETIME"),
        ("security_pin",              "VARCHAR"),
    ]

    with engine.connect() as conn:
        result = conn.execute(text("PRAGMA table_info(users)"))
        existing_columns = [row[1] for row in result]

        for col_name, col_type in columns_to_add:
            if col_name not in existing_columns:
                print(f"🛠  Adding column {col_name} to users table...")
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))

        # One-time migration: mark every legacy user as verified
        conn.execute(text(
            "UPDATE users SET is_verified = 1 WHERE is_verified = 0 OR is_verified IS NULL"
        ))
        conn.commit()
    print("✅ DB schema up to date. All users verified.")


# ── Password helpers ──────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


# ── CRUD ──────────────────────────────────────────────────────────────────────

def create_user(email: str, password: str) -> Optional[User]:
    """
    Create a new user. is_verified=True immediately — no email step.
    Returns None if the email is already registered.
    """
    db = SessionLocal()
    try:
        user = User(
            email=email,
            password_hash=hash_password(password),
            plan="FREE",
            is_verified=True,
            verification_token=None,
            verification_token_expiry=None,
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


def get_user_by_email(email: str) -> Optional[User]:
    db = SessionLocal()
    try:
        return db.query(User).filter(User.email == email).first()
    finally:
        db.close()


def get_user_by_id(user_id: int) -> Optional[User]:
    db = SessionLocal()
    try:
        return db.query(User).filter(User.id == user_id).first()
    finally:
        db.close()


def update_user_plan(user_id: int, plan: str) -> bool:
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


# ── Security PIN (free forgot-password without email) ─────────────────────────

def set_security_pin(user_id: int, pin: str) -> bool:
    """Store a bcrypt-hashed 4-digit PIN for password recovery."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        user.security_pin = hash_password(pin)
        db.commit()
        return True
    except Exception:
        db.rollback()
        return False
    finally:
        db.close()


def change_password(user_id: int, current_password: str, new_password: str) -> tuple[bool, str]:
    """Change password for a logged-in user (requires current password)."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False, "User not found."
        if not verify_password(current_password, user.password_hash):
            return False, "Current password is incorrect."
        user.password_hash = hash_password(new_password)
        db.commit()
        return True, "Password updated successfully."
    except Exception:
        db.rollback()
        return False, "An error occurred. Please try again."
    finally:
        db.close()


def reset_password_with_pin(email: str, pin: str, new_password: str) -> tuple[bool, str]:
    """Reset password using email + 4-digit security PIN. No email required."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return False, "No account found with that email."
        if not user.security_pin:
            return False, "No security PIN set for this account. Sign in and set one in Settings."
        if not verify_password(pin, user.security_pin):
            return False, "Incorrect security PIN."
        user.password_hash = hash_password(new_password)
        db.commit()
        return True, "Password reset successfully. You can now sign in."
    except Exception:
        db.rollback()
        return False, "An error occurred. Please try again."
    finally:
        db.close()
