import type { ItineraryEvent } from '../types';
import './EventCard.css';

interface Props {
  event: ItineraryEvent;
}

// 분 → "1시간 50분" / "2시간" / "40분"
function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
}

// 일정 카드 (컴팩트 가로형: 작은 썸네일 + 2줄 정보)
export default function EventCard({ event }: Props) {
  const t = event.transport;
  const tIcon = t === '도보' ? 'directions_walk' : 'local_taxi';
  return (
    <article className={'evt' + (event.highlight ? ' evt--accent' : '')}>
      {event.mustSee && <span className="evt-mustsee">MUST&nbsp;SEE</span>}
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
          <span className="evt__time">{event.time}</span>
          <h3 className="evt-title">{event.title}</h3>
          {event.stayMin != null && event.stayMin > 0 && (
            <span className="evt-stay">
              <span className="material-symbols-outlined">schedule</span>
              {fmtDuration(event.stayMin)}
            </span>
          )}
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
