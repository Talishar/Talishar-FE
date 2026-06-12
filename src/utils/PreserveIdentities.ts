/**
 * Rebuilds `next` reusing every deeply-equal piece of `prev`, so object and
 * array references only change when their content actually changed.
 *
 * The SSE stream replaces the whole game state on every push. Without this,
 * every zone array (Hand, Graveyard, Banish, ...) gets a brand-new identity
 * each push even when nothing in it changed, which makes every subscribed
 * component re-render ~20x/min for no reason. With it, `useAppSelector`'s
 * default reference-equality check skips all of that.
 *
 * Works on plain JSON-shaped data (objects, arrays, primitives) — which is
 * exactly what ParseGameState produces.
 */
export function preserveIdentities<T>(prev: T | undefined, next: T): T {
  if (prev === undefined || prev === null || next === undefined || next === null) {
    return next;
  }
  if ((prev as unknown) === (next as unknown)) {
    return prev as T;
  }
  if (Array.isArray(prev) && Array.isArray(next)) {
    let allSame = prev.length === next.length;
    const out = next.map((item, i) => {
      const merged =
        i < prev.length ? preserveIdentities(prev[i], item) : item;
      if (merged !== prev[i]) allSame = false;
      return merged;
    });
    return allSame ? (prev as T) : (out as T);
  }
  if (
    typeof prev === 'object' &&
    typeof next === 'object' &&
    !Array.isArray(prev) &&
    !Array.isArray(next)
  ) {
    const prevObj = prev as Record<string, unknown>;
    const nextObj = next as Record<string, unknown>;
    const nextKeys = Object.keys(nextObj);
    let allSame = Object.keys(prevObj).length === nextKeys.length;
    const out: Record<string, unknown> = {};
    for (const key of nextKeys) {
      if (!(key in prevObj)) allSame = false;
      const merged = preserveIdentities(prevObj[key], nextObj[key]);
      out[key] = merged;
      if (merged !== prevObj[key]) allSame = false;
    }
    return allSame ? (prev as T) : (out as T);
  }
  return next;
}
