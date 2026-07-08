import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGames, fetchPlayers, fetchRanking } from '../lib/api';
import { useGame } from '../lib/GameContext';
import { GAME_ART } from '../lib/gameArt';
import type { Game, Player, RankEntry } from '../types';
import './GameHome.css';

// 게임 홈: ① 플레이어 6명 중 선택 → ② 게임 선택 + 총합 랭킹
export default function GameHome() {
  const { player, setPlayer } = useGame();
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [ranking, setRanking] = useState<RankEntry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlayers().then(setPlayers).catch(() => setPlayers([]));
    fetchGames().then(setGames).catch(() => setGames([]));
    fetchRanking().then(setRanking).catch(() => setRanking([]));
  }, []);

  const selected = player ? players.find((p) => p.id === player.id) ?? player : null;

  return (
    <main className="page gamehome">
      <header className="gamehome__head">
        <h2 className="gamehome__title">미니 게임</h2>
        <p className="gamehome__desc">플레이어를 선택하고 게임을 즐겨보세요. 모든 게임 점수가 누적되어 총합 랭킹에 반영됩니다.</p>
      </header>

      {/* STEP 1 · 플레이어 선택 */}
      <section className="gamehome__section">
        <div className="gamehome__steplabel">STEP 1 · 플레이어 선택</div>
        <div className="player-grid">
          {players.map((p) => (
            <button
              key={p.id}
              className={'player-card' + (selected?.id === p.id ? ' player-card--on' : '')}
              onClick={() => setPlayer(p)}
            >
              <span className="player-card__avatar" style={{ background: p.color }}>
                {p.short}
              </span>
              <span className="player-card__name">{p.name}</span>
              <span className="player-card__best">{p.total ?? 0}점</span>
            </button>
          ))}
        </div>
      </section>

      {/* STEP 2 · 게임 선택 */}
      <section className="gamehome__section">
        <div className="gamehome__steplabel">STEP 2 · 게임 선택</div>
        {!selected ? (
          <div className="gamehome__hint">
            <span className="material-symbols-outlined">arrow_upward</span>
            먼저 플레이어를 선택해 주세요.
          </div>
        ) : (
          <>
            <div className="gamehome__selected">
              <span className="player-card__avatar sm" style={{ background: selected.color }}>
                {selected.short}
              </span>
              <span>
                <b>{selected.name}</b> · 보유 {selected.total ?? 0}점
              </span>
            </div>
            <div className="game-list">
              {games.map((g) => {
                const locked = g.id === 'blackjack' && (selected.total ?? 0) < 10;
                const disabled = !g.available || locked;
                return (
                  <button
                    key={g.id}
                    className={'game-item' + (disabled ? ' game-item--off' : '')}
                    disabled={disabled}
                    onClick={() => navigate(`/game/${g.id}?p=${selected.id}`)}
                  >
                    <img className="game-item__art" src={GAME_ART[g.id]} alt={g.name} />
                    <span className="game-item__text">
                      <span className="game-item__name">{g.name}</span>
                      <span className="game-item__desc">
                        {locked ? '보유 점수가 없어 플레이할 수 없어요. 돌깨기로 점수를 모아보세요!' : g.description}
                      </span>
                    </span>
                    <span className="material-symbols-outlined game-item__go">
                      {locked ? 'lock' : 'chevron_right'}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* 총합 랭킹 */}
      <section className="gamehome__section">
        <div className="gamehome__steplabel">총합 랭킹 · 모든 게임 합산</div>
        <ol className="rank-list">
          {ranking.map((p, i) => (
            <li key={p.id} className={'rank-row' + (selected?.id === p.id ? ' rank-row--me' : '')}>
              <span className={'rank-no rank-no--' + (i < 3 ? i + 1 : 'x')}>{i + 1}</span>
              <span className="player-card__avatar sm" style={{ background: p.color }}>
                {p.short}
              </span>
              <span className="rank-name">{p.name}</span>
              <span className="rank-score">
                {p.total}
                <span className="rank-score-unit">점</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
