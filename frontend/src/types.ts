// 백엔드 API 응답 타입 정의

export interface Accommodation {
  name: string;
  address: string;
  checkIn: string;
  note: string;
}

export interface Transport {
  primary: string;
  note: string;
}

export interface Trip {
  title: string;
  subtitle: string;
  nights: number;
  days: number;
  accommodation: Accommodation;
  transport: Transport;
}

export interface Weather {
  temp: string;
  humidity: string;
  wind: string;
  sky: string;
}

export interface ItineraryEvent {
  time: string;
  period: string;
  icon: string; // Material Symbols 아이콘 이름
  title: string;
  place: string;
  mapQuery: string; // 카카오맵 길찾기용 검색어
  tags: string[];
  transport: '택시' | '도보';
  durationMin: number | null; // 직전 일정에서 이곳까지 이동 소요시간(분)
  image: string; // 일정 대표 이미지 URL
  highlight?: boolean;
  mustSee?: boolean;
  confirmation?: string;
}

export interface Day {
  id: number;
  label: string;
  phase: string;
  theme: string;
  title: string;
  subtitle: string;
  date: string;
  badge: string;
  weather: Weather | null;
  events: ItineraryEvent[];
}

export interface Itinerary {
  trip: Trip;
  days: Day[];
}

// ----- 게임 관련 -----
export interface PlayerScore {
  score: number; // 누적 점수
  plays: number;
  last: number;
}

export interface Player {
  id: number;
  name: string;
  short: string;
  color: string;
  score?: PlayerScore; // 특정 게임 최고점
  perGame?: Record<string, number>; // 게임별 최고점
  total?: number; // 모든 게임 합산 총점
}

export interface Game {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

export interface RankEntry {
  id: number;
  name: string;
  short: string;
  color: string;
  perGame: Record<string, number>;
  total: number;
}
