import os
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from app.nlp.loaders.janghakgeum_loader import load_janghakgeum_documents

load_dotenv()
open_api_key = os.getenv("OPENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")

pc = Pinecone(api_key=pinecone_api_key)
index_name = "university-chatbot"

#✅ 파일 수정하면 경로 확인 후 다시 embed하기
file_path = "C:/Users/rmawl/Desktop/chatbotData/장학금/2025_장학금.xlsx"
docs = load_janghakgeum_documents(file_path)

embedding = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key = open_api_key
)

vectorstore = PineconeVectorStore(index_name=index_name, embedding=embedding)

print("📤 Pinecone 업로드 시작...")
vectorstore.add_documents(docs)
print(f"✅ Pinecone 업로드 완료! 문서 개수: {len(docs)}")

print("\n📌 업로드된 문서 예시:")
for d in docs[:3]:
    print("page_content:", d.page_content)
    print("metadata:", d.metadata)
    print("-" * 50)