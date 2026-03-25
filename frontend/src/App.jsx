import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import "./index.css";

export default function App() {
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

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your SQL assistant. Ask me anything about the database — I'll query it and explain the results.",
      sql_query: null,
      explanation: null,
      chart_data: null,
    },
  ]);

  const [schema, setSchema] = useState(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  useEffect(() => { fetchSchema(); }, []);

  function clearChat() {
    fetch(`http://localhost:8000/api/history/${sessionId}`, { method: "DELETE" });
    setMessages([{
      role: "assistant",
      content: "Chat cleared. What would you like to know?",
      sql_query: null,
      explanation: null,
      chart_data: null,
    }]);
  }

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        dbConfig={dbConfig}
        setDbConfig={setDbConfig}
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
      />
    </div>
  );
}