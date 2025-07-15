from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
from app.nlp.retriever.pinecone_retriever import get_retriever

# ✅ LLM 설정
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# ✅ 프롬프트 템플릿
prompt = ChatPromptTemplate.from_template("""
너는 대학 정보를 제공하는 챗봇이야.
다음 조건을 지켜:
- 질문에 연도가 명시되면 해당 연도를 우선 적용
- 연도가 없으면 2025년 기준으로 답변
- 답변은 간결하고 핵심만 전달
- 참고 문서 내용을 기반으로 답변해

질문: {input}

참고 문서:
{context}                          
""")

# ✅ 문서 결합 체인
document_chain = create_stuff_documents_chain(llm, prompt)

# ✅ retriever 선택 (기본: 전체 검색)
retriever = get_retriever(category=None)

# ✅ QA Chain 생성
qa_chain = create_retrieval_chain(retriever, document_chain)

__all__ = ["qa_chain"]