import pandas as pd
from langchain.schema import Document

def load_janghakgeum_documents(file_path: str):
    df = pd.read_excel(file_path)
    df = df.fillna("")
    
    docs = []
    
    for _, row in df.iterrows():
        #✅ 엑셀 8개 컬럼 가져오기(값 없으면 공백으로 채우기)
        section = row.get("section", "")
        type_ = row.get("type", "")
        subtype = row.get("subtype", "")
        scholarship_name = row.get("scholarship_name", "")
        summary = row.get("summary", "")
        eligibility = row.get("eligibility", "")
        benefit = row.get("benefit", "")
        condition = row.get("condition", "")
        
        #✅ 검색용 문장
        page_content = (
            f"구분: {section} | 종류: {type_} | 세부유형: {subtype} | "
            f"장학금명: {scholarship_name} | 요약: {summary} | "
            f"지원 자격: {eligibility} | 혜택: {benefit} | 유지 조건: {condition}"
        )
        
        #✅ metadata (검색 필터)
        metadata = {
            "category": "janghakgeum",
            "section": section,
            "type": type_,
            "subtype": subtype,
            "scholarship_name": scholarship_name,
            "summary": summary,
            "eligibility": eligibility,
            "benefit": benefit,
            "condition": condition
        }
        
        #✅ Document 생성
        docs.append(Document(page_content.strip(), metadata = metadata))
    return docs