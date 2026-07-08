// 백엔드 API 호출 유틸
// 개발 중에는 vite.config.ts 의 proxy 설정으로 /api → localhost:4000 으로 전달됩니다.
import type { Itinerary, Player, Game, PlayerScore, RankEntry } from '../types';

const BASE = '/api';

export async function fetchItinerary(): Promise<Itinerary> {
  const res = await fetch(`${BASE}/itinerary`);
  if (!res.ok) throw new Error(`일정을 불러오지 못했습니다. (status: ${res.status})`);
  return res.json();
}

// 일정 수정/저장 (전체 일정을 보내면 서버가 볼륨에 영구 저장)
export async function updateItinerary(data: Itinerary): Promise<Itinerary> {
  const res = await fetch(`${BASE}/itinerary`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('일정 저장에 실패했습니다.');
  return res.json();
}

// 일정을 기본값으로 초기화
export async function resetItinerary(): Promise<Itinerary> {
  const res = await fetch(`${BASE}/itinerary/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('일정 초기화에 실패했습니다.');
  return res.json();
}

// 플레이어 목록 (+ 해당 게임 점수)
export async function fetchPlayers(game?: string): Promise<Player[]> {
  const q = game ? `?game=${encodeURIComponent(game)}` : '';
  const res = await fetch(`${BASE}/players${q}`);
  if (!res.ok) throw new Error('플레이어 목록을 불러오지 못했습니다.');
  return res.json();
}

// 게임 목록
export async function fetchGames(): Promise<Game[]> {
  const res = await fetch(`${BASE}/games`);
  if (!res.ok) throw new Error('게임 목록을 불러오지 못했습니다.');
  return res.json();
}

// 총합 랭킹 (모든 게임 점수 합산)
export async function fetchRanking(): Promise<RankEntry[]> {
  const res = await fetch(`${BASE}/ranking`);
  if (!res.ok) throw new Error('랭킹을 불러오지 못했습니다.');
  return res.json();
}

// 점수 기록(누적). score 는 이번 판의 증감분. 반환에 갱신된 total(보유 점수) 포함.
export async function postScore(
  playerId: number,
  game: string,
  score: number
): Promise<PlayerScore & { playerId: number; game: string; total: number }> {
  const res = await fetch(`${BASE}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, game, score }),
  });
  if (!res.ok) throw new Error('점수 저장에 실패했습니다.');
  return res.json();
}
