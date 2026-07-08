import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedPlayer } from '../lib/useSelectedPlayer';
import { postScore } from '../lib/api';
import GameHeader from '../components/GameHeader';
import './BlackjackGame.css';

type Suit = '♠' | '♥' | '♦' | '♣';
interface Card {
  rank: string;
  suit: Suit;
}
type Phase = 'bet' | 'player' | 'result';

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const BET_PRESETS = [50, 100, 200, 500];

function freshDeck(): Card[] {
  const deck: Card[] = [];
  for (const s of SUITS) for (const r of RANKS) deck.push({ rank: r, suit: s });
  // Fisher-Yates
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
function cardValue(rank: string): number {
  if (rank === 'A') return 11;
  if (['K', 'Q', 'J'].includes(rank)) return 10;
  return Number(rank);
}
function handValue(cards: Card[]): number {
  let total = cards.reduce((s, c) => s + cardValue(c.rank), 0);
  let aces = cards.filter((c) => c.rank === 'A').length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}
const isBlackjack = (cards: Card[]) => cards.length === 2 && handValue(cards) === 21;

function CardView({ card, hidden }: { card?: Card; hidden?: boolean }) {
  if (hidden || !card) return <div className="bj-card bj-card--back" />;
  const red = card.suit === '♥' || card.suit === '♦';
  return (
    <div className={'bj-card' + (red ? ' bj-card--red' : '')}>
      <span className="bj-card__rank">{card.rank}</span>
      <span className="bj-card__suit">{card.suit}</span>
    </div>
  );
}

export default function BlackjackGame() {
  const player = useSelectedPlayer();
  const navigate = useNavigate();

  const deck = useRef<Card[]>([]);
  const [wallet, setWallet] = useState(0);
  const [bet, setBet] = useState(50);
  const [phase, setPhase] = useState<Phase>('bet');
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [reveal, setReveal] = useState(false); // 딜러 히든카드 공개
  const [message, setMessage] = useState('');
  const [showHelp, setShowHelp] = useState(true);

  useEffect(() => {
    if (player?.total != null) setWallet(player.total);
  }, [player]);

  const draw = (): Card => {
    if (deck.current.length < 10) deck.current = freshDeck();
    return deck.current.pop()!;
  };

  // 정산 후 점수 누적
  const settle = useCallback(
    (pc: Card[], dc: Card[]) => {
      const pv = handValue(pc);
      const dv = handValue(dc);
      const pbj = isBlackjack(pc);
      const dbj = isBlackjack(dc);
      let delta = 0;
      let msg = '';
      if (pv > 21) { delta = -bet; msg = '버스트! 패배'; }
      else if (pbj && !dbj) { delta = bet * 3; msg = '블랙잭! 승리'; }
      else if (dbj && !pbj) { delta = -bet; msg = '딜러 블랙잭! 패배'; }
      else if (dv > 21) { delta = bet * 3; msg = '딜러 버스트! 승리'; }
      else if (pv > dv) { delta = bet * 3; msg = '승리!'; }
      else if (pv < dv) { delta = -bet; msg = '패배'; }
      else { delta = 0; msg = '무승부 (푸시)'; }

      setMessage(`${msg}  ${delta > 0 ? '+' : ''}${delta}점`);
      setPhase('result');
      setReveal(true);
      if (player) {
        postScore(player.id, 'blackjack', delta)
          .then((r) => setWallet(r.total))
          .catch(() => setWallet((w) => w + delta));
      }
    },
    [bet, player]
  );

  const deal = () => {
    if (bet < 10 || bet > wallet) return;
    const pc = [draw(), draw()];
    const dc = [draw(), draw()];
    setPlayerCards(pc);
    setDealerCards(dc);
    setReveal(false);
    setMessage('');
    if (isBlackjack(pc) || isBlackjack(dc)) {
      settle(pc, dc);
    } else {
      setPhase('player');
    }
  };

  const hit = () => {
    const pc = [...playerCards, draw()];
    setPlayerCards(pc);
    if (handValue(pc) >= 21) {
      // 21이거나 버스트면 딜러 진행 후 정산
      dealerPlayAndSettle(pc);
    }
  };

  const stand = () => dealerPlayAndSettle(playerCards);

  const dealerPlayAndSettle = (pc: Card[]) => {
    const dc = [...dealerCards];
    if (handValue(pc) <= 21) {
      while (handValue(dc) < 17) dc.push(draw());
    }
    setDealerCards(dc);
    settle(pc, dc);
  };

  const nextRound = () => {
    setPhase('bet');
    setPlayerCards([]);
    setDealerCards([]);
    setReveal(false);
    setMessage('');
    if (bet > wallet) setBet(Math.min(...BET_PRESETS));
  };

  if (!player) return null;

  const canBet = (v: number) => v <= wallet && v >= 10;

  return (
    <main className="page bj">
      <GameHeader gameId="blackjack" title="블랙잭" player={player} />

      {/* 설명창 */}
      <section className="bj-help">
        <button className="bj-help__toggle" onClick={() => setShowHelp((s) => !s)}>
          <span className="material-symbols-outlined">help</span>
          게임 설명
          <span className="material-symbols-outlined">{showHelp ? 'expand_less' : 'expand_more'}</span>
        </button>
        {showHelp && (
          <div className="bj-help__body">
            <p>· 카드 합을 <b>21</b>에 최대한 가깝게! 21을 넘기면 <b>버스트(패배)</b>입니다.</p>
            <p>· A는 1 또는 11, J·Q·K는 10으로 계산됩니다.</p>
            <p>· <b>히트</b>는 카드 추가, <b>스탠드</b>는 멈춤. 딜러는 17 이상이 될 때까지 받습니다.</p>
            <p>· 딜러보다 높으면 승리! <b>이기면 베팅 점수의 3배</b>를 얻습니다.</p>
            <p>· <b>보유 점수</b>에서 베팅하며, 승패에 따라 점수가 오르내려 랭킹에 누적됩니다.</p>
          </div>
        )}
      </section>

      <div className="bj-wallet">
        <span>보유 점수</span>
        <b>{wallet}</b>
      </div>

      {/* 딜러 */}
      <div className="bj-area">
        <div className="bj-area__label">
          딜러 {reveal ? `· ${handValue(dealerCards)}` : ''}
        </div>
        <div className="bj-hand">
          {dealerCards.map((c, i) => (
            <CardView key={i} card={c} hidden={!reveal && i === 1} />
          ))}
          {dealerCards.length === 0 && <div className="bj-card bj-card--empty" />}
        </div>
      </div>

      {/* 플레이어 */}
      <div className="bj-area">
        <div className="bj-area__label">
          내 카드 {playerCards.length ? `· ${handValue(playerCards)}` : ''}
        </div>
        <div className="bj-hand">
          {playerCards.map((c, i) => (
            <CardView key={i} card={c} />
          ))}
          {playerCards.length === 0 && <div className="bj-card bj-card--empty" />}
        </div>
      </div>

      {message && <div className="bj-message">{message}</div>}

      {/* 컨트롤 */}
      {phase === 'bet' && (
        <div className="bj-controls">
          <div className="bj-bet">
            <span className="bj-bet__label">베팅</span>
            <div className="bj-bet__chips">
              {BET_PRESETS.map((v) => (
                <button
                  key={v}
                  disabled={!canBet(v)}
                  className={'bj-chip' + (bet === v ? ' on' : '')}
                  onClick={() => setBet(v)}
                >
                  {v}
                </button>
              ))}
              <button
                disabled={wallet < 10}
                className={'bj-chip' + (bet === wallet ? ' on' : '')}
                onClick={() => setBet(wallet)}
              >
                올인
              </button>
            </div>
          </div>
          {wallet < 10 ? (
            <p className="bj-warn">보유 점수가 부족합니다. 다른 게임으로 점수를 모아보세요!</p>
          ) : (
            <button className="bj-btn bj-btn--primary" onClick={deal} disabled={!canBet(bet)}>
              {bet}점 베팅하고 시작
            </button>
          )}
        </div>
      )}

      {phase === 'player' && (
        <div className="bj-controls bj-controls--row">
          <button className="bj-btn" onClick={hit}>히트</button>
          <button className="bj-btn bj-btn--primary" onClick={stand}>스탠드</button>
        </div>
      )}

      {phase === 'result' && (
        <div className="bj-controls bj-controls--row">
          <button className="bj-btn bj-btn--primary" onClick={nextRound}>다음 판</button>
          <button className="bj-btn" onClick={() => navigate('/game')}>게임 목록</button>
        </div>
      )}
    </main>
  );
}
