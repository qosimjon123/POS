import { createSingleFlight } from './singleFlight';

describe('createSingleFlight', () => {
  it('shares one in-flight promise for concurrent calls', async () => {
    const flight = createSingleFlight<number>();
    let calls = 0;

    const run = () =>
      flight.run(async () => {
        calls += 1;
        await Promise.resolve();
        return 42;
      });

    await expect(Promise.all([run(), run(), run()])).resolves.toEqual([
      42,
      42,
      42,
    ]);
    expect(calls).toBe(1);
    expect(flight.isRunning()).toBe(false);
  });

  it('allows a new call after the previous one settles', async () => {
    const flight = createSingleFlight<number>();
    let calls = 0;

    await flight.run(async () => {
      calls += 1;
      await Promise.resolve();
      return calls;
    });
    await flight.run(async () => {
      calls += 1;
      await Promise.resolve();
      return calls;
    });

    expect(calls).toBe(2);
  });
});
