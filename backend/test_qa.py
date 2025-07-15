# 📌 Pinecone 기반 QA Chain 테스트(삭제 예정)

from app.nlp.chains.qa_chain import qa_chain

if __name__ == "__main__":
    question = input("질문을 입력하세요: ")
    print("\n💬 질문:", question)
    
    # ✅ QA Chain 실행
    result = qa_chain.invoke({"input": question})

    # ✅ 결과 출력
    print("🧠 답변:", result["answer"])
