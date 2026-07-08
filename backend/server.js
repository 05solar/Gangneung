/**
 * 서버 진입점
 * app.js 에서 구성한 Express 앱을 지정한 포트로 실행합니다.
 */
const app = require('./src/app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 강릉 여행 API 서버 실행 중 → http://localhost:${PORT}`);
});
