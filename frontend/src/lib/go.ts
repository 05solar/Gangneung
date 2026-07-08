// 9×9 바둑 엔진 + MCTS(몬테카를로 트리 탐색) AI
// - 착수/따냄(포획)/자살수 금지/패(ko) 규칙
// - 계가: 중국식 집계(area scoring), 백 덤(komi) 6.5
// - AI: UCT 기반 MCTS + 전술 롤아웃(단수 따냄/탈출·자충수 회피·착수점 주변 우선)

export const N = 9;
export const SZ = N * N; // 81
export const KOMI = 6.5; // 백 덤
export type Color = 1 | 2; // 1=흑, 2=백
export type Diff = 'easy' | 'medium' | 'hard';
export const PASS = -1;

export interface GoState {
  board: Int8Array; // 0=빈점, 1=흑, 2=백
  ko: number; // 패로 인해 금지된 점 (없으면 -1)
  toMove: Color; // 둘 차례
  passes: number; // 연속 패스 수 (2면 종국)
  capB: number; // 흑이 따낸 돌 수 (표시용)
  capW: number; // 백이 따낸 돌 수 (표시용)
}

// ── 인접점(상하좌우)·대각점 미리 계산 ──────────────────────────────
const NEI: number[][] = [];
const DIA: number[][] = [];
for (let r = 0; r < N; r++) {
  for (let c = 0; c < N; c++) {
    const idx = r * N + c;
    const nb: number[] = [];
    const di: number[] = [];
    if (r > 0) nb.push(idx - N);
    if (r < N - 1) nb.push(idx + N);
    if (c > 0) nb.push(idx - 1);
    if (c < N - 1) nb.push(idx + 1);
    if (r > 0 && c > 0) di.push(idx - N - 1);
    if (r > 0 && c < N - 1) di.push(idx - N + 1);
    if (r < N - 1 && c > 0) di.push(idx + N - 1);
    if (r < N - 1 && c < N - 1) di.push(idx + N + 1);
    NEI[idx] = nb;
    DIA[idx] = di;
  }
}

export function emptyState(): GoState {
  return { board: new Int8Array(SZ), ko: -1, toMove: 1, passes: 0, capB: 0, capW: 0 };
}

export function cloneState(s: GoState): GoState {
  return { board: s.board.slice(), ko: s.ko, toMove: s.toMove, passes: s.passes, capB: s.capB, capW: s.capW };
}

// ── 무리(group) 활로 계산: 세대 스탬프로 스크래치 재사용(할당 없음) ──
const gSeen = new Int32Array(SZ);
let gGen = 0;
const gLib = new Int32Array(SZ);
let gLibGen = 0;
const gStack = new Int32Array(SZ);
const gGroup = new Int32Array(SZ); // 따낸 돌 수집용

// idx 무리에 활로가 하나라도 있으면 true (찾는 즉시 종료 → 매우 빠름)
function hasLiberty(board: Int8Array, idx: number): boolean {
  const color = board[idx];
  gGen++;
  let sp = 0;
  gStack[sp++] = idx;
  gSeen[idx] = gGen;
  while (sp > 0) {
    const cur = gStack[--sp];
    const ns = NEI[cur];
    for (let i = 0; i < ns.length; i++) {
      const n = ns[i];
      const v = board[n];
      if (v === 0) return true;
      if (v === color && gSeen[n] !== gGen) {
        gSeen[n] = gGen;
        gStack[sp++] = n;
      }
    }
  }
  return false;
}

// idx 무리의 활로 수
function countLiberties(board: Int8Array, idx: number): number {
  const color = board[idx];
  gGen++;
  gLibGen++;
  let sp = 0;
  gStack[sp++] = idx;
  gSeen[idx] = gGen;
  let libs = 0;
  while (sp > 0) {
    const cur = gStack[--sp];
    const ns = NEI[cur];
    for (let i = 0; i < ns.length; i++) {
      const n = ns[i];
      const v = board[n];
      if (v === 0) {
        if (gLib[n] !== gLibGen) {
          gLib[n] = gLibGen;
          libs++;
        }
      } else if (v === color && gSeen[n] !== gGen) {
        gSeen[n] = gGen;
        gStack[sp++] = n;
      }
    }
  }
  return libs;
}

