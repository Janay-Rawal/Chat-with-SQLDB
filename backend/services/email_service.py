import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "janayrapple@gmail.com")
SENDER_PASSWORD = os.getenv("SENDER_APP_PASSWORD", "")  # Gmail App Password


def _send(to: str, subject: str, html_body: str) -> bool:
    """Low-level helper — sends an HTML email via Gmail SMTP."""
    if not SENDER_PASSWORD:
        # Fallback: log to console if no credentials configured
        print("\n" + "=" * 50)
        print(f"📧 EMAIL (no SMTP creds): {subject}")
        print(f"To: {to}")
        print(f"Body preview: {html_body[:200]}")
        print("=" * 50 + "\n")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"SQL Intelligence <{SENDER_EMAIL}>"
    msg["To"] = to
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, to, msg.as_string())
        print(f"✅ Email sent to {to}: {subject}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email to {to}: {e}")
        return False


def send_verification_email(to: str, token: str, base_url: str) -> bool:
    """Send account verification email."""
    link = f"{base_url}/verify-email?token={token}"
    subject = "Verify your SQL Intelligence account"
    html = f"""
    <div style="font-family: sans-serif; max-width: 520px; margin: auto; padding: 32px; background: #0f0f0f; color: #e5e5e5; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: #7c3aed; border-radius: 12px;
                        line-height: 48px; font-size: 24px; font-weight: bold; color: white;">λ</div>
            <h1 style="font-size: 22px; margin: 16px 0 4px; color: #fff;">Verify your email</h1>
            <p style="color: #888; font-size: 14px; margin: 0;">You're one step away from SQL superpowers.</p>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #ccc;">
            Thanks for signing up! Click the button below to verify your email address and activate your account.
        </p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="{link}"
               style="background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px;
                      text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
                ✅ Verify My Account
            </a>
        </div>
        <p style="font-size: 12px; color: #555; text-align: center;">
            This link expires in 24 hours. If you didn't sign up, you can safely ignore this email.
        </p>
    </div>
    """
    return _send(to, subject, html)


def send_password_reset_email(to: str, token: str, base_url: str) -> bool:
    """Send password reset email."""
    link = f"{base_url}/reset-password?token={token}"
    subject = "Reset your SQL Intelligence password"
    html = f"""
    <div style="font-family: sans-serif; max-width: 520px; margin: auto; padding: 32px; background: #0f0f0f; color: #e5e5e5; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: #7c3aed; border-radius: 12px;
                        line-height: 48px; font-size: 24px; font-weight: bold; color: white;">λ</div>
            <h1 style="font-size: 22px; margin: 16px 0 4px; color: #fff;">Reset your password</h1>
            <p style="color: #888; font-size: 14px; margin: 0;">We received a request to reset your password.</p>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #ccc;">
            Click the button below to create a new password. This link is valid for 1 hour.
        </p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="{link}"
               style="background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px;
                      text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
                🔑 Reset My Password
            </a>
        </div>
        <p style="font-size: 12px; color: #555; text-align: center;">
            If you didn't request this, you can safely ignore this email. Your password won't change.
        </p>
    </div>
    """
    return _send(to, subject, html)
