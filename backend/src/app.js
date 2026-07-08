/**
 * Express 앱 구성
 * 미들웨어 등록과 라우터 연결을 담당합니다. (서버 실행은 server.js)
 */
const express = require('express');
const cors = require('cors');
const itineraryRouter = require('./routes/itinerary');
const gameRouter = require('./routes/game');

const app = express();

// 미들웨어
app.use(cors()); // 프론트(Vite)에서의 요청 허용
app.use(express.json());

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'gangneung-itinerary-api' });
});

// API 라우터
app.use('/api', itineraryRouter);
app.use('/api', gameRouter);

// 루트 안내
app.get('/', (req, res) => {
  res.json({
    service: '강릉 여행 일정 API',
    endpoints: [
      'GET /api/health',
      'GET /api/itinerary',
      'GET /api/trip',
      'GET /api/days',
      'GET /api/days/:id',
      'GET /api/players?game=watermelon',
      'GET /api/games',
      'GET /api/scores/:game',
      'POST /api/scores',
    ],
  });
});

// 404 처리
app.use((req, res) => {
  res.status(404).json({ error: '요청하신 경로를 찾을 수 없습니다.' });
});

module.exports = app;
