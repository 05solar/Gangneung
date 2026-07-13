import DaySchedule from '../components/DaySchedule';

// Day 1 : 도착 & 강릉 시내
export default function Day1Page() {
  return (
    <main className="page page--sub">
      <DaySchedule dayId={1} />
    </main>
  );
}
