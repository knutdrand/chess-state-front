import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { notifyGlobal } from './hooks/useNotification';
import { useAuthStore } from './stores/authStore';
import { getErrorMessage, isUnauthorized } from './utils/errors';

/**
 * Shared QueryClient. Errors are surfaced through the notification snackbar:
 * - queries: unless they opt out with `meta: { errorToast: false }`
 *   (e.g. because the component renders its own error state);
 * - mutations: unless they define their own `onError`.
 * 401s are skipped here; the httpClient interceptor logs the user out.
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (isUnauthorized(error) || query.meta?.errorToast === false) return;
      notifyGlobal(getErrorMessage(error, 'Could not load data from the server.'), 'error');
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (isUnauthorized(error) || mutation.options.onError) return;
      notifyGlobal(getErrorMessage(error, 'The request failed. Please try again.'), 'error');
    },
  }),
});

// Drop all cached server state whenever the user is logged out
// (manual logout, 401 from the API, or token expiry).
useAuthStore.subscribe((state, prev) => {
  if (prev.token && !state.token) {
    queryClient.clear();
  }
});
