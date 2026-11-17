import { queryClient } from './queryClient';
import { useAuthStore } from './stores/authStore';
import { useGameStore } from './stores/gameStore';

vi.mock('jwt-decode', () => ({ jwtDecode: vi.fn(() => ({ sub: 'alice' })) }));

test('logging out clears cached server data and the current game', () => {
  useAuthStore.setState({ token: 'alice-token' });
  useGameStore.setState({ position: 'some-fen', gameState: { fen: 'some-fen', mode: 'play' } });
  queryClient.setQueryData(['courses'], [{ id: 1 }]);

  useAuthStore.getState().logout();

  expect(useGameStore.getState().position).toBeNull();
  expect(useGameStore.getState().gameState).toBeNull();
  expect(queryClient.getQueryData(['courses'])).toBeUndefined();
});
