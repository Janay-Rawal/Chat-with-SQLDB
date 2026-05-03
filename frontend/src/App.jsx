import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ConnectScreen from "./components/ConnectScreen";
import AuthScreen from "./components/AuthScreen";
import LandingPage from "./components/LandingPage";
import AppNav from "./components/AppNav";
import Dashboard from "./components/Dashboard";
import PricingPage from "./components/PricingPage";
import UpgradeModal from "./components/UpgradeModal";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import "./index.css";

// ── Plan is read from the auth response and persisted in localStorage ──────
const PLAN_KEY = "sql_chat_plan";

export default function App() {
  // ── Auth ────────────────────────────────────────────────
  const [token, setToken] = useState(() => localStorage.getItem("sql_chat_token"));
  const [plan, setPlan] = useState(() => (localStorage.getItem(PLAN_KEY) || "FREE").toUpperCase());
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // ── Screen routing ───────────────────────────────────────
  // "dashboard" | "pricing" | "connect" | "demo" | "chat"
  const [screen, setScreen] = useState("dashboard");

  // ── UI state ────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem("sql_chat_theme") || "dark");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // ── DB / Chat state ─────────────────────────────────────
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem("sql_chat_session") || uuidv4();
  });
  const [sessions, setSessions] = useState([]);

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

  // ── Theme effect ─────────────────────────────────────────
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("sql_chat_theme", theme);
  }, [theme]);

  // ── Auto-fetch schema when entering chat ─────────────────
  useEffect(() => {
    if ((screen === "demo" || screen === "chat") && !schema && !schemaLoading) {
      fetchSchema(dbConfig);
    }
  }, [screen, dbConfig.db_type, sessionId]);

  // ── Fetch sessions on mount / token change ───────────────
  useEffect(() => {
    if (token) {
      fetchSessions();
    }
  }, [token]);

  // ── Auth ─────────────────────────────────────────────────
  function handleAuthSuccess(t, userPlan = "FREE") {
    setToken(t);
    const normalised = (userPlan || "FREE").toUpperCase();
    setPlan(normalised);
    localStorage.setItem(PLAN_KEY, normalised);
    setShowAuth(false);
    setScreen("dashboard");
  }

  function logout() {
    localStorage.removeItem("sql_chat_token");
    localStorage.removeItem(PLAN_KEY);
    setToken(null);
    setPlan("FREE");
    setScreen("dashboard");
    setShowAuth(false);
    setMessages([]);
    setSchema(null);
  }

  // ── Navigation ────────────────────────────────────────────
  function navigate(dest) {
    setScreen(dest);
  }

  function toggleTheme() {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  }

  // ── Schema ────────────────────────────────────────────────
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
      const res = await fetch(`http://localhost:8000/api/schema?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return logout();
      const data = await res.json();
      setSchema(data.tables || []);
    } catch {
      setSchema(null);
    } finally {
      setSchemaLoading(false);
    }
  }

  // ── Chat State ──────────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function fetchSessions() {
    try {
      const res = await fetch("http://localhost:8000/api/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return logout();
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("❌ Failed to fetch sessions:", err);
    }
  }

  function handleNewChat(type = dbConfig.db_type) {
    console.log("🆕 Starting New Chat. Type:", type);
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    setMessages([]);
    setSchema(null);
    localStorage.setItem("sql_chat_session", newSessionId);

    if (type === "USE_LOCALDB") {
      setDbConfig({ db_type: "USE_LOCALDB", mysql_host: "", mysql_user: "", mysql_password: "", mysql_db: "" });
      setScreen("demo");
    } else {
      setScreen("chat");
    }
    fetchSessions();
  }

  function handleSwitchSession(session) {
    console.log("🔄 Switching to session:", session.session_id, "Type:", session.db_type);
    setSessionId(session.session_id);
    localStorage.setItem("sql_chat_session", session.session_id);
    setMessages([]); // Will be reloaded by ChatWindow useEffect
    setSchema(null); // Force schema reload for new context

    if (session.db_type === "USE_LOCALDB") {
      setDbConfig({ db_type: "USE_LOCALDB", mysql_host: "", mysql_user: "", mysql_password: "", mysql_db: "" });
      setScreen("demo");
    } else {
      setDbConfig(prev => ({ ...prev, db_type: "USE_MYSQL" }));
      setScreen("chat");
    }
  }

  async function handleDeleteAllHistory() {
    console.log("🧹 handleDeleteAllHistory called.");
    setShowDeleteConfirm(true);
  }

  async function confirmDeleteAll() {
    console.log("🧹 confirmDeleteAll executing...");
    setShowDeleteConfirm(false);
    try {
      const res = await fetch("http://localhost:8000/api/history", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return logout();
      if (res.ok) {
        console.log("✅ History wiped successfully.");
        handleNewChat();
      }
    } catch (err) {
      console.error("❌ Failed to delete history:", err);
    }
  }

  function clearChat() {
    console.log("🗑️ Clear Current clicked. Only wiping UI state.");
    setMessages([]);
  }

  // ── Action handlers ───────────────────────────────────────
  function handleStartDemo() {
    handleNewChat("USE_LOCALDB");
  }

  function handleConnectDB() {
    if (plan === "FREE") {
      setShowUpgradeModal(true);
    } else {
      setScreen("connect");
    }
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
    setSchema(null);
    const newId = uuidv4();
    setSessionId(newId);
    setMessages([]);
    localStorage.setItem("sql_chat_session", newId);
    setScreen("chat");
    fetchSchema(cfg);
    fetchSessions();
  }

  async function handleUpgrade() {
    try {
      const res = await fetch("http://localhost:8000/api/auth/upgrade", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return logout();
      if (res.ok) {
        setPlan("PRO");
        localStorage.setItem(PLAN_KEY, "PRO");
        alert("🎉 Congratulations! Your plan has been upgraded to PRO.");
      } else {
        alert("Failed to upgrade plan. Please try again.");
      }
    } catch (err) {
      alert("An error occurred during upgrade.");
    }
  }

  // ── Render ───────────────────────────────────────────────

  // 1. Unauthenticated — Landing or Auth
  if (!token) {
    if (showAuth) {
      return (
        <AuthScreen
          initialMode={authMode}
          onAuthSuccess={handleAuthSuccess}
          onBack={() => setShowAuth(false)}
        />
      );
    }
    return (
      <LandingPage
        onSignIn={() => { setAuthMode("login"); setShowAuth(true); }}
        onGetStarted={() => { setAuthMode("signup"); setShowAuth(true); }}
        onTryDemo={() => { setAuthMode("signup"); setShowAuth(true); }}
      />
    );
  }

  // 2. Chat view — full screen, no AppNav (ChatWindow has its own topbar)
  if (screen === "demo" || screen === "chat") {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar
          open={sidebarOpen}
          mode={screen}
          plan={plan}
          dbConfig={dbConfig}
          schema={schema}
          schemaLoading={schemaLoading}
          sessions={sessions}
          currentSessionId={sessionId}
          onSwitchSession={handleSwitchSession}
          onFetchSchema={() => fetchSchema(dbConfig)}
          onClear={clearChat}
          onNewChat={handleNewChat}
          onDeleteAll={handleDeleteAllHistory}
        />
        <ChatWindow
          sessionId={sessionId}
          dbConfig={dbConfig}
          messages={messages}
          setMessages={setMessages}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onBack={() => navigate("dashboard")}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={logout}
          token={token}
          onMessageSent={fetchSessions}
        />

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all your
                chat history across all database connections.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // 3. Authenticated screens — with AppNav
  const appNavProps = {
    currentScreen: screen,
    onNavigate: navigate,
    onLogout: logout,
    onToggleTheme: toggleTheme,
    theme,
    plan,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <AppNav {...appNavProps} />

      <UpgradeModal
        open={showUpgradeModal}
        onViewPricing={() => { setShowUpgradeModal(false); navigate("pricing"); }}
        onDismiss={() => setShowUpgradeModal(false)}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your conversations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <main className="flex-1 overflow-auto bg-muted/20">
        {screen === "dashboard" && (
          <Dashboard
            plan={plan}
            onNavigate={navigate}
            onStartDemo={handleStartDemo}
            onConnectDB={handleConnectDB}
          />
        )}

        {screen === "pricing" && (
          <PricingPage
            plan={plan}
            onNavigate={navigate}
            onUpgrade={handleUpgrade}
          />
        )}

        {screen === "connect" && (
          <ConnectScreen
            onConnectSubmit={handleConnectSubmit}
            onBack={() => navigate("dashboard")}
          />
        )}
      </main>
    </div>
  );
}