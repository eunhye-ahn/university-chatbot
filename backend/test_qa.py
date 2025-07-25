# 📌 Pinecone 기반 QA Chain 테스트(삭제 예정)

from app.nlp.chains.qa_chain import run_qa_chain

if __name__ == "__main__":
    question = input("질문을 입력하세요: ")
    print("\n💬 질문:", question)
    
    # ✅ 전체 데이터 검색 (category=None)
    result = run_qa_chain(question, category=None)
    
    # ✅ 결과 출력
    print("\n🧠 답변:", result["answer"])

