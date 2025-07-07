import './notice.css';
import { useNotices } from '../hooks/useNotices';

const Notice = () => {
    const currentNotice = useNotices();

    return (
        <nav>
            <div>
                [학교공지] 
                &nbsp;  &nbsp;
                <a href={currentNotice.link} target="_blank" rel="noopener noreferrer"> 
                    {currentNotice.title}
                </a>
            </div>
            <hr/>
        </nav>
    );
};

export default Notice;