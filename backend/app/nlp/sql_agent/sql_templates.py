#⭐SQL 템플릿 보관(자주 하는 질문은 비용 절약을 위해 이 템플릿으로 작동된다)

import textwrap
from typing import Optional
from sqlalchemy import text

INTENT_PARAMS = {
    "get_remaining_major_required": ["year", "course_name"],
    "get_remaining_general_credits_by_track": ["year", "course_name"],
    "get_updated_course_info": ["course_name"],
}

SQL_TEMPLATES = {
    #1.남은 전공필수
    #입력: 년도, 내가 들은 전공필수 과목
    #출력: 안들은 과목 리스트
    "get_remaining_major_required": lambda: text(textwrap.dedent("""
        WITH taken_codes AS (
            SELECT DISTINCT c.course_code
            FROM curriculums c
            WHERE c.year = :year
                AND c.course_name = ANY(:course_name)
        ),
        required_codes AS (
            SELECT DISTINCT code::text AS course_code
            FROM graduation_requirements gr
            CROSS JOIN LATERAL jsonb_array_elements_text(gr.required_course_codes) AS code
            WHERE gr.admission_year = :year        
              AND gr.course_area = '전공'
              AND gr.requirement_type = '전공필수'
        )
        SELECT DISTINCT c.course_name, c.course_code, c.credit
        FROM curriculums c
        JOIN required_codes rc ON rc.course_code = c.course_code
        WHERE c.year = :year
          AND NOT EXISTS (                    
              SELECT 1 FROM taken_codes t
              WHERE t.course_code = c.course_code
          )
        ORDER BY c.course_name;
    """)),


    #2.남은 교양 항목별 잔여 학
    #입력: 년도, 내가 들은 교양과목
    #출력: track별 남은 학점
    "get_remaining_general_credits_by_track": lambda: text(textwrap.dedent("""
        WITH input_names AS (
            SELECT DISTINCT c.course_code
            FROM curriculums c
            WHERE c.year = :year
              AND c.course_name = ANY(:course_name) 
        ),
        mapped_codes AS (
            SELECT course_code FROM input_names
            UNION
            SELECT ec.new_course_code
            FROM equivalent_courses ec 
            JOIN input_names ic
                ON ec.old_course_code = ic.course_code
            UNION
            SELECT ec.old_course_code
            FROM equivalent_courses ec 
            JOIN input_names ic
                ON ec.new_course_code = ic.course_code
        ),
        taken AS (
            SELECT
                c.requirement_type,
                c.track,
                SUM(c.credit) AS earned_credit
            FROM curriculums c
            WHERE c.year = :year
              AND c.course_area = '교양'
              AND c.course_code IN (SELECT course_code FROM mapped_codes)
            GROUP BY c.requirement_type, c.track
        )

        SELECT
            NULLIF(gr.requirement_type, '없음') AS requirement_type,
            NULLIF(gr.track, '없음') AS track,
            gr.required_credit,
            COALESCE(t.earned_credit, 0) AS earned_credit,
            (gr.required_credit - COALESCE(t.earned_credit, 0)) AS remaining_credit
        FROM graduation_requirements gr
        LEFT JOIN taken t
            ON gr.requirement_type = t.requirement_type
            AND gr.track = t.track
        WHERE gr.admission_year = :year
            AND gr.course_area = '교양'
        ORDER BY gr.requirement_type, gr.track;
    """)),

    #3.과목명 변경 확인
    "get_updated_course_info": lambda: text(textwrap.dedent("""
        WITH RECURSIVE
        seeds_ec AS (
            SELECT DISTINCT
                    ec.old_course_code AS start_code,
                    ec.old_course_name AS start_name
            FROM equivalent_courses ec
            WHERE ec.old_course_name = ANY(:course_name)
        ),
        seeds_curr AS (
            SELECT DISTINCT ON (c.course_code)
                c.course_code AS start_code,
                c.course_name AS start_name
            FROM curriculums c
            WHERE c.course_name = ANY(:course_name)
                AND NOT EXISTS (
                    SELECT 1 FROM seeds_ec se WHERE se.start_code = c.course_code
                )
            ORDER BY c.course_code, c.year DESC
        ),
        seeds AS (
            SELECT * FROM seeds_ec
            UNION ALL
            SELECT * FROM seeds_curr
        ),
        chain AS (
            SELECT
                s.start_code,
                s.start_name,
                ec.old_course_code,
                ec.old_course_name,
                ec.new_course_code,
                ec.new_course_name,
                ec.mapping_type,
                ec.allow_duplicate,
                ec.allow_retake,
                1 AS depth,
                ARRAY[s.start_code, ec.new_course_code] AS path
            FROM seeds s
            JOIN equivalent_courses ec
                ON ec.old_course_code = s.start_code

            UNION ALL

            SELECT
                c.start_code,
                c.start_name,
                ec.old_course_code,
                ec.old_course_name,
                ec.new_course_code,
                ec.new_course_name,
                ec.mapping_type,
                ec.allow_duplicate,
                ec.allow_retake,
                c.depth + 1 AS depth,
                c.path || ec.new_course_code AS path
            FROM chain c
            JOIN equivalent_courses ec
                ON ec.old_course_code = c.new_course_code
            WHERE c.depth < 8  
                AND NOT (ec.new_course_code = ANY(c.path))
        ),
        last_hop AS (
            SELECT DISTINCT ON (c.start_code)
                    c.start_name,
                    c.start_code,
                    c.new_course_name AS final_name,
                    c.new_course_code AS final_code,
                    c.mapping_type,
                    c.allow_duplicate,
                    c.allow_retake,
                    c.depth
            FROM chain c
            LEFT JOIN equivalent_courses nxt
                ON nxt.old_course_code = c.new_course_code
            WHERE nxt.old_course_code IS NULL           
            ORDER BY c.start_code, c.depth DESC, c.new_course_code     
        )
        SELECT
            s.start_name AS old_course_name,
            s.start_code AS old_course_code,
            COALESCE(l.final_name, s.start_name) AS new_course_name,
            COALESCE(l.final_code, s.start_code) AS new_course_code,
            l.mapping_type,
            l.allow_duplicate,
            l.allow_retake,
            COALESCE(l.depth, 0) AS hops
        FROM seeds s
        LEFT JOIN last_hop l ON l.start_code = s.start_code
        ORDER BY s.start_name;
    """))
}

#✅의도(intent)에 맞는 sql쿼리를 SQL_TEMPLATES에서 가져오는 함수
def get_template_query(intent: str) -> Optional[str]:
    """
    Args:
        intent(str): 사용자의 의도(예: "get_remaining_major_required")

    Returns:
        Optional[str]: SQL 쿼리 문자열 또는 None
    """
    #의도가 존재하는지 확인
    if intent not in SQL_TEMPLATES:
        return None
    return SQL_TEMPLATES[intent]()