#📌'학사일정'을 gpt가 이해할 수 있도록 벡터화

import os
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from app.nlp.loaders.haksa_loader import load_haksa_documents

#✅ api 키 가져오기
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")

#✅ Pinecone 연결
pc = Pinecone(api_key=pinecone_api_key)

# ✅ Pinecone Index 이름
index_name = "university-chatbot"

#✅ 학사일정 문서 불러오기
docs = load_haksa_documents()

# ✅ metadata 추가 (카테고리 = haksa)
for doc in docs:
    doc.metadata["category"] = "haksa"

#✅ 임베딩 모델 정의
embedding = OpenAIEmbeddings(model="text-embedding-3-small", openai_api_key=openai_api_key)

# ✅ VectorStore 연결
vectorstore = PineconeVectorStore(index_name=index_name, embedding=embedding)

# ✅ Pinecone에 업로드
print("📤 Pinecone 업로드 시작...")
vectorstore.add_documents(docs)
print(f"✅ Pinecone 업로드 완료! 문서 개수: {len(docs)}")

# ✅ 테스트 출력
for d in docs[:3]:
    print("예시 문서:", d.page_content, d.metadata)