// idx 무리가 단수(활로 1)면 그 유일 활로 점, 아니면 -1
function atariPoint(board: Int8Array, idx: number): number {
  const color = board[idx];
  gGen++;
  gLibGen++;
  let sp = 0;
  gStack[sp++] = idx;
  gSeen[idx] = gGen;
  let libs = 0;
  let pt = -1;
  while (sp > 0) {
    const cur = gStack[--sp];
    const ns = NEI[cur];
    for (let i = 0; i < ns.length; i++) {
      const n = ns[i];
      const v = board[n];
      if (v === 0) {
        if (gLib[n] !== gLibGen) {
          gLib[n] = gLibGen;
          libs++;
          pt = n;
          if (libs > 1) return -1;
        }
      } else if (v === color && gSeen[n] !== gGen) {
        gSeen[n] = gGen;
        gStack[sp++] = n;
      }
    }
  }
  return libs === 1 ? pt : -1;
}

// idx 무리의 돌들을 gGroup 에 담고 개수 반환(따냄 제거용)
function collectGroup(board: Int8Array, idx: number): number {
  const color = board[idx];
  gGen++;
  let sp = 0;
  gStack[sp++] = idx;
  gSeen[idx] = gGen;
  let c = 0;
  while (sp > 0) {
    const cur = gStack[--sp];
    gGroup[c++] = cur;
    const ns = NEI[cur];
    for (let i = 0; i < ns.length; i++) {
      const n = ns[i];
      if (board[n] === color && gSeen[n] !== gGen) {
        gSeen[n] = gGen;
        gStack[sp++] = n;
      }
    }
  }
  return c;
}

// 착수 시도. 합법이면 새 상태, 불법(자리참·패·자살수)이면 null.
export function play(s: GoState, move: number): { state: GoState; captured: number } | null {
  if (move === PASS) {
    return {
      state: {
        board: s.board,
        ko: -1,
        toMove: (3 - s.toMove) as Color,
        passes: s.passes + 1,
        capB: s.capB,
        capW: s.capW,
      },
      captured: 0,
    };
  }
  const { board, ko, toMove } = s;
  if (move < 0 || move >= SZ || board[move] !== 0) return null; // 빈 자리가 아님
  if (move === ko) return null; // 패
  const nb = board.slice();
  nb[move] = toMove;
  const opp = (3 - toMove) as Color;
  let capCount = 0;
  let oneCapPt = -1;
  const ns = NEI[move];
  for (let i = 0; i < ns.length; i++) {
    const n = ns[i];
    if (nb[n] === opp && !hasLiberty(nb, n)) {
      const c = collectGroup(nb, n);
      for (let k = 0; k < c; k++) nb[gGroup[k]] = 0;
      if (c === 1) oneCapPt = gGroup[0];
      capCount += c;
    }
  }
  if (!hasLiberty(nb, move)) return null; // 자살수 (따냄 뒤에도 활로 없음)
  let newKo = -1;
  if (capCount === 1) {
    let ownAdj = false;
    let libs = 0;
    for (let i = 0; i < ns.length; i++) {
      const v = nb[ns[i]];
      if (v === toMove) ownAdj = true;
      else if (v === 0) libs++;
    }
    if (!ownAdj && libs === 1) newKo = oneCapPt; // 단수 되따냄 → 패
  }
  return {
    state: {
      board: nb,
      ko: newKo,
      toMove: opp,
      passes: 0,
      capB: s.capB + (toMove === 1 ? capCount : 0),
      capW: s.capW + (toMove === 2 ? capCount : 0),
    },
    captured: capCount,
  };
}

// 해당 빈점이 color의 '진짜 눈'인지 (자기 눈 메우기/거짓눈 방지용)
function isEye(board: Int8Array, idx: number, color: Color): boolean {
  if (board[idx] !== 0) return false;
  const ns = NEI[idx];
  for (let i = 0; i < ns.length; i++) if (board[ns[i]] !== color) return false; // 상하좌우 전부 내 돌
  const ds = DIA[idx];
  let own = 0;
  for (let i = 0; i < ds.length; i++) if (board[ds[i]] === color) own++;
  const offBoard = 4 - ds.length; // 반 밖(가·귀) 대각 수
  if (offBoard > 0) return own === ds.length; // 가/귀: 존재하는 대각이 전부 내 돌
  return own >= 3; // 가운데: 대각 4곳 중 3곳 이상 내 돌
}

