import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  onResetChat: () => void;
}

const Header = ({ onResetChat }: HeaderProps) => {
  // 언어 드롭다운 열림/닫힘 상태
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  // 현재 선택된 언어
  const [currentLanguage, setCurrentLanguage] = useState<'한국어' | 'English'>('한국어');
  
  // 언어 메뉴 DOM 참조 (외부 클릭 감지용)
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };

    if (showLanguageMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageMenu]);

  // 언어 선택 처리
  const handleLanguageChange = (language: '한국어' | 'English') => {
    setCurrentLanguage(language);
    setShowLanguageMenu(false);
    console.log(`언어가 ${language}로 변경되었습니다.`);
  };

  // 드롭다운 토글
  const toggleLanguageMenu = () => {
    setShowLanguageMenu(!showLanguageMenu);
  };

  return (
    <header
      className="
        w-full h-13
        bg-[#BADDFE] backdrop-blur
        border-b border-slate-200
        flex items-center justify-between
        px-4 relative
      "
    >
      {/* 왼쪽: 새채팅 */}
      <button
        onClick={onResetChat}
        className="
         active:scale-[0.98] transition target-element-1
        "
      >
        <img src="/icons/NewChat.svg" alt="" className='h-8'/>
      </button>

      {/* 가운데: 로고 */}
      <a
        href="https://www.scnu.ac.kr/SCNU/main.do"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 hover:opacity-90"
      >
        <img src="/icons/Logo.svg" alt="순천대학교 로고" className="h-8" />
      </a>

      {/* 언어 선택 드롭다운 */}
      <div
        ref={languageMenuRef}
        className="relative target-element-2"
      >
        {/* 언어 선택 버튼 */}
        <div 
          className="inline-flex items-center gap-1 cursor-pointer"
          onClick={toggleLanguageMenu}
        >
          <span className="font-bold text-[#6C6B6B] bg-[#BADDFE] px-2 py-0.5 rounded">
            {currentLanguage === '한국어' ? '한국어' : 'ENGLISH'}
          </span>
          {/* 화살표 아이콘 (드롭다운 열림 시 회전) */}
          <svg
            className={`w-3.5 h-3.5 opacity-70 text-[#6C6B6B] transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.173l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" />
          </svg>
        </div>

        {/* 언어 옵션 메뉴 */}
        {showLanguageMenu && (
          <div
            className="
              absolute right-0 z-50 mt-1 w-36
              rounded-md border border-slate-200 bg-white shadow-lg
            "
            role="menu"
          >
            {/* 한국어 옵션 - 활성화 */}
            <button
              onClick={() => handleLanguageChange('한국어')}
              className="w-full text-left px-3 py-2 text-sm hover:bg-[#E9F4FF] transition-colors"
              role="menuitem"
            >
              한국어 
            </button>
            
            {/* English 옵션 - 비활성화 (추후 제공 예정) */}
            <div
              className="w-full text-left px-3 py-2 text-sm text-gray-400 cursor-not-allowed bg-gray-50"
              role="menuitem"
              aria-disabled="true"
            >
              <div className="flex flex-col">
                <span className="line-through">English</span>
                <span className="text-xs mt-0.5">추후 기능 제공예정</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;