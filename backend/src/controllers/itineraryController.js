/**
 * 일정 컨트롤러
 * 라우터에서 호출되는 요청 처리 로직을 모아둡니다.
 * 일정은 itineraryStore 를 통해 읽고/수정합니다(편집 시 볼륨에 영구 저장).
 */
const store = require('../store/itineraryStore');

// GET /api/trip - 여행 기본 정보(숙소, 이동수단 등)
function getTrip(req, res) {
  res.json(store.get().trip);
}

// GET /api/days - 전체 일자 요약 목록
function getDays(req, res) {
  const { days } = store.get();
  const summary = days.map(({ id, label, phase, theme, title, subtitle, date, badge, events }) => ({
    id,
    label,
    phase,
    theme,
    title,
    subtitle,
    date,
    badge,
    eventCount: events.length,
  }));
  res.json(summary);
}

// GET /api/days/:id - 특정 일자의 상세 일정
function getDayById(req, res) {
  const id = Number(req.params.id);
  const day = store.get().days.find((d) => d.id === id);
  if (!day) {
    return res.status(404).json({ error: `Day ${req.params.id} 를 찾을 수 없습니다.` });
  }
  res.json(day);
}

// GET /api/itinerary - 여행 정보 + 전체 일정을 한 번에
function getFullItinerary(req, res) {
  res.json(store.get());
}

// 형식 검증 (최소한의 안전장치)
function isValid(data) {
  return (
    data &&
    typeof data === 'object' &&
    data.trip &&
    Array.isArray(data.days) &&
    data.days.every((d) => d && typeof d.id === 'number' && Array.isArray(d.events))
  );
}

// PUT /api/itinerary - 전체 일정 수정/저장
function updateItinerary(req, res) {
  const data = req.body;
  if (!isValid(data)) {
    return res.status(400).json({ error: '올바른 일정 형식이 아닙니다. (trip, days[] 필요)' });
  }
  res.json(store.save(data));
}

// POST /api/itinerary/reset - 기본 일정으로 초기화
function resetItinerary(req, res) {
  res.json(store.reset());
}

module.exports = {
  getTrip,
  getDays,
  getDayById,
  getFullItinerary,
  updateItinerary,
  resetItinerary,
};
