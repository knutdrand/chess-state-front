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

// setTimeout delays above 2^31-1 ms overflow and fire immediately.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;
let expiryTimer: ReturnType<typeof setTimeout> | null = null;

function clearExpiryTimer() {
  if (expiryTimer !== null) {
    clearTimeout(expiryTimer);
    expiryTimer = null;
  }
}

/** Log out automatically when the token's `exp` claim is reached. */
function scheduleExpiry(token: string | null, onExpire: () => void) {
  clearExpiryTimer();
  if (!token) return;
  let exp: unknown;
  try {
    exp = jwtDecode<DecodedToken>(token)?.exp;
  } catch {
    return;
  }
  if (typeof exp !== 'number') return;
  const delay = exp * 1000 - Date.now();
  if (delay > MAX_TIMEOUT_MS) return;
  expiryTimer = setTimeout(onExpire, Math.max(delay, 0));
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: getStoredToken(),

  setToken: (token: string | null) => {
    localStorage.setItem('token', JSON.stringify(token));
    set({ token });
    scheduleExpiry(token, () => get().logout());
  },

  logout: () => {
    clearExpiryTimer();
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

const initialToken = useAuthStore.getState().token;
scheduleExpiry(initialToken, () => useAuthStore.getState().logout());
