type Fn = (...params: number[]) => number;

function memoize(fn: Fn): Fn {
  const cache = new Map<string, number>();
  return function (...args: number[]): number {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
