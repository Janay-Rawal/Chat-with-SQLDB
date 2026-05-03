import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    Database,
    Zap,
    ArrowRight,
    Lock,
    Sparkles,
    BarChart3,
    Search
} from "lucide-react";

export default function Dashboard({ onNavigate, onStartDemo, onConnectDB, plan = "FREE" }) {
    const isPro = plan === "PRO";
    const planLabel = isPro ? "Pro" : "Free";

    const ACTIONS = [
        {
            id: "demo",
            icon: <Activity className="w-6 h-6 text-blue-500" />,
            title: "Explore Demo Data",
            desc: "Try queries on the built-in SQLite dataset. No setup required.",
            cta: "Open Demo",
            action: onStartDemo,
            available: true,
            gradient: "from-blue-500/10 to-indigo-500/10 border-blue-500/20"
        },
        {
            id: "connect",
            icon: <Database className={`w-6 h-6 ${isPro ? "text-green-500" : "text-muted-foreground"}`} />,
            title: "Connect Your Database",
            desc: "Connect a live MySQL database and query it with plain English.",
            cta: !isPro ? "Upgrade to Unlock" : "Connect Now",
            action: onConnectDB,
            available: isPro,
            locked: !isPro,
            badge: !isPro ? "Pro" : null,
            gradient: isPro ? "from-green-500/10 to-emerald-500/10 border-green-500/20" : "bg-muted/50 border-border/50"
        },
        {
            id: "pricing",
            icon: <Zap className="w-6 h-6 text-yellow-500" />,
            title: "View Pricing",
            desc: "Unlock unlimited queries, live databases, and advanced insights.",
            cta: "Compare Plans",
            action: () => onNavigate("pricing"),
            available: true,
            gradient: "from-yellow-500/10 to-orange-500/10 border-yellow-500/20"
        },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 py-12 animate-in fade-in duration-700">
            <div className="w-full max-w-5xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                            Good to have you back.
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-lg">
                            Your SQL Intelligence Assistant is ready. What insights are you looking for today?
                        </p>
                    </div>

                    <Card className="min-w-[240px] border-primary/20 bg-primary/5 shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Plan</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold">{planLabel}</span>
                                    {isPro ? <Badge className="bg-primary/20 text-primary border-primary/30 h-5 px-1.5 text-[10px]">Active</Badge> : null}
                                </div>
                            </div>
                            {!isPro && (
                                <Button
                                    size="sm"
                                    variant="default"
                                    className="h-8 shadow-sm"
                                    onClick={() => onNavigate("pricing")}
                                >
                                    Upgrade <ArrowRight className="w-3.5 h-3.5 ml-2" />
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {ACTIONS.map((action) => (
                        <Card
                            key={action.id}
                            className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-2 ${action.gradient} ${action.locked ? "opacity-90 grayscale-[0.5]" : ""}`}
                            onClick={action.action}
                        >
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`p-3 rounded-xl bg-background shadow-sm border border-border/50 transition-transform group-hover:scale-110 duration-500`}>
                                        {action.icon}
                                    </div>
                                    {action.locked && (
                                        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-blue-200 text-blue-700 gap-1 px-2">
                                            <Lock className="w-3 h-3" /> {action.badge}
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-xl font-bold">{action.title}</CardTitle>
                                <CardDescription className="text-sm leading-relaxed min-h-[40px]">
                                    {action.desc}
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="pt-0 flex items-center justify-between text-primary font-semibold text-sm">
                                <span className={action.locked ? "text-muted-foreground" : ""}>{action.cta}</span>
                                <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${action.locked ? "text-muted-foreground" : ""}`} />
                            </CardFooter>

                            {/* Decorative background element */}
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                        </Card>
                    ))}
                </div>

                {/* Quick Tips / Discovery */}
                <Card className="border-border/40 bg-muted/30 border-dashed">
                    <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Sparkles className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h4 className="font-semibold text-foreground mb-1">Unlock deeper insights</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Try asking specific natural language questions like <span className="font-medium text-foreground italic">"Who are our top 10 customers this quarter?"</span> or <span className="font-medium text-foreground italic">"Show a pipeline breakdown by region."</span>
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" className="shrink-0 text-xs font-semibold" onClick={onStartDemo}>
                            Try Examples
                        </Button>
                    </CardContent>
                </Card>

                <p className="text-center text-[11px] text-muted-foreground/50 uppercase tracking-[0.3em] mt-16 font-medium">
                    State of the art SQL Intelligence
                </p>
            </div>
        </div>
    );
}
