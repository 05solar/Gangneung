import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedPlayer } from '../lib/useSelectedPlayer';
import { postScore } from '../lib/api';
import GameHeader from '../components/GameHeader';
import { ROCK_IMGS, PICK_IMG } from '../lib/gameArt';
import './MineGame.css';

const PER_HIT = 10; // 한 번 캘 때마다 획득 점수
const HITS_PER_ROCK = 4; // 돌 하나를 깨는 데 필요한 타격 수

export default function MineGame() {
  const player = useSelectedPlayer();
  const navigate = useNavigate();
  const [pending, setPending] = useState(0); // 정산 전 캔 점수
  const [wallet, setWallet] = useState(0);
  const [hits, setHits] = useState(0); // 현재 돌 타격 수
  const [swing, setSwing] = useState(false);
  const [shake, setShake] = useState(false);
  const [saved, setSaved] = useState(false);
  const swingTimer = useRef<number | undefined>(undefined);
  const shakeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (player?.total != null) setWallet(player.total);
  }, [player]);

  useEffect(
    () => () => {
      clearTimeout(swingTimer.current);
      clearTimeout(shakeTimer.current);
    },
    []
  );

  const dig = () => {
    setPending((p) => p + PER_HIT);
    setHits((h) => (h + 1) % HITS_PER_ROCK);
    setSaved(false);
    // 곡괭이 스윙 + 돌 흔들림 애니메이션 재생
    setSwing(false);
    setShake(false);
    requestAnimationFrame(() => {
      setSwing(true);
      setShake(true);
    });
    clearTimeout(swingTimer.current);
    clearTimeout(shakeTimer.current);
    swingTimer.current = window.setTimeout(() => setSwing(false), 260);
    shakeTimer.current = window.setTimeout(() => setShake(false), 260);
  };

  const cashOut = () => {
    if (!player || pending <= 0) return;
    const amount = pending;
    postScore(player.id, 'mine', amount)
      .then((r) => setWallet(r.total))
      .catch(() => setWallet((w) => w + amount));
    setPending(0);
    setHits(0);
    setSaved(true);
  };

  if (!player) return null;

  const rockStage = ROCK_IMGS[hits];

  return (
    <main className="page mine">
      <GameHeader gameId="mine" title="돌깨기" player={player} />

      <div className="mine__scores">
        <div className="mine__score">
          <span className="mine__score-label">캔 점수</span>
          <span className="mine__score-value">{pending}</span>
        </div>
        <div className="mine__score">
          <span className="mine__score-label">보유 점수</span>
          <span className="mine__score-value">{wallet}</span>
        </div>
      </div>

      <p className="mine__desc">돌을 터치할 때마다 <b>+{PER_HIT}점</b>! 정산하면 바로 보유 점수에 들어갑니다.</p>

      <button className="mine__stage" onClick={dig} aria-label="돌 캐기">
        <img className={'mine__rock' + (shake ? ' shake' : '')} src={rockStage} alt="돌" draggable={false} />
        <img className={'mine__pick' + (swing ? ' swing' : '')} src={PICK_IMG} alt="곡괭이" draggable={false} />
        <span className="mine__tap">터치!</span>
      </button>

      <div className="mine__actions">
        <button className="mine__btn mine__btn--primary" onClick={cashOut} disabled={pending <= 0}>
          정산하기 (+{pending}점)
        </button>
        <button className="mine__btn" onClick={() => navigate('/game')}>
          게임 목록
        </button>
      </div>

      {saved && <p className="mine__saved">정산 완료! 보유 점수에 반영되었습니다.</p>}
    </main>
  );
}
