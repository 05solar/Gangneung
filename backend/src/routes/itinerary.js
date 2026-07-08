/**
 * 일정 관련 라우터
 * /api 하위 엔드포인트를 정의합니다.
 */
const express = require('express');
const router = express.Router();
const {
  getTrip,
  getDays,
  getDayById,
  getFullItinerary,
  updateItinerary,
  resetItinerary,
} = require('../controllers/itineraryController');

router.get('/itinerary', getFullItinerary); // 여행정보 + 전체 일정
router.put('/itinerary', updateItinerary); // 일정 수정/저장
router.post('/itinerary/reset', resetItinerary); // 기본 일정으로 초기화
router.get('/trip', getTrip); // 여행 기본 정보
router.get('/days', getDays); // 일자 요약 목록
router.get('/days/:id', getDayById); // 특정 일자 상세

module.exports = router;
