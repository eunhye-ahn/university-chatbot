#⭐사용자의 질문을 받고 키워드 or 캐시 or SQLAgent 중 어떤 경로로 처리할지 결정하는 코드

import re
import unicodedata
from difflib import SequenceMatcher
from typing import Dict, List

from app.nlp.sql_template.keywords import INTENT_KEYWORDS
from app.nlp.sql_template.cache_manager import check_cache

#✅사용자의 입력값 전처리(fuzzy_contains을 위한 전처리)
def normalizer(text: str) -> str:
    """
    Args:
        text(str): 사용자의 자연어 질문 문장 

    Returns:
        str: 전처리 완료된 문장
    """
    t = unicodedata.normalize("NFC", text) #유니코드 정규화
    t = t.lower().strip() #소문자로 통일, 띄어쓰기 제거
    t = re.sub(r"[^\w가-힣\s]", "", t) #특수문자 제거
    t = re.sub(r"\s+", "", t) #모든 공백 제거
    return t


#✅전처리된 사용자의 입력값을 키워드 매칭 한다. 
#키워드 매칭은 완전 일치가 아닌, 오타나 유사한 단어도 허용한다. 
def fuzzy_contains(text: str, keywords: str, ratio: float = 0.85) -> bool:
    """
    Args:
        text(str): 사용자의 자연어 질문 문장 
        keywords(str): INTENT_KEYWORDS에서 가져온 키워드들
        ratio(float): 질문 단어들과 키워드의 매칭 퍼센트(0.85유사도 넘으면 키워드 존재한다고 인정)

    Returns:
        bool: 매칭 결과(키워드 매칭 있는지 없는지)
    """
    #사용자의 질문, 키워드 정규화
    t = normalizer(text)
    k = normalizer(keywords)
    
    #키워드가 빈 문자열이면 false 반환(안전장치)
    if not k:
        return False
    
    #키워드가 사용자의 입력값과 완전히 매칭하면 true 반환
    if k in t:
        return True
    
    #키워드가 3글자 이상일 때만 매칭 허용(안전장치)
    if len(k) >= 3:
        return SequenceMatcher(None, t, k).ratio() >= ratio
    return False
    
    
#✅normalizer와 달리 띄어쓰기에 자유로운 정규화
#사용자가 어떻게 띄어쓰기를 해도 매칭되도록 하는 함수
def loose_regex(keywords: str) -> re.Pattern:
    """
    Args:
        keywords(str): INTENT_KEYWORDS에서 가져온 개별 키워드들

    Returns:
        re.Pattern: 다 띄어쓰기 된 정규식 패턴(전공필수 -> 전 공 필 수)
    """
    k = unicodedata.normalize("NFC", keywords)
    k = re.sub(r"\s+", "", k)
    pat = r"\s*".join(map(re.escape, list(k)))
    return re.compile(pat, re.IGNORECASE)


#✅여러개의 정규식 패턴 중에서 하나라도 매칭되는게 있는지 확인하는 함수
def regex_hit(text: str, patterns: List[re.Pattern]) -> bool:
    """
    Args:
        text(str): loose_regex 통과한 사용자가 한 질문
        partterns(List): 정규식 패턴들의 리스트

    Returns:
        bool: 사용자의 질문이 정규식 패턴 중 하나라도 일치하는지 여부
    """
    t = unicodedata.normalize("NFC", text)
    return any(p.search(t) for p in patterns)


#✅INTENT_KEYWORDS에 동의어를 추가해서 비슷한 단어들도 인식할 수 있게끔 하는 함수
#기본 키워드와 동의어들을 연결하는 사전
SYNONYMS = {
    "전공필수": ["전필", "전공 필수"],
    "남은": ["부족", "미이수", "안 들은", "더 들어야", "필요한 과목", "아직"],
    "교양": ["교양과목", "교양 과목"],
    "대체": ["동일", "변경", "바뀐", "개편", "동등", "인정"],
}

