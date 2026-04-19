import { useState } from "react";

export default function ConnectScreen({ onConnectSubmit, onBack }) {
    const [form, setForm] = useState({
        host: "localhost",
        port: "3306",
        user: "root",
        password: "",
        db: "",
    });

    const [loading, setLoading] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        onConnectSubmit(form);
    }

    return (
        <div className="welcome-overlay">
            <div className="welcome-card" style={{ maxWidth: "440px", textAlign: "left", alignItems: "flex-start" }}>
                <button className="icon-btn" onClick={onBack} style={{ marginBottom: "12px", marginLeft: "-8px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    <span style={{ fontSize: "13px", marginLeft: "4px" }}>Back</span>
                </button>

                <h1 className="welcome-title" style={{ marginBottom: "4px" }}>Connect MySQL</h1>
                <p className="welcome-desc" style={{ marginBottom: "20px" }}>
                    Provide your database credentials to start querying.
                </p>

                <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="welcome-section">
                        <label className="welcome-section-title" style={{ display: "block", marginBottom: "8px" }}>Host & Port</label>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <input
                                className="chat-textarea"
                                style={{ height: "40px" }}
                                placeholder="localhost"
                                value={form.host}
                                onChange={e => setForm({ ...form, host: e.target.value })}
                                required
                            />
                            <input
                                className="chat-textarea"
                                style={{ height: "40px", width: "90px" }}
                                placeholder="3306"
                                value={form.port}
                                onChange={e => setForm({ ...form, port: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="welcome-section">
                        <label className="welcome-section-title" style={{ display: "block", marginBottom: "8px" }}>Authentication</label>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <input
                                className="chat-textarea"
                                style={{ height: "40px" }}
                                placeholder="Username"
                                value={form.user}
                                onChange={e => setForm({ ...form, user: e.target.value })}
                                required
                            />
                            <input
                                className="chat-textarea"
                                style={{ height: "40px" }}
                                type="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="welcome-section">
                        <label className="welcome-section-title" style={{ display: "block", marginBottom: "8px" }}>Database Name</label>
                        <input
                            className="chat-textarea"
                            style={{ height: "40px" }}
                            placeholder="e.g. sales_db"
                            value={form.db}
                            onChange={e => setForm({ ...form, db: e.target.value })}
                            required
                        />
                    </div>

                    <div className="divider" style={{ margin: "8px 0" }} />

                    <button className="btn-primary" type="submit" disabled={loading}>
                        {loading ? "Connecting..." : "Connect & Initialize"}
                    </button>
                </form>
            </div>
        </div>
    );
}
