from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
from sqlalchemy import inspect, text
from db.query_db import get_raw_engine
from models.schemas import SchemaResponse, TableSchema, TableColumn
from services.auth_service import get_current_user_id

router = APIRouter(tags=["schema"])


@router.get("/schema", response_model=SchemaResponse)
async def get_schema(
    db_type: str = Query("USE_LOCALDB"),
    mysql_host: Optional[str] = Query(None),
    mysql_user: Optional[str] = Query(None),
    mysql_password: Optional[str] = Query(None),
    mysql_db: Optional[str] = Query(None),
    user_id: int = Depends(get_current_user_id),
):
    try:
        engine = get_raw_engine(db_type, mysql_host, mysql_user, mysql_password, mysql_db)
        inspector = inspect(engine)
        tables = []

        with engine.connect() as conn:
            for table_name in inspector.get_table_names():
                columns = []
                for col in inspector.get_columns(table_name):
                    columns.append(TableColumn(
                        name=col["name"],
                        type=str(col["type"]),
                        nullable=col.get("nullable", True),
                    ))

                # Row count
                try:
                    row = conn.execute(text(f'SELECT COUNT(*) FROM "{table_name}"')).fetchone()
                    row_count = row[0] if row else 0
                except Exception:
                    row_count = 0

                tables.append(TableSchema(
                    name=table_name,
                    columns=columns,
                    row_count=row_count,
                ))

        return SchemaResponse(tables=tables)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={"error": "Failed to fetch schema", "details": str(e)},
        )