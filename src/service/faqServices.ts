// services/faqService.tsx

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
    { id: 1, title: "서비스 이용방법", description: "기본적인 서비스 사용법을 안내합니다" },
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
    try {
        // 실제 환경에서는 여기서 서버 API 호출
        const response = await fetch(`/api/faq/${faqId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('FAQ API Error:', error);
        
        // API 실패 시 더미 데이터 반환 (개발용)
        return getFallbackFAQData(faqId);
    }
};

// API 실패 시 사용할 더미 데이터 (개발/테스트용)
const getFallbackFAQData = (faqId: number): FAQResponse => {
    const fallbackData: { [key: number]: FAQResponse } = {
        1: {
            id: 1,
            title: "서비스 이용방법",
            response: "서비스 이용방법을 안내해드립니다. 아래 세부 항목을 선택해주세요.",
            options: ["회원가입 방법", "기본 사용법", "고급 기능", "문제 해결"]
        },
        2: {
            id: 2,
            title: "계정 관리",
            response: "계정 관리와 관련된 도움말입니다.",
            options: ["비밀번호 변경", "프로필 수정", "계정 삭제", "보안 설정"]
        },
        3: {
            id: 3,
            title: "결제 및 환불",
            response: "결제 및 환불 정책을 안내해드립니다.",
            options: ["결제 방법", "환불 신청", "결제 내역", "요금제 안내"]
        },
        4: {
            id: 4,
            title: "기술 지원",
            response: "기술적인 문제 해결을 도와드립니다.",
            options: ["접속 오류", "기능 오류", "성능 문제", "호환성 문제"]
        },
        5: {
            id: 5,
            title: "개인정보 보호",
            response: "개인정보 보호정책에 대해 안내해드립니다.",
            options: ["정보 수집", "정보 이용", "정보 제공", "정보 보관"]
        },
        6: {
            id: 6,
            title: "서비스 정책",
            response: "서비스 이용정책을 확인하실 수 있습니다.",
            options: ["이용약관", "커뮤니티 규칙", "금지 사항", "제재 정책"]
        },
        7: {
            id: 7,
            title: "문의 및 신고",
            response: "문의사항이나 신고가 있으시면 도와드리겠습니다.",
            options: ["일반 문의", "기술 문의", "신고하기", "제안하기"]
        },
        8: {
            id: 8,
            title: "업데이트 정보",
            response: "최신 업데이트 정보를 확인하세요.",
            options: ["최근 업데이트", "예정 업데이트", "패치 노트", "공지사항"]
        },
        9: {
            id: 9,
            title: "기타 문의",
            response: "기타 궁금한 사항이 있으시면 문의해주세요.",
            options: ["일반 질문", "제안 사항", "파트너십", "언론 문의"]
        }
    };

    return fallbackData[faqId] || {
        id: faqId,
        title: "알 수 없는 FAQ",
        response: "요청하신 FAQ 항목을 찾을 수 없습니다.",
        options: []
    };
};