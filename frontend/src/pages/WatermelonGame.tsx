import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Matter from 'matter-js';
import { useGame } from '../lib/GameContext';
import { fetchPlayers, postScore } from '../lib/api';
import { FRUITS, loadFruitImages } from '../lib/fruitSprites';
import './WatermelonGame.css';

const { Engine, Bodies, Composite, Events } = Matter;

// 캔버스 크기 (논리 좌표)
const W = 336;
const H = 456;
const DROP_Y = 44; // 과일이 떨어지기 시작하는 높이
const DANGER_Y = 92; // 이 선 위로 과일이 쌓이면 게임오버

// 단계별 합체 시 획득 점수 (누적 삼각수)
const POINTS = [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55];
const MAX_TIER = FRUITS.length - 1;
const DROPPABLE = 5; // 위에서 떨어뜨릴 수 있는 최대 단계(0~4)

type FruitBody = Matter.Body & { tier: number; spawnAt: number; entered: boolean };

export default function WatermelonGame() {
  const { player, setPlayer } = useGame();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [wallet, setWallet] = useState(player?.total ?? 0); // 보유(누적) 점수
  const [gameOver, setGameOver] = useState(false);
  const [nextTier, setNextTier] = useState(0);
  const [round, setRound] = useState(0); // 값이 바뀌면 게임 재시작

  const scoreRef = useRef(0);

  // 선택된 플레이어의 보유 점수 반영
  useEffect(() => {
    if (player?.total != null) setWallet(player.total);
  }, [player]);

  // 플레이어 미선택 시: URL 의 ?p=<id> 로 복구 시도, 없으면 게임 홈으로
  useEffect(() => {
    if (player) return;
    const pid = Number(params.get('p'));
    if (pid) {
      fetchPlayers('watermelon')
        .then((list) => {
          const found = list.find((p) => p.id === pid);
          if (found) setPlayer(found);
          else navigate('/game', { replace: true });
        })
        .catch(() => navigate('/game', { replace: true }));
    } else {
      navigate('/game', { replace: true });
    }
  }, [player, params, navigate, setPlayer]);

  useEffect(() => {
    if (!player) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 엔진 & 벽
    const engine = Engine.create();
    engine.gravity.y = 1.3;
    const wallOpt = { isStatic: true, render: { visible: false } };
    Composite.add(engine.world, [
      Bodies.rectangle(W / 2, H + 24, W + 120, 48, wallOpt), // 바닥
      Bodies.rectangle(-24, H / 2, 48, H * 2, wallOpt), // 좌
      Bodies.rectangle(W + 24, H / 2, 48, H * 2, wallOpt), // 우
    ]);

    // 상태
    let pendingTier = Math.floor(Math.random() * DROPPABLE);
    let upcomingTier = Math.floor(Math.random() * DROPPABLE);
    let pendingX = W / 2;
    let canDrop = true;
    let ended = false;
    let raf = 0;
    let last = Date.now();
    const merging = new Set<number>();
    const sprites = loadFruitImages();
    setNextTier(upcomingTier);

    function addFruit(tier: number, x: number, y: number) {
      const f = FRUITS[tier];
      const body = Bodies.circle(x, y, f.r, {
        restitution: 0.18,
        friction: 0.4,
        density: 0.001,
      }) as FruitBody;
      body.tier = tier;
      body.spawnAt = Date.now();
      body.entered = false; // 위험선 아래로 완전히 진입했는지
      Composite.add(engine.world, body);
      return body;
    }

    // 합체 처리
    Events.on(engine, 'collisionStart', (evt) => {
      for (const pair of evt.pairs) {
        const a = pair.bodyA as FruitBody;
        const b = pair.bodyB as FruitBody;
        if (a.tier == null || b.tier == null) continue;
        if (a.tier !== b.tier) continue;
        if (merging.has(a.id) || merging.has(b.id)) continue;
        merging.add(a.id);
        merging.add(b.id);

        const tier = a.tier;
        const mx = (a.position.x + b.position.x) / 2;
        const my = (a.position.y + b.position.y) / 2;
        Composite.remove(engine.world, a);
        Composite.remove(engine.world, b);

        if (tier >= MAX_TIER) {
          // 수박 + 수박 → 보너스
          scoreRef.current += 100;
        } else {
          const nt = tier + 1;
          addFruit(nt, mx, my);
          scoreRef.current += POINTS[nt];
        }
        setScore(scoreRef.current);
      }
    });

    // 포인터 제어
    const toLocalX = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) * (W / rect.width);
      const r = FRUITS[pendingTier].r;
      return Math.max(r + 2, Math.min(W - r - 2, x));
    };
    const onMove = (e: PointerEvent) => {
      pendingX = toLocalX(e.clientX);
    };
    const onDown = (e: PointerEvent) => {
      pendingX = toLocalX(e.clientX);
      if (!canDrop || ended) return;
      addFruit(pendingTier, pendingX, DROP_Y);
      canDrop = false;
      pendingTier = upcomingTier;
      upcomingTier = Math.floor(Math.random() * DROPPABLE);
      setNextTier(upcomingTier);
      setTimeout(() => {
        canDrop = true;
      }, 480);
    };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onDown);

    // 그리기 (과일 캐릭터 스프라이트, 미로드 시 원으로 대체)
    function drawFruit(x: number, y: number, tier: number, ghost = false) {
      const f = FRUITS[tier];
      const sprite = sprites[tier];
      ctx.globalAlpha = ghost ? 0.4 : 1;
      if (sprite && sprite.complete && sprite.naturalWidth > 0) {
        const d = f.r * 2.1;
        ctx.drawImage(sprite, x - d / 2, y - d / 2, d, d);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function render() {
      ctx.clearRect(0, 0, W, H);
      // 배경
      ctx.fillStyle = '#eff4ff';
      ctx.fillRect(0, 0, W, H);
      // 위험선
      ctx.strokeStyle = 'rgba(186,26,26,0.5)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(0, DANGER_Y);
      ctx.lineTo(W, DANGER_Y);
      ctx.stroke();
      ctx.setLineDash([]);
      // 대기 과일 + 가이드
      if (!ended) {
        ctx.strokeStyle = 'rgba(65,94,146,0.25)';
        ctx.beginPath();
        ctx.moveTo(pendingX, DROP_Y);
        ctx.lineTo(pendingX, H);
        ctx.stroke();
        drawFruit(pendingX, DROP_Y, pendingTier, true);
      }
      // 과일들
      for (const body of Composite.allBodies(engine.world)) {
        const fb = body as FruitBody;
        if (fb.tier == null) continue;
        drawFruit(fb.position.x, fb.position.y, fb.tier);
      }
    }

    function loop() {
      const now = Date.now();
      const dt = Math.min(32, now - last);
      last = now;
      Engine.update(engine, dt);

      // 게임오버 판정(즉시): 위험선 아래로 완전히 진입했던 과일이
      // 다시 위험선 위로 넘어가는 순간 종료
      let danger = false;
      for (const body of Composite.allBodies(engine.world)) {
        const fb = body as FruitBody;
        if (fb.tier == null) continue;
        const top = fb.position.y - FRUITS[fb.tier].r;
        if (!fb.entered) {
          if (top > DANGER_Y) fb.entered = true; // 선 아래로 완전히 내려옴
        } else if (top < DANGER_Y) {
          danger = true;
          break;
        }
      }
      render();

      if (danger && !ended) {
        ended = true;
        finish();
        return;
      }
      raf = requestAnimationFrame(loop);
    }

    function finish() {
      setGameOver(true);
      const finalScore = scoreRef.current;
      postScore(player!.id, 'watermelon', finalScore)
        .then((r) => setWallet(r.total))
        .catch(() => {});
    }

    raf = requestAnimationFrame(loop);

    // 정리
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      Events.off(engine, 'collisionStart');
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [player, round]);

  function restart() {
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setRound((r) => r + 1);
  }

  if (!player) return null;

  return (
    <main className="page wgame">
      <div className="wgame__bar">
        <button className="wgame__back" onClick={() => navigate('/game')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="wgame__player">
          <span className="wgame__avatar" style={{ background: player.color }}>
            {player.short}
          </span>
          <span>{player.name}</span>
        </div>
        <div className="wgame__next">
          <span className="wgame__next-label">다음</span>
          <span className="wgame__next-dot" style={{ background: FRUITS[nextTier].color }}>
            {FRUITS[nextTier].name}
          </span>
        </div>
      </div>

      <div className="wgame__scores">
        <div className="wgame__score">
          <span className="wgame__score-label">이번 점수</span>
          <span className="wgame__score-value">{score}</span>
        </div>
        <div className="wgame__score">
          <span className="wgame__score-label">보유 점수</span>
          <span className="wgame__score-value">{wallet}</span>
        </div>
      </div>

      <div className="wgame__stage">
        <canvas ref={canvasRef} className="wgame__canvas" />
        {gameOver && (
          <div className="wgame__over">
            <div className="wgame__over-card">
              <h3>게임 오버</h3>
              <p className="wgame__over-score">+{score}점</p>
              <p className="wgame__over-best">{player.name} 보유 {wallet}점</p>
              <div className="wgame__over-btns">
                <button className="wgame__btn wgame__btn--primary" onClick={restart}>
                  다시하기
                </button>
                <button className="wgame__btn" onClick={() => navigate('/game')}>
                  게임 목록
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="wgame__hint">화면을 눌러 과일을 떨어뜨리고, 같은 과일을 합쳐 수박을 만들어보세요!</p>
    </main>
  );
}
