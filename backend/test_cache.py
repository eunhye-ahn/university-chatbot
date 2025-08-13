from app.nlp.sql_template.cache_manager import set_cached_response, get_cached_response

question = "2024학번 전공필수 중 내가 들은 과목 빼고 남은 거 알려줘"
answer = "운영체제, 컴퓨터구조가 남았습니다."

set_cached_response(question, answer)

cached = get_cached_response(question)
print("캐시된 응답:", cached)

miss = get_cached_response("2023학번 기준은?")
print("없는 질문 캐시 결과:", miss)