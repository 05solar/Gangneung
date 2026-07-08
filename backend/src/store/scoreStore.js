/**
 * 점수 저장소 (누적 방식)
 * ------------------------------------------------------------------
 * 플레이어별 · 게임별 "누적 점수" 를 관리합니다.
 * 게임을 끝낼 때마다 그 판의 최종 점수가 더해지며(블랙잭은 승패에 따라 +/-),
 * 모든 게임의 누적 점수를 합쳐 총합 랭킹을 만듭니다.
 * DB 없이 JSON 파일(scores.json)에 저장하여 서버 재시작 후에도 유지됩니다.
 *
 * 구조:
 * { watermelon: { "1": { score: 1240, plays: 5, last: 320 }, ... }, ... }
 *  - score : 누적 점수
 *  - plays : 플레이 횟수
 *  - last  : 마지막 판 점수(증감분)
 */
const fs = require('fs');
const path = require('path');

// 점수 저장 위치: 코드와 분리된 별도 data 디렉터리 (도커 볼륨으로 영구 보존).
// DATA_DIR 환경변수로 재정의 가능. 기본값은 backend/data (컨테이너에선 /app/data).
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
const FILE = path.join(DATA_DIR, 'scores.json');
try {
  fs.mkdirSync(DATA_DIR, { recursive: true });
} catch (err) {
  console.error('데이터 디렉터리 생성 실패:', err.message);
}

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  } catch {
    return {};
  }
}
function save(data) {
  try {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('점수 저장 실패:', err.message);
  }
}

let store = load();

// 특정 게임의 전체 점수(플레이어별) 반환
function getScores(game) {
  return store[game] || {};
}

// 전체 저장소 반환
function getAll() {
  return store;
}

// 특정 플레이어의 게임별 누적 점수 + 합계(raw, 기본지급 제외) 반환
function getPlayerBreakdown(playerId, gameIds) {
  const id = String(playerId);
  const perGame = {};
  let sum = 0;
  for (const g of gameIds) {
    const s = store[g]?.[id]?.score || 0;
    perGame[g] = s;
    sum += s;
  }
  return { perGame, sum };
}

// 점수 누적: delta 를 더함 (블랙잭 패배 시 음수 가능)
function recordScore(game, playerId, delta) {
  const id = String(playerId);
  if (!store[game]) store[game] = {};
  const cur = store[game][id] || { score: 0, plays: 0, last: 0 };
  const next = {
    score: cur.score + delta,
    plays: cur.plays + 1,
    last: delta,
  };
  store[game][id] = next;
  save(store);
  return next;
}

module.exports = { getScores, getAll, getPlayerBreakdown, recordScore };
