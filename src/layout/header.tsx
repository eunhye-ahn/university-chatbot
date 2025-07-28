import { useState } from 'react';
import '../style/header.css';

// Props 타입 정의
interface HeaderProps {
    onResetChat: () => void;
}

const Header = ({ onResetChat }: HeaderProps) => {
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState('한국어');
    
    const handleLanguageChange = (language: string) => {
        setCurrentLanguage(language);
        setShowLanguageMenu(false);
        // 여기에 언어 변경 로직 추가
        console.log(`언어가 ${language}로 변경되었습니다.`);
    };
    
    return (
        <header>
            <button onClick={onResetChat}>새채팅</button>  
            &nbsp;  &nbsp;
            <a href="/">홈페이지로고</a>
            &nbsp;  &nbsp;
            
            {/* 한영전환 드롭다운 버튼 */}
            <div 
                className="language-toggle-container"
                onMouseEnter={() => setShowLanguageMenu(true)}
                onMouseLeave={() => setShowLanguageMenu(false)}
            >
                <button className="language-toggle-btn">
                    {/* 언어 전환 아이콘 이미지 */}
                    <img 
                        src="/path/to/language-icon.png" 
                        alt="언어 전환" 
                        className="language-icon"
                    />
                    {currentLanguage}
                </button>
                
                {showLanguageMenu && (
                    <div className="language-dropdown">
                        <div 
                            className="language-option"
                            onClick={() => handleLanguageChange('한국어')}
                        >
                            한국어
                        </div>
                        <div 
                            className="language-option"
                            onClick={() => handleLanguageChange('English')}
                        >
                            English
                        </div>
                    </div>
                )}
            </div>
            
            {/* <button onClick={() => setShowTranslator(true)}>번역버튼</button> */}
            <hr/>
            
            {/* {showTranslator && <Translator onClose={() => setShowTranslator(false)} />} */}
        </header>
    );
};

export default Header;