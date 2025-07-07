import { useState, useEffect, useRef } from 'react';
import './ChatInterface.css';
import FAQ from './faq'; // FAQ 컴포넌트 import 추가

// 메시지 타입 정의
interface Message {
    sender: string;
    text: string;
    time: string;
    isError?: boolean;
}

// 현재 시간 가져오기 함수
const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    return `${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
};

// Props 타입 정의
interface ChatInterfaceProps {
    messages: Message[];
    setMessages: (messages: Message[]) => void;
}

const ChatInterface = ({ messages, setMessages }: ChatInterfaceProps) => {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showFAQ, setShowFAQ] = useState(false); // FAQ 상태 추가
    const [autoInput, setAutoInput] = useState(false); // 자동 입력 토글 상태 추가
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 메시지가 추가될 때마다 자동 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // 봇 응답 시뮬레이션 함수 (에러 처리 포함)
    const simulateBotResponse = async (userMessage: string, currentMessages: Message[]) => {
        setIsTyping(true);
        
        try {
            // 실제로는 여기서 API 호출을 할 수 있습니다
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000)); // 1-3초 대기
            
            // 10% 확률로 에러 시뮬레이션 (테스트용)
            if (Math.random() < 0.1) {
                throw new Error('네트워크 오류가 발생했습니다.');
            }
            
            // 성공적인 응답
            const botResponse = `"${userMessage}"에 대한 답변입니다!`;
            setMessages([...currentMessages, { 
                sender: '봇', 
                text: botResponse, 
                time: getCurrentTime() 
            }]);
            
        } catch (error) {
            // 에러 처리
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            setMessages([...currentMessages, { 
                sender: '봇', 
                text: `오류: ${errorMessage}`, 
                time: getCurrentTime(),
                isError: true
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = () => {
        const currentTime = getCurrentTime();

        // 타이핑 중이거나 메시지가 비어있으면 전송하지 않음
        if (message.trim() && !isTyping) {
            // 사용자 메시지 추가
            const newMessages = [...messages, { sender: '나', text: message, time: currentTime }];
            setMessages(newMessages);
            
            // 봇 응답 시뮬레이션
            simulateBotResponse(message, newMessages);
            
            setMessage(''); // 입력창 초기화
        }
    };

    // FAQ에서 메시지를 받아서 사용자 질문 + 봇 응답으로 추가하는 함수
    const handleFAQMessage = (faqTitle: string, faqResponse: string) => {
        // 타이핑 중이면 FAQ 클릭 무시
        if (isTyping) return;
        
        const currentTime = getCurrentTime();
        
        // 먼저 사용자가 질문한 것처럼 메시지 추가
        const userMessage = { 
            sender: '나', 
            text: faqTitle, 
            time: currentTime 
        };
        
        // 사용자 메시지를 먼저 추가
        const messagesWithUser = [...messages, userMessage];
        setMessages(messagesWithUser);
        
        // 타이핑 인디케이터 표시
        setIsTyping(true);
        
        // 잠시 후 봇 응답 추가 (실제 대화처럼 보이도록)
        setTimeout(() => {
            setIsTyping(false);
            const botMessage = { 
                sender: '봇', 
                text: faqResponse, 
                time: getCurrentTime() 
            };
            setMessages([...messagesWithUser, botMessage]);
        }, 1000 + Math.random() * 1000); // 1-2초 대기
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // 타이핑 중일 때는 Enter 키 무시
        if (e.key === 'Enter' && !isTyping) {
            handleSend();
        }
    };

    return (
        <div className="chat-container">
            {/* 환영사진 - 메시지가 없을 때만 보임 (채팅기록창과 동일한 크기) */}
            {messages.length === 0 && (
                <div className='welcome-photo'>
                    <a>환영사진 들어갈 곳</a>
                </div>
            )}
            
            {/* 💬 채팅 메시지 구역 - 메시지가 있을 때만 보임 */}
            {messages.length > 0 && (
                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-row ${msg.sender === '나' ? 'my-message-row' : 'bot-message-row'}`}>
                            {/* 봇 메시지일 때만 프로필과 이름 */}
                            {msg.sender === '봇' && (
                                <div className="profile-and-name">
                                    <div className="profile-image">🤖</div>
                                    <div className="bot-name">챗봇</div>
                                </div>
                            )}
                            
                            {/* 메시지와 시간은 프로필 아래에 */}
                            <div className="message-content-below">
                                <div className={`message-bubble ${msg.sender === '나' ? 'my-bubble' : msg.isError ? 'error-bubble' : 'bot-bubble'}`}>
                                    {msg.text}
                                </div>
                                <div className="message-time">{msg.time}</div>
                            </div>
                        </div>
                    ))}
                    
                    {/* 타이핑 인디케이터 */}
                    {isTyping && (
                        <div className="message-row bot-message-row">
                            <div className="profile-and-name">
                                <div className="profile-image">🤖</div>
                                <div className="bot-name">챗봇</div>
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
                    
                    {/* 스크롤 타겟 지점 */}
                    <div ref={messagesEndRef} />
                </div>
            )}
            
            {/* ⌨️ 입력 구역 - 항상 표시 */}
            <div className="chat-input">
                {/* FAQ 버튼과 메뉴를 함께 묶는 컨테이너 */}
                <div className="faq-wrapper">
                    <button 
                        onClick={() => setShowFAQ(true)} 
                        className="faq-button"
                        title="자주 묻는 질문"
                        disabled={isTyping} // 타이핑 중일 때 FAQ 버튼 비활성화
                    >
                        ?
                    </button>
                    {/* FAQ 컴포넌트를 버튼과 같은 래퍼 안에 배치 */}
                    <FAQ 
                        isOpen={showFAQ} 
                        onClose={() => setShowFAQ(false)}
                        onSendMessage={handleFAQMessage}
                    />
                </div>
                <div className="input-container">
                    <input 
                        type="text" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isTyping ? "챗봇이 응답 중입니다..." : "메시지를 입력하고 Enter를 누르세요..."}
                        className="message-input"
                        disabled={isTyping} // 타이핑 중일 때 입력 비활성화
                    />
                    {/* 자동 입력 토글 스위치 */}
                    <div className="auto-input-controls">
                        <span className="auto-input-label">자동입력</span>
                        <div 
                            className={`toggle-switch ${autoInput ? 'active' : ''}`}
                            onClick={() => setAutoInput(!autoInput)}
                        >
                            <div className="toggle-circle"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;