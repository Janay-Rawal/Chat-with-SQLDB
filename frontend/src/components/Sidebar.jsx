import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@radix-ui/react-separator";
import {
  Plus,
  Database,
  Trash2,
  Eraser,
  RefreshCcw,
  ChevronRight,
  Table as TableIcon,
  Layers
} from "lucide-react";

export default function Sidebar({
  open,
  mode,
  plan = "FREE",
  dbConfig,
  schema,
  schemaLoading,
  sessions = [],
  currentSessionId,
  onSwitchSession,
  onFetchSchema,
  onClear,
  onNewChat,
  onDeleteAll
}) {
  const [expandedTables, setExpandedTables] = useState({});

  function toggleTable(name) {
    setExpandedTables(p => ({ ...p, [name]: !p[name] }));
  }

  const isDemo = mode === "demo";
  const isPro = plan === "PRO";

  return (
    <aside className={`sidebar bg-sidebar border-r flex flex-col ${open ? "w-64" : "w-0 overflow-hidden"}`}>
      <div className="flex flex-col h-full p-4 gap-4">
        {/* New Chat Button */}
        <Button
          variant="default"
          className="w-full justify-start gap-2 h-11 shadow-sm"
          onClick={() => onNewChat(dbConfig.db_type)}
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </Button>

        <div className="flex items-center gap-2 px-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            λ
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">SQL Intelligence</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Assistant</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
            {isDemo ? "Dataset" : "Connection"}
          </span>
          <div className="p-3 rounded-lg border bg-card/50 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold">
                  {dbConfig.db_type === "USE_LOCALDB" ? "SQLite3 (Demo)" : "MySQL"}
                </span>
              </div>
              {!isDemo && <Badge variant="default" className="h-4 text-[9px] uppercase font-bold px-1.5 leading-none bg-blue-600">Pro</Badge>}
            </div>
            {dbConfig.db_type === "USE_MYSQL" && (
              <div className="flex flex-col gap-1 pt-1 border-t border-border/50">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Host:</span>
                  <span className="font-mono truncate max-w-[100px] text-foreground/80">{dbConfig.mysql_host}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">DB:</span>
                  <span className="font-mono truncate max-w-[100px] text-foreground/80">{dbConfig.mysql_db}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-1 overflow-hidden">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
            Chat History
          </span>
          <ScrollArea className="flex-1 -mx-1 px-1">
            <div className="flex flex-col gap-1">
              {sessions.length === 0 ? (
                <div className="text-xs text-muted-foreground italic p-4 text-center border border-dashed rounded-lg bg-muted/30">
                  No previous sessions
                </div>
              ) : (
                sessions.map((s) => (
                  <button
                    key={s.session_id}
                    className={`group flex items-start gap-3 p-2.5 rounded-lg text-left transition-all hover:bg-accent active:scale-[0.98] ${s.session_id === currentSessionId ? "bg-accent shadow-sm border border-border/50" : "border border-transparent"
                      }`}
                    onClick={() => onSwitchSession(s)}
                  >
                    <div className="mt-0.5 text-lg">
                      {s.db_type === "USE_LOCALDB" ? "📦" : "🐬"}
                    </div>
                    <div className="flex flex-col min-width-0 overflow-hidden">
                      <span className="text-xs font-medium truncate text-foreground/90 group-hover:text-foreground">
                        {s.last_message || "New chat"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {new Date(s.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex flex-col gap-1 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Catalog</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors"
              onClick={onFetchSchema}
            >
              <RefreshCcw className="w-3 h-3" />
            </Button>
          </div>

          <ScrollArea className="max-h-[200px]">
            <div className="flex flex-col gap-1 pr-2">
              {schemaLoading || schema === null ? (
                <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
                  <RefreshCcw className="w-3 h-3 animate-spin" />
                  <span>Loading schema...</span>
                </div>
              ) : schema.length === 0 ? (
                <div className="text-[10px] text-muted-foreground italic p-2">Empty catalog</div>
              ) : schema.map(table => (
                <div key={table.name} className="flex flex-col">
                  <button
                    className={`flex items-center justify-between p-1.5 rounded-md hover:bg-accent transition-colors text-xs ${expandedTables[table.name] ? "bg-accent/40" : ""}`}
                    onClick={() => toggleTable(table.name)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <TableIcon className="w-3 h-3 text-primary/70 shrink-0" />
                      <span className="truncate font-medium">{table.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] text-muted-foreground font-mono">{table.row_count}</span>
                      <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${expandedTables[table.name] ? "rotate-90" : ""}`} />
                    </div>
                  </button>
                  {expandedTables[table.name] && (
                    <div className="ml-5 flex flex-col pt-1 pb-2 gap-1 border-l pl-2 border-primary/10">
                      {table.columns.map(col => (
                        <div key={col.name} className="flex items-center justify-between text-[10px] py-0.5">
                          <span className="text-foreground/80 truncate pr-2">{col.name}</span>
                          <span className="text-muted-foreground/60 font-mono text-[9px] shrink-0">{col.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex flex-col gap-2 mt-auto pt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 h-9 text-xs text-muted-foreground hover:text-foreground border-border/60"
            onClick={onClear}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Clear screen</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 h-9 text-xs text-destructive hover:text-white hover:bg-destructive transition-all group"
            onClick={onDeleteAll}
          >
            <Trash2 className="w-3.5 h-3.5 group-hover:scale-110" />
            <span>Wipe balance</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}