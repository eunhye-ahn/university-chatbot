// import { useState } from 'react';
import './header.css';

// Props 타입 정의
interface HeaderProps {
    onResetChat: () => void;
}

const Header = ({ onResetChat }: HeaderProps) => {
    //const [showTranslator, setShowTranslator] = useState(false);
    
    return (
        <header>
            <button onClick={onResetChat}>새채팅</button>  
            &nbsp;  &nbsp;
            <a href="/">홈페이지로고</a>
            &nbsp;  &nbsp;
            <a href="/">한영전환</a>
            {/* <button onClick={() => setShowTranslator(true)}>번역버튼</button> */}
            <hr/>
            
            {/* {showTranslator && <Translator onClose={() => setShowTranslator(false)} />} */}
        </header>
    );
};

export default Header;