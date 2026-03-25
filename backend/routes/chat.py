import uuid
from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse, ChatMessage
from db.database import get_sql_database
from services.llm import get_llm, build_agent, run_agent
from services.session import get_context_string, append_message
from services.chart import detect_chart_data

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    # Validate query
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail={"error": "Query cannot be empty"})

    # Resolve session
    session_id = req.session_id or str(uuid.uuid4())

    # Build DB + LLM
    db = get_sql_database(
        req.db_type,
        req.mysql_host,
        req.mysql_user,
        req.mysql_password,
        req.mysql_db,
    )
    llm = get_llm()
    agent = build_agent(db, llm)

    # Get prior context
    context = get_context_string(session_id)

    # Run agent
    result = run_agent(agent, req.query, context)

    # Detect chart
    chart_data = detect_chart_data(result["answer"])

    # Persist to session history
    append_message(session_id, ChatMessage(role="user", content=req.query))
    append_message(
        session_id,
        ChatMessage(
            role="assistant",
            content=result["answer"],
            sql_query=result["sql_query"],
            explanation=result["explanation"],
            chart_data=chart_data,
        ),
    )

    return ChatResponse(
        session_id=session_id,
        answer=result["answer"],
        sql_query=result["sql_query"],
        explanation=result["explanation"],
        chart_data=chart_data,
    )


@router.get("/history/{session_id}")
async def get_history(session_id: str):
    from services.session import get_history
    return {"session_id": session_id, "messages": get_history(session_id)}


@router.delete("/history/{session_id}")
async def clear_history(session_id: str):
    from services.session import clear_history
    clear_history(session_id)
    return {"status": "cleared", "session_id": session_id}