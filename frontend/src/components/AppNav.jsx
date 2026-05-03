import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    BarChart3,
    Settings,
    Sun,
    Moon,
    LogOut,
    LayoutDashboard,
    CreditCard,
    Zap
} from "lucide-react";

export default function AppNav({ onNavigate, currentScreen, onLogout, onToggleTheme, theme, plan = "FREE" }) {
    const isPro = plan === "PRO";
    const navItems = [
        { label: "Dashboard", screen: "dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
        { label: "Pricing", screen: "pricing", icon: <CreditCard className="w-4 h-4 mr-2" /> },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-[1400px] mx-auto flex h-14 items-center px-6">
                <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => onNavigate("dashboard")}
                >
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm transition-transform group-hover:scale-105">λ</div>
                    <span className="text-sm font-bold tracking-tight hidden sm:inline-block">QueryAI</span>
                </div>

                <Separator orientation="vertical" className="h-6 mx-6" />

                <div className="flex items-center space-x-1 flex-1">
                    {navItems.map((item) => (
                        <Button
                            key={item.screen}
                            variant={currentScreen === item.screen ? "secondary" : "ghost"}
                            size="sm"
                            className={`h-9 px-4 ${currentScreen === item.screen ? "font-semibold text-primary bg-primary/5" : "text-muted-foreground"}`}
                            onClick={() => onNavigate(item.screen)}
                        >
                            {item.icon}
                            {item.label}
                        </Button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 pr-2">
                        {isPro ? (
                            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 gap-1 h-6 px-2 text-[10px] uppercase font-bold tracking-wider">
                                <Zap className="w-2.5 h-2.5 fill-primary" /> Pro Plan
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-muted-foreground border-dashed h-6 px-2 text-[10px] uppercase font-bold tracking-wider">
                                Free Plan
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={onToggleTheme} className="h-9 w-9 text-muted-foreground hover:text-foreground">
                            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onLogout} title="Logout" className="h-9 w-9 text-muted-foreground hover:text-destructive">
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
