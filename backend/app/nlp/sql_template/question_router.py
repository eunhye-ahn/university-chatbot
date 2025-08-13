from app.nlp.sql_template.intent_classifier import classify_intent_smart
from app.nlp.sql_agent.sql_templates import SQL_TEMPLATES, INTENT_PARAMS, get_template_query
from app.services.supabase_sql import execute_sql_query
from app.nlp.sql_template.cache_manager import save_cache
from app.nlp.sql_agent.agent import run_sql_agent
from app.nlp.sql_template.response_formatter import format_answer

#✅년도 전처리 함수(예: 2025를 25로 입력한 경우)
def _normalize_year(user_input):
    if "year" in user_input and user_input["year"] is not None:
        y = int(user_input["year"])
        if y < 100:
            y += 2000
        user_input["year"] = y
    return user_input


#✅사용자의 입력에서 과목명들을 찾아서 깔끔한 리스트로 만드는 함수
def _ensure_list_names(user_input):
    raw = user_input.get("course_name")
    
    if raw is None:
        return []
    
    if isinstance(raw, (list, tuple)):
        names = [str(n).strip() for n in raw if n is not None and str(n).strip() != ""]
    else:
        s = str(raw).strip()
        names = [s] if s else []
    
    return names


#✅사용자의 질문 들어오는 통로
#classify_intent_smart()로 키워드, 캐시, sqlAgent 중 어떤 처리가 좋을지 판별된 뒤 출력
def route_question(question: str, user_input: dict) -> str:
    """
    Args:
        question (str): 사용자의 자연어 질문
        user_input (dict): 유저 입력값 (예: {'year': 2022, 'taken_names': [...]})

    Returns:
        str: 최종 응답 문장
    """
    #사용자의 질문을 키워드 / 캐시 / sqlAgent 중 뭐로 할지 분류
    route_info = classify_intent_smart(question)
    route = route_info["route"]
    
    #분류별 처리( 키워드 / 캐시 / sqlAgent)
    if route == "keyword":
        intent = route_info["intent"]
        
        #공통 전처리
        _normalize_year(user_input)
        course_names = _ensure_list_names(user_input)
        
        #만약 사용자의 질문에 course_name(과목명)이 없다면, 빈 배열[] 응답
        if "course_name" in INTENT_PARAMS.get(intent, []) and not course_names:
            response = format_answer(intent, result=[])
            save_cache(question, response)
            return response

        #sql_templates.py의 (:바인드 변수)를 채워주는 값들 준비
        params = {
            "year": user_input.get("year"),
            "course_name": course_names,
        }
        
        #sql_templates.py에 intent전송(없으면 sql_agent실행)
        query = get_template_query(intent)
        if query is None:
            return run_sql_agent(question)
        
        #sql_templates.py의 바인드 함수에 들어갈 파라미터만 넣어서 sql실행
        allowed = INTENT_PARAMS.get(intent, [])
        safe_params = {k: v for k, v in params.items() if k in allowed}
        rows = execute_sql_query(query, safe_params)
        
        response = format_answer(intent, result=rows)
        save_cache(question, response)
        return response
        
    elif route == "cache":
        return route_info["answer"]
    
    elif route == "llm_fallback":
        return run_sql_agent(question)