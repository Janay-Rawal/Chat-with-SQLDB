import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowRight,
    Database,
    Terminal,
    BarChart3,
    Sparkles,
    Users,
    Check,
    Zap,
    ShieldCheck,
    Shield,
    PlayCircle,
    Code
} from "lucide-react";

export default function LandingPage({ onSignIn, onGetStarted, onTryDemo }) {
    const FEATURES = [
        {
            icon: <Terminal className="w-6 h-6 text-blue-500" />,
            title: "Natural Language SQL",
            desc: "Ask questions in plain English. We generate, execute, and explain the SQL for you.",
        },
        {
            icon: <BarChart3 className="w-6 h-6 text-green-500" />,
            title: "Instant Visualization",
            desc: "Auto-select the best chart type for your data. Pie, bar, or line — rendered instantly.",
        },
        {
            icon: <Sparkles className="w-6 h-6 text-yellow-500" />,
            title: "Intelligent Insights",
            desc: "Surfaces actionable key insights and suggests smart follow-up questions.",
        },
        {
            icon: <Database className="w-6 h-6 text-purple-500" />,
            title: "Multi-Database Support",
            desc: "Native support for Postgres and MySQL. Seamlessly switch between connections.",
        },
    ];

    const USE_CASES = [
        {
            role: "Data Analysts",
            desc: "Stop writing boilerplate SQL. Focus on high-level analysis and strategy.",
            icon: <Users className="w-5 h-5 text-primary" />,
            examples: ["Revenue growth by month", "Churn rate by cohort"],
        },
        {
            role: "Product Managers",
            desc: "Get answers from your data instantly without waiting for an engineering cycle.",
            icon: <Zap className="w-5 h-5 text-primary" />,
            examples: ["Daily active users this week", "Feature adoption metrics"],
        },
        {
            role: "Founders",
            desc: "Monitor your core business KPIs with simple natural language queries.",
            icon: <ShieldCheck className="w-5 h-5 text-primary" />,
            examples: ["MRR breakdown by plan", "Customer LTV by channel"],
        },
    ];

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
            {/* Navigation */}
            <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg transition-transform group-hover:scale-110">λ</div>
                        <span className="text-lg font-bold tracking-tight">QueryAI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="text-sm font-medium" onClick={onSignIn}>Sign In</Button>
                        <Button className="text-sm font-bold shadow-md shadow-primary/20 transition-all hover:translate-y-[-1px]" onClick={onGetStarted}>Get Started Free</Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-20 overflow-hidden">
                <section className="relative px-6">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />

                    <div className="max-w-5xl mx-auto text-center space-y-8">
                        <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                            <Badge variant="outline" className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary border-primary/20 bg-primary/5 rounded-full mb-6">
                                <Sparkles className="w-3.5 h-3.5 mr-2 fill-primary/20" /> Next-Gen SQL Analytics
                            </Badge>
                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground balance mb-6">
                                Your database.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Actually useful.</span>
                            </h1>
                            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed mb-10">
                                QueryAI transforms natural language into production-grade SQL, executes it securely, and visualizes insights instantly. Zero learning curve.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button size="lg" className="h-14 px-8 text-base font-bold shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px]" onClick={onTryDemo}>
                                    <PlayCircle className="mr-2 w-5 h-5" /> Start Interactive Demo
                                </Button>
                                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold bg-background transition-all hover:bg-muted" onClick={onGetStarted}>
                                    Connect My Database
                                </Button>
                            </div>
                        </div>

                        {/* Interactive Preview Mockup */}
                        <div className="relative mt-20 p-2 md:p-4 rounded-2xl border bg-muted/30 shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-300">
                            <div className="rounded-xl overflow-hidden border bg-background shadow-sm">
                                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
                                    </div>
                                    <div className="text-[11px] font-mono text-muted-foreground bg-muted/40 px-3 py-1 rounded-md border">queryai.io/analytics</div>
                                    <div className="w-10" />
                                </div>
                                <div className="p-6 md:p-8 text-left space-y-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                                            <span className="text-sm font-bold text-blue-600">U</span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 max-w-lg">
                                            <p className="text-sm font-medium text-foreground">Who are the top 5 customers by total revenue this quarter?</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start border-l-2 border-primary/20 pl-4 py-2">
                                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg border border-primary-foreground/20">
                                            <span className="text-sm font-bold text-primary-foreground">λ</span>
                                        </div>
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/30 uppercase tracking-widest">SQL GENERATED</Badge>
                                                <div className="h-px flex-1 bg-border/50" />
                                            </div>
                                            <div className="p-3 rounded-lg bg-zinc-950 font-mono text-xs text-zinc-300 border border-zinc-800 leading-relaxed overflow-x-auto shadow-inner">
                                                <span className="text-purple-400">SELECT</span> customer_name, <span className="text-yellow-400">SUM</span>(total) <span className="text-purple-400">AS</span> revenue<br />
                                                <span className="text-purple-400">FROM</span> orders<br />
                                                <span className="text-purple-400">WHERE</span> date &gt; <span className="text-green-400">'2024-01-01'</span><br />
                                                <span className="text-purple-400">GROUP BY</span> customer_name<br />
                                                <span className="text-purple-400">ORDER BY</span> revenue <span className="text-purple-400">DESC</span> <span className="text-purple-400">LIMIT</span> 5;
                                            </div>
                                            <div className="grid grid-cols-5 gap-2 h-20 items-end">
                                                <div className="bg-primary/80 h-[80%] rounded-t-sm" />
                                                <div className="bg-primary/60 h-[65%] rounded-t-sm" />
                                                <div className="bg-primary/50 h-[50%] rounded-t-sm" />
                                                <div className="bg-primary/40 h-[40%] rounded-t-sm" />
                                                <div className="bg-primary/30 h-[25%] rounded-t-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="max-w-7xl mx-auto px-6 py-32">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Engineered for Accuracy</h2>
                        <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">Everything you need to master your data</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {FEATURES.map((f) => (
                            <Card key={f.title} className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                                <CardHeader>
                                    <div className="mb-4 transform transition-transform group-hover:scale-110 duration-500">
                                        <div className="p-3 w-12 h-12 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center">
                                            {f.icon}
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl font-bold">{f.title}</CardTitle>
                                    <CardDescription className="text-sm leading-relaxed text-muted-foreground">{f.desc}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Use Cases */}
                <section className="bg-muted/30 py-32 border-y border-border/50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Team Roles</h2>
                                <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">Democratizing data access</h3>
                            </div>
                            <p className="max-w-md text-muted-foreground font-medium">Built for everyone to have an opinion backed by data, not just those who know SQL.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {USE_CASES.map((u) => (
                                <Card key={u.role} className="border-border/50 shadow-sm transition-transform hover:scale-[1.02] duration-300">
                                    <CardHeader>
                                        <div className="flex items-center gap-3 mb-2">
                                            {u.icon}
                                            <CardTitle className="text-lg font-bold">{u.role}</CardTitle>
                                        </div>
                                        <CardDescription className="text-sm font-medium">{u.desc}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {u.examples.map((ex) => (
                                                <li key={ex} className="flex items-center gap-3 text-sm text-foreground/80 font-medium group">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                                    {ex}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="px-6 py-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 -z-10" />
                    <div className="max-w-4xl mx-auto text-center space-y-10">
                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">Start talking to your data.</h2>
                        <p className="text-xl text-muted-foreground max-w-xl mx-auto">No SQL required. No setup. Just connect and start discovering insights today.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" className="h-14 px-10 text-base font-bold shadow-2xl shadow-primary/30 transition-all hover:translate-y-[-2px] active:translate-y-[0px]" onClick={onTryDemo}>
                                Try Interactive Demo <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-10 text-base font-bold bg-background transition-all hover:bg-muted" onClick={onGetStarted}>
                                Create Workspace
                            </Button>
                        </div>
                        <div className="flex items-center justify-center gap-8 pt-10 text-muted-foreground/60 transition-opacity hover:opacity-100">
                            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> <span className="text-[11px] font-bold uppercase tracking-widest">No Card Required</span></div>
                            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> <span className="text-[11px] font-bold uppercase tracking-widest">Instant Setup</span></div>
                            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> <span className="text-[11px] font-bold uppercase tracking-widest">SOC2 Compliant</span></div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t bg-muted/20 pb-20">
                <div className="max-w-7xl mx-auto px-6 pt-20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="space-y-4 max-w-xs text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">λ</div>
                                <span className="text-sm font-bold tracking-tight">QueryAI</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed leading-loose">The intelligent data assistant for modern engineering and product teams. Turn questions into insights instantly.</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-10">
                            <div className="flex flex-col gap-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground">Product</h4>
                                <a className="text-xs text-muted-foreground transition-colors hover:text-primary">Dashboard</a>
                                <a className="text-xs text-muted-foreground transition-colors hover:text-primary">Demo Chat</a>
                                <a className="text-xs text-muted-foreground transition-colors hover:text-primary">Integrations</a>
                            </div>
                            <div className="flex flex-col gap-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground">Company</h4>
                                <a className="text-xs text-muted-foreground transition-colors hover:text-primary">Pricing</a>
                                <a className="text-xs text-muted-foreground transition-colors hover:text-primary">Security</a>
                                <a className="text-xs text-muted-foreground transition-colors hover:text-primary">About Us</a>
                            </div>
                            <div className="flex flex-col gap-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground">Legal</h4>
                                <a className="text-xs text-muted-foreground transition-colors hover:text-primary">Privacy</a>
                                <a className="text-xs text-muted-foreground transition-colors hover:text-primary">Terms</a>
                                <a className="text-xs text-muted-foreground transition-colors hover:text-primary">Cookie Policy</a>
                            </div>
                        </div>
                    </div>
                    <Separator className="my-10" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-[11px] text-muted-foreground font-medium italic">Hand-crafted with passion for data professionals.</p>
                        <p className="text-[11px] text-muted-foreground font-medium">© 2025 QueryAI Labs Inc. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
