// Simulated network latency for store mutations.
// TODO(real-api): replace with fetch() to the back-office API. The shape
// of these helpers (success / failure with random jitter) approximates
// what the real client should look like.

export async function simulate<T>(value: T, minMs = 200, maxMs = 400): Promise<T> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise((r) => setTimeout(r, ms));
  return value;
}

export async function simulateVoid(minMs = 200, maxMs = 400): Promise<void> {
  await simulate(undefined, minMs, maxMs);
}
