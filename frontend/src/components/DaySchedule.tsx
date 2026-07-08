import { useState } from 'react';
import { useItinerary, useSetItinerary } from '../lib/ItineraryContext';
import { updateItinerary } from '../lib/api';
import type { ItineraryEvent } from '../types';
import ItineraryList from './ItineraryList';
import './DaySchedule.css';

const TRANSPORTS: ('택시' | '도보')[] = ['택시', '도보'];

const blankEvent = (): ItineraryEvent => ({
  time: '12:00',
  period: 'PM',
  icon: 'place',
  title: '새 일정',
  place: '',
  mapQuery: '',
  tags: [],
  transport: '택시',
  durationMin: null,
  image: '',
  highlight: false,
});

// "14:30" → 오전/오후 자동 계산
function periodOf(time: string): string {
  const h = parseInt(time.split(':')[0], 10);
  return Number.isNaN(h) || h >= 12 ? 'PM' : 'AM';
}

// 특정 Day 의 일정: 보기 모드 ↔ 편집 모드
export default function DaySchedule({ dayId }: { dayId: number }) {
  const itinerary = useItinerary();
  const setItinerary = useSetItinerary();
  const day = itinerary.days.find((d) => d.id === dayId)!;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ItineraryEvent[]>([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const startEdit = () => {
    setDraft(day.events.map((e) => ({ ...e, tags: [...e.tags] })));
    setErr(null);
    setEditing(true);
  };
  const cancel = () => {
    setEditing(false);
    setErr(null);
  };

  function patch<K extends keyof ItineraryEvent>(i: number, field: K, value: ItineraryEvent[K]) {
    setDraft((d) => d.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)));
  }
  const move = (i: number, dir: -1 | 1) => {
    setDraft((d) => {
      const j = i + dir;
      if (j < 0 || j >= d.length) return d;
      const copy = [...d];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  };
  const remove = (i: number) => setDraft((d) => d.filter((_, idx) => idx !== i));
  const add = () => setDraft((d) => [...d, blankEvent()]);

  const save = async () => {
    setSaving(true);
    setErr(null);
    const events: ItineraryEvent[] = draft.map((e) => ({
      ...e,
      period: periodOf(e.time),
      durationMin:
        e.durationMin == null || Number.isNaN(Number(e.durationMin)) ? null : Number(e.durationMin),
      cost: e.cost == null || Number.isNaN(Number(e.cost)) || Number(e.cost) <= 0 ? undefined : Number(e.cost),
      tags: e.tags.filter((t) => t.trim() !== ''),
      icon: e.icon || 'place',
    }));
    const newDays = itinerary.days.map((d) => (d.id === dayId ? { ...d, events } : d));
    try {
      const saved = await updateItinerary({ ...itinerary, days: newDays });
      setItinerary(saved);
      setEditing(false);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // ── 보기 모드 ──
  if (!editing) {
    return (
      <div className="dsched">
        <div className="dsched__bar">
          <span className="dsched__count">{day.events.length}개 일정</span>
          <button className="dsched__edit" onClick={startEdit}>
            <span className="material-symbols-outlined">edit</span>
            수정
          </button>
        </div>
        <ItineraryList events={day.events} />
      </div>
    );
  }

  // ── 편집 모드 ──
  return (
    <div className="dsched">
      <div className="dsched__bar">
        <span className="dsched__count dsched__count--edit">✏️ 수정 중</span>
        <div className="dsched__actions">
          <button className="dsched__btn" onClick={cancel} disabled={saving}>
            취소
          </button>
          <button className="dsched__btn dsched__btn--primary" onClick={save} disabled={saving}>
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      </div>
      {err && <p className="dsched__err">{err}</p>}

      <div className="edit-list">
        {draft.map((e, i) => (
          <div className="edit-card" key={i}>
            <div className="edit-card__head">
              <span className="edit-card__no">{i + 1}</span>
              <div className="edit-card__move">
                <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="위로">
                  <span className="material-symbols-outlined">keyboard_arrow_up</span>
                </button>
                <button onClick={() => move(i, 1)} disabled={i === draft.length - 1} aria-label="아래로">
                  <span className="material-symbols-outlined">keyboard_arrow_down</span>
                </button>
              </div>
              <button className="edit-card__del" onClick={() => remove(i)} aria-label="삭제">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>

            <label className="ef">
              <span>제목</span>
              <input value={e.title} onChange={(ev) => patch(i, 'title', ev.target.value)} />
            </label>

            <div className="ef-row">
              <label className="ef">
                <span>시간</span>
                <input value={e.time} placeholder="14:30" onChange={(ev) => patch(i, 'time', ev.target.value)} />
              </label>
              <label className="ef">
                <span>이동수단</span>
                <select
                  value={e.transport}
                  onChange={(ev) => patch(i, 'transport', ev.target.value as '택시' | '도보')}
                >
                  {TRANSPORTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ef">
                <span>소요(분)</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={e.durationMin ?? ''}
                  placeholder="-"
                  onChange={(ev) =>
                    patch(i, 'durationMin', ev.target.value === '' ? null : Number(ev.target.value))
                  }
                />
              </label>
              <label className="ef">
                <span>비용(원)</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={e.cost ?? ''}
                  placeholder="-"
                  onChange={(ev) =>
                    patch(i, 'cost', ev.target.value === '' ? undefined : Number(ev.target.value))
                  }
                />
              </label>
            </div>

            <label className="ef">
              <span>장소</span>
              <input value={e.place} onChange={(ev) => patch(i, 'place', ev.target.value)} />
            </label>
            <label className="ef">
              <span>지도 검색어</span>
              <input
                value={e.mapQuery}
                placeholder="카카오맵 길찾기 검색어"
                onChange={(ev) => patch(i, 'mapQuery', ev.target.value)}
              />
            </label>
            <label className="ef">
              <span>태그</span>
              <input
                value={e.tags.join(', ')}
                placeholder="쉼표로 구분 (예: 카페, 휴식)"
                onChange={(ev) => patch(i, 'tags', ev.target.value.split(',').map((t) => t.trimStart()))}
              />
            </label>
            <label className="ef ef--check">
              <input
                type="checkbox"
                checked={!!e.highlight}
                onChange={(ev) => patch(i, 'highlight', ev.target.checked)}
              />
              <span>강조 표시(하이라이트)</span>
            </label>
          </div>
        ))}
      </div>

      <button className="dsched__add" onClick={add}>
        <span className="material-symbols-outlined">add</span>
        일정 추가
      </button>
    </div>
  );
}
