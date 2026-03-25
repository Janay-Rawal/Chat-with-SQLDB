import { useState } from "react";
import ChartView from "./ChartView";

function Collapsible({ label, dotColor, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="collapsible">
      <div className="collapsible-header" onClick={() => setOpen(o => !o)}>
        <span className="collapsible-label">
          <span className="sql-dot" style={dotColor ? { background: dotColor } : {}} />
          {label}
        </span>
        <svg className={`chevron ${open ? "open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      {open && <div className="collapsible-body">{children}</div>}
    </div>
  );
}

export default function Message({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div className={`message-row ${isUser ? "user" : ""}`}>
      <div className={`avatar ${isUser ? "user" : "bot"}`}>
        {isUser ? "U" : "λ"}
      </div>
      <div className="bubble-wrap">
        <div className={`bubble ${isUser ? "user" : "bot"} ${msg.isError ? "error" : ""}`}>
          {msg.content}
        </div>

        {/* SQL Query collapsible */}
        {!isUser && msg.sql_query && (
          <Collapsible label="View SQL query">
            <pre className="sql-code">{msg.sql_query}</pre>
          </Collapsible>
        )}

        {/* Explanation collapsible */}
        {!isUser && msg.explanation && (
          <Collapsible label="Explanation" dotColor="var(--blue)">
            <p className="explanation-text">{msg.explanation}</p>
          </Collapsible>
        )}

        {/* Chart */}
        {!isUser && msg.chart_data && (
          <ChartView data={msg.chart_data} />
        )}
      </div>
    </div>
  );
}