import { useState, useEffect } from 'react';
import { FAQ_ITEMS, fetchFAQData } from '../service/faqServices';
import type { FAQResponse } from '../service/faqServices';

// 세부 항목 정보 타입 (DB 연동 시 확장 예정)
interface FAQSubItem {
    text: string;
    index: number;
    parentId: number;
    // 추후 DB 연동 시 추가될 필드들:
    // subItemId?: number;
    // category?: string;
    // priority?: number;
}

// Props 타입 정의
interface FAQProps {
    isOpen: boolean;
    onClose: () => void;
    onSendMessage: (title: string, id: number) => void;
    onSubItemClick: (subItem: FAQSubItem) => void; // 세부 항목 클릭 처리
}

const FAQ: React.FC<FAQProps> = ({ isOpen, onClose, onSendMessage, onSubItemClick }) => {
    const [isMaximized, setIsMaximized] = useState(false);
    const [faqData, setFaqData] = useState<Record<number, FAQResponse>>({});
    const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});

    // FAQ 데이터 로드 함수 (에러 처리 및 로딩 상태 개선)
    const loadFAQData = async (faqId: number) => {
        if (faqData[faqId] || loadingStates[faqId]) return;

        setLoadingStates(prev => ({ ...prev, [faqId]: true }));
        
        try {
            const data = await fetchFAQData(faqId);
            setFaqData(prev => ({ ...prev, [faqId]: data }));
        } catch (error) {
            console.error(`FAQ ${faqId} 데이터 로드 실패:`, error);
            // 에러 상태도 관리할 수 있도록 추후 확장 가능
        } finally {
            setLoadingStates(prev => ({ ...prev, [faqId]: false }));
        }
    };

    // FAQ 세부 옵션 가져오기
    const getSubItems = (faqId: number): string[] => {
        const data = faqData[faqId];
        return data?.options || [];
    };

    // 최대화 시 모든 FAQ 데이터 미리 로드
    useEffect(() => {
        if (isMaximized) {
            FAQ_ITEMS.forEach(item => {
                loadFAQData(item.id);
            });
        }
    }, [isMaximized]);

    // FAQ 메인 카테고리 클릭 처리
    const handleFAQClick = (title: string, id: number) => {
        onSendMessage(title, id);
        onClose();
    };

    // 세부 항목 클릭 처리 (DB 연동 대비 구조화된 데이터 전달)
    const handleSubItemClick = (optionText: string, parentId: number, optionIndex: number) => {
        const subItemData: FAQSubItem = {
            text: optionText,
            index: optionIndex,
            parentId: parentId,
            // 추후 DB 연동 시 추가 정보:
            // subItemId: calculateSubItemId(parentId, optionIndex),
            // category: getParentCategory(parentId),
            // priority: getOptionPriority(optionText)
        };

        onSubItemClick(subItemData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={isMaximized ? 'faq-fullscreen' : 'faq-container-small'}>
            {/* 헤더 */}
            <div className="faq-header">
                <h3>자주 묻는 질문 (FAQ)</h3>
                <div className="faq-controls">
                    <button 
                        className="faq-control-btn"
                        onClick={() => setIsMaximized(!isMaximized)}
                        title={isMaximized ? "창 크기 줄이기" : "창 최대화"}
                    >
                        {isMaximized ? '🗗' : '🗖'}
                    </button>
                    <button 
                        className="faq-control-btn close-btn"
                        onClick={onClose}
                        title="닫기"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* FAQ 내용 */}
            <div className="faq-content">
                {FAQ_ITEMS.map((item, index) => {
                    const subItems = getSubItems(item.id);
                    const isLoading = loadingStates[item.id];
                    
                    return (
                        <div key={item.id}>
                            <div className="faq-item">
                                <div 
                                    className="faq-question"
                                    onClick={() => handleFAQClick(item.title, item.id)}
                                >
                                    {isMaximized ? (
                                        <div>
                                            <div className="faq-title">
                                                {item.title}
                                            </div>
                                            <div className="faq-description">
                                                {item.description}
                                            </div>
                                        </div>
                                    ) : (
                                        item.title
                                    )}
                                </div>
                            </div>

                            {/* 최대화 화면에서만 세부 항목들 표시 */}
                            {isMaximized && (
                                <div className="faq-sub-section">
                                    {isLoading ? (
                                        <div className="faq-loading">로딩 중...</div>
                                    ) : subItems.length > 0 ? (
                                        <div className="faq-sub-items">
                                            {subItems.map((optionText, subIndex) => (
                                                <button
                                                    key={`${item.id}-${subIndex}`}
                                                    className="faq-sub-item-btn"
                                                    onClick={() => handleSubItemClick(optionText, item.id, subIndex)}
                                                >
                                                    [{optionText}]
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="faq-no-options">세부 옵션이 없습니다.</div>
                                    )}
                                </div>
                            )}

                            {/* 구분선 (마지막 항목이 아닐 때만) */}
                            {isMaximized && index < FAQ_ITEMS.length - 1 && (
                                <hr className="faq-divider" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FAQ;