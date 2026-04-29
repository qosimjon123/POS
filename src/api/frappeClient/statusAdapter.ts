export type FrappeRequestStatusHandler = (status: number) => void;

let statusHandler: FrappeRequestStatusHandler | null = null;

export function configureFrappeStatusHandler(handler: FrappeRequestStatusHandler): void {
  statusHandler = handler;
}

export function handleFrappeRequestStatus(status: number): void {
  statusHandler?.(status);
}
