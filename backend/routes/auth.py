import os
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field
from dotenv import load_dotenv
from services.user_service import (
    create_user,
    get_user_by_email,
    verify_password,
    update_user_plan,
    change_password,
    set_security_pin,
    reset_password_with_pin,
)
from services.auth_service import create_access_token, get_current_user_id

load_dotenv()

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Models ────────────────────────────────────────────────────────────────────

class AuthRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False        # True → 30-day token instead of 24h

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    plan: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)

class SetPinRequest(BaseModel):
    pin: str = Field(min_length=4, max_length=4, pattern=r"^\d{4}$")

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    pin: str = Field(min_length=4, max_length=4, pattern=r"^\d{4}$")
    new_password: str = Field(min_length=8)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/signup")
async def signup(req: AuthRequest):
    """
    Create an account and return a JWT immediately.
    No email verification required — users are active instantly.
    """
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    existing = get_user_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists. Please sign in."
        )

    user = create_user(req.email, req.password)
    if not user:
        raise HTTPException(status_code=500, detail="Failed to create account. Please try again.")

    access_token = create_access_token(
        data={"sub": str(user.id)},
        remember_me=req.remember_me,
    )
    return {
        "message": "Account created successfully!",
        "access_token": access_token,
        "token_type": "bearer",
        "plan": user.plan,
    }


@router.post("/login", response_model=TokenResponse)
async def login(req: AuthRequest):
    """
    Authenticate with email + password.
    Returns a JWT — no email verification check.
    """
    user = get_user_by_email(req.email)
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    access_token = create_access_token(
        data={"sub": str(user.id)},
        remember_me=req.remember_me,
    )
    return {"access_token": access_token, "token_type": "bearer", "plan": user.plan}


@router.post("/change-password")
async def change_pwd(req: ChangePasswordRequest, user_id: int = Depends(get_current_user_id)):
    """Change password for the currently logged-in user."""
    if req.current_password == req.new_password:
        raise HTTPException(status_code=400, detail="New password must differ from the current one.")
    success, msg = change_password(user_id, req.current_password, req.new_password)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg}


@router.post("/set-security-pin")
async def set_pin(req: SetPinRequest, user_id: int = Depends(get_current_user_id)):
    """
    Set a 4-digit numeric PIN for password recovery.
    No email needed — this is the free forgot-password mechanism.
    Must be done while logged in.
    """
    if not set_security_pin(user_id, req.pin):
        raise HTTPException(status_code=500, detail="Failed to set security PIN.")
    return {"message": "Security PIN saved. You can use it to reset your password if locked out."}


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    """
    Reset password using email + 4-digit security PIN.
    Completely free — no email delivery required.
    """
    success, msg = reset_password_with_pin(req.email, req.pin, req.new_password)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg}


@router.post("/upgrade")
async def upgrade_plan(user_id: int = Depends(get_current_user_id)):
    success = update_user_plan(user_id, "PRO")
    if not success:
        raise HTTPException(status_code=500, detail="Failed to upgrade plan.")
    return {"message": "Upgraded successfully", "plan": "PRO"}
