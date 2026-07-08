import { useNavigate } from 'react-router-dom';
import type { Player } from '../types';
import { GAME_ART } from '../lib/gameArt';
import './GameHeader.css';

interface Props {
  gameId: string;
  title: string;
  player: Player;
}

// 게임 화면 공통 상단 헤더 (뒤로가기 · 게임 아이콘/제목 · 플레이어)
export default function GameHeader({ gameId, title, player }: Props) {
  const navigate = useNavigate();
  return (
    <div className="ghead">
      <button className="ghead__back" onClick={() => navigate('/game')} aria-label="뒤로">
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      <img className="ghead__art" src={GAME_ART[gameId]} alt={title} />
      <span className="ghead__title">{title}</span>
      <span className="ghead__player">
        <span className="ghead__avatar" style={{ background: player.color }}>
          {player.short}
        </span>
      </span>
    </div>
  );
}
