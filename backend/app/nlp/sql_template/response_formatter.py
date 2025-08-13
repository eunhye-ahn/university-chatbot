#✅supabase에서 가져온 lise[dict] 결과를
#사용자에게 보여줄 자연어 응답 문자열로 변환하는 역할
def format_answer(intent: str, result: list[dict]) -> str:
    if not result:
        if intent == "get_remaining_major_required":
            return "모든 전공필수 과목을 이수하셨네요! 🎓"
        elif intent == "get_remaining_general_credits_by_track":
            return "모든 교양 학점을 다 이수하셨거나, 부족한 학점이 없어요!"
        elif intent == "get_updated_course_info":
            return "입력하신 과목에 대한 변경 이력을 찾을 수 없어요."
        else:
            return "검색된 결과가 없습니다."
    
    #1.남은 전공필수
    #입력: 년도, 내가 들은 전공필수 과목
    #출력: 안들은 과목 리스트(예: - C언어 프로그래밍 [CSE101] (3학점))
    if intent == "get_remaining_major_required":
        items = "\n".join(
            f"- {row['course_name']} [{row['course_code']}] ({row['credit']}학점)"
            for row in result
        )
        return f"남은 전공필수 과목은 다음과 같습니다:\n{items}"
    
    #2.남은 교양 항목별 잔여
    #입력: 년도, 내가 들은 교양과목
    #출력: track별 남은 학점(예: - 심화교양 (융/복합): 3학점 남음)
    elif intent == "get_remaining_general_credits_by_track":
        items = []
        for row in result:
            parts = []
            if row["requirement_type"]:
                parts.append(row["requirement_type"])
            if row["track"]:
                parts.append(row["track"])
            label = " ".join(parts) if parts else "교양"
            items.append(f"- {label}: {row['remaining_credit']}학점 남음")

        return f"분야별 남은 교양 학점은 다음과 같습니다:\n" + "\n".join(items)
        
    #3.과목명 변경 확인
    #입력: 년도, 과목명
    #출력: CSE101 컴퓨터개론 → CSE110 컴퓨터기초 (동일)
    elif intent == "get_updated_course_info":
        lines = [] #최종 출력할 문장들을 저장할 리스트
        any_changed = False #실제로 변경된 과목이 있는지 여부
        
        #결과 문장들을 영어,가나다 순으로 정렬
        result_sorted = sorted(
            result,
            key=lambda r: (str(r.get("old_course_name") or ""), str(r.get("old_course_code") or ""))
        )
        
        #각 과목에 대한 정보들을 변수에 저장
        for r in result_sorted:
            old_nm = r.get("old_course_name")
            old_cd = r.get("old_course_code")
            new_nm = r.get("new_course_name")
            new_cd = r.get("new_course_code")
            mtype = r.get("mapping_type")
            
            #교과목과 코드가 바뀐게 없으면 false 저장
            changed = not (old_cd == new_cd and old_nm == new_nm)
            
            #교과목 또는 코드가 바뀐게 있으면 실행
            if changed:
                any_changed = True
                mlabel = mtype if mtype else "동일/대체"
                lines.append(f"- {old_nm} [{old_cd}]는 {new_nm} [{new_cd}]로 {mlabel} 변경되었습니다.")
            else:
                lines.append(f"- {old_nm} [{old_cd}]는 변경된 이력이 없습니다.")
            
        #최종 응답 생성
        if any_changed:
            header = "동일·대체 교과목 변경사항은 아래와 같습니다:"
            return header + "\n" + "\n".join(lines)
        else:
             return "동일·대체 교과목 변경 이력이 없습니다."
    else:
        return f"죄송합니다. '{intent}' 요청은 아직 지원하지 않습니다. 곧 업데이트 예정입니다!"