import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Terminal,
    BarChart3,
    Lightbulb,
    Database,
    PlayCircle,
    PlusCircle,
    ShieldCheck,
    Zap
} from "lucide-react";

export default function WelcomeScreen({ onDemo, onConnect }) {
    const FEATURES = [
        { icon: <Terminal className="w-4 h-4 text-primary" />, label: "Natural Language SQL", desc: "Ask questions in plain English" },
        { icon: <BarChart3 className="w-4 h-4 text-blue-500" />, label: "Auto Visualization", desc: "Instant charts and data tables" },
        { icon: <Lightbulb className="w-4 h-4 text-amber-500" />, label: "Core Insights", desc: "LLM-generated key takeaways" },
        { icon: <ShieldCheck className="w-4 h-4 text-green-500" />, label: "Enterprise Ready", desc: "Secure SQLite & MySQL support" },
    ];

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-140px)] p-6">
            <Card className="max-w-2xl w-full border-none shadow-2xl bg-card/50 backdrop-blur-md overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-indigo-600" />

                <CardContent className="p-10 space-y-10">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                            <Database className="w-8 h-8 fill-primary-foreground/20" />
                        </div>
                        <div className="space-y-2">
                            <Badge variant="outline" className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary border-primary/20 bg-primary/5">
                                Welcome to SQL Intelligence
                            </Badge>
                            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                                Your Database, Analyzed.
                            </h1>
                            <p className="text-muted-foreground text-lg font-medium max-w-md mx-auto">
                                Transform raw queries into beautiful visualizations and actionable insights in seconds.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {FEATURES.map((f) => (
                            <div key={f.label} className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 group hover:bg-muted/50 transition-all duration-200">
                                <div className="p-2 rounded-lg bg-background shadow-sm border border-border/50 group-hover:scale-110 transition-transform duration-200">
                                    {f.icon}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-foreground leading-none">{f.label}</h3>
                                    <p className="text-xs font-medium text-muted-foreground">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                        <Button
                            size="lg"
                            className="w-full sm:flex-1 h-12 text-base font-bold shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                            onClick={onDemo}
                        >
                            <PlayCircle className="mr-2 w-5 h-5" /> Explore Demo Data
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full sm:flex-1 h-12 text-base font-bold bg-background/50 backdrop-blur-md transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                            onClick={onConnect}
                        >
                            <PlusCircle className="mr-2 w-5 h-5 text-primary" /> Connect Database
                        </Button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                            Ready for production workloads
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
