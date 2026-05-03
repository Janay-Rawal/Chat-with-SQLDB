import {
  BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, Legend,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, ArrowRight } from "lucide-react";

// Use colors that match our theme
const BAR_COLORS = [
  "hsl(var(--primary))",
  "hsl(221.2 83.2% 53.3%)",
  "hsl(142.1 76.2% 36.3%)",
  "hsl(47.9 95.8% 53.1%)",
  "hsl(346.8 77.2% 49.8%)",
  "hsl(262.1 83.3% 57.8%)"
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/80 rounded-lg p-3 shadow-2xl backdrop-blur-sm">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="text-sm font-extrabold text-foreground">
        {typeof payload[0].value === "number"
          ? payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })
          : payload[0].value}
      </div>
    </div>
  );
}

function isTimeSeries(rows) {
  if (!rows?.length) return false;
  const firstVal = String(Object.values(rows[0])[0] ?? "");
  return /\b(20\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|q[1-4]|week|day|month|year)/i.test(firstVal);
}

function pickChartType(rawRows, normalizedRows, explicitType) {
  if (explicitType && explicitType !== "bar") return explicitType;
  if (!normalizedRows || normalizedRows.length < 2) return null;
  if (isTimeSeries(rawRows ?? normalizedRows)) return "line";
  if (normalizedRows.length <= 5) return "pie";
  return "bar";
}

function normalizeData(rawData) {
  if (!rawData?.length) return null;
  const keys = Object.keys(rawData[0]);
  if (keys.length < 2) return null;

  const sample = rawData[0];
  const isIdCol = k => {
    const lk = k.toLowerCase();
    return (
      lk === "id" ||
      lk.endsWith("_id") ||
      lk.startsWith("id_") ||
      /[a-z]Id$/.test(k)
    );
  };

  const numericKeys = keys.filter(k => {
    const v = sample[k];
    return v !== null && v !== "" && !isNaN(parseFloat(v)) && isFinite(v);
  });
  const nonIdNumericKeys = numericKeys.filter(k => !isIdCol(k));
  const valueKey = nonIdNumericKeys[0] ?? null;
  if (!valueKey) return null;

  const stringKeys = keys.filter(k => {
    if (k === valueKey) return false;
    const v = sample[k];
    return v === null || isNaN(parseFloat(v)) || !isFinite(v);
  });
  const nonIdStringKeys = stringKeys.filter(k => !isIdCol(k));
  const labelKey = nonIdStringKeys[0] ?? stringKeys[0] ?? keys.find(k => k !== valueKey);

  const rows = rawData.map(row => ({
    label: String(row[labelKey] ?? ""),
    value: parseFloat(row[valueKey]) || 0,
  }));

  return { rows, labelKey, valueKey };
}

export default function ChartView({ data }) {
  let rows, labelKey, valueKey, chartType;

  if (Array.isArray(data)) {
    const normalized = normalizeData(data);
    if (!normalized) return null;
    rows = normalized.rows;
    labelKey = normalized.labelKey;
    valueKey = normalized.valueKey;
    chartType = pickChartType(data, rows, null);
  } else if (data?.data?.length) {
    rows = data.data;
    labelKey = data.label_key || "label";
    valueKey = data.value_key || "value";
    chartType = pickChartType(null, rows, data.type);
  } else {
    return null;
  }

  if (!chartType) return null;

  const rotateLabels = rows.length > 6;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-6 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground border-border/50">
            {labelKey}
          </Badge>
          <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
          <Badge variant="secondary" className="h-6 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-primary bg-primary/5">
            {valueKey}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {chartType === "line" && <LineIcon className="w-4 h-4 text-primary" />}
          {chartType === "bar" && <BarChart3 className="w-4 h-4 text-primary" />}
          {chartType === "pie" && <PieIcon className="w-4 h-4 text-primary" />}
        </div>
      </div>

      <div className="w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={rows} margin={{ top: 10, right: 10, bottom: rotateLabels ? 40 : 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.6} />
              <XAxis
                dataKey="label"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={rotateLabels ? -30 : 0}
                textAnchor={rotateLabels ? "end" : "middle"}
                height={rotateLabels ? 40 : 20}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "#fff", strokeWidth: 2 }}
                animationDuration={1500}
              />
            </LineChart>
          ) : chartType === "pie" ? (
            <PieChart>
              <Pie
                data={rows}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={50}
                paddingAngle={4}
                animationDuration={1000}
              >
                {rows.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} stroke="hsl(var(--background))" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                verticalAlign="bottom"
                formatter={(val) => <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{val}</span>}
              />
            </PieChart>
          ) : (
            <BarChart data={rows} margin={{ top: 10, right: 10, bottom: rotateLabels ? 40 : 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.6} />
              <XAxis
                dataKey="label"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={rotateLabels ? -30 : 0}
                textAnchor={rotateLabels ? "end" : "middle"}
                height={rotateLabels ? 40 : 20}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40} animationDuration={1200}>
                {rows.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}