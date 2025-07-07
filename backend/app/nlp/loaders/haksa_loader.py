# 📌'학사일정' 크롤링 + 문서화 (전체 데이터 임베딩용)

import requests
from datetime import datetime
from langchain_core.documents import Document

# ✅ 전체 학사일정 데이터를 LangChain 문서로 변환
def load_haksa_documents():
    url = "https://www.scnu.ac.kr/haksa/sv/schdulView/selectSvList.do"
    response = requests.post(url, data={"sysId": "SCNU"})
    data = response.json()  # ⭐ 전체 학사일정 (2018~현재)

    docs = []
    for item in data:
        start = item.get("bgnde","")
        end = item.get("endde","")
        title = item.get("schdulTitle", "")
        description = item.get("schdulCn", "")
        
        start_fmt = datetime.strptime(start, "%Y/%m/%d").strftime("%Y년 %m월 %d일")
        end_fmt = datetime.strptime(end, "%Y/%m/%d").strftime("%Y년 %m월 %d일")
        
        if start == end:
            content = f"{title} 일정은 {start_fmt}입니다."
        else:
            content = f"{title} 일정은 {start_fmt}부터 {end_fmt}까지입니다."
        
        docs.append(Document(
            page_content=content,
            metadata={
                "start_date": start,
                "end_date": end,
                "description": description,
                "all_day": item.get("alldayAt", "")
            }
        ))

    return docs
