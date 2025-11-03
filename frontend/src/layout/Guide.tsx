import React, { useState, useEffect, useRef } from 'react';
import '../style/Guide.css';

interface GuideStep {
    selector: string; // '.target-element', '#login-button' 등
    description: string;
    descriptionPosition?: 'top' | 'bottom' | 'left' | 'right';
}

const Guide: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlights, setSpotlights] = useState<Array<{
        top: number;
        left: number;
        width: number;
        height: number;
        description: string;
        descriptionPosition: 'top' | 'bottom' | 'left' | 'right';
    }>>([]);

    const targetRef = useRef<HTMLElement | null>(null);

    const guideSteps: GuideStep[] = [
        { selector: '.target-element-1', description: '다른 주제로 대화하고 싶다면, 새로고침을 클릭해주세요',
            descriptionPosition : 'top'
         },
        { selector: '.target-element-2', description: '쉽고 빠르게 원하는 언어로 소통해 보세요.' 
            ,descriptionPosition : 'bottom'
        },
        { selector: '.target-element-3', description: '세 번째 단계입니다!' },
    ];

    useEffect(() => {
        const updatePositions = () => {
            const positions = guideSteps.map(step => {
                const element = document.querySelector(step.selector) as HTMLElement;
                if (element) {
                    const rect = element.getBoundingClientRect();
                    return {
                        top: rect.top - 5,
                        left: rect.left - 5,
                        width: rect.width + 10,
                        height: rect.height + 5,
                        description: step.description,
                        descriptionPosition: step.descriptionPosition || 'bottom'
                    };
                }
                return null;
            }).filter(Boolean) as Array<{
                top: number;
                left: number;
                width: number;
                height: number;
                description: string;
                descriptionPosition: 'top' | 'bottom' | 'left' | 'right';
            }>;

            setSpotlights(positions);
        };

        updatePositions();
        
        window.addEventListener('resize', updatePositions);
        window.addEventListener('scroll', updatePositions);
        
        return () => {
            window.removeEventListener('resize', updatePositions);
            window.removeEventListener('scroll', updatePositions);
        };
    }, []);

    // 설명 텍스트 위치 계산 함수
    const getDescriptionStyle = (spotlight: typeof spotlights[0]) => {
        const baseStyle = {
            position: 'fixed' as const,
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 'bold' as const,
            zIndex: 1000,
            padding: '8px 12px',
        };

        switch (spotlight.descriptionPosition) {
            case 'top':
                return {
                    ...baseStyle,
                    top: `${spotlight.top}px`,
                    left: `${spotlight.left + spotlight.width}px`,
                };
            case 'bottom':
                return {
                    ...baseStyle,
                    top: `${spotlight.top + spotlight.height + 10}px`,
                    right: `20px`,

                };
            case 'left':
                return {
                    ...baseStyle,
                    top: `${spotlight.top + spotlight.height / 2}px`,
                    left: `${spotlight.left - 10}px`,
                    transform: 'translate(-100%, -50%)'
                };
            case 'right':
                return {
                    ...baseStyle,
                    top: `${spotlight.top + spotlight.height / 2}px`,
                    left: `${spotlight.left + spotlight.width + 10}px`,
                    transform: 'translateY(-50%)'
                };
            default:
                return {
                    ...baseStyle,
                    top: `${spotlight.top + spotlight.height + 10}px`,
                    left: `${spotlight.left + spotlight.width / 2}px`,
                    transform: 'translateX(-50%)'
                };
        }
    };
    
return (
        <div className="guide-overlay-container">
            {/* 회색 오버레이 */}
            <div 
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 999
                }}
            />
            
            {/* 둥근 모서리 직사각형 spotlight */}
{/* 모든 spotlight를 동시에 렌더링 */}
            {spotlights.map((spotlight, index) => (
                <React.Fragment key={index}>
                    {/* 둥근 모서리 직사각형 spotlight */}
                    <div
                        style={{
                            position: 'fixed',
                            top: `${spotlight.top}px`,
                            left: `${spotlight.left}px`,
                            width: `${spotlight.width}px`,
                            height: `${spotlight.height}px`,
                            border: '3px solid #FFFFFF',
                            borderRadius: '10px',
                            zIndex: 1000,
                            pointerEvents: 'none'
                        }}
                    />

                    <div style={getDescriptionStyle(spotlight)}>
                        {spotlight.description}
                    </div>
                </React.Fragment>
                                    
                //     <div
                //         style={{
                //             position: 'fixed',
                //             top: `${spotlight.top}px`,
                //             left: `${spotlight.left + spotlight.width}px`,
                //             color: '#ffffff',
                //             fontSize: '14px',
                //             fontWeight: 'bold',
                //             textAlign: 'center',
                //             zIndex: 1000,
                //             padding: '8px 12px',

                //             whiteSpace: 'nowrap'
                //         }}
                //     >
                //         {spotlight.description}
                //     </div>
                // </React.Fragment>
            ))}
             </div>



    );
};

export default Guide;