import os
import re
import ast
import itertools
from dotenv import load_dotenv
from fastapi import HTTPException
from langchain_groq import ChatGroq
from langchain_community.agent_toolkits import create_sql_agent, SQLDatabaseToolkit
from langchain_community.utilities import SQLDatabase
from langchain.agents.agent_types import AgentType

load_dotenv()


# ---------------------------------------------------------------------------
# LLM factory
# ---------------------------------------------------------------------------

def get_llm() -> ChatGroq:
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail={"error": "GROQ_API_KEY not configured on server"},
        )
    try:
        return ChatGroq(
            groq_api_key=api_key,
            model_name="meta-llama/llama-4-scout-17b-16e-instruct",
            streaming=False,
            temperature=0,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to initialize LLM", "details": str(e)},
        )


def parse_data(obs):
    try:
        data = ast.literal_eval(obs)
        return data
    except:
        return None

# ---------------------------------------------------------------------------
# Agent builder
# ---------------------------------------------------------------------------

def build_agent(db: SQLDatabase, llm: ChatGroq):
    """
    Build a SQL agent executor.

    FIX: Previously the code called create_sql_agent() then immediately
    re-wrapped its internals with AgentExecutor.from_agent_and_tools().
    That double-wrapping caused intermediate_steps to be lost because the
    outer AgentExecutor was replaced by a new one whose invoke() path didn't
    preserve the steps reliably across LangChain versions.

    Correct approach: create_sql_agent() already returns an AgentExecutor.
    We configure return_intermediate_steps directly on it via agent_executor_kwargs
    so the single executor owns the flag end-to-end.
    """
    toolkit = SQLDatabaseToolkit(db=db, llm=llm)

    agent_executor = create_sql_agent(
        llm=llm,
        toolkit=toolkit,
        verbose=True,
        agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        handle_parsing_errors=True,
        # Pass executor config through the dedicated kwarg — this is the
        # supported way to set flags on the AgentExecutor that create_sql_agent
        # builds internally.
        agent_executor_kwargs={
            "return_intermediate_steps": True,
        },
    )

    return agent_executor


# ---------------------------------------------------------------------------
# Agent runner
# ---------------------------------------------------------------------------

def run_agent(agent, query: str, context: str = "") -> dict:
    """
    Invoke the agent and return a structured result with:
      - answer       : final LLM answer
      - sql_query    : the SQL that was executed (if any)
      - explanation  : plain-English explanation of the SQL
      - data         : list[dict] rows from the SQL result (for charts/tables)
    """
    full_query = query
    if context:
        full_query = (
            f"Previous conversation:\n{context}\n\n"
            f"New question: {query}"
        )

    try:
        result = agent.invoke({"input": full_query})
    except Exception as e:
        print(f"[llm] agent invoke critical error: {e}")
        return {
            "answer": "I encountered an error while processing your request. Please try rephrasing or check your database connection.",
            "sql_query": None,
            "explanation": None,
            "data": [],
            "followups": [],
            "insights": [],
        }

    raw_answer = result.get("output", "")
    answer = _clean_agent_output(raw_answer)
    steps = result.get("intermediate_steps") or []

    # Debug logging — safe to remove in production
    print(f"[llm] intermediate_steps count: {len(steps)}")
    for i, step in enumerate(steps):
        print(f"  step[{i}]: tool={getattr(step[0], 'tool', '?')} | obs={str(step[1])[:120]}")

    sql_query, raw_observation = _extract_sql_and_result(steps)
    structured_data = _parse_tabular_data(raw_observation, sql_query)
    explanation = _generate_explanation(sql_query)
    followups = _generate_followups(query, answer)
    insights = _generate_insights(query, structured_data, answer)

    return {
        "answer": answer,
        "sql_query": sql_query,
        "explanation": explanation,
        "data": structured_data,
        "followups": followups,
        "insights": insights,
    }


# ---------------------------------------------------------------------------
# Step parsing helpers
# ---------------------------------------------------------------------------

def _clean_agent_output(text: str) -> str:
    """
    Remove leaked "Thought:", "Action:", "Action Input:", and "Observation:"
    tokens that sometimes appear in the final output when the agent fails to stop.
    """
    if not text:
        return ""
    
    # Remove standard LangChain prefixes and their following lines up to the first new block
    # or just the prefixes themselves if they leak.
    patterns = [
        r"Thought:.*?\n",
        r"Action:.*?\n",
        r"Action Input:.*?\n",
        r"Observation:.*?\n",
        r"Final Answer:",
    ]
    
    cleaned = text
    for p in patterns:
        cleaned = re.sub(p, "", cleaned, flags=re.IGNORECASE | re.DOTALL)
    
    return cleaned.strip()

