import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Check, ShieldCheck, Sparkles } from "lucide-react";

export default function UpgradeModal({ open, onDismiss, onViewPricing }) {
    return (
        <Dialog open={open} onOpenChange={onDismiss}>
            <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none shadow-2xl">
                <div className="relative h-32 bg-primary flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 opacity-90" />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-background/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl transform -rotate-6">
                        <Zap className="w-8 h-8 text-white fill-white" />
                    </div>
                </div>

                <div className="px-8 pt-2 pb-8 space-y-6">
                    <div className="text-center space-y-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20 mb-2 hover:bg-primary/10 cursor-default">
                            Premium Feature
                        </Badge>
                        <DialogTitle className="text-2xl font-extrabold tracking-tight">Connect Your Database</DialogTitle>
                        <DialogDescription className="text-sm font-medium leading-relaxed">
                            Upgrade to Pro to connect your own <span className="text-foreground font-bold">MySQL</span> or <span className="text-foreground font-bold">Postgres</span> databases and unlock the full potential.
                        </DialogDescription>
                    </div>

                    <div className="space-y-3">
                        {[
                            { icon: <Check className="w-4 h-4 text-green-500" />, text: "Unlimited production queries" },
                            { icon: <Check className="w-4 h-4 text-green-500" />, text: "Persistent chat history & sessions" },
                            { icon: <Check className="w-4 h-4 text-green-500" />, text: "Advanced AI visualizations" },
                            { icon: <ShieldCheck className="w-4 h-4 text-primary" />, text: "Priority support & higher rate limits" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 group transition-colors hover:bg-muted/50">
                                {item.icon}
                                <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground">{item.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <Button
                            className="h-12 text-base font-bold shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                            onClick={onViewPricing}
                        >
                            Explore Pro Plans <Sparkles className="ml-2 w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-xs font-bold text-muted-foreground uppercase tracking-widest hover:bg-transparent hover:text-foreground"
                            onClick={onDismiss}
                        >
                            Maybe Later
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
