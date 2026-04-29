export interface SingleFlight<T> {
  run: (fn: () => Promise<T>) => Promise<T>;
  isRunning: () => boolean;
}

export function createSingleFlight<T>(): SingleFlight<T> {
  let inFlight: Promise<T> | null = null;

  return {
    run(fn) {
      if (!inFlight) {
        inFlight = fn().finally(() => {
          inFlight = null;
        });
      }
      return inFlight;
    },
    isRunning() {
      return inFlight !== null;
    },
  };
}
