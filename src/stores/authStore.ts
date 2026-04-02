import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  exp: number;
  [key: string]: unknown;
}

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  getDecodedToken: () => DecodedToken | null;
}

function getStoredToken(): string | null {
  const tokenString = localStorage.getItem('token');
  if (!tokenString || tokenString === 'null') {
    return null;
  }

  try {
    const userToken = JSON.parse(tokenString);
    if (!userToken) {
      return null;
    }

    const payLoad = jwtDecode<DecodedToken>(userToken);
    const expirationTime = payLoad.exp * 1000 - 60000;
    if (new Date().getTime() > expirationTime) {
      localStorage.removeItem('token');
      return null;
    }
    return userToken;
  } catch (error) {
    localStorage.removeItem('token');
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: getStoredToken(),

  setToken: (token: string | null) => {
    localStorage.setItem('token', JSON.stringify(token));
    set({ token });
  },

  logout: () => {
    localStorage.setItem('token', JSON.stringify(null));
    set({ token: null });
  },

  getDecodedToken: () => {
    const { token } = get();
    if (!token) return null;
    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  },
}));
