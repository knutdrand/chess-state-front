import { isAxiosError } from 'axios';
import { ApiError } from '../api/core/ApiError';

/** HTTP status of an error thrown by the generated client or axios, if any. */
export function getErrorStatus(err: unknown): number | undefined {
  if (err instanceof ApiError) return err.status;
  if (isAxiosError(err)) return err.response?.status;
  return undefined;
}

export function isUnauthorized(err: unknown): boolean {
  return getErrorStatus(err) === 401;
}

/**
 * A user-facing message for an error. Prefers the backend's string `detail`
 * (FastAPI's HTTPException format), otherwise returns the fallback.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const body: unknown = err.body;
    if (body && typeof body === 'object' && 'detail' in body) {
      const detail = (body as { detail: unknown }).detail;
      if (typeof detail === 'string' && detail) return detail;
    }
  }
  return fallback;
}
