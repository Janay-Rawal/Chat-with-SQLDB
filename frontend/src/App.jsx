import { useState, useRef, useEffect } from "react";

const DB_LOCAL = "USE_LOCALDB";
const DB_MYSQL = "USE_MYSQL";

const INITIAL_MESSAGES = [{ role: "assistant", content: "How may I help you?" }];

/* ── Fonts & global CSS ───────────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; }
    body { background: #f5f3ef; font-family: 'Geist', sans-serif; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50%       { transform: scale(1.4); opacity: 1; }
    }

    .msg-enter { animation: slideUp 0.28s cubic-bezier(0.22, 1, 0.36, 1) both; }

    textarea:focus, input:focus { outline: none; }
    input[type="password"]::placeholder { letter-spacing: 2px; }
    input::placeholder { color: #b0a89a; }
    textarea::placeholder { color: #b0a89a; }

    .send-btn:hover { background: #1a1a1a !important; }
    .send-btn:active { transform: scale(0.95); }
    .send-btn:disabled { background: #d4cfc8 !important; cursor: not-allowed; }

    .sidebar-input {
      background: rgba(255,255,255,0.55);
      border: 1px solid rgba(0,0,0,0.09);
      border-radius: 10px;
      padding: 9px 12px;
      font-size: 13px;
      font-family: 'Geist', sans-serif;
      color: #2a2520;
      width: 100%;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .sidebar-input:focus {
      border-color: rgba(0,0,0,0.22);
      box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
      background: rgba(255,255,255,0.85);
    }

    .radio-opt {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 9px 11px;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.14s;
      font-size: 13px;
      color: #2a2520;
      user-select: none;
    }
    .radio-opt:hover { background: rgba(0,0,0,0.04); }
    .radio-opt.active { background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

    .icon-radio {
      width: 16px; height: 16px; border-radius: 50%;
      border: 1.5px solid #c0bab2;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: border-color 0.14s;
    }
    .radio-opt.active .icon-radio { border-color: #2a2520; }
    .icon-radio-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #2a2520; display: none;
    }
    .radio-opt.active .icon-radio-dot { display: block; }

    .pill-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #e8f5ee;
      color: #1a7a45;
      font-size: 11.5px;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid #c0e8d0;
      font-weight: 500;
    }

    .clear-btn {
      display: flex; align-items: center; justify-content: center; gap: 7px;
      padding: 9px 14px; border-radius: 10px;
      background: transparent;
      border: 1px solid rgba(0,0,0,0.10);
      color: #80736a;
      font-size: 12.5px;
      font-family: 'Geist', sans-serif;
      cursor: pointer;
      transition: background 0.14s, color 0.14s, border-color 0.14s;
      width: 100%;
    }
    .clear-btn:hover { background: rgba(220,60,60,0.07); color: #c0392b; border-color: rgba(220,60,60,0.2); }

    .menu-btn {
      width: 34px; height: 34px; border-radius: 9px;
      border: 1px solid rgba(0,0,0,0.08);
      background: #fff;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0;
      transition: background 0.14s;
      color: #6b6258;
    }
    .menu-btn:hover { background: #f0ede8; }

    .chat-input {
      flex: 1;
      background: #fff;
      border: 1px solid rgba(0,0,0,0.10);
      border-radius: 14px;
      padding: 13px 16px;
      font-size: 14.5px;
      font-family: 'Geist', sans-serif;
      color: #2a2520;
      resize: none;
      max-height: 130px;
      overflow-y: auto;
      line-height: 1.5;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .chat-input:focus {
      border-color: rgba(0,0,0,0.2);
      box-shadow: 0 0 0 3px rgba(0,0,0,0.04);
    }

    .assistant-bubble {
      background: #fff;
      border: 1px solid rgba(0,0,0,0.07);
      border-radius: 18px 18px 18px 4px;
      box-shadow: 0 1px 6px rgba(0,0,0,0.05);
    }
    .user-bubble {
      background: #2a2520;
      color: #f5f0e8;
      border-radius: 18px 18px 4px 18px;
    }

    .dot-typing span {
      display: inline-block;
      width: 5px; height: 5px; border-radius: 50%;
      background: #c0b8ae;
      animation: pulse 1.3s ease-in-out infinite;
    }
    .dot-typing span:nth-child(2) { animation-delay: 0.18s; }
    .dot-typing span:nth-child(3) { animation-delay: 0.36s; }

    .suggestion-btn {
      background: #fff;
      border: 1px solid rgba(0,0,0,0.09);
      border-radius: 10px;
      padding: 8px 14px;
      font-size: 13px;
      color: #5a524a;
      cursor: pointer;
      font-family: 'Geist', sans-serif;
      transition: background 0.14s;
    }
    .suggestion-btn:hover { background: #f0ede8; }
  `}</style>
);

function TypingBubble() {
  return (
    <div className="msg-enter" style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 16 }}>
      <Avatar bot />
      <div className="assistant-bubble" style={{ padding: "14px 18px" }}>
        <div className="dot-typing" style={{ display: "flex", gap: 5 }}>
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

function Avatar({ bot }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
      background: bot ? "#2a2520" : "#e2ddd7",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 14,
      fontFamily: "'Instrument Serif', serif",
      color: bot ? "#f5f0e8" : "#5a524a",
      letterSpacing: "-0.5px",
      fontStyle: bot ? "italic" : "normal",
    }}>
      {bot ? "λ" : "U"}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className="msg-enter" style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      gap: 10,
      alignItems: "flex-end",
      marginBottom: 16,
    }}>
      <Avatar bot={!isUser} />
      <div
        className={isUser ? "user-bubble" : "assistant-bubble"}
        style={{
          padding: "12px 16px",
          fontSize: 14.5,
          lineHeight: 1.65,
          maxWidth: "74%",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10.5,
      fontWeight: 500,
      letterSpacing: "0.10em",
      textTransform: "uppercase",
      color: "#a09890",
      marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

function Sidebar({ open, dbType, setDbType, mysqlFields, setMysqlField, apiKey, setApiKey, onClear }) {
  return (
    <aside style={{
      width: open ? 270 : 0,
      minWidth: open ? 270 : 0,
      overflow: "hidden",
      transition: "all 0.32s cubic-bezier(0.4,0,0.2,1)",
      background: "rgba(232,228,220,0.7)",
      backdropFilter: "blur(16px)",
      borderRight: "1px solid rgba(0,0,0,0.07)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      <div style={{
        padding: "28px 20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 28,
        height: "100%",
        overflowY: "auto",
        minWidth: 270,
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "#2a2520",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
            fontFamily: "'Instrument Serif', serif",
            fontStyle: "italic",
            color: "#f5f0e8",
          }}>λ</div>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 500, color: "#2a2520", letterSpacing: "-0.3px" }}>SQL Chat</div>
            <div style={{ fontSize: 11.5, color: "#a09890" }}>Langchain + Groq</div>
          </div>
        </div>

        {/* Database */}
        <div>
          <SectionLabel>Database</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { label: "SQLite3 (student.db)", val: DB_LOCAL },
              { label: "MySQL", val: DB_MYSQL },
            ].map(opt => (
              <div key={opt.val}
                className={`radio-opt ${dbType === opt.val ? "active" : ""}`}
                onClick={() => setDbType(opt.val)}
              >
                <span className="icon-radio"><span className="icon-radio-dot" /></span>
                {opt.label}
              </div>
            ))}
          </div>
        </div>

        {/* MySQL fields */}
        {dbType === DB_MYSQL && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, animation: "fadeIn 0.2s ease" }}>
            <SectionLabel>MySQL Connection</SectionLabel>
            {[
              { key: "host",     ph: "Host",     type: "text"     },
              { key: "user",     ph: "Username", type: "text"     },
              { key: "password", ph: "Password", type: "password" },
              { key: "db",       ph: "Database", type: "text"     },
            ].map(f => (
              <input key={f.key}
                className="sidebar-input"
                type={f.type}
                placeholder={f.ph}
                value={mysqlFields[f.key]}
                onChange={e => setMysqlField(f.key, e.target.value)}
              />
            ))}
          </div>
        )}

        {/* API Key */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SectionLabel>API Key</SectionLabel>
          <input
            className="sidebar-input"
            type="password"
            placeholder="GROQ API Key"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
          {apiKey && (
            <div><span className="pill-tag"><span style={{ fontSize: 12 }}>✓</span> Key set</span></div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        <button className="clear-btn" onClick={onClear}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
          Clear conversation
        </button>
      </div>
    </aside>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dbType, setDbType] = useState(DB_LOCAL);
  const [mysqlFields, setMysqlFields] = useState({ host: "", user: "", password: "", db: "" });
  const [apiKey, setApiKey] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const setMysqlField = (key, val) => setMysqlFields(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 130) + "px";
  }, [input]);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    if (!apiKey) { alert("Enter your GROQ API key in the sidebar first."); return; }

    const next = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q, api_key: apiKey, db_type: dbType,
          ...(dbType === DB_MYSQL && {
            mysql_host: mysqlFields.host, mysql_user: mysqlFields.user,
            mysql_password: mysqlFields.password, mysql_db: mysqlFields.db,
          }),
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.response || "No response." }]);
    } catch (err) {
      setMessages([...next, {
        role: "assistant",
        content: `⚠ ${err.message}\n\nMake sure your backend is running at http://localhost:8000`,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const showEmpty = messages.length === 1 && !loading;
  const SUGGESTIONS = ["Show all students", "Who scored above 90?", "Count rows in each table"];

  return (
    <>
      <GlobalStyle />
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar
          open={sidebarOpen} dbType={dbType} setDbType={setDbType}
          mysqlFields={mysqlFields} setMysqlField={setMysqlField}
          apiKey={apiKey} setApiKey={setApiKey}
          onClear={() => setMessages(INITIAL_MESSAGES)}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f5f3ef" }}>
          {/* Topbar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 22px",
            background: "rgba(245,243,239,0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(0,0,0,0.07)",
            flexShrink: 0,
          }}>
            <button className="menu-btn" onClick={() => setSidebarOpen(o => !o)}>
              {sidebarOpen
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
            <div style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 18, color: "#2a2520",
              letterSpacing: "-0.3px", fontStyle: "italic",
            }}>
              Langchain SQL Chat
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span style={{
                fontSize: 12, color: "#a09890",
                background: "#edeae4", padding: "4px 11px",
                borderRadius: 20, border: "1px solid rgba(0,0,0,0.07)",
              }}>
                {dbType === DB_LOCAL ? "SQLite3" : "MySQL"}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "32px 10%" }}>
            {showEmpty ? (
              <div style={{ textAlign: "center", paddingTop: "18vh", animation: "fadeIn 0.5s ease" }}>
                <div style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 36, color: "#2a2520",
                  letterSpacing: "-1px", marginBottom: 12, fontStyle: "italic",
                }}>
                  Ask your database anything.
                </div>
                <div style={{ fontSize: 14, color: "#a09890", lineHeight: 1.7, maxWidth: 380, margin: "0 auto" }}>
                  Connect to SQLite or MySQL in the sidebar, add your Groq API key, and start querying in plain English.
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} className="suggestion-btn"
                      onClick={() => { setInput(s); textareaRef.current?.focus(); }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => <Message key={i} msg={msg} />)
            )}
            {loading && <TypingBubble />}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{
            padding: "14px 10% 20px",
            background: "rgba(245,243,239,0.85)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(0,0,0,0.07)",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea
                ref={textareaRef}
                className="chat-input"
                rows={1}
                placeholder="Ask anything from the database…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKey}
              />
              <button
                className="send-btn"
                disabled={loading || !input.trim()}
                onClick={send}
                style={{
                  width: 44, height: 44, borderRadius: 13,
                  background: "#2a2520", border: "none", color: "#f5f0e8",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "background 0.14s, transform 0.1s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <div style={{ textAlign: "center", fontSize: 11.5, color: "#bbb5ad", marginTop: 9 }}>
              Enter to send · Shift+Enter for newline
            </div>
          </div>
        </div>
      </div>
    </>
  );
}