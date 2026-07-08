import { useItinerary } from '../lib/ItineraryContext';
import DayTabs from '../components/DayTabs';
import InfoBanner from '../components/InfoBanner';
import DaySchedule from '../components/DaySchedule';

// Day 2 : 강릉 미식 & 바다 액티비티
export default function Day2Page() {
  const { trip, days } = useItinerary();
  const day = days.find((d) => d.id === 2)!;

  return (
    <main className="page">
      <InfoBanner trip={trip} weather={day.weather} />
      <DayTabs active={2} />
      <DaySchedule dayId={2} />
    </main>
  );
}
