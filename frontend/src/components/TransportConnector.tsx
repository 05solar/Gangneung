import { openKakaoRoute } from '../lib/kakao';
import './TransportConnector.css';

interface Props {
  from: string; // 출발지 검색어
  to: string; // 도착지 검색어
  transport: '택시' | '도보';
  durationMin: number | null; // 이동 소요시간(분)
  cost?: number; // 이동 비용(원)
}

// 일정 사이에 표시되는 이동수단 미니 박스 (원형 아이콘 + 소요시간 + 비용)
// 클릭하면 카카오맵 길찾기(출발→도착) 창이 열립니다.
export default function TransportConnector({ from, to, transport, durationMin, cost }: Props) {
  const icon = transport === '도보' ? 'directions_walk' : 'local_taxi';
  const mod = transport === '도보' ? 'walk' : 'taxi';
  return (
    <div className="connector">
      <span className="connector__line" />
      <button
        className={'connector__pill connector__pill--' + mod}
        onClick={() => openKakaoRoute(from, to)}
        title={`${from} → ${to} 카카오맵 길찾기`}
      >
        <span className="connector__bubble">
          <span className="material-symbols-outlined">{icon}</span>
        </span>
        <span className="connector__text">
          <b>{transport}</b>
          {durationMin != null && <span className="connector__time">약 {durationMin}분</span>}
          {cost != null && cost > 0 && (
            <span className="connector__cost">{cost.toLocaleString()}원</span>
          )}
        </span>
        <span className="material-symbols-outlined connector__map">map</span>
      </button>
      <span className="connector__line" />
    </div>
  );
}
