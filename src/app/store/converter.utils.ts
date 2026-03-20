export function roundRate(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function roundAmount(n: number): number {
  return Math.round(n * 100) / 100;
}

export function clampRate(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function invertRate(rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) return NaN;
  return roundRate(1 / rate);
}

export function randomFluctuation(): number {
  const stepCount = 1001;
  const index = Math.floor(Math.random() * stepCount);
  return (index - 500) / 10000;
}
