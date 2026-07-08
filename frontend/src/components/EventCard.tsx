import type { ItineraryEvent } from '../types';
import './EventCard.css';

interface Props {
  event: ItineraryEvent;
}

// "16:10" + 110분 → "18:00"
function addMinutes(time: string, min: number): string {
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const total = h * 60 + m + min;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// 일정 카드 (컴팩트 가로형: 작은 썸네일 + 2줄 정보)
export default function EventCard({ event }: Props) {
  const t = event.transport;
  const tIcon = t === '도보' ? 'directions_walk' : 'local_taxi';
  // 머무는 시간이 있으면 "시작~끝" 범위로, 없으면 시작 시각만
  const timeLabel =
    event.stayMin != null && event.stayMin > 0
      ? `${event.time}~${addMinutes(event.time, event.stayMin)}`
      : event.time;
  return (
    <article className={'evt' + (event.highlight ? ' evt--accent' : '')}>
      <div className="evt__thumb">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <div className="evt__body">
        <div className="evt__line1">
          <span className="evt__time">{timeLabel}</span>
          <h3 className="evt-title">{event.title}</h3>
        </div>
        <div className="evt__line2">
          <span className="evt-place">
            <span className="material-symbols-outlined">place</span>
            {event.place}
          </span>
          <span className={'evt-transport evt-transport--' + (t === '도보' ? 'walk' : 'taxi')}>
            <span className="material-symbols-outlined">{tIcon}</span>
            {t}
          </span>
        </div>
        {event.confirmation && <div className="evt-confirm">{event.confirmation}</div>}
      </div>
    </article>
  );
}
