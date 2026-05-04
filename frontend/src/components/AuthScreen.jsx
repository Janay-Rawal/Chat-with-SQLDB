import { useState } from "react";
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

import {
    Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    AlertCircle, ChevronLeft, ArrowRight, Loader2,
    Mail, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, KeyRound
} from "lucide-react";

// ── Password strength meter ───────────────────────────────────────────────────
function getStrength(pwd) {
    if (!pwd) return { score: 0, label: "", color: "" };
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return [
        { score: 0, label: "", color: "" },
        { score: 1, label: "Weak",   color: "bg-red-500" },
        { score: 2, label: "Fair",   color: "bg-yellow-500" },
        { score: 3, label: "Good",   color: "bg-blue-500" },
        { score: 4, label: "Strong", color: "bg-green-500" },
    ][s];
}

// ── Reusable password field ───────────────────────────────────────────────────
function PwdField({ id, label, value, onChange, autoComplete, showStrength = false }) {
    const [show, setShow] = useState(false);
    const strength = getStrength(value);
    return (
        <div className="space-y-1.5">
            {label && (
                <Label htmlFor={id} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Lock className="w-3 h-3" /> {label}
                </Label>
            )}
            <div className="relative">
                <Input id={id} type={show ? "text" : "password"} placeholder="••••••••"
                    value={value} onChange={onChange} required autoComplete={autoComplete}
                    className="h-11 pr-10 transition-all hover:border-primary/50 focus:border-primary" />
                <button type="button" onClick={() => setShow(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            {showStrength && value.length > 0 && (
                <div className="space-y-1 pt-1">
                    <div className="flex gap-1 h-1">
                        {[1,2,3,4].map(i => (
                            <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : "bg-muted"}`} />
                        ))}
                    </div>
                    {strength.label && (
                        <p className="text-[11px] text-muted-foreground">
                            Strength: <span className="font-semibold text-foreground">{strength.label}</span>
                            {strength.score < 3 && " — add uppercase, numbers or symbols"}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

function AlertBanner({ msg }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{msg}</span>
        </div>
    );
}

function SuccessBanner({ msg }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 text-green-600 text-xs font-medium border border-green-500/20">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span>{msg}</span>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
// modes: "login" | "signup" | "forgot-password"
export default function AuthScreen({ initialMode = "login", onAuthSuccess, onBack }) {
    const [mode, setMode] = useState(initialMode);

    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    // forgot-password fields
    const [pin, setPin]             = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [error, setError]     = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    function reset() { setError(""); setSuccess(""); setPassword(""); setPin(""); setNewPassword(""); }
    function go(m)   { reset(); setMode(m); }

    async function post(path, body) {
        const res  = await fetch(`${API}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return { res, data };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(""); setSuccess(""); setLoading(true);

        try {
            if (mode === "login" || mode === "signup") {
                const path = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
                const { res, data } = await post(path, { email, password, remember_me: rememberMe });
                if (!res.ok) throw new Error(data.detail || "Authentication failed.");
                localStorage.setItem("sql_chat_token", data.access_token);
                localStorage.setItem("sql_chat_plan",  data.plan || "FREE");
                onAuthSuccess(data.access_token, data.plan || "FREE");

            } else if (mode === "forgot-password") {
                if (!/^\d{4}$/.test(pin)) throw new Error("Security PIN must be exactly 4 digits.");
                if (newPassword.length < 8) throw new Error("New password must be at least 8 characters.");
                const { res, data } = await post("/api/auth/forgot-password", {
                    email, pin, new_password: newPassword,
                });
                if (!res.ok) throw new Error(data.detail || "Reset failed.");
                setSuccess(data.message + " You can now sign in.");
                setTimeout(() => go("login"), 2500);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const isLogin  = mode === "login";
    const isSignup = mode === "signup";
    const isForgot = mode === "forgot-password";

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20 px-6 py-12">
            <div className="w-full max-w-md">

                {onBack && isLogin && (
                    <Button variant="ghost" size="sm"
                        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
                        onClick={onBack}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                )}
                {isForgot && (
                    <Button variant="ghost" size="sm"
                        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
                        onClick={() => go("login")}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Sign In
                    </Button>
                )}

                <Card className="border-border shadow-2xl bg-card">
                    <CardHeader className="space-y-2 text-center pt-8 pb-6 border-b border-dashed">
                        <div className="flex justify-center mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg ring-4 ring-primary/10">
                                {isForgot ? <ShieldCheck className="w-6 h-6" /> : "λ"}
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-extrabold tracking-tight">
                            {isLogin  && "Welcome Back"}
                            {isSignup && "Create Your Account"}
                            {isForgot && "Reset Password"}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            {isLogin  && "Sign in to your SQL Intelligence workspace"}
                            {isSignup && "Join analysts using AI for instant SQL insights"}
                            {isForgot && "Use your security PIN to set a new password"}
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4 pt-7">
                            {error   && <AlertBanner msg={error} />}
                            {success && <SuccessBanner msg={success} />}

                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email"
                                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    <Mail className="w-3 h-3" /> Email
                                </Label>
                                <Input id="email" type="email" placeholder="you@company.com"
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    required autoComplete="email"
                                    className="h-11 transition-all hover:border-primary/50 focus:border-primary" />
                            </div>

                            {/* Password (login / signup) */}
                            {(isLogin || isSignup) && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password"
                                            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            <Lock className="w-3 h-3" /> Password
                                        </Label>
                                        {isLogin && (
                                            <button type="button"
                                                onClick={() => go("forgot-password")}
                                                className="text-[11px] font-bold text-primary hover:underline uppercase tracking-wider">
                                                Forgot?
                                            </button>
                                        )}
                                    </div>
                                    <PwdField id="password" value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        autoComplete={isLogin ? "current-password" : "new-password"}
                                        showStrength={isSignup} />
                                </div>
                            )}

                            {/* Forgot-password PIN fields */}
                            {isForgot && (
                                <>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="pin"
                                            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            <KeyRound className="w-3 h-3" /> 4-Digit Security PIN
                                        </Label>
                                        <Input id="pin" type="password" inputMode="numeric" maxLength={4}
                                            placeholder="••••" value={pin}
                                            onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                            className="h-11 tracking-[0.5em] text-center font-mono text-lg hover:border-primary/50 focus:border-primary" />
                                        <p className="text-[11px] text-muted-foreground">
                                            The 4-digit PIN you set in Account → Set Security PIN
                                        </p>
                                    </div>
                                    <PwdField id="new-password" label="New Password" value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        autoComplete="new-password" showStrength />
                                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground leading-relaxed">
                                        <strong className="text-foreground">Don't have a PIN?</strong> Sign in and go to
                                        <strong className="text-foreground"> Account → Set Security PIN</strong> to create one.
                                    </div>
                                </>
                            )}

                            {/* Remember Me */}
                            {(isLogin || isSignup) && (
                                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                                    <input type="checkbox" checked={rememberMe}
                                        onChange={e => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-border accent-primary cursor-pointer" />
                                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                        Remember me for 30 days
                                    </span>
                                </label>
                            )}
                        </CardContent>

                        <CardFooter className="flex flex-col gap-3 pb-8 pt-2">
                            <Button type="submit"
                                className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-px active:translate-y-px"
                                disabled={loading}>
                                {loading
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>
                                    : <>
                                        {isLogin  && "Sign In"}
                                        {isSignup && "Create Account"}
                                        {isForgot && "Reset Password"}
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </>
                                }
                            </Button>

                            {(isLogin || isSignup) && (
                                <button type="button"
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium w-full text-center py-1"
                                    onClick={() => go(isLogin ? "signup" : "login")}>
                                    {isLogin
                                        ? "Don't have an account? Create one →"
                                        : "Already have an account? Sign in →"}
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
