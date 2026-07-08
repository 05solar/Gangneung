import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedPlayer } from '../lib/useSelectedPlayer';
import { postScore } from '../lib/api';
import GameHeader from '../components/GameHeader';
import {
  N,
  PASS,
  KOMI,
  emptyState,
  play,
  mctsMove,
  scoreGame,
  toIdx,
  type GoState,
  type Diff,
  type ScoreResult,
} from '../lib/go';
import './GoGame.css';

const PAD = 22;
const STEP = 34;
const W = STEP * (N - 1) + PAD * 2; // 316
const R = 15; // 돌 반지름
const STARS = [
  [2, 2], [2, 6], [6, 2], [6, 6], [4, 4],
]; // 9×9 화점

type Status = 'playing' | 'won' | 'lost';

const DIFFS: { key: Diff; label: string }[] = [
  { key: 'easy', label: '쉬움' },
  { key: 'medium', label: '중간' },
  { key: 'hard', label: '어려움' },
];

const BLACK = 1;

export default function GoGame() {
  const player = useSelectedPlayer();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<GoState>(emptyState);
  const [status, setStatus] = useState<Status>('playing');
  const [thinking, setThinking] = useState(false);
  const [wallet, setWallet] = useState(0);
  const [gained, setGained] = useState(0);
  const [diff, setDiff] = useState<Diff>('medium');
  const [lastMove, setLastMove] = useState<number | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const posted = useRef(false);

  useEffect(() => {
    if (player?.total != null) setWallet(player.total);
  }, [player]);

  const reset = useCallback(() => {
    setState(emptyState());
    setStatus('playing');
    setThinking(false);
    setGained(0);
    setLastMove(null);
    setResult(null);
    posted.current = false;
  }, []);

  const winPoints = diff === 'easy' ? 100 : diff === 'hard' ? 5000 : 1000;

  // 종국 처리: 계가(한국식: 집 + 사석) → 승패 판정 → 점수 적립
  const finish = useCallback(
    (s: GoState, resigned?: 'black') => {
      const sc = scoreGame(s);
      setResult(sc);
      const humanWon = resigned ? false : sc.winner === BLACK;
      const st: Status = humanWon ? 'won' : 'lost';
      setStatus(st);
      if (!player || posted.current) return;
      posted.current = true;
      const pts = humanWon ? winPoints : 0;
      setGained(pts);
      postScore(player.id, 'baduk', pts)
        .then((r) => setWallet(r.total))
        .catch(() => {});
    },
    [player, winPoints]
  );

  // AI(백) 착수
  const aiTurn = useCallback(
    (s: GoState) => {
      setThinking(true);
      window.setTimeout(() => {
        const mv = mctsMove(s, diff);
        const r = play(s, mv);
        const ns = r ? r.state : play(s, PASS)!.state;
        setState(ns);
        setLastMove(mv === PASS || !r ? null : mv);
        setThinking(false);
        if (ns.passes >= 2) finish(ns);
      }, 60);
    },
    [diff, finish]
  );

  // 사람(흑) 착수
  const place = (idx: number) => {
    if (status !== 'playing' || thinking || state.toMove !== BLACK) return;
    const r = play(state, idx);
    if (!r) return; // 불법수(자리참·패·자살수)
    setState(r.state);
    setLastMove(idx);
    if (r.state.passes >= 2) return finish(r.state);
    aiTurn(r.state);
  };

  const humanPass = () => {
    if (status !== 'playing' || thinking || state.toMove !== BLACK) return;
    const r = play(state, PASS)!;
    setState(r.state);
    setLastMove(null);
    if (r.state.passes >= 2) return finish(r.state);
    aiTurn(r.state);
  };

  const resign = () => {
    if (status !== 'playing' || thinking) return;
    finish(state, 'black');
  };

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (W / rect.width);
    const y = (e.clientY - rect.top) * (W / rect.height);
    const c = Math.round((x - PAD) / STEP);
    const r = Math.round((y - PAD) / STEP);
    if (r >= 0 && r < N && c >= 0 && c < N) place(toIdx(r, c));
  };

  // 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = W * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = W + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // 판
    ctx.fillStyle = '#e3b877';
    ctx.fillRect(0, 0, W, W);
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 1;
    for (let i = 0; i < N; i++) {
      const p = PAD + i * STEP;
      ctx.beginPath();
      ctx.moveTo(PAD, p);
      ctx.lineTo(W - PAD, p);
      ctx.moveTo(p, PAD);
      ctx.lineTo(p, W - PAD);
      ctx.stroke();
    }
    // 화점
    ctx.fillStyle = '#5a3a1e';
    for (const [r, c] of STARS) {
      ctx.beginPath();
      ctx.arc(PAD + c * STEP, PAD + r * STEP, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // 돌
    const b = state.board;
    for (let i = 0; i < N * N; i++) {
      if (!b[i]) continue;
      const r = Math.floor(i / N);
      const c = i % N;
      const x = PAD + c * STEP;
      const y = PAD + r * STEP;
      const black = b[i] === BLACK;
      const g = ctx.createRadialGradient(x - 4, y - 4, 1, x, y, R);
      if (black) {
        g.addColorStop(0, '#5a5a5a');
        g.addColorStop(1, '#151515');
      } else {
        g.addColorStop(0, '#ffffff');
        g.addColorStop(1, '#cfcfcf');
      }
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fill();
      if (!black) {
        ctx.strokeStyle = '#b0b0b0';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
    // 마지막 착수 표시
    if (lastMove != null && b[lastMove]) {
      const r = Math.floor(lastMove / N);
      const c = lastMove % N;
      const x = PAD + c * STEP;
      const y = PAD + r * STEP;
      ctx.strokeStyle = b[lastMove] === BLACK ? 'rgba(255,238,165,0.95)' : 'rgba(220,60,60,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, R * 0.45, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [state, lastMove, player]);

  if (!player) return null;

  const statusText =
    status === 'won'
      ? `승리! +${gained}점`
      : status === 'lost'
      ? '패배… 다시 도전!'
      : thinking
      ? 'AI(백)가 생각 중…'
      : '내 차례 (흑돌)';

  return (
    <main className="page baduk">
      <GameHeader gameId="baduk" title="바둑 9×9" player={player} />

      <div className="baduk__bar">
        <span className={'baduk__status' + (status !== 'playing' ? ' done' : '')}>{statusText}</span>
        <span className="baduk__wallet">보유 {wallet}점</span>
      </div>

      <div className="baduk__meta">
        <span className="baduk__cap">흑 따냄 {state.capB}</span>
        <span className="baduk__cap">백 따냄 {state.capW}</span>
        <span className="baduk__cap">덤 {KOMI}</span>
      </div>

      <div className="baduk__diff">
        <span className="baduk__diff-label">난이도</span>
        <div className="baduk__diff-seg">
          {DIFFS.map((d) => (
            <button
              key={d.key}
              className={'baduk__diff-btn' + (diff === d.key ? ' on' : '')}
              onClick={() => setDiff(d.key)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="baduk__board-wrap">
        <canvas ref={canvasRef} className="baduk__canvas" onClick={onClick} />
        {status !== 'playing' && result && (
          <div className="baduk__over">
            <div className="baduk__over-card">
              <h3>{status === 'won' ? '승리!' : '패배'}</h3>
              <p className="baduk__over-score">
                흑 {result.black}집 · 백 {result.white.toFixed(1)}집
              </p>
              <p className="baduk__over-margin">
                집+사석 계가 · {result.winner === BLACK ? '흑' : '백'} {result.margin.toFixed(1)}집 승
              </p>
              <p className="baduk__over-pts">+{gained}점</p>
              <div className="baduk__over-btns">
                <button className="baduk__btn baduk__btn--primary" onClick={reset}>
                  다시하기
                </button>
                <button className="baduk__btn" onClick={() => navigate('/game')}>
                  게임 목록
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="baduk__actions">
        <button className="baduk__btn" onClick={humanPass} disabled={status !== 'playing' || thinking}>
          패스
        </button>
        <button className="baduk__btn" onClick={resign} disabled={status !== 'playing' || thinking}>
          기권
        </button>
        <button className="baduk__btn" onClick={reset}>
          새 게임
        </button>
      </div>
      <p className="baduk__hint">
        교차점을 눌러 흑돌을 놓으세요. 두 번 연속 패스하면 종국합니다. 한국식 계가(집 + 사석) · 백 덤 {KOMI}집
        (현재 난이도 승리 +{winPoints}점)
      </p>
    </main>
  );
}
