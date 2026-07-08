// 게임별 대표 이미지 (외부 이미지 없이 SVG 로 생성한 data URI)

const uri = (svg: string) => 'data:image/svg+xml,' + encodeURIComponent(svg);

// 수박게임 - 수박 한 조각
const watermelon = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
  <rect width='100' height='100' rx='16' fill='#eafaef'/>
  <path d='M18 78 A46 46 0 0 1 82 78 Z' fill='#2e7d32'/>
  <path d='M23 78 A40 40 0 0 1 77 78 Z' fill='#f4f9f0'/>
  <path d='M28 78 A34 34 0 0 1 72 78 Z' fill='#e8556b'/>
  <g fill='#2b2b2b'><ellipse cx='42' cy='66' rx='2' ry='3'/><ellipse cx='58' cy='66' rx='2' ry='3'/>
  <ellipse cx='50' cy='72' rx='2' ry='3'/></g>
</svg>`;

// 2048 - 숫자 타일
const g2048 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
  <rect width='100' height='100' rx='16' fill='#faf8ef'/>
  <rect x='16' y='16' width='30' height='30' rx='6' fill='#eee4da'/>
  <rect x='54' y='16' width='30' height='30' rx='6' fill='#f2b179'/>
  <rect x='16' y='54' width='30' height='30' rx='6' fill='#f59563'/>
  <rect x='54' y='54' width='30' height='30' rx='6' fill='#edc850'/>
  <text x='31' y='36' font-family='Arial' font-weight='700' font-size='15' fill='#776e65' text-anchor='middle'>2</text>
  <text x='69' y='36' font-family='Arial' font-weight='700' font-size='15' fill='#fff' text-anchor='middle'>4</text>
  <text x='31' y='74' font-family='Arial' font-weight='700' font-size='15' fill='#fff' text-anchor='middle'>8</text>
  <text x='69' y='74' font-family='Arial' font-weight='700' font-size='13' fill='#fff' text-anchor='middle'>16</text>
</svg>`;

// 워들 - 색칠된 글자 칸
const wordle = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
  <rect width='100' height='100' rx='16' fill='#ffffff'/>
  <g font-family='Arial' font-weight='700' font-size='16' fill='#fff' text-anchor='middle'>
    <rect x='10' y='38' width='24' height='24' rx='4' fill='#6aaa64'/><text x='22' y='55'>W</text>
    <rect x='38' y='38' width='24' height='24' rx='4' fill='#c9b458'/><text x='50' y='55'>O</text>
    <rect x='66' y='38' width='24' height='24' rx='4' fill='#787c7e'/><text x='78' y='55'>R</text>
  </g>
</svg>`;

// 블랙잭 - 카드 A♠ · K♥
const blackjack = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
  <rect width='100' height='100' rx='16' fill='#0f5132'/>
  <g>
    <rect x='20' y='30' width='34' height='46' rx='5' fill='#fff' stroke='#ccc' transform='rotate(-10 37 53)'/>
    <text x='30' y='48' font-family='Arial' font-weight='700' font-size='13' fill='#111' transform='rotate(-10 37 53)'>A</text>
    <text x='36' y='66' font-size='15' transform='rotate(-10 37 53)'>♠</text>
  </g>
  <g>
    <rect x='46' y='30' width='34' height='46' rx='5' fill='#fff' stroke='#ccc' transform='rotate(8 63 53)'/>
    <text x='55' y='48' font-family='Arial' font-weight='700' font-size='13' fill='#d11' transform='rotate(8 63 53)'>K</text>
    <text x='60' y='67' font-size='15' fill='#d11' transform='rotate(8 63 53)'>♥</text>
  </g>
</svg>`;

// 돌깨기 - 곡괭이 + 돌 (게임 목록 아이콘)
const mine = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
  <defs>
    <linearGradient id='mw' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#9c6a3c'/><stop offset='1' stop-color='#6b4423'/></linearGradient>
    <linearGradient id='ms' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#c7d0d8'/><stop offset='1' stop-color='#7a828b'/></linearGradient>
    <linearGradient id='mr' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#a3acb4'/><stop offset='1' stop-color='#6f767f'/></linearGradient>
  </defs>
  <rect width='100' height='100' rx='16' fill='#eef3fa'/>
  <ellipse cx='40' cy='80' rx='26' ry='5' fill='#1b2740' opacity='0.12'/>
  <path d='M18 76 Q12 58 26 50 Q38 42 52 50 Q64 58 58 72 Q52 82 36 82 Q24 82 18 76 Z' fill='url(#mr)' stroke='#5c646c' stroke-width='2'/>
  <path d='M26 54 Q36 46 48 52 Q38 52 30 58 Q26 58 26 54 Z' fill='#c2c9d0' opacity='0.7'/>
  <path d='M40 58 L46 66 L40 74' fill='none' stroke='#454d55' stroke-width='1.8'/>
  <path d='M52 86 L86 40' stroke='#4d3016' stroke-width='9' stroke-linecap='round'/>
  <path d='M52 86 L86 40' stroke='url(#mw)' stroke-width='6' stroke-linecap='round'/>
  <path d='M68 26 Q88 22 97 38 Q86 33 73 40 Q62 31 49 38 Q59 24 68 26 Z' fill='url(#ms)' stroke='#4a525a' stroke-width='1.5' stroke-linejoin='round'/>
