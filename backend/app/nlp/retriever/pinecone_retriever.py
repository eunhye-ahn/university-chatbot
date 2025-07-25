import os
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore
from typing import Optional, Dict, List
import ast


#✅ 환경변수 로드
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")

#✅ Pinecone 연결
pc = Pinecone(api_key=pinecone_api_key)
index_name = "university-chatbot"

#✅ 임베딩 모델 정의
embedding = OpenAIEmbeddings(model="text-embedding-3-small", openai_api_key=openai_api_key)

#✅ 기존 인덱스와 연결
vectorstore = PineconeVectorStore.from_existing_index(
    index_name=index_name, embedding=embedding
)

# ✅ LLM (Query Expansion 용)
llm = ChatOpenAI(model="gpt-4", temperature=0)

# ✅ LLM이 사용자의 질문에서 category, year 등을 추출했다면,
# 아래 함수는 딕셔너리 타입으로 바꾼 후 Pinecone의 filter 옵션으로 전달.
def build_filter(category: Optional[str] = None, year: Optional[str] = None) -> Optional[Dict[str, str]]:
    filter_condition: Dict[str, str] = {}
    if category:
        filter_condition["category"] = category
    if year:
        filter_condition["year"] = year
    return filter_condition if filter_condition else None

# ✅ LLM 기반으로 사용자가 입력한 질문(query)에 동의어, 줄임말, 풀네임을 자동으로 추가 
def expand_query_with_llm(query: str) -> str:
    prompt = f"""
    사용자가 '{query}' 라고 질문했어.
    이 질문과 관련된 동의어나 줄임말, 풀네임을 모두 나열해줘.
    예시: '컴공' → '컴퓨터공학과', '컴퓨터공학전공'
    출력은 공백으로 구분된 키워드만 줘.
    """
    try:
        expansion = llm.invoke(prompt).content.strip()
        return query + " " + expansion
    except Exception as e:
        print(f"LLM Query Expansion 실패: {e}")
        return query

# ✅ alias 기반 재정렬 + Pinecone 검색
def custom_retrieve(query: str, category: Optional[str] = None, year: Optional[str] = None, k: int = 30) -> List:
    # 1단계: LLM으로 질의 확장(동의어, 줄임말, 풀네임으로 확장)
    expanded_query = expand_query_with_llm(query)

    # 2단계: Pinecone에서 k*2개 검색
    filter_condition = build_filter(category, year)
    docs = vectorstore.similarity_search(expanded_query, k=k*2, filter=filter_condition)

    # 3단계: alias 기반 점수 계산
    scored_docs = []
    for idx, doc in enumerate(docs):
        aliases = doc.metadata.get("alias", [])
        if isinstance(aliases, str):
            try:
                aliases = ast.literal_eval(aliases)
            except:
                aliases = [aliases]

        alias_score = sum([50 for a in aliases if a in query])  
        vector_score = (len(docs) - idx) / len(docs) * 20       
        final_score = alias_score + vector_score
        scored_docs.append((doc, final_score))

    # 4단계: 점수 순 정렬
    scored_docs.sort(key=lambda x: x[1], reverse=True)

    return [doc for doc, _ in scored_docs[:k]]