import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DeleteAccount } from './DeleteAccount';
import { useAuthStore } from '../../stores/authStore';
import { NotificationProvider } from '../../hooks/useNotification';
import { ApiError } from '../../api/core/ApiError';
import { DefaultService } from '../../api';

vi.mock('jwt-decode', () => ({ jwtDecode: vi.fn(() => ({ sub: 'alice' })) }));
vi.mock('../../api', () => ({
  DefaultService: { deleteMyAccountApiAccountDeletePost: vi.fn() },
  OpenAPI: { BASE: '', TOKEN: '', HEADERS: {} },
}));

const renderIt = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <NotificationProvider>
        <DeleteAccount />
      </NotificationProvider>
    </QueryClientProvider>,
  );

const openAndSubmit = (password: string) => {
  fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }));
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Delete permanently' }));
};

describe('DeleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ token: 'tok' });
  });

  test('wrong password shows an error and keeps the user logged in', async () => {
    vi.mocked(DefaultService.deleteMyAccountApiAccountDeletePost).mockRejectedValue(
      new ApiError({ method: 'POST', url: '/api/account/delete' },
        { url: '/api/account/delete', ok: false, status: 401, statusText: 'Unauthorized', body: {} }, 'x'),
    );
    renderIt();
    openAndSubmit('nope');
    expect(await screen.findByText('That password is not correct.')).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBe('tok');
  });

  test('success deletes with the password and logs out', async () => {
    vi.mocked(DefaultService.deleteMyAccountApiAccountDeletePost).mockResolvedValue(undefined);
    renderIt();
    openAndSubmit('correct horse');
    await waitFor(() => expect(useAuthStore.getState().token).toBeNull());
    expect(DefaultService.deleteMyAccountApiAccountDeletePost).toHaveBeenCalledWith({ password: 'correct horse' });
    expect(await screen.findByText('Your account and all your data have been deleted.')).toBeInTheDocument();
  });
});
