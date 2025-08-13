#📌'교육과정'을 gpt가 이해할 수 있도록 벡터화 -> pinecone에 저장 

import os
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from app.nlp.loaders.gyoyuk_loader import load_gyoyuk_json

#✅ api 키 가져오기
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")

#✅ Pinecone 연결
pc = Pinecone(api_key=pinecone_api_key)
index_name = "university-chatbot"

# ✅ 임베딩 모델 정의
embedding = OpenAIEmbeddings(model="text-embedding-3-small", openai_api_key = openai_api_key)

# ✅ VectorStore 연결
vectorstore = PineconeVectorStore(index_name = index_name, embedding = embedding)

#✅ json 로드
json_path = "C:/Users/rmawl/Desktop/chatbotData/교육과정_JSON/2025_교육과정_전공.json"
docs = load_gyoyuk_json(json_path)

# ✅ category 메타데이터 추가
for doc in docs:
    doc.metadata["category"] = "gyoyuk"
    
# ✅ Pinecone 업로드
batch_size = 100
for i in range(0, len(docs), batch_size):
    batch = docs[i:i + batch_size]
    print(f"📤 업로드 중... {i} ~ {i + len(batch) - 1}")
    vectorstore.add_documents(batch)

print("✅ 교직과정 데이터 업로드 완료!")