def _extract_sql_and_result(steps: list) -> tuple[str | None, str | None]:
    """
    Walk intermediate_steps and return (sql_query, raw_result_string).

    FIX: action.tool_input can be:
      - a plain string:  "SELECT name FROM students"
      - a dict:          {"query": "SELECT name FROM students"}
    Both cases are normalised here.
    """
    for step in reversed(steps):
        try:
            action, observation = step
            tool_name = getattr(action, "tool", "") or ""

            if tool_name == "sql_db_query":
                tool_input = getattr(action, "tool_input", None)

                # Normalise tool_input to a string
                if isinstance(tool_input, dict):
                    sql = (
                        tool_input.get("query")
                        or tool_input.get("input")
                        or str(tool_input)
                    )
                elif isinstance(tool_input, str):
                    sql = tool_input
                else:
                    sql = str(tool_input) if tool_input else None

                raw_result = str(observation) if observation is not None else None
                return sql, raw_result

        except Exception as e:
            print(f"[llm] step parse error: {e}")

    return None, None


def _parse_tabular_data(raw: str | None, sql: str | None = None) -> list[dict]:
    """
    Convert the raw DB observation string into a list of dicts suitable for
    charting / table display.

    LangChain SQL tools return results as a Python-literal string, e.g.:
      "[('Alice', 90), ('Bob', 85)]"
    or already as a list of tuples/dicts.

    When the result is a list of tuples/lists, real column names are extracted
    from the SQL SELECT clause (via _extract_column_names) so charts and tables
    show meaningful names instead of col0, col1, …

    Returns [] if parsing fails or there is no data.
    """
    if not raw:
        return []

    raw = raw.strip()

    # Case 1: starts with '[' — try ast.literal_eval first
    if raw.startswith("["):
        try:
            parsed = ast.literal_eval(raw)
            if not isinstance(parsed, list) or not parsed:
                return []

            first = parsed[0]

            # List of dicts — ideal, return as-is (already has real column names)
            if isinstance(first, dict):
                return parsed

            # List of tuples/lists — use real column names from SQL when available
            if isinstance(first, (tuple, list)):
                width = len(first)
                col_names = _extract_column_names(sql, width)
                return [dict(zip(col_names, row)) for row in parsed]

            # List of scalars
            return [{"value": v} for v in parsed]

        except Exception as e:
            print(f"[llm] tabular parse error (literal_eval): {e}")

    # Case 2: fallback — regex-extract parenthesised tuples
    try:
        tuples = re.findall(r"\(([^)]+)\)", raw)
        if tuples:
            rows = []
            for t in tuples:
                values = [v.strip().strip("'\"'") for v in t.split(",")]
                col_names = _extract_column_names(sql, len(values))
                rows.append(dict(zip(col_names, values)))
            return rows
    except Exception as e:
        print(f"[llm] tabular parse error (regex): {e}")

    return []


def _extract_column_names(sql: str | None, width: int) -> list[str]:
    """
    Parse the SELECT clause of a SQL query and return a list of column names.
    Handles aliases (AS), simple column refs, and expressions.
    Falls back to col0, col1, … for any position that can't be determined,
    or for the full list when sql is None / unparseable.

    Examples:
      SELECT id, name, stock FROM ...       → ['id', 'name', 'stock']
      SELECT name, SUM(amount) AS total ...  → ['name', 'total']
      SELECT * FROM ...                      → ['col0', 'col1', ...]
    """
    fallback = [f"col{i}" for i in range(width)]
    if not sql:
        return fallback

    try:
        # Grab everything between SELECT and the first FROM / newline block
        sql_upper = sql.upper()
        select_start = sql_upper.find("SELECT")
        if select_start == -1:
            return fallback
        after_select = sql[select_start + 6:]

        # Find end of SELECT list: stop at FROM (whole word)
        from_match = re.search(r'\bFROM\b', after_select, re.IGNORECASE)
        if not from_match:
            return fallback
        select_clause = after_select[:from_match.start()].strip()

        # If SELECT *, we can't determine column names
        if select_clause.strip() == "*":
            return fallback

        # Split on commas (but not commas inside parentheses like SUM(a, b))
        cols = []
        depth = 0
        current = []
        for ch in select_clause:
            if ch == '(':
                depth += 1
                current.append(ch)
            elif ch == ')':
                depth -= 1
                current.append(ch)
            elif ch == ',' and depth == 0:
                cols.append(''.join(current).strip())
                current = []
            else:
                current.append(ch)
        if current:
            cols.append(''.join(current).strip())

        names = []
        for col in cols:
            col = col.strip()
            # Pick alias if present: anything after AS (case-insensitive)
            alias_match = re.search(r'\bAS\s+(\w+)\s*$', col, re.IGNORECASE)
            if alias_match:
                names.append(alias_match.group(1))
                continue
            # Table-qualified: schema.table.col or table.col — take last part
            # Strip any trailing backtick/quote
            bare = re.sub(r'[`"\'\[\]]', '', col.split('.')[-1]).strip()
            # If it's a function call like COUNT(*), use everything before '('
            if '(' in bare:
                bare = bare[:bare.index('(')].strip() or f"col{len(names)}"
            names.append(bare if bare else f"col{len(names)}")

        # Pad or trim to match actual result width
        while len(names) < width:
            names.append(f"col{len(names)}")
        return list(itertools.islice(names, width))

    except Exception as e:
        print(f"[llm] column name extraction error: {e}")
        return fallback


