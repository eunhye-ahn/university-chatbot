#⭐사용자의 질문(자연어)을 → LangChain이 SQL로 바꾸고 → Supabase DB에 쿼리하고 → 답변을 만들어주는 “에이전트”를 만드는 파일

from langchain_community.agent_toolkits.sql.base import create_sql_agent
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

from app.services.supabase_sql import db

load_dotenv()

# OpenAI API와 연결
llm = ChatOpenAI(
    temperature=0,
    model="gpt-4",
)

toolkit = SQLDatabaseToolkit(db=db, llm=llm)

agent = create_sql_agent(
    llm=llm,
    toolkit=toolkit,
    verbose=True
)

#✅외부에서 sqlAgent 사용 가능하도록
def run_sql_agent(question: str) -> str:
    try:
        return agent.run(question)
    except Exception as e:
        return f"SQL Agent 실행 중 오류가 발생했습니다: {str(e)}"