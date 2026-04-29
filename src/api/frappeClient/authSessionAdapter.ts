import type { AxiosError } from 'axios';

export type FrappeAuthFailureReason = 'unauthorized' | 'session-expired';

export interface FrappeAuthFailureEvent {
  status: number;
  reason: FrappeAuthFailureReason;
}

export type FrappeAuthFailureHandler = (event: FrappeAuthFailureEvent) => void;

let authFailureHandler: FrappeAuthFailureHandler | null = null;

export function configureFrappeAuthFailureHandler(
  handler: FrappeAuthFailureHandler,
): void {
  authFailureHandler = handler;
}

export function handleFrappeAuthFailure(event: FrappeAuthFailureEvent): void {
  authFailureHandler?.(event);
}

function responseText(data: unknown): string {
  if (!data) return '';
  if (typeof data === 'string') return data;
  try {
    return JSON.stringify(data);
  } catch {
    return '';
  }
}

export function getFrappeAuthFailureEvent(
  err: AxiosError,
): FrappeAuthFailureEvent | null {
  const status = typeof err.response?.status === 'number' ? err.response.status : 0;
  if (status === 401) {
    return { status, reason: 'unauthorized' };
  }

  if (status === 403) {
    const text = responseText(err.response?.data).toLowerCase();
    const looksLikeSessionFailure =
      text.includes('authenticationerror') ||
      text.includes('not logged in') ||
      text.includes('login required') ||
      text.includes('session expired') ||
      text.includes('"guest"');

    if (looksLikeSessionFailure) {
      return { status, reason: 'session-expired' };
    }
  }

  return null;
}