# ---------------------------------------------------------------------------
# Explanation generator
# ---------------------------------------------------------------------------

def _generate_explanation(sql: str | None) -> str:
    """
    Generate a plain-English explanation of the SQL query.

    FIX: The original prompt had no context and produced vague/generic output.
    The updated prompt instructs the LLM to describe WHAT, WHERE, and HOW
    in user-friendly terms, without repeating SQL syntax.
    """
    if not sql:
        return "No SQL query was executed for this response."

    llm = get_llm()

    prompt = (
        "You are a helpful data assistant. Explain the following SQL query "
        "to a non-technical user in 2–4 plain English sentences. "
        "Describe WHAT data is being fetched, WHERE it comes from, and any "
        "filters or ordering applied. Do not include SQL syntax in your answer.\n\n"
        f"SQL:\n{sql}"
    )

    try:
        response = llm.invoke(prompt)
        return response.content.strip()
    except Exception:
        return "This query retrieves data from the database based on your request."


# ---------------------------------------------------------------------------
# Follow-up question generator
# ---------------------------------------------------------------------------

def _generate_followups(query: str, answer: str) -> list[str]:
    """
    Generate 3 short follow-up questions the user might ask next,
    based on their original query and the assistant's answer.
    Returns a list of strings (empty list on failure).
    """
    llm = get_llm()

    answer_str: str = str(answer)
    prompt = (
        "Based on this database question and its answer, suggest exactly 3 short "
        "follow-up questions the user might ask next. "
        "Rules: each question must be on its own line, no numbering or bullet points, "
        "keep each question under 12 words, make them specific and actionable.\n\n"
        f"User question: {query}\n"
        f"Answer summary: {answer_str[:400]}"
    )

    try:
        response = llm.invoke(prompt)
        lines: list[str] = [l.strip().lstrip("•\-*123456789. ") for l in response.content.strip().splitlines()]
        questions: list[str] = [l for l in lines if l and l.endswith("?")]
        questions = list(itertools.islice(questions, 3))
        return questions if len(questions) == 3 else questions or []
    except Exception:
        return []


# ---------------------------------------------------------------------------
# Insight generator
# ---------------------------------------------------------------------------

def _generate_insights(query: str, data: list[dict[str, object]], answer: str) -> list[str]:
    """
    Generate 2-3 short, bullet-point insights based on the user query,
    the structured result data, and the assistant answer.
    Returns a list of plain strings (no bullets), empty list on failure.
    """
    if not data and not answer:
        return []

    llm = get_llm()

    # Summarise the data — send a compact preview (max 10 rows) to avoid token bloat
    data_slice: list[dict[str, object]] = list(itertools.islice(data, 10))
    data_preview = str(data_slice) if data else "(no tabular data)"

    answer_str: str = str(answer)
    prompt = (
        "You are a data analyst. Given a user question and the query results below, "
        "write exactly 2 to 3 concise, factual insights about the data.\n"
        "Rules:\n"
        "- Each insight on its own line, no extra blank lines\n"
        "- No bullet symbols, no numbering — plain text only\n"
        "- Each insight must be a single sentence under 20 words\n"
        "- Focus on notable patterns, extremes, or comparisons in the data\n\n"
        f"User question: {query}\n"
        f"Result data: {data_preview}\n"
        f"Answer summary: {answer_str[:300]}"
    )

    try:
        response = llm.invoke(prompt)
        lines: list[str] = [
            l.strip().lstrip("•\-*123456789. ")
            for l in response.content.strip().splitlines()
            if l.strip()
        ]
        result: list[str] = list(itertools.islice(lines, 3))
        return result
    except Exception:
        return []