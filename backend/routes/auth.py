from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from services.user_service import (
    create_user, 
    get_user_by_email, 
    verify_password, 
    verify_user_email,
    create_password_reset_token,
    reset_user_password
)
from services.auth_service import create_access_token, get_current_user_id

router = APIRouter(prefix="/auth", tags=["auth"])

class AuthRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    plan: str

@router.post("/signup")
async def signup(req: AuthRequest):
    user = create_user(req.email, req.password)
    if not user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Simulate sending email
    print("\n" + "="*50)
    print("📧 SIMULATED EMAIL: Verify your account")
    print(f"To: {req.email}")
    print(f"Link: http://localhost:5173/verify-email?token={user.verification_token}")
    print("="*50 + "\n")

    return {"message": "Verification email sent. Please check your inbox (and console logs!)."}

@router.post("/login", response_model=TokenResponse)
async def login(req: AuthRequest):
    user = get_user_by_email(req.email)
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in"
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "plan": user.plan}

@router.get("/verify-email")
async def verify_email(token: str):
    success = verify_user_email(token)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
    return {"message": "Email verified successfully. You can now login."}

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    token = create_password_reset_token(req.email)
    if token:
        # Simulate sending email
        print("\n" + "="*50)
        print("📧 SIMULATED EMAIL: Reset your password")
        print(f"To: {req.email}")
        print(f"Link: http://localhost:5173/reset-password?token={token}")
        print("="*50 + "\n")
    
    # Always return success message for security (don't reveal if email exists)
    return {"message": "If this email is registered, you will receive a reset link shortly."}

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    success = reset_user_password(req.token, req.new_password)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    return {"message": "Password updated successfully. You can now login."}

@router.post("/upgrade")
async def upgrade_plan(user_id: int = Depends(get_current_user_id)):
    from services.user_service import update_user_plan
    success = update_user_plan(user_id, "PRO")
    if not success:
        raise HTTPException(status_code=500, detail="Failed to upgrade plan")
    
    return {"message": "Upgraded successfully", "plan": "PRO"}




