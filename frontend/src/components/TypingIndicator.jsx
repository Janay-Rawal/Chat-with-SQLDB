import { Sparkles } from "lucide-react";

export default function TypingIndicator({ message = "AI is thinking..." }) {
  return (
    <div className="flex items-start gap-4 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
      </div>
      <div className="flex flex-col gap-2 pt-1 border-border/50">
        <div className="flex items-center gap-1.5 h-6">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
          <span className="ml-2 text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}