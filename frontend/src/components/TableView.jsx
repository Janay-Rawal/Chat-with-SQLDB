export default function TableView({ data }) {
    if (!data?.length) return null;
    const headers = Object.keys(data[0]);

    return (
        <div className="table-wrap" style={{ overflowX: "auto", margin: "12px 0 0" }}>
            <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ background: "rgba(0,0,0,0.03)" }}>
                        {headers.map(h => (
                            <th
                                key={h}
                                style={{
                                    padding: "10px 14px",
                                    textAlign: "left",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    color: "var(--text2)",
                                    borderBottom: "1px solid var(--border)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em"
                                }}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                            {headers.map(h => (
                                <td
                                    key={h}
                                    style={{
                                        padding: "10px 14px",
                                        fontSize: "13px",
                                        color: "var(--text1)",
                                    }}
                                >
                                    {row[h] ?? "—"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
