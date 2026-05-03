import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    AlertCircle,
    ChevronLeft,
    ArrowRight,
    Loader2,
    Mail,
    Lock,
    CheckCircle2,
    KeyRound,
    RefreshCw
} from "lucide-react";

export default function AuthScreen({ initialMode = "login", onAuthSuccess, onBack }) {
    const [mode, setMode] = useState(initialMode); // login, signup, forgot-password, reset-password, verification-pending
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // ── Handle URL Tokens ──────────────────────────────────
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const verifyToken = params.get("token");
        const isReset = window.location.pathname.includes("reset-password") || params.has("token") && mode === "login";

        // Simple heuristic: if we see a token and we are on a reset/verify path
        if (window.location.pathname.includes("verify-email") && verifyToken) {
            handleVerifyEmail(verifyToken);
        } else if (window.location.pathname.includes("reset-password") && verifyToken) {
            setToken(verifyToken);
            setMode("reset-password");
        }
    }, []);

    async function handleVerifyEmail(vToken) {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8000/api/auth/verify-email?token=${vToken}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Verification failed");
            setSuccess(data.message);
            setMode("login");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (mode === "login" || mode === "signup") {
                const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
                const res = await fetch(`http://localhost:8000${endpoint}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await res.json();
                if (!res.ok) {
                    if (res.status === 403) {
                        setMode("verification-pending");
                        return;
                    }
                    throw new Error(data.detail || "Authentication failed");
                }

                if (mode === "signup") {
                    setMode("verification-pending");
                    setSuccess(data.message);
                } else {
                    localStorage.setItem("sql_chat_token", data.access_token);
                    localStorage.setItem("sql_chat_plan", data.plan || "FREE");
                    onAuthSuccess(data.access_token, data.plan || "FREE");
                }
            } else if (mode === "forgot-password") {
                const res = await fetch(`http://localhost:8000/api/auth/forgot-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });
                const data = await res.json();
                setSuccess(data.message);
            } else if (mode === "reset-password") {
                if (password !== confirmPassword) throw new Error("Passwords do not match");
                const res = await fetch(`http://localhost:8000/api/auth/reset-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, new_password: password }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || "Reset failed");
                setSuccess(data.message);
                setMode("login");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const titles = {
        login: "Welcome Back",
        signup: "Start Querying AI",
        "forgot-password": "Reset Password",
        "reset-password": "New Password",
        "verification-pending": "Verify Email"
    };

    const descriptions = {
        login: "Access your intelligent PostgreSQL & MySQL assistant",
        signup: "Join analysts everywhere leveraging AI for SQL insights",
        "forgot-password": "Enter your email to receive a password reset link",
        "reset-password": "Create a strong new password for your account",
        "verification-pending": "We've sent a verification link to your inbox"
    };

    if (mode === "verification-pending") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20 px-6 py-12 animate-in fade-in duration-700">
                <Card className="w-full max-w-md border-border shadow-2xl bg-card">
                    <CardHeader className="text-center pt-8 pb-6 border-b border-dashed">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Mail className="w-8 h-8" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">{titles[mode]}</CardTitle>
                        <CardDescription>{descriptions[mode]}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Please click the link in the email we sent to <strong>{email}</strong> to verify your account.
                        </p>
                        {success && (
                            <div className="p-3 rounded-lg bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                                {success}
                            </div>
                        )}
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => setMode("login")}
                        >
                            <ChevronLeft className="w-4 h-4" /> Back to Login
                        </Button>
                    </CardContent>
                    <CardFooter className="pb-8 justify-center">
                        <Button variant="link" className="text-xs text-muted-foreground" onClick={() => setSuccess("Link resent! (Check logs)")}>
                            <RefreshCw className="w-3 h-3 mr-1" /> Resend verification email
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20 px-6 py-12 animate-in fade-in duration-700">
            <div className="w-full max-w-md">
                {onBack && mode !== "reset-password" && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-8 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={onBack}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to landing page
                    </Button>
                )}

                <Card className="border-border shadow-2xl bg-card">
                    <CardHeader className="space-y-2 text-center pt-8 pb-6 border-b border-dashed">
                        <div className="flex justify-center mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg ring-4 ring-primary/10">λ</div>
                        </div>
                        <CardTitle className="text-3xl font-extrabold tracking-tight">
                            {titles[mode]}
                        </CardTitle>
                        <CardDescription className="text-sm font-medium text-muted-foreground">
                            {descriptions[mode]}
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-5 pt-8">
                            {error && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20 animate-in shake-in-1 duration-300">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {success && mode !== "verification-pending" && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 text-primary text-xs font-semibold border border-primary/20 animate-in fade-in duration-300">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    <span>{success}</span>
                                </div>
                            )}

                            {(mode === "login" || mode === "signup" || mode === "forgot-password") && (
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="alex@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-11 transition-all hover:border-primary/50 focus:border-primary"
                                        autoComplete="email"
                                    />
                                </div>
                            )}

                            {(mode === "login" || mode === "signup" || mode === "reset-password") && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="flex items-center gap-2">
                                            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                            {mode === "reset-password" ? "New Password" : "Password"}
                                        </Label>
                                        {mode === "login" && (
                                            <Button
                                                type="button"
                                                variant="link"
                                                className="px-0 h-auto text-[11px] font-bold uppercase tracking-wider text-primary"
                                                onClick={() => setMode("forgot-password")}
                                            >
                                                Forgot?
                                            </Button>
                                        )}
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-11 transition-all hover:border-primary/50 focus:border-primary"
                                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                                    />
                                </div>
                            )}

                            {mode === "reset-password" && (
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                                        <KeyRound className="w-3.5 h-3.5 text-muted-foreground" /> Confirm New Password
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="h-11 transition-all hover:border-primary/50 focus:border-primary"
                                    />
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4 pb-10">
                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {mode === "login" ? "Sign In" :
                                            mode === "signup" ? "Create My Account" :
                                                mode === "forgot-password" ? "Send Reset Link" :
                                                    "Reset Password"}
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </>
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full text-xs text-muted-foreground hover:text-foreground font-medium"
                                onClick={() => {
                                    if (mode === "forgot-password" || mode === "reset-password") {
                                        setMode("login");
                                    } else {
                                        setMode(mode === "login" ? "signup" : "login");
                                    }
                                    setError("");
                                    setSuccess("");
                                }}
                            >
                                {mode === "login" ? "New here? Create a workspace" : "Already have an account? Sign in"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center mt-10 text-[11px] text-muted-foreground/50 uppercase tracking-[0.2em] font-bold">
                    Powered by State-of-the-art Intelligence
                </p>
            </div>
        </div>
    );
}

