// 🤖 챗봇 응답 DB 연동 서비스

// 📝 챗봇 응답 타입 정의
interface ChatbotResponse {
    response: string;
    confidence: number;             // 응답 신뢰도 (0-1)
    category?: string;              // 응답 카테고리 (주문, 배송, 반품 등)
    suggestedActions?: string[];    // 추천 후속 질문들
}

// 🔗 API 응답 타입 정의
interface ChatbotApiResponse {
    success: boolean;
    data: ChatbotResponse;
    message?: string;
}

// 👤 사용자 컨텍스트 타입 정의
interface UserContext {
    userId?: string;
    sessionId: string;
    previousMessages?: Array<{
        message: string;
        timestamp: Date;
        type: 'user' | 'bot';
    }>;
}

/**
 * 🤖 챗봇 응답을 위한 서비스 클래스
 * 실제 사용 시 이 파일을 참고하여 구현하세요
 */
export class ChatbotService {
    private static readonly API_BASE_URL = '/api/chatbot';
    
    /**
     * 💬 사용자 메시지에 대한 챗봇 응답을 가져옵니다
     * @param message 사용자 메시지
     * @param context 사용자 컨텍스트 (선택적)
     * @returns 챗봇 응답
     */
    static async getChatbotResponse(
        message: string, 
        context?: UserContext
    ): Promise<string> {
        try {
            const requestBody = {
                message: message.trim(),
                context: context || null,
                timestamp: new Date().toISOString()
            };

            const response = await fetch(this.API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ChatbotApiResponse = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || '챗봇 응답을 가져오는데 실패했습니다.');
            }

            return result.data.response;
            
        } catch (error) {
            console.error('챗봇 API 호출 중 오류:', error);
            
            // 🔄 에러 발생 시 기본 응답 반환
            return this.getFallbackResponse(message);
        }
    }

    /**
     * 📊 상세한 챗봇 응답 정보를 가져옵니다 (신뢰도, 카테고리, 추천 질문 포함)
     * @param message 사용자 메시지
     * @param context 사용자 컨텍스트
     * @returns 상세 챗봇 응답
     */
    static async getDetailedChatbotResponse(
        message: string, 
        context?: UserContext
    ): Promise<ChatbotResponse> {
        try {
            const requestBody = {
                message: message.trim(),
                context: context || null,
                timestamp: new Date().toISOString(),
                includeMetadata: true
            };

            const response = await fetch(`${this.API_BASE_URL}/detailed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ChatbotApiResponse = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || '챗봇 응답을 가져오는데 실패했습니다.');
            }

            return result.data;
            
        } catch (error) {
            console.error('상세 챗봇 API 호출 중 오류:', error);
            
            // 🔄 에러 발생 시 기본 응답 반환
            return {
                response: this.getFallbackResponse(message),
                confidence: 0.5,
                category: 'general'
            };
        }
    }

    /**
     * 🏷️ 카테고리별 챗봇 응답을 가져옵니다
     * @param message 사용자 메시지
     * @param category 카테고리 (order, shipping, return, etc.)
     * @param context 사용자 컨텍스트
     * @returns 카테고리별 챗봇 응답
     */
    static async getCategorizedResponse(
        message: string,
        category: string,
        context?: UserContext
    ): Promise<string> {
        try {
            const requestBody = {
                message: message.trim(),
                category,
                context: context || null,
                timestamp: new Date().toISOString()
            };

            const response = await fetch(`${this.API_BASE_URL}/category/${category}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ChatbotApiResponse = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || '카테고리별 챗봇 응답을 가져오는데 실패했습니다.');
            }

            return result.data.response;
            
        } catch (error) {
            console.error('카테고리별 챗봇 API 호출 중 오류:', error);
            return this.getFallbackResponse(message);
        }
    }

    /**
     * 🛡️ API 호출 실패 시 사용할 기본 응답 (키워드 기반)
     * @param message 사용자 메시지
     * @returns 기본 응답
     */
    private static getFallbackResponse(message: string): string {
        const lowerMessage = message.toLowerCase();
        
        // 🔍 키워드 기반 기본 응답 (DB 연결 실패 시 사용)
        if (lowerMessage.includes('주문 취소') || lowerMessage.includes('취소')) {
            return '주문 취소를 도와드리겠습니다. 주문번호를 알려주시면 취소 처리해드릴게요.';
        } else if (lowerMessage.includes('주문 확인') || lowerMessage.includes('주문 조회')) {
            return '주문 확인을 위해 주문번호나 휴대폰 번호를 입력해주세요.';
        } else if (lowerMessage.includes('배송') || lowerMessage.includes('배송 조회')) {
            return '배송 조회를 위해 주문번호를 입력해주시거나 로그인 후 마이페이지에서 확인 가능합니다.';
        } else if (lowerMessage.includes('반품')) {
            return '반품 신청을 도와드리겠습니다. 주문번호와 반품 사유를 알려주세요.';
        } else if (lowerMessage.includes('교환')) {
            return '교환 신청을 접수하겠습니다. 주문번호와 교환하고 싶은 상품 정보를 알려주세요.';
        } else if (lowerMessage.includes('결제')) {
            return '결제 관련 문의사항을 도와드리겠습니다. 어떤 결제 문제가 있으신가요?';
        } else if (lowerMessage.includes('로그인')) {
            return '로그인에 문제가 있으시군요. 아이디/비밀번호 찾기나 계정 관련 도움이 필요하시면 말씀해주세요.';
        } else if (lowerMessage.includes('상품 문의') || lowerMessage.includes('상품')) {
            return '상품에 대해 궁금한 점이 있으시군요. 어떤 상품에 대해 알고 싶으신가요?';
        } else if (lowerMessage.includes('고객센터') || lowerMessage.includes('연락처')) {
            return '고객센터 운영시간은 평일 오전 9시부터 오후 6시까지입니다. 전화번호: 1588-0000';
        } else if (lowerMessage.includes('안녕') || lowerMessage.includes('hello')) {
            return '안녕하세요! 무엇을 도와드릴까요?';
        } else if (lowerMessage.includes('감사') || lowerMessage.includes('고마')) {
            return '천만에요! 또 다른 도움이 필요하시면 언제든 말씀해주세요.';
        } else {
            return '죄송합니다. 현재 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주시거나 고객센터(1588-0000)로 문의해주세요.';
        }
    }

    /**
     * 📚 대화 기록을 저장합니다
     * @param sessionId 세션 ID
     * @param userMessage 사용자 메시지
     * @param botResponse 봇 응답
     * @param userId 사용자 ID (선택적)
     */
    static async saveChatHistory(
        sessionId: string,
        userMessage: string,
        botResponse: string,
        userId?: string
    ): Promise<void> {
        try {
            await fetch(`${this.API_BASE_URL}/history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    userMessage,
                    botResponse,
                    userId,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('대화 기록 저장 중 오류:', error);
            // 💡 저장 실패는 사용자 경험에 영향을 주지 않으므로 조용히 처리
        }
    }
}

// 🎯 ChatInterface에서 사용할 헬퍼 함수
export const createChatbotResponseFetcher = (sessionId: string, userId?: string) => {
    return async (message: string): Promise<string> => {
        const context: UserContext = {
            sessionId,
            userId
        };
        
        const response = await ChatbotService.getChatbotResponse(message, context);
        
        // 📚 대화 기록 저장 (비동기적으로 처리, 에러가 발생해도 사용자 경험에 영향 없음)
        ChatbotService.saveChatHistory(sessionId, message, response, userId);
        
        return response;
    };
};

/* 
✨ 사용 예시:

// ChatInterface.tsx에서
import { createChatbotResponseFetcher } from '../service/chatbotService';

const ChatInterface = ({ messages, setMessages }: ChatInterfaceProps) => {
    // ... 기존 코드 ...
    
    // 🔑 세션 ID 생성 (페이지 로드 시 한 번)
    const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
    const userId = getCurrentUserId(); // 실제 구현 필요
    
    // 🤖 챗봇 응답 함수 생성
    const fetchChatbotResponse = createChatbotResponseFetcher(sessionId, userId);
    
    // simulateBotResponse 함수에서 사용
    const simulateBotResponse = async (userMessage: string, currentMessages: Message[]) => {
        setIsTyping(true);
        
        try {
            const botResponse = await fetchChatbotResponse(userMessage);
            // ... 응답 처리 로직
        } catch (error) {
            // ... 에러 처리 로직
        } finally {
            setIsTyping(false);
        }
    };
};
*/