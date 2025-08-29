import React, { useState, useEffect } from 'react';
import '../style/Guide.css';

const Guide: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'modal' | 'overlay'>('modal');
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const openGuide = () => {
        setIsOpen(true);
        setMode('modal'); // 항상 이미지 모달로 시작
        setImageError(false); // 이미지 오류 상태 리셋
    };

    const closeGuide = () => {
        setIsOpen(false);
        setMode('modal'); // 닫을 때 기본 모드로 리셋
    };

    const switchToOverlay = () => {
        setMode('overlay');
    };

    // 이미지 로드 에러 처리
    const handleImageError = () => {
        setImageError(true);
    };

    // ESC 키로 닫기
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                closeGuide();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen]);

    if (!isOpen) return (
        <button
            onClick={openGuide}
            className="guide-button"
            aria-label="이용안내"
        >
            <img src={isHovered ? "/icons/Guide.svg" : "/icons/Guide_close.svg"} alt="이용안내"
            onMouseEnter={()=> setIsHovered(true)}
            onMouseLeave={()=> setIsHovered(false)}
             />
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
        </button>
    );

    // 모드 1: 이미지 모달 + 좌우 버튼
    if (mode === 'modal') {
        return (
            <div 
                className="guide-modal-overlay"
            >
                {/* 오버레이 우측 최상단 닫기 버튼 */}
                <button
                    onClick={closeGuide}
                    className="guide-overlay-close-fixed"
                    aria-label="닫기"
                >
                    ✕
                </button>

                {/* 왼쪽 < 버튼 (현재는 비활성, 추후 확장 가능) */}
                <button 
                    className="guide-nav-button guide-nav-left"
                    aria-label="이전"
                >
                    &lt;
                </button>

                {/* 이미지 모달 (메인 컨텐츠) */}
                <div 
                    className="guide-image-container"
                >
                    {/* 이미지 요소 - public 폴더 경로 사용 */}
                    <img 
                        src="/image/guide-image.png"
                        alt="이용안내 이미지"
                        className="guide-main-image"
                        onError={handleImageError}
                        style={{ display: imageError ? 'none' : 'block' }}
                    />
                    
                    {/* 이미지가 로드되지 않을 때를 위한 fallback */}
                    <div 
                        className="guide-image-fallback"
                        style={{ display: imageError ? 'flex' : 'none' }}
                    >
                        <h2>이용안내</h2>
                        <p>이미지를 불러올 수 없습니다</p>
                        <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
                            파일 경로: public/image/guide-image.png
                        </p>
                    </div>
                </div>

                {/* 오른쪽 > 버튼 (검은색 오버레이로 전환) */}
                <button 
                    className="guide-nav-button guide-nav-right"
                    onClick={switchToOverlay}
                    aria-label="단순 모드로 전환"
                >
                    &gt;
                </button>
            </div>
        );
    }

    // 모드 2: 검은색 오버레이만
    return (
        <div 
            className="guide-simple-overlay"
        >
            {/* 닫기 버튼만 */}
            <button
                onClick={closeGuide}
                className="guide-overlay-close"
                aria-label="닫기"
            >
                <svg className="guide-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default Guide;