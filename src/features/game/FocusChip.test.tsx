import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FocusChip } from './FocusChip';
import { NotificationProvider } from '../../hooks/useNotification';
import { DefaultService } from '../../api';
import { useGameStore } from '../../stores/gameStore';

vi.mock('../../api', () => ({
  DefaultService: { getFocusApiFocusGet: vi.fn(), clearFocusApiFocusDelete: vi.fn(), setFocusApiFocusPut: vi.fn() },
  OpenAPI: { BASE: '', TOKEN: '', HEADERS: {} },
}));

const FEN = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3';
const renderChip = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <NotificationProvider>
        <FocusChip />
      </NotificationProvider>
    </QueryClientProvider>,
  );

test('shows the focused line and clears it', async () => {
  vi.mocked(DefaultService.getFocusApiFocusGet).mockResolvedValue({ fen: FEN, move: 'Bb5' });
  vi.mocked(DefaultService.clearFocusApiFocusDelete).mockResolvedValue({ fen: null, move: null });
  useGameStore.setState({ position: 'some-fen', gameState: { fen: 'some-fen', mode: 'play' } });
  renderChip();
  expect(await screen.findByText('Focus: 3. Bb5')).toBeInTheDocument();
  fireEvent.click(screen.getByTestId('CancelIcon'));
  await waitFor(() => expect(DefaultService.clearFocusApiFocusDelete).toHaveBeenCalled());
  await waitFor(() => expect(useGameStore.getState().position).toBeNull()); // next Play visit reloads
});

test('renders nothing without a focus', async () => {
  vi.mocked(DefaultService.getFocusApiFocusGet).mockResolvedValue({ fen: null, move: null });
  const { container } = renderChip();
  await waitFor(() => expect(DefaultService.getFocusApiFocusGet).toHaveBeenCalled());
  expect(container.textContent).toBe('');
});
