import type { Trip, Weather } from '../types';
import './InfoBanner.css';

interface Props {
  trip: Trip;
  weather: Weather | null;
}

function weatherIcon(sky: string): string {
  if (sky.includes('맑')) return 'wb_sunny';
  if (sky.includes('흐림')) return 'cloud';
  if (sky.includes('구름')) return 'partly_cloudy_day';
  if (sky.includes('비')) return 'rainy';
  if (sky.includes('눈')) return 'weather_snowy';
  return 'wb_sunny';
}

// 숙소 안내 + 날씨 (모든 Day 공통)
export default function InfoBanner({ trip, weather }: Props) {
  return (
    <div className="infobanner">
      <div className="infobanner__item">
        <span className="material-symbols-outlined infobanner__icon">home</span>
        <div>
          <div className="infobanner__label">숙소</div>
          <div className="infobanner__value">{trip.accommodation.address}</div>
          <div className="infobanner__sub">체크인 {trip.accommodation.checkIn}~</div>
        </div>
      </div>
      <div className="infobanner__item">
        <span className="material-symbols-outlined infobanner__icon">
          {weather ? weatherIcon(weather.sky) : 'thermostat'}
        </span>
        <div>
          <div className="infobanner__label">날씨</div>
          <div className="infobanner__value">
            {weather ? `${weather.temp} · ${weather.sky}` : '-'}
          </div>
          <div className="infobanner__sub">
            {weather ? `${weather.humidity} · ${weather.wind}` : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
