from dotenv import load_dotenv
import os

#✅ .env 로드
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__),"..",".env"))

#✅ key 가져오기
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")