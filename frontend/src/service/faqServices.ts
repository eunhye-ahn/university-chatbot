// services/faqservices.ts

export interface FAQResponse {
    id: number;
    title: string;
    response: string;
    options?: string[];
}

// FAQ 데이터 타입
export interface FAQItem {
    id: number;
    title: string;
    description: string;
}

// 임시 FAQ 목록 (실제로는 서버에서 관리)
export const FAQ_ITEMS: FAQItem[] = [
    { id: 1, title: "챗봇 사용법", description: "기본적인 서비스 사용법을 안내합니다" },
    { id: 2, title: "계정 관리", description: "계정 설정 및 관리 방법입니다" },
    { id: 3, title: "결제 및 환불", description: "결제 방법과 환불 정책입니다" },
    { id: 4, title: "기술 지원", description: "기술적인 문제 해결 방법입니다" },
    { id: 5, title: "개인정보 보호", description: "개인정보 처리방침 안내입니다" },
    { id: 6, title: "서비스 정책", description: "이용약관 및 정책 안내입니다" },
    { id: 7, title: "문의 및 신고", description: "고객센터 문의 방법입니다" },
    { id: 8, title: "업데이트 정보", description: "최신 업데이트 및 공지사항입니다" },
    { id: 9, title: "기타 문의", description: "기타 궁금한 사항들입니다" }
];

// FAQ 데이터를 가져오는 API 함수
export const fetchFAQData = async (faqId: number): Promise<FAQResponse> => {
    console.log('🔍 fetchFAQData 호출됨 - faqId:', faqId);
    
    try {
        // ========== 추후 API 호출 시 사용할 코드 (현재 주석 처리) ==========
        // console.log('📡 API 호출 시도:', `/api/faq/${faqId}`);
        // const response = await fetch(`/api/faq/${faqId}`, {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        // });

        // if (!response.ok) {
        //     throw new Error(`HTTP error! status: ${response.status}`);
        // }

        // const data = await response.json();
        // console.log('✅ API 응답 성공:', data);
        // return data;

        // ========== 현재는 API 호출하지 않고 바로 fallback 데이터 사용 ==========
        console.log('📋 API 호출 없이 fallback 데이터 사용');
        return getFallbackFAQData(faqId);

    } catch (error) {
        console.error('❌ FAQ API Error:', error);
        
        // API 실패 시 더미 데이터 반환 (개발용)
        return getFallbackFAQData(faqId);
    }
};

