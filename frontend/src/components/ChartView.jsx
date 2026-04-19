import {
  BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, Legend,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const BLUE = "#5b9bd5";
const BORDER = "var(--border)";
const TEXT2 = "var(--text2)";
const TEXT3 = "var(--text3)";

const BAR_COLORS = ["#e8b86d", "#5b9bd5", "#7ec8a0", "#c97bbd", "#e07a6a", "#7ab8d4"];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg3)",
      border: `1px solid var(--border)`,
      borderRadius: 8,
      padding: "8px 14px",
      fontSize: 12,
      color: "var(--text1)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    }}>
      <div style={{ color: TEXT2, marginBottom: 4, fontSize: 11 }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: 13 }}>
        {typeof payload[0].value === "number"
          ? payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })
          : payload[0].value}
      </div>
    </div>
  );
}

// Detect if data looks like time-series
function isTimeSeries(rows) {
  if (!rows?.length) return false;
  const firstVal = String(Object.values(rows[0])[0] ?? "");
  return /\b(20\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|q[1-4]|week|day|month|year)/i.test(firstVal);
}

// Pick chart type automatically
function pickChartType(rawRows, normalizedRows, explicitType) {
  if (explicitType && explicitType !== "bar") return explicitType; // respect pre-structured type
  if (!normalizedRows || normalizedRows.length < 2) return null;   // too few rows
  if (isTimeSeries(rawRows ?? normalizedRows)) return "line";
  if (normalizedRows.length <= 5) return "pie";
  return "bar";
}

// Normalize raw backend data rows into [{label, value}]
function normalizeData(rawData) {
  if (!rawData?.length) return null;
  const keys = Object.keys(rawData[0]);
  if (keys.length < 2) return null;

  const sample = rawData[0];

  // A column is "ID-like" if its name is exactly "id", or starts/ends
  // with "id" at an underscore/camelCase boundary.
  // Examples matched: id, student_id, id_ref, userId, orderId
  // Examples NOT matched: grid, valid, fluid
  const isIdCol = k => {
    const lk = k.toLowerCase();
    return (
      lk === "id" ||
      lk.endsWith("_id") ||
      lk.startsWith("id_") ||
      /[a-z]Id$/.test(k)          // camelCase suffix e.g. studentId
    );
  };

  // Find the best numeric column: non-ID preferred, return null if only IDs exist
  const numericKeys = keys.filter(k => {
    const v = sample[k];
    return v !== null && v !== "" && !isNaN(parseFloat(v)) && isFinite(v);
  });
  const nonIdNumericKeys = numericKeys.filter(k => !isIdCol(k));
  // Do NOT fall back to an ID column — return null so no chart is rendered
  const valueKey = nonIdNumericKeys[0] ?? null;
  if (!valueKey) return null;

  // Find a string (non-numeric) column to use as the label; prefer non-ID names
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
    // Raw array from backend "data" field
    const normalized = normalizeData(data);
    if (!normalized) return null;
    rows = normalized.rows;
    labelKey = normalized.labelKey;
    valueKey = normalized.valueKey;
    chartType = pickChartType(data, rows, null);
  } else if (data?.data?.length) {
    // Pre-structured chart_data object { type, label_key, value_key, data }
    rows = data.data;
    labelKey = data.label_key || "label";
    valueKey = data.value_key || "value";
    chartType = pickChartType(null, rows, data.type);
  } else {
    return null;
  }

  if (!chartType) return null; // < 2 rows — skip chart

  const color = chartType === "line" ? BLUE : BAR_COLORS[0];
  const rotateLabels = rows.length > 6;

  return (
    <div className="chart-wrap">
      <div className="chart-header">
        <div className="chart-title">
          <span className="chart-key">{labelKey}</span>
          <span className="chart-sep">→</span>
          <span className="chart-key">{valueKey}</span>
        </div>
        <span className="chart-badge">
          {chartType === "line" ? "↗ trend" : chartType === "pie" ? "◉ pie" : "▦ bar"}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={chartType === "pie" ? 230 : 210}>
        {chartType === "line" ? (
          <LineChart data={rows} margin={{ top: 8, right: 12, bottom: rotateLabels ? 36 : 8, left: 0 }}>
            <CartesianGrid stroke={BORDER} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: TEXT3, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={rotateLabels ? -30 : 0}
              textAnchor={rotateLabels ? "end" : "middle"}
              height={rotateLabels ? 48 : 24}
            />
            <YAxis
              tick={{ fill: TEXT3, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={44}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 1.5 }}
            />
          </LineChart>
        ) : chartType === "pie" ? (
          <PieChart>
            <Pie
              data={rows}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="45%"
              outerRadius={80}
              innerRadius={34}
              paddingAngle={3}
            >
              {rows.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: TEXT2 }}
            />
          </PieChart>
        ) : (
          <BarChart data={rows} margin={{ top: 8, right: 12, bottom: rotateLabels ? 36 : 8, left: 0 }}>
            <CartesianGrid stroke={BORDER} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: TEXT3, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={rotateLabels ? -30 : 0}
              textAnchor={rotateLabels ? "end" : "middle"}
              height={rotateLabels ? 48 : 24}
            />
            <YAxis
              tick={{ fill: TEXT3, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={44}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={52}>
              {rows.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}