</svg>`;

// 오목 - 격자판 + 흑/백 돌
const omok = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
  <rect width='100' height='100' rx='16' fill='#e3b877'/>
  <g stroke='#8a5a2b' stroke-width='1.4'>
    <path d='M24 24 H76 M24 40 H76 M24 56 H76 M24 72 H76'/>
    <path d='M24 24 V76 M40 24 V76 M56 24 V76 M72 24 V76'/>
  </g>
  <circle cx='40' cy='40' r='7' fill='#2b2b2b'/>
  <circle cx='56' cy='56' r='7' fill='#f5f5f5' stroke='#b8b8b8' stroke-width='1'/>
  <circle cx='56' cy='40' r='7' fill='#2b2b2b'/>
  <circle cx='40' cy='56' r='7' fill='#f5f5f5' stroke='#b8b8b8' stroke-width='1'/>
</svg>`;

// 바둑 - 9×9 격자 느낌 + 흑/백 돌 (화점 포함)
const baduk = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
  <rect width='100' height='100' rx='16' fill='#e3b877'/>
  <g stroke='#8a5a2b' stroke-width='1.2'>
    <path d='M20 20 H80 M20 33 H80 M20 46 H80 M20 59 H80 M20 72 H80'/>
    <path d='M20 20 V80 M33 20 V80 M46 20 V80 M59 20 V80 M72 20 V80'/>
  </g>
  <g fill='#5a3a1e'><circle cx='33' cy='33' r='2'/><circle cx='59' cy='33' r='2'/><circle cx='46' cy='46' r='2'/><circle cx='33' cy='59' r='2'/><circle cx='59' cy='59' r='2'/></g>
  <circle cx='33' cy='46' r='6.5' fill='#1c1c1c'/>
  <circle cx='46' cy='59' r='6.5' fill='#f5f5f5' stroke='#b8b8b8' stroke-width='1'/>
  <circle cx='59' cy='46' r='6.5' fill='#1c1c1c'/>
</svg>`;

export const GAME_ART: Record<string, string> = {
  mine: uri(mine),
  watermelon: uri(watermelon),
  '2048': uri(g2048),
  wordle: uri(wordle),
  blackjack: uri(blackjack),
  omok: uri(omok),
  baduk: uri(baduk),
};

// 돌깨기 게임 내부용 큰 이미지 (돌 · 곡괭이)
const rock = (cracks: number) => {
  const crackPaths = [
    `<path d='M66 40 L60 56 L68 64 L62 78' fill='none' stroke='#3f464d' stroke-width='2.4' stroke-linejoin='round' stroke-linecap='round'/>`,
    `<path d='M44 44 L52 60 L44 72 L50 84' fill='none' stroke='#3f464d' stroke-width='2.4' stroke-linejoin='round' stroke-linecap='round'/>`,
    `<path d='M80 62 L70 70 L78 80' fill='none' stroke='#3f464d' stroke-width='2.4' stroke-linejoin='round' stroke-linecap='round'/>`,
  ].slice(0, cracks).join('');
  return uri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 130 130'>
    <defs><linearGradient id='rg' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#aab3bb'/><stop offset='1' stop-color='#6f767f'/></linearGradient></defs>
    <ellipse cx='66' cy='114' rx='46' ry='9' fill='#1b2740' opacity='0.14'/>
    <path d='M24 98 Q12 70 24 50 Q34 34 54 32 Q66 28 82 36 Q104 44 106 68 Q108 92 88 102 Q64 112 42 106 Q30 104 24 98 Z'
      fill='url(#rg)' stroke='#545b63' stroke-width='3' stroke-linejoin='round'/>
    <path d='M30 54 Q40 38 56 36 Q68 34 76 42 Q60 42 48 52 Q38 60 30 54 Z' fill='#c2c9d0' opacity='0.75'/>
    <path d='M106 68 Q108 92 88 102 Q78 106 66 104 Q86 96 94 82 Q100 74 106 68 Z' fill='#5c646c' opacity='0.55'/>
    <g fill='#565e66' opacity='0.55'><circle cx='54' cy='74' r='2.2'/><circle cx='72' cy='62' r='1.7'/><circle cx='64' cy='90' r='2'/><circle cx='84' cy='78' r='1.5'/><circle cx='46' cy='62' r='1.4'/></g>
    ${crackPaths}
  </svg>`);
};
export const ROCK_IMGS = [rock(0), rock(1), rock(2), rock(3)];

export const PICK_IMG = uri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 130 130'>
  <defs>
    <linearGradient id='wood' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#9c6a3c'/><stop offset='1' stop-color='#6b4423'/></linearGradient>
    <linearGradient id='steel' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#c7d0d8'/><stop offset='0.5' stop-color='#98a2ab'/><stop offset='1' stop-color='#6f7880'/></linearGradient>
  </defs>
  <path d='M36 106 L96 42' stroke='#4d3016' stroke-width='13' stroke-linecap='round'/>
  <path d='M36 106 L96 42' stroke='url(#wood)' stroke-width='9' stroke-linecap='round'/>
  <path d='M42 100 L90 48' stroke='#b98a55' stroke-width='2' stroke-linecap='round' opacity='0.6'/>
  <g stroke='#3d2814' stroke-width='2' opacity='0.7' stroke-linecap='round'>
    <line x1='44' y1='96' x2='53' y2='104'/><line x1='51' y1='89' x2='60' y2='97'/><line x1='58' y1='82' x2='67' y2='90'/>
  </g>
  <path d='M26 46 Q60 18 98 30 Q116 36 124 50 Q112 44 96 44 Q64 38 44 56 Q32 54 26 46 Z'
    fill='url(#steel)' stroke='#4a525a' stroke-width='2' stroke-linejoin='round'/>
  <path d='M32 45 Q62 22 96 32' fill='none' stroke='#e3e9ee' stroke-width='2' opacity='0.65' stroke-linecap='round'/>
  <rect x='75' y='36' width='16' height='16' rx='3' transform='rotate(-46 83 44)' fill='#828a92' stroke='#4a525a' stroke-width='1.5'/>
</svg>`);
