/**
 * 게임 플레이어 목록 (6명) 과 게임 목록
 * 각 플레이어별로 게임 점수를 저장하며, 모든 게임 점수를 합산해 총합 랭킹을 만듭니다.
 */
const players = [
  { id: 1, name: '솔', short: '솔', color: '#415e92' },
  { id: 2, name: '이지', short: '이지', color: '#78536d' },
  { id: 3, name: '안유진', short: '유진', color: '#3d665d' },
  { id: 4, name: '이수', short: '이수', color: '#8ba8e0' },
  { id: 5, name: '자두', short: '자두', color: '#c07aa8' },
  { id: 6, name: '제프리', short: '제프', color: '#b0863d' },
];

// 제공 게임 목록 (id 는 점수 저장 키로도 사용)
const games = [
  {
    id: 'mine',
    name: '돌깨기',
    description: '곡괭이로 돌을 터치! 한 번 캘 때마다 10점, 정산하면 바로 점수 획득.',
    available: true,
  },
  {
    id: 'watermelon',
    name: '수박게임',
    description: '같은 과일을 합쳐 더 큰 과일로! 수박을 만들어보세요.',
    available: true,
  },
  {
    id: '2048',
    name: '2048',
    description: '같은 숫자를 밀어 합치며 2048 타일을 만들어보세요.',
    available: true,
  },
  {
    id: 'wordle',
    name: '워들 (Wordle)',
    description: '6번 안에 5글자 영어 단어를 맞혀보세요.',
    available: true,
  },
  {
    id: 'blackjack',
    name: '블랙잭',
    description: '보유 점수로 베팅! 21에 가깝게 딜러를 이기세요. (점수 필요)',
    available: true,
  },
  {
    id: 'omok',
    name: '오목',
    description: 'AI와 대결! 흑돌로 먼저 5개를 연결하세요.',
    available: true,
  },
  {
    id: 'baduk',
    name: '바둑 9×9',
    description: 'MCTS AI와 9줄 바둑 대국! 흑돌로 집을 더 많이 지으세요.',
    available: true,
  },
];

// 초기 지급 포인트 (0점부터 시작)
const STARTING_POINTS = 0;

module.exports = { players, games, STARTING_POINTS };
