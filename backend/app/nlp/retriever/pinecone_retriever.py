import os
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore

#✅ 환경변수 로드
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")

#✅ Pinecone 연결
pc = Pinecone(api_key=pinecone_api_key)

#✅ 인덱스 이름
index_name = "university-chatbot"

#✅ 임베딩 모델 정의
embedding = OpenAIEmbeddings(model="text-embedding-3-small", openai_api_key=openai_api_key)

#✅ 기존 인덱스와 연결
vectorstore = PineconeVectorStore.from_existing_index(
    index_name=index_name, embedding=embedding
)

#✅ Retriever 생성 함수
def get_retriever(category: str | None = None):
    filter_condition = {"category": category} if category else None
    return vectorstore.as_retriever(search_kwargs={"k": 5, "filter": filter_condition})

#🚀 테스트 코드 (삭제 예정)
if __name__ == "__main__":
    query = input("통합 검색창: ")
    retriever = get_retriever(category=None)
    docs  = retriever.get_relevant_documents(query)
    
    print("\n[검색 결과]")
    for i, doc in enumerate(docs):
        print(f"\n{i+1}. {doc.page_content} (메타: {doc.metadata})")