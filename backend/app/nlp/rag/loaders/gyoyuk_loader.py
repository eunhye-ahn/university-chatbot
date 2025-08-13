# 📌교육과정 JSON 파일을 → LangChain Document 리스트로 변환(json -> docs)

import json
from langchain.schema import Document

def load_gyoyuk_json(json_path: str):
    #✅ json 파일 가져오기
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    #✅ 사용자가 자주 쓰는 표현 추가 저장
    def get_alias(entry):
        aliases = []
        department = entry.get("department", "").strip()
        major = entry.get("major", "").strip()
        
        def clean_name(name):
            suffixes = ["학부", "학과", "과", "전공", "분야"]
            for s in suffixes:
                if name.endswith(s):
                    name = name.replace(s, "")
            return name.strip()
        
        if department:
            aliases.append(department)
        if major:
            aliases.append(major) 
            
        if department:
            dept_base = clean_name(department)
            aliases.append(dept_base)
            aliases.append(dept_base + "과")
            if len(dept_base) >= 2:
                aliases.append(dept_base[:2])
        if major:
            major_base = clean_name(major)
            aliases.append(major_base + "과")
            if len(major_base) >= 2:
                aliases.append(major_base[:2] + "공")
        
        return list(set(filter(None, aliases)))
        
    #✅ text 필드 만들기
    def create_text(entry, aliases):
        alias_text = ", ".join(aliases)
        return (
            f"학년도: {entry['year']} | "
            f"대학: {entry['college']} | "
            f"학과(분야): {entry['department']} | "
            f"전공: {entry['major'] if entry['major'] else '해당 없음'} | "
            f"학년: {entry['grade']} | 학기: {entry['semester']} | "
            f"이수구분: {entry['requirement']} | "
            f"과목명: {entry['course_name']} | "
            f"코드: {entry['course_code']} | 학점: {entry['credit']} | "
            f"과정유형: {entry['curriculum_type']} | "
            f"별칭(alias): {alias_text}"
        )
        
    #✅ Document 생성
    docs=[]
    for entry in data:
        aliases = get_alias(entry)
        entry["alias"] = aliases
        entry["text"] = create_text(entry, aliases)
        metadata = {k: v for k, v in entry.items() if k != "text"}
        docs.append(Document(page_content=entry["text"], metadata=metadata))
    
    return docs