// ── 계가(중국식 집계) ────────────────────────────────────────────
export interface ScoreResult { black: number; white: number; winner: Color; margin: number }

const scSeen = new Uint8Array(SZ);
const scStack = new Int32Array(SZ);
const scRegion = new Int32Array(SZ);
export function scoreArea(board: Int8Array, komi = KOMI): ScoreResult {
  let black = 0;
  let white = 0;
  scSeen.fill(0);
  for (let i = 0; i < SZ; i++) {
    const v = board[i];
    if (v === 1) black++;
    else if (v === 2) white++;
    else if (!scSeen[i]) {
      // 빈 영역(집) 탐색 → 접한 색이 한 쪽뿐이면 그 색의 집
      let rc = 0;
      let touchB = false;
      let touchW = false;
      let sp = 0;
      scStack[sp++] = i;
      scSeen[i] = 1;
      while (sp > 0) {
        const cur = scStack[--sp];
        scRegion[rc++] = cur;
        const ns = NEI[cur];
        for (let k = 0; k < ns.length; k++) {
          const n = ns[k];
          const nv = board[n];
          if (nv === 0) {
            if (!scSeen[n]) {
              scSeen[n] = 1;
              scStack[sp++] = n;
            }
          } else if (nv === 1) touchB = true;
          else touchW = true;
        }
      }
      if (touchB && !touchW) black += rc;
      else if (touchW && !touchB) white += rc;
    }
  }
  const wTotal = white + komi;
  const margin = black - wTotal; // 양수면 흑 우세
  return { black, white: wTotal, winner: margin > 0 ? 1 : 2, margin: Math.abs(margin) };
}

// 빈 영역을 집으로 분류: 반환 배열에서 빈점 = 0(공배/dame)·1(흑집)·2(백집), 돌 = 그 색
function classify(board: Int8Array): Int8Array {
  const cls = new Int8Array(SZ);
  const seen = new Uint8Array(SZ);
  const stack = new Int32Array(SZ);
  const region = new Int32Array(SZ);
  for (let i = 0; i < SZ; i++) {
    if (board[i] !== 0) {
      cls[i] = board[i];
      continue;
    }
    if (seen[i]) continue;
    let rc = 0;
    let touchB = false;
    let touchW = false;
    let sp = 0;
    stack[sp++] = i;
    seen[i] = 1;
    while (sp > 0) {
      const cur = stack[--sp];
      region[rc++] = cur;
      const ns = NEI[cur];
      for (let k = 0; k < ns.length; k++) {
        const n = ns[k];
        const nv = board[n];
        if (nv === 0) {
          if (!seen[n]) {
            seen[n] = 1;
            stack[sp++] = n;
          }
        } else if (nv === 1) touchB = true;
        else touchW = true;
      }
    }
    const t = touchB && !touchW ? 1 : touchW && !touchB ? 2 : 0;
    for (let k = 0; k < rc; k++) cls[region[k]] = t;
  }
  return cls;
}

// 한국식(집 + 사석) 계가. 흑 = 흑집 + 흑이 잡은 돌, 백 = 백집 + 백이 잡은 돌 + 덤.
export function scoreGame(state: GoState, komi = KOMI): ScoreResult {
  const cls = classify(state.board);
  let tB = 0;
  let tW = 0;
  for (let i = 0; i < SZ; i++) {
    if (state.board[i] === 0) {
      if (cls[i] === 1) tB++;
      else if (cls[i] === 2) tW++;
    }
  }
  const black = tB + state.capB;
  const white = tW + state.capW + komi;
  const margin = black - white;
  return { black, white, winner: margin > 0 ? 1 : 2, margin: Math.abs(margin) };
}

// ── 롤아웃 정책 ──────────────────────────────────────────────────
const rEmpties = new Int32Array(SZ);
function shuffle(arr: Int32Array, len: number) {
  for (let k = len - 1; k > 0; k--) {
    const j = (Math.random() * (k + 1)) | 0;
    const t = arr[k];
    arr[k] = arr[j];
    arr[j] = t;
  }
}

