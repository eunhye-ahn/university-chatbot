#📌'학사일정'을 gpt가 이해할 수 있도록 벡터화

import os
from dotenv import load_dotenv

from app.nlp.loaders.haksa_loader import load_haksa_documents

#✅ api 키 가져오기
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

#✅ 학사일정 문서 불러오기
docs = load_haksa_documents()


#✅ 출력 확인
for d in docs:
    print(d.page_content, d.metadata)