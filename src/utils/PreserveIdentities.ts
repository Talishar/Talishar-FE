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
    if (prev.length === next.length) {
      let out: unknown[] | null = null;
      for (let i = 0; i < next.length; i++) {
        const merged = preserveIdentities(prev[i], next[i]);
        if (out !== null) {
          out[i] = merged;
        } else if (merged !== prev[i]) {
          out = new Array(next.length);
          for (let j = 0; j < i; j++) out[j] = prev[j];
          out[i] = merged;
        }
      }
      return out === null ? (prev as T) : (out as T);
    }
    // Length changed: result can never equal prev, so the map is necessary.
    return next.map((item, i) =>
      i < prev.length ? preserveIdentities(prev[i], item) : item
    ) as T;
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
    let out: Record<string, unknown> | null = null;
    for (let i = 0; i < nextKeys.length; i++) {
      const key = nextKeys[i];
      if (!(key in prevObj)) allSame = false;
      const merged = preserveIdentities(prevObj[key], nextObj[key]);
      if (merged !== prevObj[key]) allSame = false;
      if (out !== null) {
        out[key] = merged;
      } else if (!allSame) {
        out = {};
        for (let j = 0; j < i; j++) out[nextKeys[j]] = prevObj[nextKeys[j]];
        out[key] = merged;
      }
    }
    return allSame ? (prev as T) : (out as T);
  }
  return next;
}
