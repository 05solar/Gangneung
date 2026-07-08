import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from './GameContext';
import { fetchPlayers } from './api';

// 게임 페이지 공통: 선택된 플레이어를 반환.
// 컨텍스트에 없으면 URL 의 ?p=<id> 로 복구하고, 그래도 없으면 게임 홈으로 이동.
export function useSelectedPlayer() {
  const { player, setPlayer } = useGame();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    if (player) return;
    const pid = Number(params.get('p'));
    if (pid) {
      fetchPlayers()
        .then((list) => {
          const found = list.find((p) => p.id === pid);
          if (found) setPlayer(found);
          else navigate('/game', { replace: true });
        })
        .catch(() => navigate('/game', { replace: true }));
    } else {
      navigate('/game', { replace: true });
    }
  }, [player, params, navigate, setPlayer]);

  return player;
}
