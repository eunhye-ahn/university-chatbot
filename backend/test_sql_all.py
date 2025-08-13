from app.nlp.sql_template.question_router import route_question

response = route_question(
    "컴퓨터 그래픽스랑 데이터페이스 설계 및 응용 교과목 이름 바뀌었나?",
    {
        "course_name": ["컴퓨터그래픽스", "데이터베이스설계및응용"],
    }
)

print(response)

