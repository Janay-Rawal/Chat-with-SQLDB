import { useState, useRef, useEffect } from "react";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";

const SUGGESTIONS = [
  "Show top 5 customers by total spending",
  "Which product category generates the most revenue?",
  "How many orders were placed each month in 2024?",
  "List products with low stock (under 20)",
  "What's the average order value by city?",
  "Show delivered vs cancelled orders breakdown",
];

export default function ChatWindow({ sessionId, dbConfig, messages, setMessages, sidebarOpen, setSidebarOpen, onBack, theme, toggleTheme }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Thinking...");
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const shouldAutoScroll = useRef(true);

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

    // Cycling loading message
    const steps = ["Thinking...", "Generating SQL...", "Fetching data..."];
    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setLoadingMessage(steps[stepIdx]);
    }, 2000);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Could not reach the backend.\n\nMake sure it's running at http://localhost:8000`,
        sql_query: null,
        explanation: null,
        chart_data: null,
        data: null,
        isError: true,
      }]);
    } finally {
      // Ensure loading is visible for at least 800ms to avoid flicker
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
    <div className="chat-window">
      {/* Topbar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="icon-btn" onClick={onBack} title="Back to welcome">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className="icon-btn" onClick={() => setSidebarOpen(o => !o)} title="Toggle sidebar">
            {sidebarOpen
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            }
          </button>
        </div>

        <div className="topbar-info">
          <div className="topbar-mode">
            <span className={`status-dot active`} />
            {dbConfig.db_type === "USE_LOCALDB" ? "Using Demo Dataset" : `Connected: ${dbConfig.mysql_db}`}
          </div>
          {dbConfig.db_type === "USE_MYSQL" && (
            <div className="topbar-sub">
              {dbConfig.mysql_host} · {dbConfig.mysql_db}
            </div>
          )}
        </div>

        <button className="icon-btn theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="18.36" x2="5.64" y2="16.93" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          )}
        </button>
      </div>

      {/* Messages */}
      <div className="messages-area" ref={scrollRef} onScroll={handleScroll}>
        {isEmpty ? (
          <div className="empty-state">
            <div className="empty-icon">λ</div>
            <div className="empty-title">Query your data, naturally.</div>
            <div className="empty-sub">
              Ask questions in plain English. I'll generate the SQL, run it, and explain what I found.
            </div>
            <div className="suggestion-chips">
              {SUGGESTIONS.map(s => (
                <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => <Message key={i} msg={msg} onFollowup={send} />)}
            {loading && <TypingIndicator message={loadingMessage} />}
          </>
        )}
      </div>

      {/* Input */}
      <div className="input-bar">
        <div className="input-row">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            rows={1}
            placeholder={loading ? "Analyzing data..." : "Ask anything... e.g. 'Show top 5 customers'"}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            disabled={loading}
          />
          <button
            className="send-btn"
            disabled={loading || !input.trim()}
            onClick={() => send()}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div className="input-hint">Enter to send · Shift+Enter for newline</div>
      </div>
    </div>
  );
}