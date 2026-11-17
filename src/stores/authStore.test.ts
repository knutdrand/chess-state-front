import type { Mock } from 'vitest';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from './authStore';

// Mock jwt-decode
vi.mock('jwt-decode');
const mockedJwtDecode = jwtDecode as Mock;

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.setState({ token: null });
  });

  test('setToken updates state', () => {
    const newToken = 'new-jwt-token';

    useAuthStore.getState().setToken(newToken);

    expect(useAuthStore.getState().token).toBe(newToken);
  });

  test('logout clears token', () => {
    useAuthStore.setState({ token: 'some-token' });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().token).toBeNull();
  });

  test('getDecodedToken returns decoded token when valid', () => {
    const mockPayload = { sub: 'testuser', exp: 9999999999 };
    mockedJwtDecode.mockReturnValue(mockPayload);
    useAuthStore.setState({ token: 'valid-token' });

    const decoded = useAuthStore.getState().getDecodedToken();

    expect(decoded).toEqual(mockPayload);
    expect(mockedJwtDecode).toHaveBeenCalledWith('valid-token');
  });

  test('getDecodedToken returns null when no token', () => {
    useAuthStore.setState({ token: null });

    const decoded = useAuthStore.getState().getDecodedToken();

    expect(decoded).toBeNull();
  });

  test('getDecodedToken returns null when decode fails', () => {
    mockedJwtDecode.mockImplementation(() => {
      throw new Error('Invalid token');
    });
    useAuthStore.setState({ token: 'invalid-token' });

    const decoded = useAuthStore.getState().getDecodedToken();

    expect(decoded).toBeNull();
  });

  test('setToken with null clears the token', () => {
    useAuthStore.setState({ token: 'some-token' });

    useAuthStore.getState().setToken(null);

    expect(useAuthStore.getState().token).toBeNull();
  });

  test('logs out automatically when the token expires', () => {
    vi.useFakeTimers();
    try {
      const nowSec = Math.floor(Date.now() / 1000);
      mockedJwtDecode.mockReturnValue({ sub: 'testuser', exp: nowSec + 60 });

      useAuthStore.getState().setToken('expiring-token');
      expect(useAuthStore.getState().token).toBe('expiring-token');

      vi.advanceTimersByTime(61 * 1000);

      expect(useAuthStore.getState().token).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  test('manual logout cancels the expiry timer', () => {
    vi.useFakeTimers();
    try {
      const nowSec = Math.floor(Date.now() / 1000);
      mockedJwtDecode.mockReturnValue({ sub: 'testuser', exp: nowSec + 60 });

      useAuthStore.getState().setToken('first-token');
      useAuthStore.getState().logout();
      useAuthStore.setState({ token: 'other-token' });

      vi.advanceTimersByTime(61 * 1000);

      expect(useAuthStore.getState().token).toBe('other-token');
    } finally {
      vi.useRealTimers();
    }
  });
});
