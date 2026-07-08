/**
 * 게임 관련 라우터
 * 플레이어 · 게임 · 점수 엔드포인트를 정의합니다.
 */
const express = require('express');
const router = express.Router();
const {
  getPlayers,
  getGames,
  getRanking,
  getGameScores,
  postScore,
} = require('../controllers/gameController');

router.get('/players', getPlayers); // 플레이어 목록(+점수)
router.get('/games', getGames); // 게임 목록
router.get('/ranking', getRanking); // 총합 랭킹
router.get('/scores/:game', getGameScores); // 게임별 점수
router.post('/scores', postScore); // 점수 기록

module.exports = router;
