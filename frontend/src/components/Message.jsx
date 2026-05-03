import { useState } from "react";
import ChartView from "./ChartView";
import TableView from "./TableView";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  Terminal,
  Info,
  BarChart3,
  Table as TableIcon,
  Lightbulb,
  CornerDownRight,
  User,
  Zap,
  AlertCircle
} from "lucide-react";

export default function Message({ msg, onFollowup }) {
  const [copied, setCopied] = useState(false);

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isUser = msg.role === "user";
  const chartSource = msg.chart_data || (msg.data?.length >= 2 ? msg.data : null);
  const hasFollowups = !isUser && !msg.isError && msg.followups?.length > 0;

  if (isUser) {
    return (
      <div className="flex justify-end mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex gap-3 max-w-[85%]">
          <div className="flex flex-col items-end">
            <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-tr-none shadow-sm text-sm">
              {msg.content}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 border shadow-sm">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex gap-3 w-full max-w-[95%]">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-sm mt-1">
          <Zap className="w-4 h-4 text-primary fill-primary/20" />
        </div>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Principal Response Card */}
          <Card className={`overflow-hidden border shadow-sm ${msg.isError ? "border-destructive/30 bg-destructive/5" : ""}`}>
            <CardHeader className="py-3 px-4 bg-muted/30 flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                {msg.isError ? <AlertCircle className="w-4 h-4 text-destructive" /> : <Info className="w-4 h-4 text-primary" />}
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {msg.isError ? "System Status" : "Assistant Response"}
                </CardTitle>
              </div>
              {!msg.isError && <Badge variant="outline" className="text-[10px] font-bold uppercase bg-background">Insight</Badge>}
            </CardHeader>
            <CardContent className="p-4 text-sm leading-relaxed">
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {!msg.isError && msg.insights?.length > 0 && (
                <div className="mt-4 pt-4 border-t flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-bold text-foreground">Key Insights</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.insights.map((insight, i) => (
                      <div key={i} className="flex gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md border border-border/40">
                        <span className="text-primary font-bold">•</span>
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Table Card */}
          {msg.data?.length > 0 && (
            <Card className="overflow-hidden border shadow-sm">
              <CardHeader className="py-2 px-4 bg-muted/30 flex-row items-center gap-2 space-y-0">
                <TableIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Result Set</CardTitle>
              </CardHeader>
              <CardContent className="p-0 border-t">
                <TableView data={msg.data} />
              </CardContent>
              <CardFooter className="py-2 px-4 bg-muted/10 flex justify-end">
                <span className="text-[10px] text-muted-foreground font-medium">{msg.data.length} rows returned</span>
              </CardFooter>
            </Card>
          )}

          {/* Visualization Card */}
          {chartSource && (
            <Card className="overflow-hidden border shadow-sm">
              <CardHeader className="py-2 px-4 bg-muted/30 flex-row items-center gap-2 space-y-0">
                <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Visualization</CardTitle>
              </CardHeader>
              <CardContent className="p-4 border-t">
                <ChartView data={chartSource} />
              </CardContent>
            </Card>
          )}

          {/* Technical Details (SQL & Explanation) */}
          {(msg.sql_query || msg.explanation) && (
            <Card className="border border-border/60 bg-transparent overflow-hidden shadow-none">
              <CardHeader className="py-2 px-4 bg-muted/10 flex-row items-center justify-between space-y-0 border-b">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                  <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Technical Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {msg.sql_query && (
                  <div className="p-4 border-b last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Generated SQL</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-[10px] h-7 px-2"
                        onClick={() => copyToClipboard(msg.sql_query)}
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied" : "Copy SQL"}
                      </Button>
                    </div>
                    <pre className="text-[11px] font-mono bg-muted/80 p-3 rounded-md border text-foreground/90 overflow-x-auto whitespace-pre">
                      {msg.sql_query}
                    </pre>
                  </div>
                )}
                {msg.explanation && (
                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground block mb-1.5">Logic Explanation</span>
                    <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 pl-3 border-muted">
                      {msg.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Follow-ups */}
          {hasFollowups && (
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-2 px-1">
                <CornerDownRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Suggested Follow-ups</span>
              </div>
              <div className="flex flex-wrap gap-2 pr-4">
                {msg.followups.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full text-xs bg-background hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all border-border/80 shadow-sm"
                    onClick={() => onFollowup(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}