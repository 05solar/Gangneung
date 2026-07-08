import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { fetchItinerary } from './lib/api';
import { ItineraryContext } from './lib/ItineraryContext';
import { GameProvider } from './lib/GameContext';
import type { Itinerary } from './types';
import TopAppBar from './components/TopAppBar';
import BottomNav from './components/BottomNav';
import Day1Page from './pages/Day1Page';
import Day2Page from './pages/Day2Page';
import Day3Page from './pages/Day3Page';
import GameHome from './pages/GameHome';
import WatermelonGame from './pages/WatermelonGame';
import Game2048 from './pages/Game2048';
import WordleGame from './pages/WordleGame';
import BlackjackGame from './pages/BlackjackGame';
import MineGame from './pages/MineGame';
import OmokGame from './pages/OmokGame';
import GoGame from './pages/GoGame';
import './App.css';

export default function App() {
  const [data, setData] = useState<Itinerary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItinerary()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="app-shell app-status">
        <span className="material-symbols-outlined app-status__icon">error</span>
        <p>{error}</p>
        <p className="app-status__hint">백엔드 서버(localhost:4000)가 실행 중인지 확인해 주세요.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app-shell app-status">
        <span className="material-symbols-outlined app-status__icon spin">progress_activity</span>
        <p>강릉 여행 일정을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <ItineraryContext.Provider value={{ data, setData }}>
      <GameProvider>
        <div className="app-shell">
          <TopAppBar title={data.trip.title} />
          <Routes>
            <Route path="/" element={<Navigate to="/day/1" replace />} />
            <Route path="/day/1" element={<Day1Page />} />
            <Route path="/day/2" element={<Day2Page />} />
            <Route path="/day/3" element={<Day3Page />} />
            <Route path="/game" element={<GameHome />} />
            <Route path="/game/mine" element={<MineGame />} />
            <Route path="/game/watermelon" element={<WatermelonGame />} />
            <Route path="/game/2048" element={<Game2048 />} />
            <Route path="/game/wordle" element={<WordleGame />} />
            <Route path="/game/blackjack" element={<BlackjackGame />} />
            <Route path="/game/omok" element={<OmokGame />} />
            <Route path="/game/baduk" element={<GoGame />} />
            <Route path="*" element={<Navigate to="/day/1" replace />} />
          </Routes>
          <BottomNav />
        </div>
      </GameProvider>
    </ItineraryContext.Provider>
  );
}
