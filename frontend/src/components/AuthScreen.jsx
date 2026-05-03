import { useState, useEffect, useRef } from "react";
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

import {
    Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    AlertCircle, ChevronLeft, ArrowRight, Loader2, Mail, Lock,
    CheckCircle2, KeyRound, RefreshCw, ShieldCheck, Eye, EyeOff
} from "lucide-react";

// ── Helper: password strength ─────────────────────────────────────────────────
function getPasswordStrength(pwd) {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
        { score: 0, label: "", color: "" },
        { score: 1, label: "Weak", color: "bg-red-500" },
        { score: 2, label: "Fair", color: "bg-yellow-500" },
        { score: 3, label: "Good", color: "bg-blue-500" },
        { score: 4, label: "Strong", color: "bg-green-500" },
    ];
    return levels[score];
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AuthScreen({ initialMode = "login", onAuthSuccess, onBack }) {
    const [mode, setMode] = useState(initialMode);
    // login | signup | forgot-password | reset-password | verification-pending | verifying | verified | resend-verification

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const verifyAttempted = useRef(false); // Prevents React StrictMode double-invoke

    // ── URL token handling (verify-email & reset-password) ────────────────────
    useEffect(() => {
        if (verifyAttempted.current) return;
        verifyAttempted.current = true;

        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("token");

        if (window.location.pathname.includes("verify-email") && urlToken) {
            handleVerifyEmail(urlToken);
        } else if (window.location.pathname.includes("reset-password") && urlToken) {
            setResetToken(urlToken);
            setMode("reset-password");
        }
    }, []);

    // ── Resend cooldown timer ──────────────────────────────────────────────────
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    // ── API helpers ───────────────────────────────────────────────────────────
    async function post(path, body) {
        const res = await fetch(`${API}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return { res, data };
    }

    // ── Handlers ──────────────────────────────────────────────────────────────
    async function handleVerifyEmail(token) {
        setMode("verifying");
        setError("");
        try {
            const res = await fetch(`${API}/api/auth/verify-email?token=${encodeURIComponent(token)}`);
            const data = await res.json();
            if (!res.ok) {
                // Expired token — offer to resend
                if (res.status === 400 && data.detail?.includes("expired")) {
                    setMode("resend-verification");
                    setError(data.detail);
                } else {
                    setMode("login");
                    setError(data.detail || "Verification failed. The link may be invalid.");
                }
                return;
            }
            setMode("verified");
            setSuccess(data.message);
            // Auto-redirect to login after 3 s
            setTimeout(() => { setMode("login"); setSuccess(data.message); }, 3000);
        } catch {
            setMode("login");
            setError("Network error. Please try again.");
        }
    }

    async function handleResendVerification() {
        if (!email) { setError("Please enter your email address."); return; }
        setError(""); setLoading(true);
        try {
            const { data } = await post("/api/auth/resend-verification", { email });
            setSuccess(data.message);
            setResendCooldown(60); // 60-second cooldown
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(""); setSuccess(""); setLoading(true);

        try {
            if (mode === "login") {
                const { res, data } = await post("/api/auth/login", { email, password });
                if (!res.ok) {
                    if (res.status === 403) {
                        // Not verified — jump straight to resend screen with email pre-filled
                        setMode("resend-verification");
                        setError("This account hasn't been verified yet.");
                        return;
                    }
                    throw new Error(data.detail || "Authentication failed.");
                }
                localStorage.setItem("sql_chat_token", data.access_token);
                localStorage.setItem("sql_chat_plan", data.plan || "FREE");
                onAuthSuccess(data.access_token, data.plan || "FREE");

            } else if (mode === "signup") {
                if (password.length < 8) throw new Error("Password must be at least 8 characters.");
                const { res, data } = await post("/api/auth/signup", { email, password });
                if (!res.ok) throw new Error(data.detail || "Sign-up failed.");
                setMode("verification-pending");
                setSuccess(data.message);

            } else if (mode === "forgot-password") {
                const { data } = await post("/api/auth/forgot-password", { email });
                setSuccess(data.message);

            } else if (mode === "reset-password") {
                if (password !== confirmPassword) throw new Error("Passwords do not match.");
                if (password.length < 8) throw new Error("Password must be at least 8 characters.");
                const { res, data } = await post("/api/auth/reset-password", {
                    token: resetToken, new_password: password
                });
                if (!res.ok) throw new Error(data.detail || "Reset failed.");
                setSuccess(data.message);
                setTimeout(() => { setMode("login"); setSuccess(data.message); }, 2000);

            } else if (mode === "resend-verification") {
                await handleResendVerification();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function switchMode(next) {
        setMode(next);
        setError("");
        setSuccess("");
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
    }

    // ── Full-screen states ────────────────────────────────────────────────────

    // Loading while verifying token from URL
    if (mode === "verifying") {
        return (
            <FullScreenCard>
                <div className="flex flex-col items-center gap-6 py-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold">Verifying your email…</h2>
                        <p className="text-sm text-muted-foreground mt-2">This only takes a moment.</p>
                    </div>
                </div>
            </FullScreenCard>
        );
    }

    // Verified success screen
    if (mode === "verified") {
        return (
            <FullScreenCard>
                <div className="flex flex-col items-center gap-6 py-8">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                        <ShieldCheck className="w-9 h-9 text-green-500" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-green-500">Email Verified!</h2>
                        <p className="text-sm text-muted-foreground mt-2">{success}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Redirecting you to sign in…</p>
                    </div>
                    <Button className="w-full" onClick={() => switchMode("login")}>
                        Sign In Now <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </FullScreenCard>
        );
    }

    // Verification email sent — waiting for user to click link
    if (mode === "verification-pending") {
        return (
            <FullScreenCard>
                <div className="flex flex-col items-center text-center gap-4 py-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Mail className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Check your inbox</h2>
                        <p className="text-sm text-muted-foreground mt-2">
                            We sent a verification link to <strong className="text-foreground">{email}</strong>.
                            Click it to activate your account.
                        </p>
                    </div>

                    {success && (
                        <div className="w-full p-3 rounded-lg bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                            {success}
                        </div>
                    )}

                    <div className="w-full space-y-2 pt-2">
                        <Button
                            className="w-full"
                            disabled={resendCooldown > 0 || loading}
                            onClick={async () => {
                                setLoading(true); setError(""); setSuccess("");
                                try {
                                    const { data } = await post("/api/auth/resend-verification", { email });
                                    setSuccess(data.message);
                                    setResendCooldown(60);
                                } catch { setError("Network error."); }
                                finally { setLoading(false); }
                            }}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 w-4 h-4" />}
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Verification Email"}
                        </Button>
                        <Button variant="ghost" className="w-full text-xs text-muted-foreground" onClick={() => switchMode("login")}>
                            <ChevronLeft className="w-3 h-3 mr-1" /> Back to Sign In
                        </Button>
                    </div>

                    {error && <AlertBanner message={error} />}
                </div>
            </FullScreenCard>
        );
    }

    // ── Main auth form ────────────────────────────────────────────────────────
    const cfg = {
        login:                 { title: "Welcome Back",          desc: "Sign in to your SQL Intelligence workspace" },
        signup:                { title: "Create Your Account",   desc: "Join thousands of analysts using AI for SQL insights" },
        "forgot-password":     { title: "Forgot Password?",      desc: "Enter your email and we'll send a reset link" },
        "reset-password":      { title: "Set New Password",      desc: "Choose a strong password for your account" },
        "resend-verification": { title: "Verify Your Email",     desc: "Enter your email to receive a new verification link" },
    }[mode] ?? { title: "Sign In", desc: "" };

    const pwdStrength = getPasswordStrength(password);
    const showStrength = (mode === "signup" || mode === "reset-password") && password.length > 0;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20 px-6 py-12">
            <div className="w-full max-w-md">

                {/* Back button */}
                {onBack && mode === "login" && (
                    <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                )}
                {["forgot-password", "resend-verification"].includes(mode) && (
                    <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground" onClick={() => switchMode("login")}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Sign In
                    </Button>
                )}

                <Card className="border-border shadow-2xl bg-card">
                    <CardHeader className="space-y-2 text-center pt-8 pb-6 border-b border-dashed">
                        <div className="flex justify-center mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg ring-4 ring-primary/10">
                                λ
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-extrabold tracking-tight">{cfg.title}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">{cfg.desc}</CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4 pt-7">
                            {error && <AlertBanner message={error} />}
                            {success && !["verification-pending"].includes(mode) && <SuccessBanner message={success} />}

                            {/* Email */}
                            {["login", "signup", "forgot-password", "resend-verification"].includes(mode) && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <Mail className="w-3 h-3" /> Email
                                    </Label>
                                    <Input
                                        id="email" type="email" placeholder="you@company.com"
                                        value={email} onChange={e => setEmail(e.target.value)}
                                        required autoComplete="email"
                                        className="h-11 transition-all hover:border-primary/50 focus:border-primary"
                                    />
                                </div>
                            )}

                            {/* Password */}
                            {["login", "signup", "reset-password"].includes(mode) && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            <Lock className="w-3 h-3" /> {mode === "reset-password" ? "New Password" : "Password"}
                                        </Label>
                                        {mode === "login" && (
                                            <button type="button" onClick={() => switchMode("forgot-password")}
                                                className="text-[11px] font-bold text-primary hover:underline uppercase tracking-wider">
                                                Forgot?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password" type={showPassword ? "text" : "password"}
                                            placeholder="••••••••" value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required className="h-11 pr-10 transition-all hover:border-primary/50 focus:border-primary"
                                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                                        />
                                        <button type="button" onClick={() => setShowPassword(p => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Strength bar */}
                                    {showStrength && (
                                        <div className="space-y-1 pt-1">
                                            <div className="flex gap-1 h-1">
                                                {[1, 2, 3, 4].map(i => (
                                                    <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= pwdStrength.score ? pwdStrength.color : "bg-muted"}`} />
                                                ))}
                                            </div>
                                            {pwdStrength.label && (
                                                <p className="text-[11px] text-muted-foreground">
                                                    Strength: <span className="font-semibold text-foreground">{pwdStrength.label}</span>
                                                    {pwdStrength.score < 4 && " — try adding numbers, symbols or uppercase letters"}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Confirm Password */}
                            {mode === "reset-password" && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <KeyRound className="w-3 h-3" /> Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword" type={showConfirm ? "text" : "password"}
                                            placeholder="••••••••" value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required className={`h-11 pr-10 transition-all ${
                                                confirmPassword && password !== confirmPassword
                                                    ? "border-destructive focus:border-destructive"
                                                    : "hover:border-primary/50 focus:border-primary"
                                            }`}
                                        />
                                        <button type="button" onClick={() => setShowConfirm(p => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="text-xs text-destructive font-medium">Passwords don't match</p>
                                    )}
                                    {confirmPassword && password === confirmPassword && (
                                        <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Passwords match
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="flex flex-col gap-3 pb-8 pt-2">
                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-px active:translate-y-px"
                                disabled={loading || (mode === "resend-verification" && resendCooldown > 0)}
                            >
                                {loading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>
                                ) : (
                                    <>
                                        {mode === "login" && "Sign In"}
                                        {mode === "signup" && "Create Account"}
                                        {mode === "forgot-password" && "Send Reset Link"}
                                        {mode === "reset-password" && "Reset Password"}
                                        {mode === "resend-verification" && (resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Send Verification Link")}
                                        {!["resend-verification"].includes(mode) || resendCooldown === 0 ? <ArrowRight className="ml-2 w-4 h-4" /> : null}
                                    </>
                                )}
                            </Button>

                            {/* Toggle login ↔ signup */}
                            {(mode === "login" || mode === "signup") && (
                                <button type="button"
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium w-full text-center py-1"
                                    onClick={() => switchMode(mode === "login" ? "signup" : "login")}>
                                    {mode === "login" ? "Don't have an account? Create one →" : "Already have an account? Sign in →"}
                                </button>
                            )}

                            {/* "Didn't get the email?" link on login */}
                            {mode === "login" && (
                                <button type="button"
                                    className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors w-full text-center"
                                    onClick={() => switchMode("resend-verification")}>
                                    Didn't get a verification email?
                                </button>
                            )}
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center mt-8 text-[11px] text-muted-foreground/40 uppercase tracking-[0.2em] font-bold select-none">
                    SQL Intelligence — Powered by Llama 3.3
                </p>
            </div>
        </div>
    );
}

// ── Small shared components ───────────────────────────────────────────────────
function FullScreenCard({ children }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20 px-6">
            <Card className="w-full max-w-sm border-border shadow-2xl bg-card">
                <CardContent className="px-8 py-6">{children}</CardContent>
            </Card>
        </div>
    );
}

function AlertBanner({ message }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{message}</span>
        </div>
    );
}

function SuccessBanner({ message }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 text-green-600 text-xs font-medium border border-green-500/20">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{message}</span>
        </div>
    );
}
