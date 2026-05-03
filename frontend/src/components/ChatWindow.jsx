import { useState, useRef, useEffect } from "react";
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  PanelLeft,
  Sun,
  Moon,
  LogOut,
  Send,
  Database,
  Cpu,
  MessageSquare,
  Sparkles,
  Command
} from "lucide-react";

const DEMO_SUGGESTIONS = [
  "Show top 5 customers by total spending",
  "Which product category generates the most revenue?",
  "How many orders were placed each month in 2024?",
  "List products with low stock (under 20)",
  "What's the average order value by city?",
  "Show delivered vs cancelled orders breakdown",
];

const EXPLORATION_SUGGESTIONS = [
  "Show all tables in this database",
  "What data is available in these tables?",
  "Show me sample rows from each table",
  "Summarize the database schema",
  "Which table has the most records?",
  "List all columns for the first table",
];

export default function ChatWindow({
  sessionId,
  dbConfig,
  messages,
  setMessages,
  sidebarOpen,
  setSidebarOpen,
  onBack,
  theme,
  toggleTheme,
  onLogout,
  token,
  onMessageSent
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Thinking...");
  const scrollRef = useRef(null);

  const activeSuggestions = dbConfig?.db_type === "USE_LOCALDB"
    ? DEMO_SUGGESTIONS
    : EXPLORATION_SUGGESTIONS;
  const textareaRef = useRef(null);
  const shouldAutoScroll = useRef(true);

  // Load history from API on mount
  useEffect(() => {
    let active = true;
    fetch(`${API}/api/history/${sessionId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => {
        if (res.status === 401) return onLogout();
        return res.json();
      })
      .then((data) => {
        if (active && data && data.messages) {
          setMessages(data.messages);
        }
      });
    return () => { active = false; };
  }, [sessionId, token]);

  // Smart scroll: Only auto-scroll if near bottom
  function handleScroll() {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - clientHeight - scrollTop < 100;
    shouldAutoScroll.current = isAtBottom;
  }

  useEffect(() => {
    if (shouldAutoScroll.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 130) + "px";
  }, [input]);

  async function send(query) {
    const q = (query || input).trim();
    if (!q || loading) return;

    setMessages(prev => [...prev, {
      role: "user",
      content: q,
      sql_query: null,
      explanation: null,
      chart_data: null,
      data: null,
    }]);
    setInput("");
    setLoading(true);
    setLoadingMessage("Thinking...");
    const startTime = Date.now();

    const steps = ["Thinking...", "Generating SQL...", "Fetching data..."];
    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setLoadingMessage(steps[stepIdx]);
    }, 2000);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          query: q,
          session_id: sessionId,
          db_type: dbConfig.db_type,
          ...(dbConfig.db_type === "USE_MYSQL" && {
            mysql_host: dbConfig.mysql_host,
            mysql_user: dbConfig.mysql_user,
            mysql_password: dbConfig.mysql_password,
            mysql_db: dbConfig.mysql_db,
          }),
        }),
      });

      if (res.status === 401) return onLogout();

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data?.detail?.error || data?.detail || "An error occurred.";
        const errDetail = data?.detail?.details || null;
        setMessages(prev => [...prev, {
          role: "assistant",
          content: errDetail ? `${errMsg}\n\n${errDetail}` : errMsg,
          sql_query: null,
          explanation: null,
          chart_data: null,
          data: null,
          isError: true,
        }]);
        return;
      }

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.answer,
        sql_query: data.sql_query || null,
        explanation: data.explanation || null,
        chart_data: data.chart_data || null,
        data: Array.isArray(data.data) ? data.data : null,
        followups: Array.isArray(data.followups) ? data.followups : [],
        insights: Array.isArray(data.insights) ? data.insights : [],
        isError: false,
      }]);

      if (onMessageSent) onMessageSent();
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Could not reach the backend. Please try again.`,
        sql_query: null,
        explanation: null,
        chart_data: null,
        data: null,
        isError: true,
      }]);
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 800 - elapsed);
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }

      setLoading(false);
      clearInterval(interval);
    }
  }

  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden font-sans">
      {/* Topbar */}
      <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack} title="Back to welcome" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(o => !o)} title="Toggle sidebar" className={`h-8 w-8 transition-colors ${sidebarOpen ? "text-primary bg-primary/10" : "text-muted-foreground"}`}>
            <PanelLeft className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <div className="flex items-center gap-2 px-1">
            <div className={`w-2 h-2 rounded-full ${dbConfig.db_type === "USE_LOCALDB" ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"}`} />
            <span className="text-sm font-semibold tracking-tight truncate max-w-[200px] text-foreground/90">
              {dbConfig.db_type === "USE_LOCALDB" ? "Demo Dataset" : dbConfig.mysql_db}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 text-muted-foreground hover:text-foreground">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onLogout} className="h-9 w-9 text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full px-4 pt-4" ref={scrollRef} onScroll={handleScroll}>
          <div className="max-w-4xl mx-auto pb-32">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto animate-in fade-in duration-1000">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl shadow-sm border border-primary/20 relative z-10">
                    λ
                  </div>
                  <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl -z-0 opacity-50" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">Ready for your first query?</h1>
                <p className="text-muted-foreground mb-10 leading-relaxed text-sm max-w-md">
                  Ask questions in plain English. I'll translate them to SQL, query your database, and provide insights.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full px-4">
                  {activeSuggestions.map(s => (
                    <Button
                      key={s}
                      variant="outline"
                      className="justify-start h-auto py-3 px-4 text-xs font-medium bg-card/50 hover:bg-accent hover:text-accent-foreground transition-all flex items-start gap-3 whitespace-normal border-border/60 shadow-sm text-left group"
                      onClick={() => send(s)}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 transition-transform group-hover:scale-110" />
                      <span>{s}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => <Message key={i} msg={msg} onFollowup={send} />)}
                {loading && (
                  <div className="flex justify-start mb-8 animate-in fade-in duration-300">
                    <div className="flex gap-3 w-full">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-sm mt-1">
                        <Cpu className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <TypingIndicator message={loadingMessage} />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </main>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent pt-10 z-10">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-border/80 focus-within:ring-1 focus-within:ring-primary/40 transition-shadow">
            <CardContent className="p-2">
              <div className="flex flex-col">
                <textarea
                  ref={textareaRef}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none py-3 px-4 min-h-[50px] max-h-[150px] placeholder:text-muted-foreground/60 scrollbar-none"
                  placeholder={loading ? "Analyzing data..." : "Ask anything... e.g. 'Show top 5 customers'"}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKey}
                  disabled={loading}
                />
                <div className="flex items-center justify-between px-2 pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-5 font-mono text-muted-foreground/70 bg-muted/50 border-none select-none">
                      <Command className="w-2.5 h-2.5 mr-1" /> ENTER
                    </Badge>
                  </div>
                  <Button
                    className="h-9 px-4 rounded-lg shadow-sm transition-all"
                    disabled={loading || !input.trim()}
                    onClick={() => send()}
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    <span>Send</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <p className="text-[10px] text-muted-foreground/40 text-center mt-3 font-medium uppercase tracking-[0.2em] select-none">
            Powered by Lambda SQL Engine
          </p>
        </div>
      </div>
    </div>
  );
}