def expand_keywords(intents: Dict[str, List[str]]) -> Dict[str, List[str]]:
    """
    Args:
        intents(Dict[str, List[str]]): INTENT_KEYWORDS에서 실제로 전달되는 값
        (예: "get_remaining_major_required": ["전공필수", "남은", "들어야 할"],,,)

    Returns:
        Dict[str, List[str]]: INTENT_KEYWORDS에 동의어가 추가된 Dict
    """
    #확장된 키워드들을 저장할 빈 공간
    expanded = {}
    
    #기존 intent를 하나씩 돌면서 중복된것 제외하고 추가하기
    for intent, keywords in intents.items():
        buffer = set(keywords)
        for keyword in list(keywords):
            if keyword in SYNONYMS:
                for syn in SYNONYMS[keyword]:
                    buffer.add(syn)
        expanded[intent] = sorted(buffer)
    return expanded

EXPANDED_KEYWORDS = expand_keywords(INTENT_KEYWORDS)
REGEX_PATTERNS = {intent: [loose_regex(kw) for kw in kws] for intent, kws in EXPANDED_KEYWORDS.items()}

    
#✅사용자의 질문의 단어들이 Intent별로 얼마나 정확한지 점수 매기는 함수
def calculate_confidence_v4(question: str, all_intents: Dict[str, List[str]]) -> Dict[str, float]:
    """
    Args:
        question(str): 사용자의 질문 텍스트
        all_intents(Dict[str, List[str]]): expand_keywords함수로 인해 확장된 키워드 딕셔너리

    Returns:
        Dict[str, float]: 각 intent 별 신뢰도 점수
    """
    scores = {}
    for intent, keywords in all_intents.items():
        #매칭된 키워드 개수
        hits = 0
        for keyword in keywords:
            if fuzzy_contains(question, keyword):
                hits += 1
                continue
        if regex_hit(question, REGEX_PATTERNS[intent]):
            hits += 1
        scores[intent] = hits
    
    max_score = max(scores.values()) if scores else 0
    if max_score == 0:
        return{}
    
    #상대비교 + 절대비교 혼합
    confidences = {}
    for intent, raw in scores.items():
        if raw > 0:
            relative = raw / max_score
            absolute = raw / max(1, len(all_intents[intent]))  # 0 division 방지
            confidences[intent] = round(0.7 * relative + 0.3 * absolute, 3)
    return confidences
   
            
#✅사용자의 질문을 받아서 어떤 방식으로 처리할지 결정하는 함수
#키워드 기반 우선, 모호하면 캐시, 그래도 아니면 LLM(SQL Agent)
def classify_intent_smart(question: str) -> dict:
    #calculate_confidence_v4 함수로 신뢰도 계산
    confidences = calculate_confidence_v4(question, EXPANDED_KEYWORDS   )
    
    #아무 키워드도 매칭이 안되면 바로 LLM 처리
    if not confidences:
        return {"route": "llm_fallback", "intent": None}
    
    #가장 높은 신뢰도를 가진 Intent 선택(예: best_intent="전공필수", best_score=0.8)
    best_intent, best_score = max(confidences.items(), key=lambda x: x[1])
    
    raw_counts = {
        intent: sum(1 for kw in EXPANDED_KEYWORDS[intent] if fuzzy_contains(question, kw)) +
                (1 if regex_hit(question, REGEX_PATTERNS[intent]) else 0)
        for intent in EXPANDED_KEYWORDS
    }
    best_raw_intent = max(raw_counts, key=raw_counts.get)
    best_raw = raw_counts[best_raw_intent]
    
    if best_raw >= 2:
        return {"route": "keyword", "intent": best_raw_intent}
    elif best_raw == 1:
        cached = check_cache(question)
        if cached:
            return {"route": "cache", "answer": cached}
        return {"route": "llm_fallback", "intent": None}
    else:
        return {"route": "llm_fallback", "intent": None}
        