export default function WelcomeScreen({ onDemo, onConnect }) {
    const EXAMPLE_QUERIES = [
        "Most popular product categories",
        "Monthly revenue trends for 2024",
        "List of users with no orders"
    ];

    return (
        <div className="welcome-overlay">
            <div className="welcome-card">
                <div className="welcome-logo-mark">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                    </svg>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h1 className="welcome-title">SQL Intelligence</h1>
                    <p className="welcome-desc">
                        Your personal data analyst. Ask questions in plain English and watch your database tell its story.
                    </p>
                </div>

                <div className="divider" />

                {/* Capabilities Section */}
                <div className="welcome-section">
                    <span className="welcome-section-title">Capabilities</span>
                    <ul className="capability-list">
                        <li className="capability-item">
                            <div className="capability-dot" />
                            <span>Natural language to SQL generation</span>
                        </li>
                        <li className="capability-item">
                            <div className="capability-dot" />
                            <span>Intelligent data visualization</span>
                        </li>
                        <li className="capability-item">
                            <div className="capability-dot" />
                            <span>Automated key insight extraction</span>
                        </li>
                    </ul>
                </div>

                <div className="divider" />

                {/* Try Asking Section */}
                <div className="welcome-section">
                    <span className="welcome-section-title">Try asking</span>
                    <div className="suggestion-chips" style={{ justifyContent: 'flex-start', margin: 0 }}>
                        {EXAMPLE_QUERIES.map(q => (
                            <span key={q} className="chip" style={{ cursor: 'default', fontSize: '11.5px', padding: '4px 10px' }}>{q}</span>
                        ))}
                    </div>
                </div>

                <div className="divider" style={{ marginBottom: '4px' }} />

                <div className="welcome-actions">
                    <button className="btn-primary" onClick={onDemo}>
                        Explore Demo Data
                    </button>
                    <button className="btn-secondary" onClick={onConnect}>
                        Connect Database
                    </button>
                </div>

                <div style={{ marginTop: '8px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text3)' }}>
                        Supports SQLite3 (Demo) and MySQL connections
                    </p>
                </div>
            </div>
        </div>
    );
}
