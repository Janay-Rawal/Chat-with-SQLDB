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
import { Check, Star, Zap, Shield, HelpCircle } from "lucide-react";

export default function PricingPage({ onNavigate, onUpgrade, plan = "FREE" }) {
    const isPro = plan === "PRO";

    const PLANS = [
        {
            name: "Free",
            price: "$0",
            period: "forever",
            desc: "Explore and prototype with no commitment.",
            features: [
                "Demo dataset access",
                "10 queries per day",
                "Basic chart generation",
                "Community support",
            ],
            cta: isPro ? "Downgrade" : "Current Plan",
            current: !isPro,
            highlight: false,
            action: () => { },
        },
        {
            name: "Pro",
            price: "$29",
            period: "per month",
            desc: "For analysts and teams who need production-grade access.",
            features: [
                "Connect your own MySQL DB",
                "Unlimited queries",
                "Advanced visualizations",
                "Query history & insights",
                "Priority support",
            ],
            cta: isPro ? "Current Plan" : "Get Started Now",
            current: isPro,
            highlight: true,
            action: onUpgrade,
        },
        {
            name: "Enterprise",
            price: "Custom",
            period: "contact us",
            desc: "For large teams with compliance, security, and scale needs.",
            features: [
                "SSO & RBAC",
                "Dedicated infrastructure",
                "Custom model fine-tuning",
                "SLA guarantee",
                "Dedicated solutions engineer",
            ],
            cta: "Talk to Sales",
            current: false,
            highlight: false,
            action: () => window.alert("Contact sales at sales@queryai.com"),
        },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 py-20 bg-muted/20">
            <div className="w-full max-w-6xl">
                <div className="text-center space-y-4 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Badge variant="outline" className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold text-primary border-primary/30 bg-primary/5 mb-2">
                        Pricing Plans
                    </Badge>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
                        {isPro ? "You're all set with Pro!" : "Smart analysis for every scale"}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {isPro
                            ? "Scale your analysis with unlimited queries and production database connections."
                            : "Start free to explore the platform. Upgrade to unlock the full power of QueryAI."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {PLANS.map((p) => (
                        <Card
                            key={p.name}
                            className={`relative flex flex-col transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] border-2 shadow-sm ${p.highlight ? "border-primary ring-4 ring-primary/5" : "border-border/50"}`}
                        >
                            {p.highlight && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}

                            <CardHeader className="text-center pt-10 pb-8">
                                <CardTitle className="text-2xl font-bold mb-2">{p.name}</CardTitle>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-5xl font-extrabold tracking-tight">{p.price}</span>
                                    {p.period !== "contact us" && <span className="text-muted-foreground font-medium">/{p.period}</span>}
                                </div>
                                <CardDescription className="mt-4 text-sm leading-relaxed max-w-[240px] mx-auto min-h-[40px]">
                                    {p.desc}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1 pb-10">
                                <ul className="space-y-4">
                                    {p.features.map((f) => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground group">
                                            <div className={`p-1 rounded-full ${p.highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                                <Check className="w-3.5 h-3.5 shadow-sm" />
                                            </div>
                                            <span className="transition-colors group-hover:text-foreground">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter className="pb-10">
                                <Button
                                    className={`w-full h-12 text-base font-bold shadow-md transition-all ${p.current ? "bg-muted text-muted-foreground hover:bg-muted cursor-default" : p.highlight ? "shadow-primary/20 hover:translate-y-[-2px] active:translate-y-[1px]" : "hover:translate-y-[-2px] active:translate-y-[1px]"}`}
                                    variant={p.highlight ? "default" : "outline"}
                                    onClick={p.action}
                                    disabled={p.current}
                                >
                                    {p.cta}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-border/50">
                    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
                        <Shield className="w-6 h-6 text-primary flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-sm mb-1 uppercase tracking-wider text-muted-foreground">Secure & Compliant</h4>
                            <p className="text-[13px] text-muted-foreground">Bank-grade SSL encryption and SOC2 ready data handling.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
                        <Zap className="w-6 h-6 text-primary flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-sm mb-1 uppercase tracking-wider text-muted-foreground">High Availability</h4>
                            <p className="text-[13px] text-muted-foreground">Enterprise-ready with 99.99% uptime guarantee.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
                        <HelpCircle className="w-6 h-6 text-primary flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-sm mb-1 uppercase tracking-wider text-muted-foreground">24/7 Support</h4>
                            <p className="text-[13px] text-muted-foreground">Global expert support team ready to assist your team.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
