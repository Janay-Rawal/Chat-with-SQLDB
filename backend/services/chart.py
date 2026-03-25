import re
from typing import Any, Optional


def detect_chart_data(answer: str) -> Optional[dict]:
    """
    Try to extract tabular data from the agent answer text and
    return a chart-ready payload, or None if not suitable.

    Looks for markdown tables like:
      | Name | Count |
      |------|-------|
      | Foo  | 42    |
    """
    lines = answer.strip().split("\n")
    table_lines = [l for l in lines if l.strip().startswith("|")]

    if len(table_lines) < 3:
        return None

    # Parse header
    header = [h.strip() for h in table_lines[0].split("|") if h.strip()]
    if len(header) < 2:
        return None

    # Skip separator row
    data_rows = table_lines[2:]
    rows = []
    for row in data_rows:
        cells = [c.strip() for c in row.split("|") if c.strip()]
        if len(cells) == len(header):
            rows.append(cells)

    if not rows:
        return None

    # Determine chart type: if second column is numeric, we can chart
    label_col = header[0]
    value_col = header[1]

    parsed = []
    for row in rows:
        try:
            parsed.append({"label": row[0], "value": float(row[1])})
        except (ValueError, IndexError):
            continue

    if not parsed:
        return None

    # Heuristic: if labels look like years/dates → line chart, else bar
    chart_type = "bar"
    if all(re.match(r"^\d{4}$", r["label"]) for r in parsed):
        chart_type = "line"

    return {
        "type": chart_type,
        "label_key": label_col,
        "value_key": value_col,
        "data": parsed,
    }