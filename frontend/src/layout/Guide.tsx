import React, { useState } from 'react';
import '../style/guide.css';

const Guide: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const openGuide = () => {
        setIsOpen(true);
    };

    const closeGuide = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* 이용안내 버튼 - group 클래스 추가 */}
            <button
                onClick={openGuide}
                className="guide-button group"
                aria-label="이용안내"
            >
                {/* 이미지로 교체할 경우 아래 주석을 해제하고 SVG 부분을 삭제하세요 */}
                {/* 
                <img 
                    src="/path/to/your/guide-icon.png" 
                    alt="이용안내" 
                    className="guide-button-icon"
                />
                */}
                
                {/* 임시 SVG 아이콘 */}
                <svg 
                    className="guide-button-svg" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                </svg>
            </button>

            {/* 모달 오버레이 */}
            {isOpen && (
                <div 
                    className="guide-overlay"
                    onClick={closeGuide}
                >
                    <div 
                        className="guide-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 모달 헤더 */}
                        <div className="guide-header">
                            <h2 className="guide-title">이용안내</h2>
                            <button
                                onClick={closeGuide}
                                className="guide-close-button"
                                aria-label="닫기"
                            >
                                <svg className="guide-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* 모달 내용 */}
                        <div className="guide-content">
                            <div className="guide-info-section guide-info-blue">
                                <h3 className="guide-info-title">
                                    <span className="guide-emoji">💬</span>
                                    채팅 방법
                                </h3>
                                <p className="guide-info-text">화면 하단의 입력창에 질문을 입력하고 전송 버튼을 클릭하거나 엔터를 누르세요.</p>
                            </div>
                            
                            <div className="guide-info-section guide-info-green">
                                <h3 className="guide-info-title">
                                    <span className="guide-emoji">🤖</span>
                                    AI 기능
                                </h3>
                                <p className="guide-info-text">일반적인 질문부터 전문적인 내용까지 다양한 주제에 대해 답변해드립니다.</p>
                            </div>
                            
                            <div className="guide-info-section guide-info-yellow">
                                <h3 className="guide-info-title">
                                    <span className="guide-emoji">⚡</span>
                                    빠른 응답
                                </h3>
                                <p className="guide-info-text">실시간으로 AI가 답변을 생성하여 즉시 확인하실 수 있습니다.</p>
                            </div>
                            
                            <div className="guide-info-section guide-info-purple">
                                <h3 className="guide-info-title">
                                    <span className="guide-emoji">🔄</span>
                                    채팅 초기화
                                </h3>
                                <p className="guide-info-text">상단 헤더의 초기화 버튼을 클릭하여 대화 기록을 삭제할 수 있습니다.</p>
                            </div>
                            
                            <div className="guide-info-section guide-info-red">
                                <h3 className="guide-info-title">
                                    <span className="guide-emoji">🔒</span>
                                    개인정보 보호
                                </h3>
                                <p className="guide-info-text">모든 대화는 안전하게 보호되며, 개인정보는 수집하지 않습니다.</p>
                            </div>
                        </div>
                        
                        {/* 모달 푸터 */}
                        <div className="guide-footer">
                            <button
                                onClick={closeGuide}
                                className="guide-confirm-button"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Guide;