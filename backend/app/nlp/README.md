# 사전 준비

학교 홈페이지에서 수집한 크롤링 데이터를 벡터로 임베딩하여 GPT 기반 질의응답에 활용할 수 있도록 처리합니다.

---

## ✅ 1. 라이브러리 설치

```bash
pip install -r requirements.txt

## ✅ 2. .env 파일 생성
backend/.env 파일을 생성하고, 아래처럼 OpenAI API 키를 입력하세요:
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

## ✅ 3. 실행 방법 (루트에서 진행)
터미널(Git Bash 등)에서 아래 순서대로 입력하세요:
### 1. 루트 디렉토리로 이동
cd university-chatbot

### 2. 실행 스크립트 자동 생성
python backend/app/nlp/scripts/generate_run_all.py

### 3. 벡터 임베딩 실행
bash backend/app/nlp/scripts/run_all.sh

## ✅ 예시 출력
    2025/07/01에 성적확인 및 정정 일정이 있습니다. {'start_date': ..., ...}
    2025/07/07에 제1학기 성적 확정 일정이 있습니다. {...}
    ...
    모든 임베딩 완료!

## ⚠️ 주의사항
1. 절대 VSCode ▶️ 버튼으로 실행하지 마세요.
ModuleNotFoundError: No module named 'app' 오류가 발생합니다.
2. 반드시 터미널(Git Bash 등) 에서 위 명령어를 순서대로 입력해주세요.
3. macOS 사용자도 동일하게 작동합니다 (경로 및 PYTHONPATH 자동 설정됨)
```
