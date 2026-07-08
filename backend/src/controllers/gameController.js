/**
 * 게임 컨트롤러
 * 플레이어 · 게임 · 누적 점수 · 총합 랭킹을 처리합니다.
 *
 * 점수는 누적 방식입니다. 각 플레이어의 총 보유 점수(total)는
 *   기본 지급(STARTING_POINTS) + 모든 게임의 누적 점수 합
 * 이며, 블랙잭 베팅 재원(보유 점수)으로도 사용됩니다.
 */
const { players, games, STARTING_POINTS } = require('../data/players');
const { getScores, getPlayerBreakdown, recordScore } = require('../store/scoreStore');

const gameIds = games.map((g) => g.id);
const totalOf = (playerId) => {
  const { perGame, sum } = getPlayerBreakdown(playerId, gameIds);
  return { perGame, total: STARTING_POINTS + sum };
};

// GET /api/players?game=<id>
function getPlayers(req, res) {
  const game = req.query.game;
  const scores = game ? getScores(game) : {};
  const withScores = players.map((p) => {
    const { perGame, total } = totalOf(p.id);
    return {
      ...p,
      score: scores[String(p.id)] || { score: 0, plays: 0, last: 0 },
      perGame,
      total,
    };
  });
  res.json(withScores);
}

// GET /api/games
function getGames(req, res) {
  res.json(games);
}

// GET /api/ranking - 모든 게임 누적 점수 + 기본지급을 합산한 총합 랭킹
function getRanking(req, res) {
  const ranked = players
    .map((p) => {
      const { perGame, total } = totalOf(p.id);
      return { id: p.id, name: p.name, short: p.short, color: p.color, perGame, total };
    })
    .sort((a, b) => b.total - a.total);
  res.json(ranked);
}

// GET /api/scores/:game
function getGameScores(req, res) {
  res.json(getScores(req.params.game));
}

// POST /api/scores - 점수 누적 { playerId, game, score(증감분) }
function postScore(req, res) {
  const { playerId, game, score } = req.body || {};
  if (playerId == null || !game || typeof score !== 'number') {
    return res.status(400).json({ error: 'playerId, game, score(숫자) 가 필요합니다.' });
  }
  if (!gameIds.includes(game)) {
    return res.status(404).json({ error: '존재하지 않는 게임입니다.' });
  }
  if (!players.some((p) => p.id === Number(playerId))) {
    return res.status(404).json({ error: '존재하지 않는 플레이어입니다.' });
  }

  const result = recordScore(game, playerId, Math.floor(score));
  const { total } = totalOf(Number(playerId));
  res.json({ playerId: Number(playerId), game, ...result, total });
}

module.exports = { getPlayers, getGames, getRanking, getGameScores, postScore };
