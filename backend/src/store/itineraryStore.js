/**
 * 일정 저장소 (편집 가능)
 * ------------------------------------------------------------------
 * 기본 일정은 data/itinerary.js 에 있고, 사용자가 편집하면
 * DATA_DIR(도커 볼륨)의 itinerary.json 에 저장하여 재빌드 후에도 유지됩니다.
 * 저장본이 있으면 그것을, 없으면 기본 일정을 제공합니다.
 */
const fs = require('fs');
const path = require('path');
const { trip: defTrip, days: defDays } = require('../data/itinerary');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
const FILE = path.join(DATA_DIR, 'itinerary.json');
try {
  fs.mkdirSync(DATA_DIR, { recursive: true });
} catch (err) {
  console.error('데이터 디렉터리 생성 실패:', err.message);
}

// 기본 일정의 깊은 복사본 (원본 오염 방지)
function defaults() {
  return JSON.parse(JSON.stringify({ trip: defTrip, days: defDays }));
}

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  } catch {
    return defaults();
  }
}

let current = load();

function get() {
  return current;
}

function save(data) {
  current = data;
  try {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('일정 저장 실패:', err.message);
  }
  return current;
}

// 기본 일정으로 되돌리기 (저장본 삭제)
function reset() {
  current = defaults();
  try {
    if (fs.existsSync(FILE)) fs.unlinkSync(FILE);
  } catch (err) {
    console.error('일정 초기화 실패:', err.message);
  }
  return current;
}

module.exports = { get, save, reset, defaults };
