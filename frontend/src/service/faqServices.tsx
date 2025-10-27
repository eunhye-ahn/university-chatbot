// services/faqservices.ts

import type { ReactNode } from "react";
import React from "react";


export interface FAQResponse {
    id: number;
    title: string;
    response: string;
    options?: string[];
}

// FAQ 데이터 타입
export interface FAQItem {
    id: number;
    title: ReactNode;
    description: ReactNode;
}

// 임시 FAQ 목록 (실제로는 서버에서 관리)
export const FAQ_ITEMS: FAQItem[] = [
    {
        id: 1, title: (<span className="faq-title-inline"><img src="/icons/schedule.svg" alt="학사일정" className="faq-icon" />
            <span className="faq-title-text">학사일정</span>
        </span>), description: (
            <div>
                학사일정이 궁금하신가요?<br />
                학사일정 페이지에서 등록,수강,시험,휴복학, 졸업 등 연간 학사 일정을 확인할 수 있어요
            </div>
        )
    },
    {
        id: 2, title: (<span className="faq-title-inline"><img src="/icons/curriculum.svg" alt="교육과정" className="faq-icon" />
            <span className="faq-title-text">교육과정</span>
        </span>), description: (
            <div>
                교육과정 페이지에서 전공 및 교양과목, 이수 학점, 교육 목표 등 상세한 커리큘럼을 확인할 수 있어요.        </div>
        )
    },
    {
        id: 3, title: (<span className="faq-title-inline"><img src="/icons/scholarship.svg" alt="장학금" className="faq-icon" />
            <span className="faq-title-text">장학금</span>
        </span>), description: (
            <div>
                등록금 납부 일정 및 방법이 궁금하신가요?학부, 대학원 등록금 납부 일정 및 납부 방법에 관한 더 자세한 내용은 아래 버튼을 눌러 확인해보세요.
            </div>
        )
    },
    { id: 4, title: (<span className="faq-title-inline"><img src="/icons/lab.svg" alt="실험실" className="faq-icon" />
            <span className="faq-title-text">실험실</span>
        </span>), description: (
            <div>
 실험실 안내 페이지에서 이용 시간, 예약 방법, 안전 수칙 등 실험실 이용에 필요한 정보를 확인할 수 있어요.            </div>
        )
    },
    { id: 5, title: (<span className="faq-title-inline"><img src="/icons/library.svg" alt="도서관" className="faq-icon" />
            <span className="faq-title-text">도서관</span>
        </span>), description: (
            <div>
 실험실 안내 페이지에서 이용 시간, 예약 방법, 안전 수칙 등 실험실 이용에 필요한 정보를 확인할 수 있어요.            </div>
        )
    },
    { id: 6, title: (<span className="faq-title-inline"><img src="/icons/call.svg" alt="교내연락처" className="faq-icon" />
            <span className="faq-title-text">교내연락처</span>
        </span>), description: (
            <div>
 실험실 안내 페이지에서 이용 시간, 예약 방법, 안전 수칙 등 실험실 이용에 필요한 정보를 확인할 수 있어요.            </div>
        )
    },
    { id: 7, title: (<span className="faq-title-inline"><img src="/icons/buss.svg" alt="셔틀버스" className="faq-icon" />
            <span className="faq-title-text">셔틀버스</span>
        </span>), description: (
            <div>
 실험실 안내 페이지에서 이용 시간, 예약 방법, 안전 수칙 등 실험실 이용에 필요한 정보를 확인할 수 있어요.            </div>
        )
    },
    { id: 8, title: (<span className="faq-title-inline"><img src="/icons/amenities.svg" alt="편의시설" className="faq-icon" />
            <span className="faq-title-text">편의시설</span>
        </span>), description: (
            <div>
 실험실 안내 페이지에서 이용 시간, 예약 방법, 안전 수칙 등 실험실 이용에 필요한 정보를 확인할 수 있어요.            </div>
        )
    },
    { id: 9, title: (<span className="faq-title-inline"><img src="/icons/restaurant.svg" alt="식도락" className="faq-icon" />
            <span className="faq-title-text">식도락</span>
        </span>), description: (
            <div>
 실험실 안내 페이지에서 이용 시간, 예약 방법, 안전 수칙 등 실험실 이용에 필요한 정보를 확인할 수 있어요.            </div>
        )
    },
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
            options: ["이번달 학사일정 보러가기", "전체 학사일정 보러가기"]

        },
        2: {
            id: 2,
            title: "계정 관리",
            response: "계정 관리에 관한 도움이 필요하시군요. 계정 설정 변경, 비밀번호 재설정, 프로필 수정 등에 대해 안내해 드릴 수 있습니다. 구체적으로 어떤 부분이 궁금하신가요?",
            options: ["교육과정 보러가기"]

        },
        3: {
            id: 3,
            title: "결제 및 환불",
            response: "결제 및 환불 정책에 대해 궁금하신가요? 결제 방법, 요금제, 환불 절차, 환불 조건 등에 대해 상세히 안내해 드리겠습니다.",
            options: ["등록금 고지서 출력 상세보기", "등록금 납부방법 상세보기", "등록금 납부내역 확인하기"]

        },
        4: {
            id: 4,
            title: "기술 지원",
            response: "기술적 문제가 발생하셨나요? 로그인 문제, 화면 표시 오류, 기능 작동 불량 등 다양한 기술적 이슈에 대해 해결 방법을 안내해 드리겠습니다.",
            options: ["실험실 소개", "실험실 안전수칙"]

        },
        5: {
            id: 5,
            title: "개인정보 보호",
            response: "개인정보 처리방침에 대해 안내해 드리겠습니다. 개인정보 수집 및 이용, 보관 기간, 제3자 제공, 개인정보 보호 조치 등에 대한 내용을 확인하실 수 있습니다.",
                        options: ["등록금 고지서 출력 상세보기", "등록금 납부방법 상세보기", "등록금 납부내역 확인하기"]

        },
        6: {
            id: 6,
            title: "서비스 정책",
            response: "서비스 이용정책에 대해 궁금하신 점이 있으시군요. 서비스 이용 규칙, 사용자 권리와 의무, 제한사항 등에 대해 자세히 설명해 드릴 수 있습니다.",
                        options: ["등록금 고지서 출력 상세보기", "등록금 납부방법 상세보기", "등록금 납부내역 확인하기"]

        },
        7: {
            id: 7,
            title: "문의 및 신고",
            response: "추가 문의사항이 있으시면 언제든 연락해 주세요. 이메일, 전화, 온라인 채팅 등 다양한 방법으로 문의하실 수 있으며, 빠른 시간 내에 답변해 드리겠습니다.",
                        options: ["등록금 고지서 출력 상세보기", "등록금 납부방법 상세보기", "등록금 납부내역 확인하기"]

        },
        8: {
            id: 8,
            title: "업데이트 정보",
            response: "최신 업데이트 정보를 확인하고 싶으시군요. 새로운 기능 추가, 성능 개선, 버그 수정 등 최근 업데이트 내역에 대해 안내해 드릴 수 있습니다.",
                        options: ["등록금 고지서 출력 상세보기", "등록금 납부방법 상세보기", "등록금 납부내역 확인하기"]

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