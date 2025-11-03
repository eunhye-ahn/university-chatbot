import { useState, useEffect, useCallback } from 'react';
import { FAQ_ITEMS, fetchFAQData } from '../service/faqServices';
import type { FAQResponse } from '../service/faqServices';

// 세부 항목 정보 타입 (DB 연동 시 확장 예정)
export interface FAQSubItem {
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
    // 🔧 수정: 에러 상태 관리 추가 - 사용자에게 에러 메시지 표시
    const [errorStates, setErrorStates] = useState<Record<number, string>>({});

    // 🔧 수정: useCallback으로 감싸서 의존성 배열 경고 해결
    // FAQ 데이터 로드 함수 (에러 처리 및 로딩 상태 개선)
    const loadFAQData = useCallback(async (faqId: number) => {
        if (faqData[faqId] || loadingStates[faqId]) return;

        setLoadingStates(prev => ({ ...prev, [faqId]: true }));
        // 🔧 수정: 에러 상태 초기화
        setErrorStates(prev => ({ ...prev, [faqId]: '' }));

        try {
            const data = await fetchFAQData(faqId);
            setFaqData(prev => ({ ...prev, [faqId]: data }));
        } catch (error) {
            console.error(`FAQ ${faqId} 데이터 로드 실패:`, error);
            // 🔧 수정: 사용자에게 보여줄 에러 메시지 저장
            const errorMessage = error instanceof Error ? error.message : '데이터를 불러올 수 없습니다.';
            setErrorStates(prev => ({ ...prev, [faqId]: errorMessage }));
        } finally {
            setLoadingStates(prev => ({ ...prev, [faqId]: false }));
        }
    }, [faqData, loadingStates]);

    // FAQ 세부 옵션 가져오기
    const getSubItems = (faqId: number): string[] => {
        const data = faqData[faqId];
        return data?.options || [];
    };

    // 🔧 수정: 의존성 배열에 loadFAQData 추가 - ESLint 경고 해결
    // 최대화 시 모든 FAQ 데이터 미리 로드
    useEffect(() => {
        if (isMaximized) {
            FAQ_ITEMS.forEach(item => {
                loadFAQData(item.id);
            });
        }
    }, [isMaximized, loadFAQData]);

    // FAQ 메인 카테고리 클릭 처리
    const handleFAQClick = (label: string | undefined, id: number) => {
        // ✅ label이 undefined일 경우 기본값 사용
        const title = label || `FAQ ${id}`;
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
            <div className={`faq-header  ${isMaximized ? 'faq-header--max' : ''}`}>
                <h3 className={`faq-title ${isMaximized ? 'faq-title--left' : ''}`}>
                    {isMaximized ? '자주 찾는 질문(FAQ)' : '자주 찾는 질문'}</h3>
                <div className="faq-controls">
                    <button
                        className="faq-control-btn"
                        onClick={() => {
                            if(isMaximized) {
                            setIsMaximized(false);
                        } else {
                            setIsMaximized(true);
                        }
                        }}
                        title={isMaximized ? "X" : "전체보기"}
                        aria-label={isMaximized? "X" : "전체보기"}
                    >
                        {isMaximized? "X" : "전체보기"}
                    </button>
                </div>
            </div>

            <div className='faq-scroll'>
                <div className='faq-scroll-viewport'>

                {/* FAQ 내용 */}
                <div className="faq-content">
                    {FAQ_ITEMS.map((item, index) => {
                        const subItems = getSubItems(item.id);
                        const isLoading = loadingStates[item.id];
                        // 🔧 수정: 에러 상태 확인
                        const errorMessage = errorStates[item.id];

                        return (
                            <div key={item.id}>
                                <div className="faq-item">
                                    <div
                                        className="faq-question"
                                        onClick={() => handleFAQClick(item.label, item.id)}
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
                                        ) : errorMessage ? (
                                            /* 🔧 수정: 에러 메시지 표시 */
                                            <div className="faq-error" style={{ color: 'red', padding: '10px' }}>
                                                ⚠️ {errorMessage}
                                            </div>
                                        ) : subItems.length > 0 ? (
                                            <div className="faq-sub-items">
                                                {subItems.map((optionText, subIndex) => (
                                                    <button
                                                        key={`${item.id}-${subIndex}`}
                                                        className="faq-sub-item-btn"
                                                        onClick={() => handleSubItemClick(optionText, item.id, subIndex)}
                                                    >
                                                        {optionText}
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
            </div>

        </div>
    );
};

export default FAQ;