// API 실패 시 사용할 더미 데이터 (개발/테스트용)
const getFallbackFAQData = (faqId: number): FAQResponse => {
    console.log('🔍 getFallbackFAQData 호출됨 - faqId:', faqId, 'type:', typeof faqId);
    
    // faqId가 숫자가 아닌 경우 처리
    if (typeof faqId !== 'number' || isNaN(faqId)) {
        console.error('❌ 잘못된 faqId 타입:', faqId, typeof faqId);
        return {
            id: 0,
            title: "오류",
            response: "FAQ 요청 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
            options: []
        };
    }
    
    const fallbackData: { [key: number]: FAQResponse } = {
        1: {
            id: 1,
            title: "챗봇 사용법",
            response: "안녕하세요! 저는 AI 챗봇입니다. 궁금한 것이 있으시면 언제든 질문해 주세요. 텍스트로 대화하실 수 있으며, 다양한 주제에 대해 도움을 드릴 수 있습니다.",
            options: ["회원가입 방법", "기본 사용법", "고급 기능", "문제 해결"]
        },
        2: {
            id: 2,
            title: "계정 관리",
            response: "계정 관리에 관한 도움이 필요하시군요. 계정 설정 변경, 비밀번호 재설정, 프로필 수정 등에 대해 안내해 드릴 수 있습니다. 구체적으로 어떤 부분이 궁금하신가요?",
            options: ["비밀번호 변경", "프로필 수정", "계정 삭제", "보안 설정"]
        },
        3: {
            id: 3,
            title: "결제 및 환불",
            response: "결제 및 환불 정책에 대해 궁금하신가요? 결제 방법, 요금제, 환불 절차, 환불 조건 등에 대해 상세히 안내해 드리겠습니다.",
            options: ["결제 방법", "환불 신청", "결제 내역", "요금제 안내"]
        },
        4: {
            id: 4,
            title: "기술 지원",
            response: "기술적 문제가 발생하셨나요? 로그인 문제, 화면 표시 오류, 기능 작동 불량 등 다양한 기술적 이슈에 대해 해결 방법을 안내해 드리겠습니다.",
            options: ["접속 오류", "기능 오류", "성능 문제", "호환성 문제"]
        },
        5: {
            id: 5,
            title: "개인정보 보호",
            response: "개인정보 처리방침에 대해 안내해 드리겠습니다. 개인정보 수집 및 이용, 보관 기간, 제3자 제공, 개인정보 보호 조치 등에 대한 내용을 확인하실 수 있습니다.",
            options: ["정보 수집", "정보 이용", "정보 제공", "정보 보관"]
        },
        6: {
            id: 6,
            title: "서비스 정책",
            response: "서비스 이용정책에 대해 궁금하신 점이 있으시군요. 서비스 이용 규칙, 사용자 권리와 의무, 제한사항 등에 대해 자세히 설명해 드릴 수 있습니다.",
            options: ["이용약관", "커뮤니티 규칙", "금지 사항", "제재 정책"]
        },
        7: {
            id: 7,
            title: "문의 및 신고",
            response: "추가 문의사항이 있으시면 언제든 연락해 주세요. 이메일, 전화, 온라인 채팅 등 다양한 방법으로 문의하실 수 있으며, 빠른 시간 내에 답변해 드리겠습니다.",
            options: ["일반 문의", "기술 문의", "신고하기", "제안하기"]
        },
        8: {
            id: 8,
            title: "업데이트 정보",
            response: "최신 업데이트 정보를 확인하고 싶으시군요. 새로운 기능 추가, 성능 개선, 버그 수정 등 최근 업데이트 내역에 대해 안내해 드릴 수 있습니다.",
            options: ["최근 업데이트", "예정 업데이트", "패치 노트", "공지사항"]
        },
        9: {
            id: 9,
            title: "기타 문의",
            response: "자주 묻는 질문들을 정리해 드릴게요. 가장 많이 문의하시는 내용들과 그에 대한 답변을 제공해 드리겠습니다. 다른 궁금한 점도 언제든 물어보세요!",
            options: ["일반 질문", "제안 사항", "파트너십", "언론 문의"]
        }
    };

    const result = fallbackData[faqId];
    console.log('🔍 fallbackData에서 찾은 결과:', result);

    if (!result) {
        console.log('❌ faqId를 찾을 수 없음:', faqId, '사용 가능한 ID:', Object.keys(fallbackData));
        return {
            id: faqId,
            title: "FAQ 항목 없음",
            response: `죄송합니다. 요청하신 FAQ 항목(ID: ${faqId})이 아직 준비되지 않았습니다. 곧 업데이트 예정입니다.`,
            options: []
        };
    }

    console.log('✅ fallback 데이터 반환 성공:', result.title);
    return result;
};

// ========== 추가 유틸리티 함수들 ==========

// FAQ 항목 존재 여부 확인
export const isFAQExists = (faqId: number): boolean => {
    return FAQ_ITEMS.some(item => item.id === faqId);
};

// 모든 FAQ 제목 가져오기
export const getAllFAQTitles = (): string[] => {
    return FAQ_ITEMS.map(item => item.title);
};

// FAQ ID로 기본 정보 가져오기 (API 호출 없이)
export const getFAQBasicInfo = (faqId: number): FAQItem | null => {
    return FAQ_ITEMS.find(item => item.id === faqId) || null;
};

export const validateFAQData = () => {
    console.log('🔍 FAQ_ITEMS 검증:', FAQ_ITEMS);
    console.log('🔍 사용 가능한 FAQ ID들:', FAQ_ITEMS.map(item => item.id));
    
    FAQ_ITEMS.forEach(item => {
        console.log(`FAQ ${item.id}: ${item.title} (타입: ${typeof item.id})`);
    });
};