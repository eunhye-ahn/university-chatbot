// utils/crawler.ts
// 브라우저에서 실행되는 크롤링 함수
export type Notice = {
    title: string;
    link: string;
  };

  
  export const getScnuNotices = async (): Promise<Notice[]> => {
    try {
        // CORS 우회를 위한 프록시 사용
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const targetUrl = 'https://www.scnu.ac.kr/SCNU/na/ntt/selectNttList.do?mi=1131&bbsId=1040';
        
        console.log("순천대 공지사항 접속");
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        
        console.log(`응답상태: ${response.status}`);
        
        if (response.ok) {
            console.log("접속 성공");
            const html = await response.text();
            
            // HTML 파싱 (브라우저 환경)
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const rows = doc.querySelectorAll('tr');
            console.log(`행 개수: ${rows.length}`);
            
            const noticeRows: any[] = [];
            rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                if (cells.length > 0) {
                    const firstCell = cells[0].textContent!.trim();
                    if (/^\d+$/.test(firstCell)) {
                        noticeRows.push(row);
                    }
                }
            });
            
            const notices: any[] = [];
            for (let i = 0; i < Math.min(noticeRows.length, 5); i++) {
                const row = noticeRows[i];
                const cells = row.querySelectorAll('td');
                
                if (cells.length >= 2) {
                    const title = cells[1].textContent!.trim();
                    const linkElement = cells[1].querySelector('a');
                    
                    let link = "링크 없음";
                    if (linkElement && linkElement.getAttribute('href')) {
                        const href = linkElement.getAttribute('href');
                        link = href.startsWith('http') ? href : `https://www.scnu.ac.kr${href}`;
                    }
                    
                    notices.push({
                        title,
                        link
                    });
                    
                    console.log(`${i + 1}. 제목: ${title}`);
                }
            }
            
            // localStorage에 저장 (JSON 파일 대신)
            const data = {
                notices,
                last_update: new Date().toISOString()
            };
            localStorage.setItem('scnu_notices', JSON.stringify(data));
            
            console.log(`공지사항 ${notices.length}개 저장 완료`);
            return notices;
            
        } else {
            console.log("접속 실패");
            return [];
        }
        
    } catch (error) {
        console.error('크롤링 오류:', error);
        return [];
    }
};

// 30분마다 자동 크롤링
