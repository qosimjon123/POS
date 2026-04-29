declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: {
  <T>(actual: T): {
    toBe: (expected: T) => void;
    toEqual: (expected: unknown) => void;
    toBeLessThanOrEqual: (expected: number) => void;
    toBeNull: () => void;
    resolves: {
      toEqual: (expected: unknown) => Promise<void>;
    };
  };
};
