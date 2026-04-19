import { useState } from "react";
import ChartView from "./ChartView";
import TableView from "./TableView";

function Collapsible({ label, dotColor, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="collapsible">
      <div className="collapsible-header" onClick={() => setOpen(o => !o)}>
        <span className="collapsible-label">
          <span className="sql-dot" style={dotColor ? { background: dotColor } : {}} />
          {label}
        </span>
        <svg
          className={`chevron ${open ? "open" : ""}`}
          width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && <div className="collapsible-body">{children}</div>}
    </div>
  );
}

export default function Message({ msg, onFollowup }) {
  const [copied, setCopied] = useState(false);

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  console.log("🧠 MESSAGE OBJECT:", msg);
  const isUser = msg.role === "user";

  // The chart source: prefer chart_data (pre-structured), fall back to raw data array
  const chartSource = msg.chart_data || (msg.data?.length >= 2 ? msg.data : null);
  console.log("📊 chartSource:", chartSource);

  const hasFollowups = !isUser && !msg.isError && msg.followups?.length > 0;

  return (
    <div className={`message-row ${isUser ? "user" : ""}`}>
      <div className={`avatar ${isUser ? "user" : "bot"}`}>
        {isUser ? "U" : "λ"}
      </div>

      <div className="bubble-wrap">
        {/* Assistant Cards */}
        {!isUser && (
          <>
            <div className={`content-card ${msg.isError ? "error-card" : ""}`} style={{ marginTop: 0 }}>
              <span className="content-card-label">
                {msg.isError ? "System Status" : "Assistant Response"}
              </span>
              <div className={`bubble bot ${msg.isError ? "error" : ""}`} style={{ padding: 0, background: "transparent", border: "none", boxShadow: "none", fontSize: "14px" }}>
                {msg.isError && <span style={{ marginRight: "6px" }}>⚠️</span>}
                {msg.content}
              </div>

              {!msg.isError && msg.insights?.length > 0 && (
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                  <span className="content-card-label" style={{ fontSize: "10px", marginBottom: "8px", display: "block" }}>Key Insights</span>
                  <ul className="insights-list" style={{ margin: 0, paddingLeft: "1.2rem" }}>
                    {msg.insights.map((insight, i) => (
                      <li key={i} style={{ color: "var(--text1)", fontSize: "13px", marginBottom: "4px" }}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Table — shown above chart */}
            {msg.data?.length > 0 && (
              <div className="content-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px 0" }}><span className="content-card-label">Result Data</span></div>
                <TableView data={msg.data} />
              </div>
            )}

            {/* Chart — shown inline */}
            {chartSource && (
              <div className="content-card">
                <span className="content-card-label">Visualization</span>
                <ChartView data={chartSource} />
              </div>
            )}

            {/* SQL Query */}
            {msg.sql_query && (
              <div className="content-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span className="content-card-label" style={{ marginBottom: 0 }}>SQL Query</span>
                  <button className="copy-btn" onClick={() => copyToClipboard(msg.sql_query)}>
                    {copied ? "Copied!" : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className="sql-code" style={{ margin: 0, background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px", fontSize: "12px", border: "1px solid var(--border)" }}>{msg.sql_query}</pre>
              </div>
            )}

            {/* Explanation */}
            {msg.explanation && (
              <div className="content-card">
                <span className="content-card-label">Explanation</span>
                <p className="explanation-text" style={{ margin: 0, fontSize: "13.5px", color: "var(--text2)" }}>{msg.explanation}</p>
              </div>
            )}

            {/* Follow-up suggestions */}
            {hasFollowups && (
              <div className="followup-chips">
                <div className="followup-label">Suggested follow-ups:</div>
                {msg.followups.map((q, i) => (
                  <button key={i} className="followup-chip" onClick={() => onFollowup(q)}>
                    <span style={{ opacity: 0.6 }}>↳</span> {q}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* User Message Bubble */}
        {isUser && (
          <div className="bubble user">
            {msg.content}
          </div>
        )}
      </div>
    </div>
  );
}