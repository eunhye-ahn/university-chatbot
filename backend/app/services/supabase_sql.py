#⭐supabase의 SQLAlchemy 방식 연결
# LangChain SQL Agent 사용을 위해서는 SQLAlchemy 방식 필요

import os
from sqlalchemy import create_engine
from langchain_community.utilities import SQLDatabase
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.sql.elements import TextClause

load_dotenv()

USER = os.getenv("SUPABASE_USER")
PASSWORD = os.getenv("SUPABASE_PASSWORD")
HOST = os.getenv("SUPABASE_HOST")
PORT = os.getenv("SUPABASE_PORT")
DBNAME = os.getenv("SUPABASE_DBNAME")

DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"

engine = create_engine(DATABASE_URL)

db = SQLDatabase(
    engine=engine,
    include_tables=[
        "curriculums",
        "equivalent_courses",
        "graduation_requirements"
    ],
    sample_rows_in_table_info=3
)

#✅question_reouter.py에서 route == "keyword" 일 시
# supabase에 내가 작성한 SQL문을 전송하여 결과를 리스트로 반환
def execute_sql_query(query, params: dict | None = None) -> list[dict]:
    with engine.connect() as connection:
        if isinstance(query, TextClause):
            result = connection.execute(query, params or {})
        else:
            result = connection.execute(text(query), params or {})
        rows = result.fetchall()
        columns = result.keys()
        return [dict(zip(columns, row))for row in rows]