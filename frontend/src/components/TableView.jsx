export default function TableView({ data }) {
    if (!data?.length) return null;
    const headers = Object.keys(data[0]);

    return (
        <div className="w-full mt-4 rounded-xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-muted/50 border-b border-border/50">
                        <tr>
                            {headers.map(h => (
                                <th
                                    key={h}
                                    className="px-4 py-3 text-left text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest whitespace-nowrap"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr
                                key={i}
                                className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors group"
                            >
                                {headers.map(h => (
                                    <td
                                        key={h}
                                        className="px-4 py-3 text-sm text-foreground/80 group-hover:text-foreground transition-colors font-medium tabular-nums"
                                    >
                                        {row[h] !== null && row[h] !== undefined ? (
                                            typeof row[h] === 'number'
                                                ? row[h].toLocaleString(undefined, { maximumFractionDigits: 2 })
                                                : String(row[h])
                                        ) : (
                                            <span className="text-muted-foreground/30">—</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {data.length > 5 && (
                <div className="px-4 py-2 bg-muted/20 border-t border-border/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">
                    Showing {data.length} records
                </div>
            )}
        </div>
    );
}
