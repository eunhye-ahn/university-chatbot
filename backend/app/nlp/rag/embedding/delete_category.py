from pinecone import Pinecone
import os
from dotenv import load_dotenv

# ✅ 환경 변수 로드
load_dotenv()
pinecone_api_key = os.getenv("PINECONE_API_KEY")

# ✅ Pinecone 연결
pc = Pinecone(api_key=pinecone_api_key)
index_name = "university-chatbot"
index = pc.Index(index_name)

# ✅ 카테고리 'gyoyuk' 데이터 삭제
print(f"🗑 인덱스 '{index_name}'에서 category='gyoyuk' 데이터 삭제 중...")
index.delete(filter={"category": "gyoyuk"})
print("✅ 삭제 완료!")
