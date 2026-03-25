import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const ACCENT   = "#e8b86d";
const BLUE     = "#5b9bd5";
const BG3      = "#1a1d22";
const BORDER   = "rgba(255,255,255,0.07)";
const TEXT2    = "#8a8580";
const TEXT3    = "#5a5650";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#22262d",
      border: `1px solid ${BORDER}`,
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 12,
      color: "#e8e3da",
    }}>
      <div style={{ color: TEXT2, marginBottom: 3 }}>{label}</div>
      <div style={{ fontWeight: 500 }}>
        {typeof payload[0].value === "number"
          ? payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })
          : payload[0].value}
      </div>
    </div>
  );
}

export default function ChartView({ data }) {
  if (!data || !data.data?.length) return null;

  const { type, label_key, value_key, data: rows } = data;
  const color = type === "line" ? BLUE : ACCENT;

  return (
    <div className="chart-wrap">
      <div className="chart-title">
        {label_key} · {value_key}
        <span style={{ marginLeft: 8, color: "var(--text3)", fontStyle: "italic" }}>
          ({type} chart)
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        {type === "line" ? (
          <LineChart data={rows} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={BORDER} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: TEXT3, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: TEXT3, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: color }}
            />
          </LineChart>
        ) : (
          <BarChart data={rows} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={BORDER} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: TEXT3, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={rows.length > 6 ? -30 : 0}
              textAnchor={rows.length > 6 ? "end" : "middle"}
              height={rows.length > 6 ? 48 : 24}
            />
            <YAxis
              tick={{ fill: TEXT3, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill={color}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}