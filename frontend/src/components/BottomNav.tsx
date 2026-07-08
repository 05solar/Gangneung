import { NavLink, useLocation } from 'react-router-dom';
import './BottomNav.css';

// 하단 고정 네비게이션 (일정 / 게임)
export default function BottomNav() {
  const { pathname } = useLocation();
  const itineraryActive = pathname.startsWith('/day');
  const gameActive = pathname.startsWith('/game');

  return (
    <nav className="bottomnav">
      <NavLink to="/day/1" className={'bottomnav__item' + (itineraryActive ? ' active' : '')}>
        <span className="material-symbols-outlined">map</span>
        <span className="bottomnav__label">일정</span>
      </NavLink>
      <NavLink to="/game" className={'bottomnav__item' + (gameActive ? ' active' : '')}>
        <span className="material-symbols-outlined">sports_esports</span>
        <span className="bottomnav__label">게임</span>
      </NavLink>
    </nav>
  );
}
