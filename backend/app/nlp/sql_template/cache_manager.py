#⭐캐시 저장소 생성(일단 메모리 저장, 나중에 Redis로 변경 예정)

from typing import Optional
import re

#1.질문-대답 저장할 캐시 저장소 생성
query_cache: dict[str, str] = {}

#2.저장하기 전 전처리
def normalize_question(text: str) -> str:
    text = text.lower().strip()
    # 한글, 영문, 숫자만 유지
    text = re.sub(r'[^\w가-힣\s]', '', text)
    # 연속 공백을 하나로
    text = re.sub(r'\s+', '', text)
    return text
   
#3.질문-응답을 캐시에 저장 
def save_cache(question: str, response: str) -> None:
    key = normalize_question(question)
    query_cache[key] = response
    
#4.질문 들어오면 캐시와 매칭
def check_cache(question: str, min_length: int = 3) -> Optional[str]:
    #전처리
    normalized = normalize_question(question)
    
    #사용자가 입력한 질문이 너무 짧으면 캐시 매칭x
    if len(normalized) < min_length:
        return None
    
    #정확 매칭 먼저 체크(혹시 똑같은 질문 캐시에 저장되어 있을 수도 있으니까)
    exact_match = query_cache.get(normalized)
    if exact_match:
        print(f"[정확 매칭] {normalized}")
        return exact_match
    
    #유사 매칭(캐시에 저장된 비슷한 질문 확인)
    for cached_question, cached_answer in query_cache.items():
        if (len(normalized) >= min_length and normalized in cached_question) or \
           (len(cached_question) >= min_length and cached_question in normalized):
            print(f"[유사 매칭] {normalized} ≈ {cached_question}")
            return cached_answer
    
    print(f"[캐시 미스] {normalized}")
    return None
    
    
    