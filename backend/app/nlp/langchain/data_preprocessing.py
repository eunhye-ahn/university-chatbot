#📌크롤링 + 전처리 + LangChain 문서화

from datetime import datetime
import requests
from langchain_core.documents import Document

#✅ 데이터 요청
url = "https://www.scnu.ac.kr/haksa/sv/schdulView/selectSvList.do"
response = requests.post(url, data={"sysId": "SCNU"})
data = response.json()#⭐학사 일정 전체 데이터(2018~현재)

#✅ 원하는 연도와 월 입력
year = 2025
month = 7

#✅ 일정이 해당 연도와 달에 해당하는지 확인하는 함수
def is_event_in_target_month(item, year, month):
    try:
        start = datetime.strptime(item["bgnde"], "%Y/%m/%d")
        end = datetime.strptime(item["endde"], "%Y/%m/%d")
    except:
        return False
    return(
        start.year == year and start.month == month or
        end.year == year and end.month == month or
        (start < datetime(year, month, 31) and end > datetime(year, month, 1))
    )

#✅ 원하는 년,월의 데이터만 필터링
filtered_data = [
    item for item in data
    if is_event_in_target_month(item, year, month)
]

#✅ LangChain이 이해할 수 있는 형태로 문서화
docs = []
for item in filtered_data:
    content = f"{item['bgnde']}에 {item['schdulTitle']} 일정이 있습니다."
    metadata = {
    "start_date": item.get("bgnde", ""),
    "end_date": item.get("endde", ""),
    "description": item.get("schdulCn", ""),
    "all_day": item.get("alldayAt", "")
}
    docs.append(Document(page_content=content, metadata=metadata))
    
#✅ 결과 확인
for d in docs:
    print(d.page_content, d.metadata)