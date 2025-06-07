import { renderHook, act } from '@testing-library/react';
import { jwtDecode } from 'jwt-decode';

// Mock jwt-decode
jest.mock('jwt-decode');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Override the setupTests localStorage mock
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Import after mocking
import useToken from './useToken';

describe('useToken Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    jest.spyOn(Date.prototype, 'getTime').mockReturnValue(1000000000); // Fixed timestamp
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns null when no token in localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useToken());

    expect(result.current.token).toBeNull();
    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
  });

  test('returns null when token string is null in localStorage', () => {
    localStorageMock.getItem.mockReturnValue('null');

    const { result } = renderHook(() => useToken());

    expect(result.current.token).toBeNull();
  });

  test('returns token when valid token exists in localStorage', () => {
    const mockToken = 'valid-jwt-token';
    const mockPayload = { exp: 2000000 }; // Future expiration
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockToken));
    jwtDecode.mockReturnValue(mockPayload);

    const { result } = renderHook(() => useToken());

    expect(result.current.token).toBe(mockToken);
    expect(jwtDecode).toHaveBeenCalledWith(mockToken);
  });

  test('removes expired token from localStorage and returns null', () => {
    const mockToken = 'expired-jwt-token';
    const mockPayload = { exp: 500 }; // Past expiration (500 * 1000 - 60000 < 1000000000)
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockToken));
    jwtDecode.mockReturnValue(mockPayload);

    const { result } = renderHook(() => useToken());

    expect(result.current.token).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });

  test('setToken saves token to localStorage and updates state', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useToken());
    const newToken = 'new-jwt-token';

    act(() => {
      result.current.setToken(newToken);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', JSON.stringify(newToken));
    expect(result.current.token).toBe(newToken);
  });

  test('handles token expiration edge case (exactly at expiration time)', () => {
    const mockToken = 'edge-case-token';
    const mockPayload = { exp: 1000060 }; // Exactly at expiration boundary
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockToken));
    jwtDecode.mockReturnValue(mockPayload);

    const { result } = renderHook(() => useToken());

    expect(result.current.token).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });

  test('handles malformed token gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');

    const { result } = renderHook(() => useToken());

    // Should return null and not throw
    expect(result.current.token).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });

  test('handles jwt decode error gracefully', () => {
    const mockToken = 'invalid-jwt-token';

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockToken));
    jwtDecode.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const { result } = renderHook(() => useToken());

    // Should return null and clean up localStorage
    expect(result.current.token).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });
});
