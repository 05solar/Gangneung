import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedPlayer } from '../lib/useSelectedPlayer';
import { postScore } from '../lib/api';
import GameHeader from '../components/GameHeader';
import './WordleGame.css';

// 정답 후보 (5글자 영어 단어)
const WORDS = [
  'APPLE', 'BEACH', 'CANDY', 'DREAM', 'EAGLE', 'FLAME', 'GRAPE', 'HEART',
  'IGLOO', 'JELLY', 'KOALA', 'LEMON', 'MANGO', 'NIGHT', 'OCEAN', 'PIANO',
  'QUEEN', 'ROBOT', 'SUGAR', 'TIGER', 'UNITY', 'VIVID', 'WATER', 'YACHT',
  'ZEBRA', 'MUSIC', 'HAPPY', 'SMILE', 'CLOUD', 'PLANT',
];
const ROWS = 6;
const KEYS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

type Mark = 'correct' | 'present' | 'absent';

function evaluate(guess: string, answer: string): Mark[] {
  const res: Mark[] = Array(5).fill('absent');
  const rem: (string | null)[] = answer.split('');
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      res[i] = 'correct';
      rem[i] = null;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (res[i] === 'correct') continue;
    const idx = rem.indexOf(guess[i]);
    if (idx !== -1) {
      res[i] = 'present';
      rem[idx] = null;
    }
  }
  return res;
}

export default function WordleGame() {
  const player = useSelectedPlayer();
  const navigate = useNavigate();

  const [answer, setAnswer] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [wallet, setWallet] = useState(0);
  const [gained, setGained] = useState(0);
  const [shake, setShake] = useState(false);
  const posted = useRef(false);

  const newGame = useCallback(() => {
    setAnswer(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuesses([]);
    setCurrent('');
    setStatus('playing');
    setGained(0);
    posted.current = false;
  }, []);

  useEffect(() => {
    newGame();
  }, [newGame]);

  useEffect(() => {
    if (player?.total != null) setWallet(player.total);
  }, [player]);

  // 게임 종료 시 점수 누적
  useEffect(() => {
    if (status === 'playing' || !player || posted.current) return;
    posted.current = true;
    const pts = status === 'won' ? 500 : 0;
    setGained(pts);
    postScore(player.id, 'wordle', pts)
      .then((r) => setWallet(r.total))
      .catch(() => {});
  }, [status, player, guesses.length]);

  const submit = useCallback(() => {
    if (current.length !== 5) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    const next = [...guesses, current];
    setGuesses(next);
    if (current === answer) setStatus('won');
    else if (next.length >= ROWS) setStatus('lost');
    setCurrent('');
  }, [current, guesses, answer]);

  const press = useCallback(
    (k: string) => {
      if (status !== 'playing') return;
      if (k === 'ENTER') submit();
      else if (k === 'DEL') setCurrent((c) => c.slice(0, -1));
      else if (/^[A-Z]$/.test(k)) setCurrent((c) => (c.length < 5 ? c + k : c));
    },
    [status, submit]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') press('ENTER');
      else if (e.key === 'Backspace') press('DEL');
      else if (/^[a-zA-Z]$/.test(e.key)) press(e.key.toUpperCase());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press]);

  // 키보드 글자 상태
  const letterState: Record<string, Mark> = {};
  const rank: Record<Mark, number> = { absent: 0, present: 1, correct: 2 };
  for (const g of guesses) {
    const marks = evaluate(g, answer);
    for (let i = 0; i < 5; i++) {
      const ch = g[i];
      if (!letterState[ch] || rank[marks[i]] > rank[letterState[ch]]) letterState[ch] = marks[i];
    }
  }

  if (!player) return null;

  return (
    <main className="page wordle">
      <GameHeader gameId="wordle" title="워들" player={player} />

      <div className="wordle__topbar">
        <span className="wordle__wallet">보유 {wallet}점</span>
        <button className="wordle__new" onClick={newGame}>
          새 단어
        </button>
      </div>

      <div className={'wordle__grid' + (shake ? ' shake' : '')}>
        {Array.from({ length: ROWS }).map((_, r) => {
          const g = guesses[r];
          const marks = g ? evaluate(g, answer) : null;
          const letters = g ?? (r === guesses.length ? current : '');
          return (
            <div key={r} className="wordle__row">
              {Array.from({ length: 5 }).map((__, c) => (
                <div key={c} className={'wordle__cell' + (marks ? ' ' + marks[c] : letters[c] ? ' filled' : '')}>
                  {letters[c] ?? ''}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {status !== 'playing' && (
        <div className={'wordle__result ' + status}>
          {status === 'won' ? (
            <span>정답! <b>{answer}</b> · +{gained}점</span>
          ) : (
            <span>아쉬워요! 정답은 <b>{answer}</b></span>
          )}
        </div>
      )}

      <div className="wordle__keyboard">
        {KEYS.map((row, i) => (
          <div key={i} className="wordle__krow">
            {i === 2 && <button className="wordle__key wide" onClick={() => press('ENTER')}>Enter</button>}
            {row.split('').map((k) => (
              <button
                key={k}
                className={'wordle__key' + (letterState[k] ? ' ' + letterState[k] : '')}
                onClick={() => press(k)}
              >
                {k}
              </button>
            ))}
            {i === 2 && <button className="wordle__key wide" onClick={() => press('DEL')}>⌫</button>}
          </div>
        ))}
      </div>

      {status !== 'playing' && (
        <button className="wordle__list" onClick={() => navigate('/game')}>
          게임 목록으로
        </button>
      )}
    </main>
  );
}
