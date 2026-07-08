// 여행 데이터를 하위 페이지들과 공유하기 위한 Context
import { createContext, useContext } from 'react';
import type { Itinerary } from '../types';

interface ItineraryState {
  data: Itinerary;
  setData: (i: Itinerary) => void;
}

export const ItineraryContext = createContext<ItineraryState | null>(null);

// 여행 데이터 읽기 (기존 사용처 호환: Itinerary 를 그대로 반환)
export function useItinerary(): Itinerary {
  const ctx = useContext(ItineraryContext);
  if (!ctx) {
    throw new Error('useItinerary 는 ItineraryContext.Provider 안에서 사용해야 합니다.');
  }
  return ctx.data;
}

// 여행 데이터 갱신 (편집 저장 후 화면 반영용)
export function useSetItinerary(): (i: Itinerary) => void {
  const ctx = useContext(ItineraryContext);
  if (!ctx) {
    throw new Error('useSetItinerary 는 ItineraryContext.Provider 안에서 사용해야 합니다.');
  }
  return ctx.setData;
}
