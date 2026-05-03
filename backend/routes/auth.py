import os
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from services.user_service import (
    create_user,
    get_user_by_email,
    verify_password,
    verify_user_email,
    refresh_verification_token,
    create_password_reset_token,
    reset_user_password
)
from services.auth_service import create_access_token, get_current_user_id
from services.email_service import send_verification_email, send_password_reset_email

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Request / Response models ─────────────────────────────────────────────────

class AuthRequest(BaseModel):
    email: EmailStr
    password: str

class EmailOnlyRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    plan: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/signup")
async def signup(req: AuthRequest):
    user = create_user(req.email, req.password)
    if not user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    sent = send_verification_email(req.email, user.verification_token, FRONTEND_URL)
    msg = "Account created! Check your inbox for a verification link."
    if not sent:
        msg += " (SMTP not configured — check server logs for the link.)"

    return {"message": msg}


@router.post("/login", response_model=TokenResponse)
async def login(req: AuthRequest):
    user = get_user_by_email(req.email)
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    # SQLite stores booleans as 0/1 integers — always coerce
    if not bool(user.is_verified):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in."
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "plan": user.plan}


@router.get("/verify-email")
async def verify_email(token: str):
    """
    Idempotent endpoint — safe to call multiple times with the same token.
    Returns success even if the user was already verified (handles React
    StrictMode's double-invoke of useEffect in development).
    """
    success, reason = verify_user_email(token)

    if not success:
        if reason == "expired":
            raise HTTPException(
                status_code=400,
                detail="This verification link has expired. Please request a new one."
            )
        raise HTTPException(
            status_code=400,
            detail="Invalid verification link. It may have already been used."
        )

    already = reason == "already_verified"
    return {
        "message": "Email verified! You can now sign in." if not already
                   else "Your email is already verified. Please sign in.",
        "already_verified": already,
    }


@router.post("/resend-verification")
async def resend_verification(req: EmailOnlyRequest):
    """Issue a fresh 24-hour verification token and email it. Always returns 200."""
    new_token = refresh_verification_token(req.email)
    if new_token:
        send_verification_email(req.email, new_token, FRONTEND_URL)
    # Don't reveal whether the email exists (security)
    return {"message": "If this email is pending verification, a new link has been sent."}


@router.post("/forgot-password")
async def forgot_password(req: EmailOnlyRequest):
    token = create_password_reset_token(req.email)
    if token:
        send_password_reset_email(req.email, token, FRONTEND_URL)
    return {"message": "If this email is registered, you will receive a reset link shortly."}


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    success = reset_user_password(req.token, req.new_password)
    if not success:
        raise HTTPException(
            status_code=400,
            detail="This reset link is invalid or has expired. Please request a new one."
        )
    return {"message": "Password updated successfully. You can now sign in."}


@router.post("/upgrade")
async def upgrade_plan(user_id: int = Depends(get_current_user_id)):
    from services.user_service import update_user_plan
    success = update_user_plan(user_id, "PRO")
    if not success:
        raise HTTPException(status_code=500, detail="Failed to upgrade plan.")
    return {"message": "Upgraded successfully", "plan": "PRO"}
