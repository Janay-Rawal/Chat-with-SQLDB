import { useState } from "react";

const SUGGESTIONS_DB = ["USE_LOCALDB", "USE_MYSQL"];

export default function Sidebar({ open, dbConfig, setDbConfig, schema, schemaLoading, onFetchSchema, onClear }) {
  const [expandedTables, setExpandedTables] = useState({});

  function toggleTable(name) {
    setExpandedTables(p => ({ ...p, [name]: !p[name] }));
  }

  function updateConfig(key, val) {
    setDbConfig(prev => ({ ...prev, [key]: val }));
  }

  return (
    <aside className={`sidebar ${open ? "" : "closed"}`}>
      <div className="sidebar-inner">
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">λ</div>
          <div>
            <div className="brand-name">SQL Intelligence</div>
            <div className="brand-sub">Powered by Groq · LLaMA 3.3</div>
          </div>
        </div>

        {/* DB Selector */}
        <div>
          <div className="section-label">Database</div>
          <div className="radio-group">
            {[
              { label: "SQLite3 (local)", val: "USE_LOCALDB" },
              { label: "MySQL", val: "USE_MYSQL" },
            ].map(opt => (
              <div
                key={opt.val}
                className={`radio-opt ${dbConfig.db_type === opt.val ? "active" : ""}`}
                onClick={() => updateConfig("db_type", opt.val)}
              >
                <span className="radio-dot"><span className="radio-dot-inner" /></span>
                {opt.label}
              </div>
            ))}
          </div>
        </div>

        {/* MySQL fields */}
        {dbConfig.db_type === "USE_MYSQL" && (
          <div className="field-group">
            <div className="section-label">MySQL Connection</div>
            {[
              { key: "mysql_host", ph: "Host", type: "text" },
              { key: "mysql_user", ph: "Username", type: "text" },
              { key: "mysql_password", ph: "Password", type: "password" },
              { key: "mysql_db", ph: "Database name", type: "text" },
            ].map(f => (
              <input
                key={f.key}
                className="sb-input"
                type={f.type}
                placeholder={f.ph}
                value={dbConfig[f.key]}
                onChange={e => updateConfig(f.key, e.target.value)}
              />
            ))}
            <button className="refresh-btn" onClick={onFetchSchema} style={{ marginTop: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
              </svg>
              Connect & Load Schema
            </button>
          </div>
        )}

        {/* Schema Viewer */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="section-label" style={{ marginBottom: 0 }}>Schema</div>
            <button
              className="refresh-btn"
              style={{ width: "auto", padding: "3px 8px", fontSize: 11 }}
              onClick={onFetchSchema}
            >
              ↺
            </button>
          </div>

          <div className="schema-panel">
            {schemaLoading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "4px 0" }}>
                {[80, 60, 70, 55].map((w, i) => (
                  <div key={i} className="skeleton" style={{ width: `${w}%` }} />
                ))}
              </div>
            )}

            {!schemaLoading && !schema && (
              <div style={{ fontSize: 12, color: "var(--text3)", padding: "4px 0" }}>
                No schema loaded.
              </div>
            )}

            {!schemaLoading && schema && schema.map(table => (
              <div key={table.name}>
                <div
                  className="schema-table-header"
                  onClick={() => toggleTable(table.name)}
                >
                  <span className="schema-table-name">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>
                    </svg>
                    {table.name}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="schema-table-count">{table.row_count.toLocaleString()}</span>
                    <span className={`schema-chevron ${expandedTables[table.name] ? "open" : ""}`}>▶</span>
                  </div>
                </div>
                {expandedTables[table.name] && (
                  <div className="schema-columns">
                    {table.columns.map(col => (
                      <div key={col.name} className="schema-col">
                        <span>{col.name}</span>
                        <span className="schema-col-type">{col.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Clear */}
        <button className="clear-btn" onClick={onClear}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
          Clear conversation
        </button>
      </div>
    </aside>
  );
}