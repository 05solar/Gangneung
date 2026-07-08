import { useNavigate } from 'react-router-dom';
import './DayTabs.css';

interface Props {
  active: number; // 현재 활성화된 Day (1/2/3)
}

const tabs = [1, 2, 3];

// 레트로 폴더 탭 스타일의 Day 전환 네비게이션
export default function DayTabs({ active }: Props) {
  const navigate = useNavigate();
  return (
    <div className="daytabs">
      {tabs.map((n) => (
        <button
          key={n}
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
