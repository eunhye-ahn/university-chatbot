// hooks/useNotices.ts
import { useState, useEffect } from 'react';
// @ts-ignore
import { getScnuNotices, Notice } from '../utils/crawler';

export const useNotices = () => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // 초기 로드 및 자동 크롤링 설정
        const loadNotices = async () => {
            const newNotices = await getScnuNotices();
            setNotices(newNotices);
        };

        // 처음 한 번 실행
        loadNotices();
        
        // 30분마다 자동 크롤링
        const intervalId = setInterval(loadNotices, 30 * 60 * 1000);
        
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        if (notices.length > 0) {
            const interval = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % notices.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [notices.length]);

    const currentNotice = notices.length > 0 ? notices[currentIndex] : { title: "공지사항 로딩 중...", link: "/" };

    return currentNotice;
};