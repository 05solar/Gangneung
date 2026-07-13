import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { fetchItinerary } from './lib/api';
import { ItineraryContext } from './lib/ItineraryContext';
import { GameProvider } from './lib/GameContext';
import type { Itinerary } from './types';
import TopAppBar from './components/TopAppBar';
import DayTabs from './components/DayTabs';
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

  // 현재 Day(1/2/3)와 방향 계산 — 탭 인디케이터/페이지 슬라이드 애니메이션에 사용
  const location = useLocation();
  const dayMatch = location.pathname.match(/^\/day\/(\d)/);
  const day = dayMatch ? Number(dayMatch[1]) : 0;
  const prevDay = useRef(0);
  let dir: 'none' | 'forward' | 'back' = 'none';
  if (day && prevDay.current && day !== prevDay.current) {
    dir = day > prevDay.current ? 'forward' : 'back';
  }
  useEffect(() => {
    if (day) prevDay.current = day;
  }, [day]);

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
          {day > 0 && (
            <div className="dayhead">
              <DayTabs active={day} />
            </div>
          )}
          <div className={'route-slide route-slide--' + dir} key={location.pathname}>
            <Routes location={location}>
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
          </div>
          <BottomNav />
        </div>
      </GameProvider>
    </ItineraryContext.Provider>
  );
}
