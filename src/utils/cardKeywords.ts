import { useEffect, useState } from 'react';

interface CardKeywordData {
  strings: string[];
  map: Record<string, number[]>;
}

let cache: CardKeywordData | null = null;
let pending: Promise<CardKeywordData> | null = null;

const loadCardKeywords = (): Promise<CardKeywordData> => {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = import('data/keywords/generated/cardKeywordMap').then((mod) => {
      cache = { strings: mod.KEYWORD_STRINGS, map: mod.CARD_KEYWORD_MAP };
      return cache;
    });
  }
  return pending;
};

export const useCardKeywords = (cardNumber?: string): string[] | undefined => {
  const [data, setData] = useState<CardKeywordData | null>(cache);

  useEffect(() => {
    if (cache) return;
    let alive = true;
    loadCardKeywords().then((loaded) => {
      if (alive) setData(loaded);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!cardNumber || !data) return undefined;
  const indexes = data.map[cardNumber];
  if (!indexes || indexes.length === 0) return undefined;
  return indexes.map((i) => data.strings[i]);
};
