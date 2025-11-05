import { useNotices } from '../hooks/useNotices';

const Notice = () => {
  const currentNotice = useNotices();

  return (
    <nav className="w-full bg-white border-b border-black">
      <div className="px-6 py-2 flex items-center gap-3 text-sm text-slate-800">
        <span className="whitespace-nowrap border border-black px-2 py-0.5 notice-label">
          공지사항
        </span>

        <a
          href={currentNotice.link}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline hover:text-slate-900 transition-colors font-semibold
          notice-text line-clamp-1"
        >
          {currentNotice.title}
        </a>
      </div>
    </nav>
  );
};

export default Notice;
