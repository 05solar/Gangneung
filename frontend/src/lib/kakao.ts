// 카카오맵 길찾기 창 열기
// 출발지(from) → 도착지(to) 를 검색어로 넣어 카카오맵 길찾기 페이지를 새 탭으로 엽니다.
export function openKakaoRoute(from: string, to: string) {
  const url = `https://map.kakao.com/?sName=${encodeURIComponent(from)}&eName=${encodeURIComponent(to)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
