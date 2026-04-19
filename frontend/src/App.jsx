import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import WelcomeScreen from "./components/WelcomeScreen";
import ConnectScreen from "./components/ConnectScreen";
import "./index.css";

export default function App() {
  // mode state:
  // null = Welcome Screen
  // "connect" = Show ConnectScreen (MySQL Form)
  // "demo" = Chat View (SQLite)
  // "chat" = Chat View (Connected MySQL)
  const [mode, setMode] = useState(() => {
    return window.history.state?.mode ?? null;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("sql_chat_theme") || "dark";
  });

  const [sessionId] = useState(() => {
    const saved = localStorage.getItem("sql_chat_session");
    if (saved) return saved;
    const id = uuidv4();
    localStorage.setItem("sql_chat_session", id);
    return id;
  });

  const [dbConfig, setDbConfig] = useState({
    db_type: "USE_LOCALDB",
    mysql_host: "",
    mysql_user: "",
    mysql_password: "",
    mysql_db: "",
  });

  const [messages, setMessages] = useState([]);

  const [schema, setSchema] = useState(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Browser history ───────────────────────────────────────
  useEffect(() => {
    function onPopState(e) {
      setMode(e.state?.mode ?? null);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("sql_chat_theme", theme);
  }, [theme]);

  // ── Auto-fetch schema on mode change ─────────────────────
  useEffect(() => {
    if ((mode === "demo" || mode === "chat") && !schema && !schemaLoading) {
      fetchSchema(dbConfig);
    }
  }, [mode, dbConfig.db_type, schema, schemaLoading]);

  function toggleTheme() {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  }

  function pushMode(newMode) {
    window.history.pushState({ mode: newMode }, "");
    setMode(newMode);
  }

  function goBack() {
    window.history.back();
  }

  async function fetchSchema(config = dbConfig) {
    setSchemaLoading(true);
    try {
      const params = new URLSearchParams({ db_type: config.db_type });
      if (config.db_type === "USE_MYSQL") {
        params.append("mysql_host", config.mysql_host);
        params.append("mysql_user", config.mysql_user);
        params.append("mysql_password", config.mysql_password);
        params.append("mysql_db", config.mysql_db);
      }
      const res = await fetch(`http://localhost:8000/api/schema?${params}`);
      const data = await res.json();
      setSchema(data.tables || []);
    } catch {
      setSchema(null);
    } finally {
      setSchemaLoading(false);
    }
  }

  function clearChat() {
    fetch(`http://localhost:8000/api/history/${sessionId}`, { method: "DELETE" });
    setMessages([]);
  }

  // ── Welcome screen handlers ──────────────────────────────
  function handleDemo() {
    const cfg = { db_type: "USE_LOCALDB", mysql_host: "", mysql_user: "", mysql_password: "", mysql_db: "" };
    setDbConfig(cfg);
    pushMode("demo");
    fetchSchema(cfg);
    setMessages([{
      role: "assistant",
      content: "I've loaded the **Demo Dataset** (SQLite). You can ask me questions about customers, products, or sales trends. Try: *'Who are the top 5 customers by revenue?'*.",
      isError: false
    }]);
  }

  function handleConnectRequest() {
    pushMode("connect");
  }

  function handleConnectSubmit(form) {
    const cfg = {
      db_type: "USE_MYSQL",
      mysql_host: form.host,
      mysql_port: form.port || "3306",
      mysql_user: form.user,
      mysql_password: form.password,
      mysql_db: form.db,
    };
    setDbConfig(cfg);
    fetchSchema(cfg).then(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Connect successful! I'm now connected to the **${cfg.mysql_db}** database on **${cfg.mysql_host}**. How can I help you today?`,
        isError: false
      }]);
      pushMode("chat");
    });
  }

  // ── Render ───────────────────────────────────────────────
  if (!mode) {
    return <WelcomeScreen onDemo={handleDemo} onConnect={handleConnectRequest} />;
  }

  if (mode === "connect") {
    return <ConnectScreen onConnectSubmit={handleConnectSubmit} onBack={goBack} />;
  }

  const isChatView = mode === "demo" || mode === "chat";

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        mode={mode}
        dbConfig={dbConfig}
        schema={schema}
        schemaLoading={schemaLoading}
        onFetchSchema={() => fetchSchema(dbConfig)}
        onClear={clearChat}
      />
      <ChatWindow
        sessionId={sessionId}
        dbConfig={dbConfig}
        messages={messages}
        setMessages={setMessages}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onBack={goBack}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </div>
  );
}