import { Fragment } from 'react';
import type { ItineraryEvent } from '../types';
import EventCard from './EventCard';
import TransportConnector from './TransportConnector';
import './ItineraryList.css';

interface Props {
  events: ItineraryEvent[];
}

// 일정 리스트: 각 일정 카드 사이에 이동수단 커넥터(원형 미니박스)를 넣습니다.
export default function ItineraryList({ events }: Props) {
  return (
    <div className="itinlist">
      {events.map((event, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <TransportConnector
              from={events[i - 1].mapQuery}
              to={event.mapQuery}
              transport={event.transport}
              durationMin={event.durationMin}
              cost={event.cost}
            />
          )}
          <EventCard event={event} />
        </Fragment>
      ))}
    </div>
  );
}
