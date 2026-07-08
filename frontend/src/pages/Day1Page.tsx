import { useItinerary } from '../lib/ItineraryContext';
import DayTabs from '../components/DayTabs';
import InfoBanner from '../components/InfoBanner';
import DaySchedule from '../components/DaySchedule';

// Day 1 : 도착 & 강릉 시내
export default function Day1Page() {
  const { trip, days } = useItinerary();
  const day = days.find((d) => d.id === 1)!;

  return (
    <main className="page">
      <InfoBanner trip={trip} weather={day.weather} />
      <DayTabs active={1} />
      <DaySchedule dayId={1} />
    </main>
  );
}
