import { useState } from "react";

export default function Sidebar({ open, mode, dbConfig, schema, schemaLoading, onFetchSchema, onClear }) {
  const [expandedTables, setExpandedTables] = useState({});

  function toggleTable(name) {
    setExpandedTables(p => ({ ...p, [name]: !p[name] }));
  }

  const isDemo = mode === "demo";

  return (
    <aside className={`sidebar ${open ? "" : "closed"}`}>
      <div className="sidebar-inner">
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">λ</div>
          <div>
            <div className="brand-name">SQL Intelligence</div>
            <div className="brand-sub">Analytical Assistant</div>
          </div>
        </div>

        {/* Current Connection Status */}
        <div className="connection-status">
          <div className="section-label">{isDemo ? "Dataset" : "Active Connection"}</div>
          <div className="status-card">
            <div className="status-header">
              <div className="status-indicator active" />
              <span className="status-db-type">
                {dbConfig.db_type === "USE_LOCALDB" ? "SQLite3 (Demo)" : "MySQL"}
              </span>
            </div>
            {dbConfig.db_type === "USE_MYSQL" && (
              <div className="status-details">
                <div className="status-item">
                  <span className="status-label">Host:</span>
                  <span className="status-value">{dbConfig.mysql_host}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Database:</span>
                  <span className="status-value">{dbConfig.mysql_db}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Schema Viewer */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="section-label" style={{ marginBottom: 0 }}>Catalog</div>
            <button
              className="refresh-btn"
              style={{ width: "auto", padding: "4px 8px", fontSize: 11 }}
              onClick={onFetchSchema}
              title="Reload Schema"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
            </button>
          </div>

          <div className="schema-panel">
            {schemaLoading || schema === null ? (
              <div className="schema-loading">
                <div className="spinner-small" />
                <span>Detecting tables...</span>
              </div>
            ) : schema.length === 0 ? (
              <div className="schema-empty">
                No tables discovered in catalog.
              </div>
            ) : schema.map(table => (
              <div key={table.name}>
                <div
                  className="schema-table-header"
                  onClick={() => toggleTable(table.name)}
                >
                  <span className="schema-table-name">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" />
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
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
          </svg>
          Clear session
        </button>
      </div>
    </aside>
  );
}