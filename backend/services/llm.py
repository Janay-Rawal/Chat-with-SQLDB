import os
import re
from dotenv import load_dotenv
from fastapi import HTTPException
from langchain_groq import ChatGroq
from langchain_community.agent_toolkits import create_sql_agent, SQLDatabaseToolkit
from langchain_community.utilities import SQLDatabase
from langchain.agents.agent_types import AgentType
from langchain.agents import AgentExecutor

load_dotenv()


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
            model_name="llama-3.3-70b-versatile",
            streaming=False,
            temperature=0,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to initialize LLM", "details": str(e)},
        )


def build_agent(db: SQLDatabase, llm: ChatGroq):
    toolkit = SQLDatabaseToolkit(db=db, llm=llm)

    agent = create_sql_agent(
        llm=llm,
        toolkit=toolkit,
        verbose=True,
        agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        handle_parsing_errors=True,
    )

    executor = AgentExecutor.from_agent_and_tools(
        agent=agent.agent,
        tools=agent.tools,
        verbose=True,
        return_intermediate_steps=True,  # 🔥 THIS ACTUALLY WORKS
    )

    return executor


def run_agent(agent, query: str, context: str = "") -> dict:
    full_query = query
    if context:
        full_query = (
            f"Previous conversation:\n{context}\n\n"
            f"New question: {query}"
        )

    try:
        result = agent.invoke({"input": full_query})
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Agent execution failed", "details": str(e)},
        )

    answer = result.get("output", "")
    steps = result.get("intermediate_steps", [])

    sql_query = _extract_sql_from_steps(steps)
    explanation = _generate_explanation(sql_query)
    print("INTERMEDIATE STEPS:", result.get("intermediate_steps"))

    return {
        "answer": answer,
        "sql_query": sql_query,
        "explanation": explanation,
    }


def _extract_sql_from_steps(steps) -> str | None:
    for step in steps:
        try:
            action, observation = step

            # Debug print (temporary)
            print("STEP ACTION:", action)

            # Check tool name safely
            tool_name = getattr(action, "tool", "")

            if "sql_db_query" in tool_name:
                return action.tool_input

        except Exception as e:
            print("STEP PARSE ERROR:", e)

    return None


def _generate_explanation(sql: str | None) -> str:
    if not sql:
        return "No SQL query was required for this response."

    llm = get_llm()

    prompt = f"""
Explain this SQL query in simple terms for a non-technical user:

{sql}
"""

    try:
        response = llm.invoke(prompt)
        return response.content.strip()
    except Exception:
        return "This query retrieves data from the database based on the user's request."