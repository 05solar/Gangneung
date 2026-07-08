import { useItinerary } from '../lib/ItineraryContext';
import DayTabs from '../components/DayTabs';
import InfoBanner from '../components/InfoBanner';
import DaySchedule from '../components/DaySchedule';

// Day 3 : 여유 & 작별 (Day1 과 동일한 구조)
export default function Day3Page() {
  const { trip, days } = useItinerary();
  const day = days.find((d) => d.id === 3)!;

  return (
    <main className="page">
      <InfoBanner trip={trip} weather={day.weather} />
      <DayTabs active={3} />
      <DaySchedule dayId={3} />
    </main>
  );
}
