import { useState, useEffect, useRef } from 'react';
import '../style/ChatInterface.css';
import '../style/FAQ-additions.css';
import '../style/AutoComplete.css';
import FAQ from '../../src/layout/faq';
import FAQChatResponse from './faqChat';
import AutoComplete, { type AutoCompleteRef } from './AutoComplete';
import { fetchFAQData } from '../service/faqServices';

interface Message {
    sender: string;
    text: string;
    time: string;
    isError?: boolean;
    type?: 'regular' | 'faq';
    faqOptions?: string[];
}

interface FAQSubItem {
    text: string;
    index: number;
    parentId: number;
}

const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    return `${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
};

interface ChatInterfaceProps {
    messages: Message[];
    setMessages: (messages: Message[]) => void;
}

const ChatInterface = ({ messages, setMessages }: ChatInterfaceProps) => {
    
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showFAQ, setShowFAQ] = useState(false);
    const [autoInput, setAutoInput] = useState(false);

   
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const autoCompleteRef = useRef<AutoCompleteRef>(null);

    
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    //챗봇 응답 시뮬레이션
    const simulateBotResponse = async (userMessage: string, currentMessages: Message[]) => {
        setIsTyping(true);

        try {
            // 응답 지연 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

            // 랜덤 네트워크 오류 시뮬레이션
            if (Math.random() < 0.1) {
                throw new Error('네트워크 오류가 발생했습니다.');
            }

            // 키워드 기반 맞춤 응답 생성
            const getBotResponse = (message: string): string => {
                const lowerMessage = message.toLowerCase();

                if (lowerMessage.includes('주문 취소')) {
                    return '주문 취소를 도와드리겠습니다. 주문번호를 알려주시면 취소 처리해드릴게요.';
                } else if (lowerMessage.includes('주문 확인')) {
                    return '주문 확인을 위해 주문번호나 휴대폰 번호를 입력해주세요.';
                } else if (lowerMessage.includes('배송 조회')) {
                    return '배송 조회를 위해 주문번호를 입력해주시거나 로그인 후 마이페이지에서 확인 가능합니다.';
                } else if (lowerMessage.includes('반품')) {
                    return '반품 신청을 도와드리겠습니다. 주문번호와 반품 사유를 알려주세요.';
                } else if (lowerMessage.includes('교환')) {
                    return '교환 신청을 접수하겠습니다. 주문번호와 교환하고 싶은 상품 정보를 알려주세요.';
                } else if (lowerMessage.includes('결제')) {
                    return '결제 관련 문의사항을 도와드리겠습니다. 어떤 결제 문제가 있으신가요?';
                } else if (lowerMessage.includes('로그인')) {
                    return '로그인에 문제가 있으시군요. 아이디/비밀번호 찾기나 계정 관련 도움이 필요하시면 말씀해주세요.';
                } else if (lowerMessage.includes('상품 문의')) {
                    return '상품에 대해 궁금한 점이 있으시군요. 어떤 상품에 대해 알고 싶으신가요?';
                } else if (lowerMessage.includes('고객센터')) {
                    return '고객센터 운영시간은 평일 오전 9시부터 오후 6시까지입니다. 전화번호: 1588-0000';
                } else {
                    return `"${userMessage}"에 대한 답변입니다!`;
                }
            };

            const botResponse = getBotResponse(userMessage);

            setMessages([...currentMessages, {
                sender: '봇',
                text: botResponse,
                time: getCurrentTime(),
                type: 'regular' as const
            }]);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            setMessages([...currentMessages, {
                sender: '봇',
                text: `오류: ${errorMessage}`,
                time: getCurrentTime(),
                isError: true,
                type: 'regular' as const
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    // 📤 일반 메시지 전송 처리
    const handleSend = () => {
        const currentTime = getCurrentTime();

        if (message.trim() && !isTyping) {
            const newMessages = [...messages, {
                sender: '나',
                text: message,
                time: currentTime,
                type: 'regular' as const
            }];
            setMessages(newMessages);

            simulateBotResponse(message, newMessages);
            setMessage('');
        }
    };

    //자동완성 선택 처리
    const handleAutoCompleteSelect = (suggestion: string) => {
        setMessage(suggestion);
        autoCompleteRef.current?.focus();
    };

    //자동완성 바로 전송 처리
    const handleAutoCompleteAutoSend = (suggestion: string) => {
        if (isTyping) return;

        const currentTime = getCurrentTime();
        const newMessages = [...messages, {
            sender: '나',
            text: suggestion,
            time: currentTime,
            type: 'regular' as const
        }];
        setMessages(newMessages);

        simulateBotResponse(suggestion, newMessages);
    };

    //FAQ 메시지 처리
    const handleFAQMessage = async (faqTitle: string, faqId: number) => {
        if (isTyping) return;

        const currentTime = getCurrentTime();
        const userMessage: Message = {
            sender: '나',
            text: faqTitle,
            time: currentTime,
            type: 'regular' as const
        };

        const messagesWithUser = [...messages, userMessage];
        setMessages(messagesWithUser);
        setIsTyping(true);

        try {
            const faqData = await fetchFAQData(faqId);
            setIsTyping(false);

            const botMessage: Message = {
                sender: '봇',
                text: faqData.response,
                time: getCurrentTime(),
                type: 'faq' as const,
                faqOptions: faqData.options
            };

            setMessages([...messagesWithUser, botMessage]);

        } catch (error) {
            setIsTyping(false);

            const errorMessage: Message = {
                sender: '봇',
                text: 'FAQ 데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                time: getCurrentTime(),
                isError: true,
                type: 'regular' as const
            };

            setMessages([...messagesWithUser, errorMessage]);
        }
    };

    //FAQ 세부 항목 클릭 처리
    const handleFAQSubItemClick = async (subItem: FAQSubItem) => {
        if (isTyping) return;

        const currentTime = getCurrentTime();
        const userMessage: Message = {
            sender: '나',
            text: subItem.text,
            time: currentTime,
            type: 'regular' as const
        };

        const messagesWithUser = [...messages, userMessage];
        setMessages(messagesWithUser);

        // 기존 simulateBotResponse와 동일한 방식으로 처리
        simulateBotResponse(subItem.text, messagesWithUser);
    };

    //FAQ 옵션 버튼 클릭 처리
    const handleFAQOptionClick = (option: string) => {
        if (isTyping) return;

        const currentTime = getCurrentTime();
        const userMessage: Message = {
            sender: '나',
            text: option,
            time: currentTime,
            type: 'regular' as const
        };

        const messagesWithUser = [...messages, userMessage];
        setMessages(messagesWithUser);

        simulateBotResponse(option, messagesWithUser);
    };

    //키보드 입력 처리
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
            e.preventDefault(); // 줄바꿈 방지
            handleSend();
        }
        //Shift+Enter는 줄바꿈 허용
    };

    //자동완성 토글 처리
    const handleAutoInputToggle = () => {
        setAutoInput(!autoInput);
    };

    return (
        <div className="chat-container">
            {messages.length === 0 && (
                <div className='flex flex-col items-center justify-end text-center h-full pb-2'>
                    <img src="/icons/Mascot.svg" alt="마스코트" className="h-60 mb-8" />

                    <p>
                        안녕하세요 국립순천대학교 컴퓨터공학과 입니다.<br />
                        궁금한 것이 있다면 총장님에게 질문하세요!
                    </p>                </div>
            )}


            {messages.length > 0 && (
                <div className="chat-messages">
                    <div className='chat-inner'>
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-row ${msg.sender === '나' ? 'my-message-row' : 'bot-message-row'}`}>

                                {msg.sender === '봇' && (
                                    <div className="profile-and-name">
                                        <div className='profile-image'>
                                            <img src="/icons/MascortFace.svg" alt="총장이" />
                                        </div>
                                        <div className="bot-name">챗봇</div>
                                    </div>
                                )}

                                <div className="message-content-below">
                                    {msg.type === 'faq' ? (
                                        <FAQChatResponse
                                            message={msg}
                                            onOptionSelect={handleFAQOptionClick}
                                        />
                                    ) : (
                                        <div className={`message-bubble ${msg.sender === '나'
                                            ? 'my-bubble'
                                            : msg.isError
                                                ? 'error-bubble'
                                                : 'bot-bubble'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    )}
                                    <div className="message-time">{msg.time}</div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="message-row bot-message-row">
                                <div className="profile-and-name">
                                    <div className='profile-image'>
                                        <img src="/icons/MascortFace.svg" alt="총장이" />
                                    </div>
                                    <div className="bot-name">총장이</div>
                                </div>
                                <div className="message-content-below">
                                    <div className="message-bubble bot-bubble typing-indicator">
                                        <div className="typing-dots">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>
            )}

            <div className="chat-input">
                <div className="faq-wrapper">
                    <button
                        onClick={() => setShowFAQ(prev => !prev)}
                        className="faq-button"
                        title="자주 묻는 질문"
                        disabled={isTyping}
                    >
                        FAQ
                    </button>
                    <FAQ
                        isOpen={showFAQ}
                        onClose={() => setShowFAQ(false)}
                        onSendMessage={handleFAQMessage}
                        onSubItemClick={handleFAQSubItemClick}
                    />
                </div>

                <div className="input-container">
                    <AutoComplete
                        ref={autoCompleteRef}
                        value={message}
                        onChange={setMessage}
                        onSelect={handleAutoCompleteSelect}
                        onKeyDown={handleKeyDown}
                        placeholder={isTyping ? "챗봇이 응답 중입니다..." : "질문을 입력하세요"}
                        disabled={isTyping}
                        autoInputEnabled={autoInput}
                        className="input-wrapper"
                        //inputClassName="message-input"
                        autoSend={true}
                        onAutoSend={handleAutoCompleteAutoSend}
                    />

                    <div className="auto-input-controls">
                        <div
                            className={`toggle-switch ${autoInput ? 'active' : ''}`}
                            onClick={handleAutoInputToggle}
                        >
                            <div className="toggle-circle"></div>
                        </div>
                        <span className="auto-input-label">자동완성</span>
                    </div>


                        <button
                            type="button"
                            className='send-btn'
                        >
                            <img src="/icons/send.svg" alt="전송" />
                        </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;