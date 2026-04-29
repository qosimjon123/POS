import type { AxiosError } from 'axios';

import { getFrappeAuthFailureEvent } from './authSessionAdapter';

function axiosError(status: number, data?: unknown): AxiosError {
  return {
    isAxiosError: true,
    name: 'AxiosError',
    message: 'request failed',
    toJSON: () => ({}),
    response: {
      status,
      statusText: '',
      headers: {},
      config: {},
      data,
    },
  } as AxiosError;
}

describe('getFrappeAuthFailureEvent', () => {
  it('treats 401 as unauthorized', () => {
    expect(getFrappeAuthFailureEvent(axiosError(401))).toEqual({
      status: 401,
      reason: 'unauthorized',
    });
  });

  it('treats auth-shaped 403 as session expired', () => {
    expect(
      getFrappeAuthFailureEvent(
        axiosError(403, { exception: 'frappe.AuthenticationError' }),
      ),
    ).toEqual({
      status: 403,
      reason: 'session-expired',
    });
  });

  it('does not treat ordinary permission 403 as logout', () => {
    expect(
      getFrappeAuthFailureEvent(
        axiosError(403, { exception: 'frappe.PermissionError' }),
      ),
    ).toBeNull();
  });
});
