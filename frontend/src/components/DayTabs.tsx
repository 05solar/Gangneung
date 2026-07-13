import { useNavigate } from 'react-router-dom';
import './DayTabs.css';

interface Props {
  active: number; // 현재 활성화된 Day (1/2/3)
}

const tabs = [1, 2, 3];

// 세그먼트형 Day 전환 네비게이션 (활성 인디케이터가 스르륵 이동)
export default function DayTabs({ active }: Props) {
  const navigate = useNavigate();
  return (
    <div className="daytabs" role="tablist">
      {/* 활성 탭 위치로 미끄러지는 인디케이터 */}
      <span
        className="daytabs__indicator"
        style={{ transform: `translateX(${(active - 1) * 100}%)` }}
        aria-hidden
      />
      {tabs.map((n) => (
        <button
          key={n}
          role="tab"
          aria-selected={n === active}
          className={'daytabs__tab' + (n === active ? ' daytabs__tab--active' : '')}
          onClick={() => navigate(`/day/${n}`)}
        >
          {n === active && (
            <span className="material-symbols-outlined filled daytabs__pin">location_on</span>
          )}
          Day {n}
        </button>
      ))}
    </div>
  );
}
