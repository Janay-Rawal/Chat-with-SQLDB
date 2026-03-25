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

export default function ChatWindow({ sessionId, dbConfig, messages, setMessages, sidebarOpen, setSidebarOpen }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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

    setMessages(prev => [...prev, { role: "user", content: q, sql_query: null, explanation: null, chart_data: null }]);
    setInput("");
    setLoading(true);

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
          sql_query: null, explanation: null, chart_data: null,
          isError: true,
        }]);
        return;
      }

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.answer,
        sql_query: data.sql_query,
        explanation: data.explanation,
        chart_data: data.chart_data,
        isError: false,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Could not reach the backend.\n\nMake sure it's running at http://localhost:8000`,
        sql_query: null, explanation: null, chart_data: null,
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const showEmpty = messages.length === 1 && !loading;

  return (
    <div className="chat-window">
      {/* Topbar */}
      <div className="topbar">
        <button className="icon-btn" onClick={() => setSidebarOpen(o => !o)} title="Toggle sidebar">
          {sidebarOpen
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          }
        </button>
        <span className="topbar-title">SQL Intelligence</span>
        <span className="db-badge">{dbConfig.db_type === "USE_LOCALDB" ? "SQLite3" : "MySQL"}</span>
      </div>

      {/* Messages */}
      <div className="messages-area">
        {showEmpty ? (
          <div className="empty-state">
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
          messages.map((msg, i) => <Message key={i} msg={msg} />)
        )}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="input-bar">
        <div className="input-row">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            rows={1}
            placeholder="Ask anything about the database…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
          />
          <button
            className="send-btn"
            disabled={loading || !input.trim()}
            onClick={() => send()}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <div className="input-hint">Enter to send · Shift+Enter for newline</div>
      </div>
    </div>
  );
}