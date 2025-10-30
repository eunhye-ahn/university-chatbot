from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.autocomplete import router as autocomplete_router
from app.routers.calendar import router as calendar_router
from app.routers.faq import router as faq_router

# FastAPI 앱 생성
app = FastAPI(
    title="FAQ Autocomplete API",
    description="FAQ 자동완성 API",
    version="1.0.0"
)

# CORS 설정 (React 프론트엔드와 통신하기 위해 필요)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중에는 모든 origin 허용, 배포 시에는 구체적인 도메인으로 변경
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(autocomplete_router)
app.include_router(calendar_router)
app.include_router(faq_router)

# 루트 경로
@app.get("/")
async def root():
    return {
        "message": "FAQ Autocomplete API",
        "version": "1.0.0",
        "endpoints": {
            "autocomplete_search": "/api/autocomplete/search?q=검색어"
        }
    }

# 헬스 체크
@app.get("/health")
async def health_check():
    return {"status": "healthy"}