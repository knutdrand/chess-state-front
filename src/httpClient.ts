import axios from 'axios';
import { baseUrl } from './config';
import { useAuthStore } from './stores/authStore';
import { notifyGlobal } from './hooks/useNotification';

const httpClient = axios.create({
  baseURL: baseUrl,
});

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling: if we were logged in and the API rejects our token,
// log out (which also clears the React Query cache, see queryClient.ts).
// Requests made while logged out (e.g. a failed login) are left alone.
httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const { token, logout } = useAuthStore.getState();
      if (token) {
        logout();
        notifyGlobal('Your session has expired. Please log in again.', 'warning');
      }
    }
    return Promise.reject(error);
  }
);

export default httpClient;
