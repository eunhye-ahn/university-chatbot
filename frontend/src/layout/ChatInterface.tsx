import { useState, useEffect, useRef } from 'react';
import '../style/ChatInterface.css';
import '../style/FAQ-additions.css';
import '../style/AutoComplete.css';
import '../style/responsive.css'
import FAQ from '../../src/layout/faq';
import FAQChatResponse from './faqChat';
import AutoComplete, { type AutoCompleteRef } from './AutoComplete';
import { fetchFAQData } from '../service/faqServices';
import { AutoCompleteService } from '../service/autoCompleteService';
import { CalendarService } from '../service/CalendarService';
import { ChatbotService } from '../service/chatbotService';
import React from 'react';


interface Message {
    sender: string;
    text: string | React.ReactNode;
    time: string;
    isError?: boolean;
    type?: 'regular' | 'faq';
    faqOptions?: string[];
    children?: Array<{
        id: number;
        question: string;
        answer_type: string;
        answer_content: string | null;
        title: string;
        card_priority?: number | null;
        action_type?: string | null;
    }>;    
}

const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    return `${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
};

const normalizeMessage = (text: string): string => {
    return text.replace(/\\n/g, '\n');
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

    const fetchAutoCompleteSuggestions = async (query: string): Promise<string[]> => {
        try {
            const suggestions = await AutoCompleteService.fetchSuggestions(query, 10);
            return suggestions.map(item => item.question);
        } catch (error) {
            console.error('자동완성 데이터 로드 오류:', error);
            return [];
        }
    };



    const fetchBotResponse = async (userMessage: string, currentMessages: Message[]) => {
        setIsTyping(true);

        try {
            const storedSessionId = sessionStorage.getItem('chat_session_id');
            
            // 🔥 getDetailedChatbotResponse 사용 (전체 응답 객체 반환)
            const response = await ChatbotService.getDetailedChatbotResponse(userMessage, {
                sessionId: storedSessionId ?? undefined
            });

            // 세션 ID 저장
            if (response.session_id) {
                sessionStorage.setItem('chat_session_id', response.session_id);
                console.log('💾 세션 ID 저장:', response.session_id);
            }

            // 메시지 추가
            setMessages([...currentMessages, {
                sender: '봇',
                text: response.message,
                time: getCurrentTime(),
                type: 'regular' as const
            }]);

        } catch (error) {
            console.error('챗봇 API 호출 오류:', error);
            
            const errorMessage = error instanceof Error 
                ? error.message 
                : '서버 연결에 실패했습니다.';
                
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

            fetchBotResponse(message, newMessages);
            setMessage('');
        }
    };

    const handleAutoCompleteSelect = (suggestion: string) => {
        setMessage(suggestion);
        autoCompleteRef.current?.focus();
    };

    const handleAutoCompleteAutoSend = async (suggestion: string) => {
        if (isTyping) return;

        const currentTime = getCurrentTime();
        const newMessages = [...messages, {
            sender: '나',
            text: suggestion,
            time: currentTime,
            type: 'regular' as const
        }];
        setMessages(newMessages);
        setIsTyping(true);

        try {
            const suggestions = await AutoCompleteService.fetchSuggestions(suggestion, 50);
            
            const matchedItem = suggestions.find(item => item.question === suggestion);

            if (matchedItem && matchedItem.answer_content) {
                const children = await AutoCompleteService.fetchChildrenByParentId(matchedItem.id);
                
                const botMessage: Message = {
                    sender: '봇',
                    text: normalizeMessage(matchedItem.answer_content),
                    time: getCurrentTime(),
                    type: 'regular' as const,
                    children: children.length > 0 ? children : undefined
                };
                setMessages([...newMessages, botMessage]);
            } else {
                fetchBotResponse(suggestion, newMessages);
            }
        } catch (error) {
            console.error('답변을 가져오는 중 오류:', error);
            fetchBotResponse(suggestion, newMessages);
        } finally {
            setIsTyping(false);
        }
    };

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
                type: 'regular' as const,  // ✅ 'faq' → 'regular'로 변경
                children: faqData.children && faqData.children.length > 0 
                    ? faqData.children
                    : undefined  // ✅ children 추가
            };

            console.log('📊 FAQ 응답 데이터:', faqData);
            console.log('📊 생성된 봇 메시지:', botMessage);

            setMessages([...messagesWithUser, botMessage]);

        } catch (error) {
            console.error('FAQ 데이터 로드 오류:', error);
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

    const handleFAQSubItemClick = (subItem: { 
        text: string;
        index: number;
        parentId: number;
    }) => {
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

        fetchBotResponse(subItem.text, messagesWithUser);
    };

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

        fetchBotResponse(option, messagesWithUser);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleAutoInputToggle = () => {
        setAutoInput(!autoInput);
    };

    const handleActionClick = async (actionType: string, title: string) => {
        if (isTyping) return;

        const currentTime = getCurrentTime();
        
        const userMessage: Message = {
            sender: '나',
            text: title,
            time: currentTime,
            type: 'regular' as const
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setIsTyping(true);

        try {
            let botResponse = '';

            if (actionType === 'calendar_this_month' || actionType === 'current_month_calendar') {
                const calendarData = await CalendarService.getCurrentMonthCalendar();
                botResponse = CalendarService.formatCalendarToText(calendarData);
            } else {
                botResponse = `${actionType} 액션은 아직 구현되지 않았습니다.`;
            }

            const botMessage: Message = {
                sender: '봇',
                text: botResponse,
                time: getCurrentTime(),
                type: 'regular' as const
            };

            setMessages([...newMessages, botMessage]);

        } catch (error) {
            console.error('Action 처리 중 오류:', error);
            
            const errorMessage: Message = {
                sender: '봇',
                text: '일정을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                time: getCurrentTime(),
                isError: true,
                type: 'regular' as const
            };

            setMessages([...newMessages, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    // 파일 상단에 이미 AutoCompleteService import 되어 있음

    const handleChildTextClick = async (child: {
        id: number;
        title: string;
        answer_type: string;
        answer_content: string | null;
    }) => {
        if (isTyping) return;
    
        const currentTime = getCurrentTime();
    
        // 사용자가 버튼(자식 텍스트)을 선택한 메시지 추가
        const userMessage: Message = {
        sender: '나',
        text: child.title,
        time: currentTime,
        type: 'regular'
        };
    
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setIsTyping(true);
    
        try {
            // 자식의 답변 내용 표시
            const botText = normalizeMessage(child.answer_content || '');
        
            // 해당 자식의 손자(children) 로드
            const nextChildren = await AutoCompleteService.fetchChildrenByParentId(child.id);
        
            const botMessage: Message = {
                sender: '봇',
                text: botText,
                time: getCurrentTime(),
                type: 'regular',
                children: nextChildren.length > 0 ? nextChildren : undefined
            };
        
            setMessages([...newMessages, botMessage]);
        } catch (err) {
            console.error('child text 클릭 처리 오류:', err);
            setMessages([
                ...newMessages,
                {
                sender: '봇',
                text: '데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                time: getCurrentTime(),
                isError: true,
                type: 'regular'
                }
            ]);
        } finally {
        setIsTyping(false);
        }
    };
  
    return (
        <div className='chat-interface'>
        <div className={`chat-container ${messages.length > 0 ? 'chat-active' : 'chat-empty'}`}>
            {messages.length === 0 && (
                <div className='welcome-photo '>
                    <img src="/icons/Mascot.svg" alt="마스코트" className="welcome-photo" />
                    <p className='initialComment'>
                        안녕하세요 국립순천대학교 컴퓨터공학과 입니다.<br />
                        궁금한 것이 있다면 총장님에게 질문하세요!
                    </p>
                </div>
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
                                        <div className="bot-name">총장이</div>
                                    </div>
                                )}

                                <div className="message-content-below">
                                    {/* 🔥 이제 FAQ도 type이 'regular'이므로 이 분기는 거의 사용 안 됨 */}
                                    {msg.type === 'faq' ? (
                                        <FAQChatResponse
                                            message={msg}
                                            onOptionSelect={handleFAQOptionClick}
                                        />
                                    ) : (
                                        <div>
                                            <div className={`message-bubble ${msg.sender === '나'
                                                ? 'my-bubble'
                                                : msg.isError
                                                    ? 'error-bubble'
                                                    : 'bot-bubble'
                                                }`}
                                                style={{ whiteSpace: 'pre-wrap' }}
                                            >
                                                {msg.text}
                                            </div>
                                            
                                            
                                            {/* URL / Action / TEXT 타입 자식 질문들을 버튼으로 표시 */}
                                            {msg.children && msg.children.length > 0 && (
                                                <div className="faq-children-buttons">
                                                    {msg.children
                                                    .filter(child =>
                                                        child.answer_type === 'url' ||
                                                        child.answer_type === 'action' ||
                                                        child.answer_type === 'text'   // 👈 추가
                                                    )
                                                    .map((child) => (
                                                        <button
                                                        key={child.id}
                                                        onClick={() => {
                                                            if (child.answer_type === 'url') {
                                                            window.open(child.answer_content || '#', '_blank');
                                                            } else if (child.answer_type === 'action') {
                                                            handleActionClick(child.answer_content || '', child.title);
                                                            } else if (child.answer_type === 'text') {
                                                            handleChildTextClick(child); // 👈 추가
                                                            }
                                                        }}
                                                        >
                                                        {child.title}
                                                        </button>
                                                    ))
                                                    }
                                                </div>
                                                )}

                                            
                                            {/* Card 타입 자식 질문들을 카드로 표시 */}
                                            {msg.children && msg.children.length > 0 && (
                                                <div className="faq-children-cards">
                                                    {msg.children
                                                        .filter(child => child.answer_type === 'card')
                                                        .sort((a, b) => (a.card_priority || 0) - (b.card_priority || 0))
                                                        .map((child) => (
                                                            <div key={child.id} className="faq-card">
                                                                <div className="faq-card-content">
                                                                    <div className="faq-card-title">{child.title}</div>
                                                                    <div className="faq-card-answer">{normalizeMessage(child.answer_content || '')}</div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            )}
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
                        onSubItemClick={(subItem) => {
                            void handleFAQSubItemClick(subItem);
                        }}
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
                        fetchSuggestions={fetchAutoCompleteSuggestions}
                        autoSend={true}
                        onAutoSend={handleAutoCompleteAutoSend}
                    />

                    <div className="auto-input-controls target-element-3">
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
                        onClick={handleSend}
                    >
                        <img src="/icons/send.svg" alt="전송" />
                    </button>
                </div>
            </div>
        </div>
                </div>

    );
};

export default ChatInterface;