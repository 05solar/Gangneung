# 강릉 여행 일정 · 백엔드 (Backend)

강릉 여행 일정 앱의 API 서버입니다. **Node.js + Express** 로 구현했으며,
2박 3일 강릉 여행 일정 데이터를 REST API 로 제공합니다.

---

## 🗂 폴더 구조

```
backend/
├── server.js                    # 서버 진입점 (포트 실행)
├── package.json
├── Dockerfile                   # Node 20 기반 API 이미지
├── README.md
└── src/
    ├── app.js                   # Express 앱 구성 (미들웨어 · 라우터 연결)
    ├── routes/
    │   ├── itinerary.js         # 일정 엔드포인트
    │   └── game.js              # 게임(플레이어·점수) 엔드포인트
    ├── controllers/
    │   ├── itineraryController.js  # 일정 요청 처리
    │   └── gameController.js       # 게임 요청 처리
    ├── store/
    │   └── scoreStore.js        # 점수 저장소 (scores.json 파일 영속화)
    └── data/
        ├── itinerary.js         # 일정 데이터 (단일 진실 공급원)
        └── players.js           # 플레이어(6명) · 게임 목록
```

### 각 파일 역할
| 파일 | 설명 |
|------|------|
| `server.js` | `app.js` 를 불러와 포트(기본 4000)에서 서버를 실행합니다. |
| `src/app.js` | CORS·JSON 파서 등 미들웨어를 등록하고 라우터를 연결합니다. |
| `src/routes/itinerary.js` | URL 경로와 컨트롤러 함수를 연결합니다. |
| `src/controllers/itineraryController.js` | 실제 응답 데이터를 만들어 반환합니다. |
| `src/data/itinerary.js` | 여행 정보·3일치 일정이 담긴 데이터 원본입니다. |

---

## 🚀 실행 방법

```bash
cd backend
npm install      # 최초 1회 의존성 설치
npm start        # http://localhost:4000 에서 실행
# 또는 파일 변경 자동 반영:
npm run dev
```

도커로 실행 (프론트와 함께 통합):
```bash
cd ..            # 프로젝트 루트
docker compose up --build    # 프론트 http://localhost:8080 / API http://localhost:4000
```

---

## 📡 API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/itinerary` | 여행 정보 + 전체 일정(3일)을 한 번에 |
| GET | `/api/trip` | 여행 기본 정보(숙소·이동수단) |
| GET | `/api/days` | 일자 요약 목록 |
| GET | `/api/days/:id` | 특정 일자(1·2·3) 상세 일정 |
| GET | `/api/players?game=<id>` | 플레이어 6명 (+게임 누적점수·게임별 점수·총점) |
| GET | `/api/games` | 제공 게임 목록 (수박게임·2048·워들·블랙잭) |
| GET | `/api/ranking` | 모든 게임 합산 **총합 랭킹** (내림차순) |
| GET | `/api/scores/:game` | 게임별 플레이어 점수 |
| POST | `/api/scores` | 점수 **누적** `{ playerId, game, score }` (score=이번 판 증감분) |

### 점수 저장 (누적 방식)
- 점수는 `src/data/scores.json` 에 **플레이어별·게임별 누적 점수**로 저장됩니다.
- 게임을 끝낼 때마다 그 판의 점수가 **더해집니다**(블랙잭 패배 시 음수도 가능).
- 각 플레이어의 **보유 점수(total)** = 기본 지급 `STARTING_POINTS(0)` + 모든 게임 누적 점수 합.
  - 이 보유 점수가 **총합 랭킹**의 기준이자, **블랙잭 베팅 재원**입니다.
  - 0점부터 시작하므로, **돌깨기** 등으로 점수를 모아야 블랙잭 베팅이 가능합니다.
- 서버를 재시작해도 유지되며, 파일이 없으면 자동 생성됩니다. (git 에는 커밋되지 않음)

### 응답 예시 — `GET /api/days/2`
```json
{
  "id": 2,
  "label": "Day 2",
  "title": "강릉 미식 & 바다 투어",
  "events": [
    {
      "time": "09:00",
      "emoji": "🥣",
      "title": "초당순두부마을",
      "place": "초당동",
      "description": "강릉을 대표하는 초당순두부로 아침 식사...",
      "tags": ["아침", "향토음식"],
      "transport": "택시",
      "highlight": false
    }
  ]
}
```

---

## 🧩 데이터 모델

**Trip (여행 정보)**
- `title`, `subtitle`, `nights`, `days`
- `accommodation`: `{ name, address, checkIn, note }` — 숙소(진리항구2길 5)
- `transport`: `{ primary, note }` — 이동 수단(택시/도보)

**Day (일자)**
- `id`, `label`, `title`, `subtitle`, `date`, `badge`, `weather`
- `events[]`: 아래 이벤트 목록
- (Day 3) `summary`: 여행 요약 통계

**Event (일정 항목)**
- `time`, `period`, `emoji`, `title`, `place`, `description`
- `tags[]`: 라벨(간식·카페·해변 등)
- `transport`: `"택시"` 또는 `"도보"`
- `highlight`, `mustSee`: 강조 표시 여부
