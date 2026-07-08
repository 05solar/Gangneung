// 게임에서 선택한 플레이어를 화면 간에 공유하기 위한 Context
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Player } from '../types';

interface GameState {
  player: Player | null;
  setPlayer: (p: Player | null) => void;
}

const GameContext = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);
  return <GameContext.Provider value={{ player, setPlayer }}>{children}</GameContext.Provider>;
}

export function useGame(): GameState {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame 은 GameProvider 안에서 사용해야 합니다.');
  return ctx;
}
