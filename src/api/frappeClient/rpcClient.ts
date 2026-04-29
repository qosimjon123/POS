import { getFrappeCall } from './backendClient';

export async function callFrappeMethod<TResponse = unknown>(
  method: string,
  payload?: Record<string, unknown>,
): Promise<TResponse | null> {
  const call = getFrappeCall();
  if (!call) return null;
  return call.post(method, payload ?? {});
}