function shuffleList(a: number[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
}

// 전술 한 수:
//   (useGlobal일 때만) 1) 전역 단수 따냄  2) 전역 단수 방어
//   3) 직전 착수점 주변(3×3) 무작위
//   4) 전역 무작위(자충 회피)
// 전역 스캔은 비싸므로 롤아웃 첫 수에서만 켠다(기존 판의 단수 상황을 반영).
// 이후 수는 값싼 국지 대응으로 충분하다(전투는 대개 직전 착수 근처에서 이어짐).
// 반환 [새 상태, 이번에 둔 점]
function heuristicStep(s: GoState, last: number, useGlobal: boolean): { state: GoState; last: number } {
  const board = s.board;
  const M = s.toMove;
  const O = (3 - M) as Color;

  if (useGlobal) {
    // 1) 판 전체에서 '따낼 수 있는' 상대 단수 그룹의 활로에 착수 → 따냄
    const caps: number[] = [];
    for (let i = 0; i < SZ; i++) {
      if (board[i] === O) {
        const p = atariPoint(board, i);
        if (p >= 0) caps.push(p);
      }
    }
    if (caps.length) {
      shuffleList(caps);
      for (const mv of caps) {
        const r = play(s, mv);
        if (r && r.captured > 0) return { state: r.state, last: mv };
      }
    }
    // 2) 내 단수 그룹이 있으면 살린다 (활로로 늘리거나 되따냄)
    const defs: number[] = [];
    for (let i = 0; i < SZ; i++) {
      if (board[i] === M) {
        const p = atariPoint(board, i);
        if (p >= 0) defs.push(p);
      }
    }
    if (defs.length) {
      shuffleList(defs);
      for (const mv of defs) {
        const r = play(s, mv);
        if (r && (r.captured > 0 || countLiberties(r.state.board, mv) >= 2)) {
          return { state: r.state, last: mv };
        }
      }
    }
  } else if (last >= 0) {
    // 국지: 직전 착수점에 인접한 단수 그룹만 대응(따냄/탈출)
    const cand: number[] = [];
    for (const n of NEI[last]) {
      const v = board[n];
      if (v === O || v === M) {
        const p = atariPoint(board, n);
        if (p >= 0) cand.push(p);
      }
    }
    if (cand.length) {
      shuffleList(cand);
      for (const mv of cand) {
        const r = play(s, mv);
        if (r && (r.captured > 0 || countLiberties(r.state.board, mv) >= 2)) {
          return { state: r.state, last: mv };
        }
      }
    }
  }

  if (last >= 0) {
    // 3) 착수점 주변(3×3) 무작위 — 자충수는 회피
    if (Math.random() < 0.5) {
      const loc: number[] = [];
      for (const n of NEI[last]) if (board[n] === 0 && !isEye(board, n, M)) loc.push(n);
      for (const d of DIA[last]) if (board[d] === 0 && !isEye(board, d, M)) loc.push(d);
      for (let i = loc.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        const t = loc[i];
        loc[i] = loc[j];
        loc[j] = t;
      }
      for (const mv of loc) {
        const r = play(s, mv);
        if (r && (r.captured > 0 || countLiberties(r.state.board, mv) >= 2)) {
          return { state: r.state, last: mv };
        }
      }
    }
  }

  // 3) 전역 무작위 — 눈/자충 회피 우선, 없으면 아무 합법수, 그래도 없으면 패스
  let m = 0;
  for (let i = 0; i < SZ; i++) if (board[i] === 0) rEmpties[m++] = i;
  shuffle(rEmpties, m);
  for (let k = 0; k < m; k++) {
    const mv = rEmpties[k];
    if (isEye(board, mv, M)) continue;
    const r = play(s, mv);
    if (r && (r.captured > 0 || countLiberties(r.state.board, mv) >= 2)) return { state: r.state, last: mv };
  }
  for (let k = 0; k < m; k++) {
    const mv = rEmpties[k];
    if (isEye(board, mv, M)) continue;
    const r = play(s, mv);
    if (r) return { state: r.state, last: mv };
  }
  return { state: play(s, PASS)!.state, last: -1 };
}

// 순수 무작위 한 수(쉬움용) — 눈만 회피
function randomStep(s: GoState): { state: GoState; last: number } {
  const board = s.board;
  const M = s.toMove;
  let m = 0;
  for (let i = 0; i < SZ; i++) if (board[i] === 0) rEmpties[m++] = i;
  shuffle(rEmpties, m);
  for (let k = 0; k < m; k++) {
    const mv = rEmpties[k];
    if (isEye(board, mv, M)) continue;
    const r = play(s, mv);
    if (r) return { state: r.state, last: mv };
  }
  return { state: play(s, PASS)!.state, last: -1 };
}

// 롤아웃 → 최종 집 차이(부호: 흑 - 백, 양수면 흑 우세)
// 승/패(0/1)가 아니라 마진을 반환해, "이기고 있어도 더 크게" 두게 만든다.
function rollout(start: GoState, heuristic: boolean): number {
  let s = cloneState(start);
  let last = -1;
  let moves = 0;
  const maxMoves = SZ * 2;
  while (s.passes < 2 && moves < maxMoves) {
    const step = heuristic ? heuristicStep(s, last, moves === 0) : randomStep(s);
    s = step.state;
    last = step.last;
    moves++;
  }
  const res = scoreArea(s.board);
  return res.winner === 1 ? res.margin : -res.margin;
}

// ── MCTS ────────────────────────────────────────────────────────
interface Node {
  move: number; // 부모에서 이 노드로 온 수 (루트는 -2)
  justMoved: Color; // 그 수를 둔 색
  toMove: Color; // 이 노드에서 둘 색
  parent: Node | null;
  children: Node[];
  untried: number[]; // 아직 펼치지 않은 후보수 (합법성은 펼칠 때 검증)
  visits: number;
  wins: number; // justMoved 관점의 승수
}

// 눈이 아닌 빈점 후보 + 패(마지막에 팝되도록 맨 앞)
function candidates(s: GoState): number[] {
  const list: number[] = [PASS];
  for (let i = 0; i < SZ; i++) {
    if (s.board[i] === 0 && !isEye(s.board, i, s.toMove)) list.push(i);
  }
  return list;
}

function makeNode(s: GoState, move: number, parent: Node | null): Node {
  return {
    move,
    justMoved: (3 - s.toMove) as Color,
    toMove: s.toMove,
    parent,
    children: [],
    untried: candidates(s),
    visits: 0,
    wins: 0,
  };
}

// 착수 후보의 사전 평가(0~1). 롤아웃 분산이 큰 초반에도 상식적인 수를 두게 한다.
// s = 두기 전 상태, mv = 후보, r = play(s,mv) 결과.
function priorValue(s: GoState, mv: number, r: { state: GoState; captured: number }): number {
  if (mv === PASS) return 0.25; // 패스는 기본적으로 비선호
  const pboard = s.board;
  const M = s.toMove;
  let v = 0.5;

  // 따냄 → 좋음
  if (r.captured > 0) v += 0.1 + 0.05 * Math.min(r.captured, 4);

  // 착수 후 내 돌의 활로
  const libs = countLiberties(r.state.board, mv);
  if (r.captured === 0) {
    if (libs === 1) v -= 0.35; // 자충수(스스로 단수) → 나쁨
    else if (libs === 2) v -= 0.05;
  }

  // 내 단수 그룹을 살리는 수 → 좋음
  for (const n of NEI[mv]) {
    if (pboard[n] === M && atariPoint(pboard, n) >= 0) {
      if (libs >= 2 || r.captured > 0) v += 0.18;
      break;
    }
  }

  // 기존 돌 근처(접전) 선호 · 외딴 수/1선 억제
  let adj = false;
  for (const n of NEI[mv]) if (pboard[n] !== 0) { adj = true; break; }
  if (!adj) for (const d of DIA[mv]) if (pboard[d] !== 0) { adj = true; break; }
  const row = (mv / N) | 0;
  const col = mv % N;
  const onEdge = row === 0 || row === N - 1 || col === 0 || col === N - 1;
  if (adj) v += 0.08;
  else {
    if (onEdge) v -= 0.12; // 외딴 1선 = 나쁨
    // 중앙 쪽이면 소폭 가점(초반 세력)
    const dc = Math.abs(row - 4) + Math.abs(col - 4);
    if (dc <= 3) v += 0.04;
  }

  return v < 0.02 ? 0.02 : v > 0.98 ? 0.98 : v;
}

const UCT_C = 0.35; // 낮은 탐색: 사전확률(prior)이 초기 정렬을, 마진이 미세 조정을 담당
const MARGIN_SCALE = SZ; // 집 차이 → 값 변환. 포화 없이 전 구간 선형(이기든 지든 더 좋은 수 선호)
const PRIOR_K = 30; // 사전확률 가상 방문 수(클수록 휴리스틱 신뢰↑)
function uctSelect(node: Node): Node {
  let best = node.children[0];
  let bestVal = -Infinity;
  const logN = Math.log(node.visits + 1);
  for (const ch of node.children) {
    const val = ch.wins / ch.visits + UCT_C * Math.sqrt(logN / ch.visits);
    if (val > bestVal) {
      bestVal = val;
      best = ch;
    }
  }
  return best;
}

// 무작위 합법수(눈 회피). 쉬움 난이도의 실수 유발용.
function randomMove(s: GoState): number {
  const board = s.board;
  const M = s.toMove;
  let m = 0;
  for (let i = 0; i < SZ; i++) if (board[i] === 0) rEmpties[m++] = i;
  shuffle(rEmpties, m);
  for (let k = 0; k < m; k++) {
    const mv = rEmpties[k];
    if (isEye(board, mv, M)) continue;
    if (play(s, mv)) return mv;
  }
  return PASS;
}

// AI 착수 결정. 반환은 board idx 또는 PASS(-1).
export function mctsMove(state: GoState, diff: Diff): number {
  if (diff === 'easy' && Math.random() < 0.35) return randomMove(state);

  const heuristic = diff !== 'easy';
  const budget = diff === 'easy' ? 130 : diff === 'medium' ? 700 : 1400; // ms
  const maxIter = diff === 'easy' ? 1500 : diff === 'medium' ? 20000 : 60000;

  const root = makeNode(state, -2, null);
  const start = performance.now();
  let iter = 0;

  while (iter < maxIter && performance.now() - start < budget) {
    iter++;
    let node = root;
    let s = cloneState(state);

    // 1) 선택
    while (node.untried.length === 0 && node.children.length > 0) {
      node = uctSelect(node);
      s = play(s, node.move)!.state;
    }
    // 2) 확장 (합법수가 나올 때까지 후보를 소진) — 사전확률로 가상 방문 시딩
    while (node.untried.length > 0) {
      const mv = node.untried.pop()!;
      const r = play(s, mv);
      if (r) {
        const pv = priorValue(s, mv, r);
        s = r.state;
        const child = makeNode(s, mv, node);
        child.visits = PRIOR_K;
        child.wins = PRIOR_K * pv;
        node.children.push(child);
        node = child;
        break;
      }
    }
    // 3) 시뮬레이션 (흑 기준 집 차이)
    const margin = rollout(s, heuristic);
    // 4) 역전파 — 각 노드의 '둔 색' 관점 값(0~1)으로 누적. 마진이 클수록 값이 큼.
    let n: Node | null = node;
    while (n) {
      n.visits++;
      const signed = n.justMoved === 1 ? margin : -margin;
      let val = 0.5 + signed / (2 * MARGIN_SCALE);
      if (val < 0) val = 0;
      else if (val > 1) val = 1;
      n.wins += val;
      n = n.parent;
    }
  }

  // 방문수가 가장 많은 수 선택(가상 방문 PRIOR_K 는 모든 자식이 동일).
  let best = PASS;
  let bestVisits = -1;
  for (const ch of root.children) {
    if (ch.visits > bestVisits) {
      bestVisits = ch.visits;
      best = ch.move;
    }
  }
  if (best === PASS) return PASS;

  // 최선수가 '자기 집'을 메우는 수(따냄 아님)라면 패스로 대체.
  // → 무의미하게 자기 집 메우기 방지 & 종국 유도. 종국에만 자연히 발동한다.
  const cls = classify(state.board);
  if (cls[best] === state.toMove) {
    const r = play(state, best);
    if (!r || r.captured === 0) return PASS;
  }
  return best;
}

// 좌표 변환 유틸
export const rc = (idx: number): [number, number] => [Math.floor(idx / N), idx % N];
export const toIdx = (r: number, c: number) => r * N + c;
