// 🔍 자동완성 DB 연동 서비스

// 📝 자동완성 응답 타입 정의
interface AutoCompleteResponse {
    suggestions: string[];
    total: number;
}

// 🔗 API 응답 타입 정의
interface ApiResponse {
    success: boolean;
    data: AutoCompleteResponse;
    message?: string;
}

/**
 * 🔍 DB에서 자동완성 단어를 가져오는 서비스 클래스
 * 실제 사용 시 이 파일을 참고하여 구현하세요
 */
export class AutoCompleteService {
    private static readonly API_BASE_URL = '/api/autocomplete';
    
    /**
     * 🔍 검색어를 기반으로 자동완성 단어를 가져옵니다
     * @param query 검색어
     * @param limit 가져올 결과 수 (기본 10개)
     * @returns 자동완성 단어 배열
     */
    static async fetchSuggestions(query: string, limit: number = 10): Promise<string[]> {
        try {
            const params = new URLSearchParams({
                q: query,
                limit: limit.toString()
            });
            
            const response = await fetch(`${this.API_BASE_URL}?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ApiResponse = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || '자동완성 데이터를 가져오는데 실패했습니다.');
            }

            return result.data.suggestions;
            
        } catch (error) {
            console.error('자동완성 API 호출 중 오류:', error);
            
            // 🔄 에러 발생 시 빈 배열 반환 (기본 동작 유지)
            return [];
        }
    }

    /**
     * 🔥 인기 자동완성 단어를 가져옵니다
     * @param limit 가져올 결과 수 (기본 20개)
     * @returns 인기 자동완성 단어 배열
     */
    static async fetchPopularSuggestions(limit: number = 20): Promise<string[]> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/popular?limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ApiResponse = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || '인기 자동완성 데이터를 가져오는데 실패했습니다.');
            }

            return result.data.suggestions;
            
        } catch (error) {
            console.error('인기 자동완성 API 호출 중 오류:', error);
            return [];
        }
    }

    /**
     * 👤 사용자별 맞춤 자동완성 단어를 가져옵니다
     * @param userId 사용자 ID
     * @param query 검색어
     * @param limit 가져올 결과 수 (기본 10개)
     * @returns 맞춤 자동완성 단어 배열
     */
    static async fetchPersonalizedSuggestions(
        userId: string, 
        query: string, 
        limit: number = 10
    ): Promise<string[]> {
        try {
            const params = new URLSearchParams({
                userId,
                q: query,
                limit: limit.toString()
            });
            
            const response = await fetch(`${this.API_BASE_URL}/personalized?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ApiResponse = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || '맞춤 자동완성 데이터를 가져오는데 실패했습니다.');
            }

            return result.data.suggestions;
            
        } catch (error) {
            console.error('맞춤 자동완성 API 호출 중 오류:', error);
            return [];
        }
    }

    /**
     * 📊 자동완성 사용 통계를 전송합니다 (선택적)
     * @param userId 사용자 ID
     * @param selectedSuggestion 선택된 자동완성 단어
     * @param query 원래 검색어
     */
    static async trackSuggestionUsage(
        userId: string,
        selectedSuggestion: string,
        query: string
    ): Promise<void> {
        try {
            await fetch(`${this.API_BASE_URL}/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    selectedSuggestion,
                    query,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('자동완성 사용 통계 전송 중 오류:', error);
            // 통계는 실패해도 사용자 경험에 영향을 주지 않으므로 조용히 처리
        }
    }
}

// 🎯 ChatInterface에서 사용할 헬퍼 함수
export const createAutoCompleteFetcher = (userId?: string) => {
    return async (query: string): Promise<string[]> => {
        if (userId) {
            // 👤 로그인된 사용자의 경우 맞춤 자동완성 사용
            return await AutoCompleteService.fetchPersonalizedSuggestions(userId, query);
        } else {
            // 👥 일반 사용자의 경우 기본 자동완성 사용
            return await AutoCompleteService.fetchSuggestions(query);
        }
    };
};

/* 
✨ 사용 예시:

// ChatInterface.tsx에서
import { createAutoCompleteFetcher } from '../service/autoCompleteService';

const ChatInterface = ({ messages, setMessages }: ChatInterfaceProps) => {
    // ... 기존 코드 ...
    
    // 👤 사용자 ID (로그인 상태에 따라)
    const userId = getCurrentUserId(); // 실제 구현 필요
    
    // 🔍 자동완성 함수 생성
    const fetchAutoCompleteSuggestions = createAutoCompleteFetcher(userId);
    
    return (
        // ... JSX ...
        <AutoComplete 
            // ... 기존 props ...
            fetchSuggestions={fetchAutoCompleteSuggestions}
        />
        // ... 나머지 JSX ...
    );
};
*/