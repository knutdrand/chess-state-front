import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from './authStore';

// Mock jwt-decode
jest.mock('jwt-decode');
const mockedJwtDecode = jwtDecode as jest.Mock;

describe('authStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
