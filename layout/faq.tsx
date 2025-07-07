import { useState } from 'react';
import './faq.css';

interface FAQProps {
    isOpen: boolean;
    onClose: () => void;
    onSendMessage: (title: string, response: string) => void; // 제목과 응답을 모두 전달
}

const FAQ = ({ isOpen, onClose, onSendMessage }: FAQProps) => {
    const [isMaximized, setIsMaximized] = useState(false);

    // FAQ 메뉴 데이터
    const faqItems = [
        { id: 1, title: "챗봇 사용법", response: "안녕하세요! 저는 AI 챗봇입니다. 궁금한 것이 있으시면 언제든 질문해 주세요. 텍스트로 대화하실 수 있으며, 다양한 주제에 대해 도움을 드릴 수 있습니다." },
        { id: 2, title: "계정 관리", response: "계정 관리에 관한 도움이 필요하시군요. 계정 설정 변경, 비밀번호 재설정, 프로필 수정 등에 대해 안내해 드릴 수 있습니다. 구체적으로 어떤 부분이 궁금하신가요?" },
        { id: 3, title: "기술적 문제", response: "기술적 문제가 발생하셨나요? 로그인 문제, 화면 표시 오류, 기능 작동 불량 등 다양한 기술적 이슈에 대해 해결 방법을 안내해 드리겠습니다." },
        { id: 4, title: "서비스 이용약관", response: "서비스 이용약관에 대해 궁금하신 점이 있으시군요. 서비스 이용 규칙, 사용자 권리와 의무, 제한사항 등에 대해 자세히 설명해 드릴 수 있습니다." },
        { id: 5, title: "개인정보 처리방침", response: "개인정보 처리방침에 대해 안내해 드리겠습니다. 개인정보 수집 및 이용, 보관 기간, 제3자 제공, 개인정보 보호 조치 등에 대한 내용을 확인하실 수 있습니다." },
        { id: 6, title: "결제 및 환불", response: "결제 및 환불 정책에 대해 궁금하신가요? 결제 방법, 요금제, 환불 절차, 환불 조건 등에 대해 상세히 안내해 드리겠습니다." },
        { id: 7, title: "문의하기", response: "추가 문의사항이 있으시면 언제든 연락해 주세요. 이메일, 전화, 온라인 채팅 등 다양한 방법으로 문의하실 수 있으며, 빠른 시간 내에 답변해 드리겠습니다." },
        { id: 8, title: "업데이트 정보", response: "최신 업데이트 정보를 확인하고 싶으시군요. 새로운 기능 추가, 성능 개선, 버그 수정 등 최근 업데이트 내역에 대해 안내해 드릴 수 있습니다." },
        { id: 9, title: "자주 묻는 질문", response: "자주 묻는 질문들을 정리해 드릴게요. 가장 많이 문의하시는 내용들과 그에 대한 답변을 제공해 드리겠습니다. 다른 궁금한 점도 언제든 물어보세요!" }
    ];

    const handleMaximize = () => {
        setIsMaximized(true);
    };

    const handleMinimize = () => {
        setIsMaximized(false);
    };

    const handleClose = () => {
        setIsMaximized(false);
        onClose();
    };

    const handleFAQClick = (item: { id: number; title: string; response: string }) => {
        onSendMessage(item.title, item.response);
        // FAQ 창을 닫지 않고 유지
    };

    if (!isOpen) return null;

    return (
        <>
            {/* 최대화된 경우 전체 화면 */}
            {isMaximized ? (
                <div className="faq-fullscreen">
                    <div className="faq-header">
                        <h3>자주 묻는 질문</h3>
                        <div className="faq-controls">
                            <button 
                                className="faq-control-btn minimize-btn" 
                                onClick={handleMinimize}
                                title="최소화"
                            >
                                ⊟
                            </button>
                            <button 
                                className="faq-control-btn close-btn" 
                                onClick={handleClose}
                                title="닫기"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                    <div className="faq-content">
                        {faqItems.map((item) => (
                            <div key={item.id} className="faq-item">
                                <div 
                                    className="faq-question" 
                                    onClick={() => handleFAQClick(item)}
                                >
                                    <span>{item.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* 최소화된 경우 작은 창 */
                <div className="faq-container-small">
                    <div className="faq-header">
                        <h3>FAQ</h3>
                        <div className="faq-controls">
                            <button 
                                className="faq-control-btn maximize-btn" 
                                onClick={handleMaximize}
                                title="최대화"
                            >
                                ⛶
                            </button>
                            <button 
                                className="faq-control-btn close-btn" 
                                onClick={handleClose}
                                title="닫기"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                    <div className="faq-content">
                        {faqItems.map((item) => (
                            <div key={item.id} className="faq-item">
                                <div 
                                    className="faq-question" 
                                    onClick={() => handleFAQClick(item)}
                                >
                                    <span>{item.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default FAQ;