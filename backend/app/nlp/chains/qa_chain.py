from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from app.nlp.retriever.pinecone_retriever import custom_retrieve

# ✅ LLM 설정
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# ✅ 프롬프트 템플릿
prompt = ChatPromptTemplate.from_template("""
너는 대학 정보를 제공하는 전문 챗봇이야. 다음 규칙을 지켜:
- 문서에 없는 정보는 절대 추측하지 마.
- 연도가 명시되지 않으면 기본값은 2025로 사용.
- 답변은 참고 문서 내용을 기반으로, 간결하고 명확하게 작성.
- 핵심 내용 누락 없이 정리.

질문: {input}

참고 문서:
{context}
""")

# ✅ 문서 결합 체인 생성
document_chain = create_stuff_documents_chain(llm, prompt)

def run_qa_chain(query: str, category=None, year=None):
    docs = custom_retrieve(query, category=category, year=year)
    context = "\n".join([doc.page_content for doc in docs[:50]])

    formatted_prompt = prompt.format(input=query, context=context)
    result = llm.invoke(formatted_prompt)

    return {
       "answer": result.content,
        "sources": [doc.metadata for doc in docs[:3]]
    }
