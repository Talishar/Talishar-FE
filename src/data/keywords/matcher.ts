import { GLOSSARY } from './glossary';
import { KeywordEntry } from './types';

export interface KeywordMatch {
  start: number;
  end: number;
  id: string;
  display: string;
}

const normalize = (raw: string) => raw.toLowerCase().replace(/\s+/g, ' ').trim();

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

interface MatcherState {
  entryById: Map<string, KeywordEntry>;
  aliasToId: Map<string, string>;
  regex: RegExp | null;
}

let state: MatcherState | null = null;

const BOUNDARY = "\\w'’-";

const buildState = (): MatcherState => {
  const entryById = new Map<string, KeywordEntry>();
  const aliasToId = new Map<string, string>();
  const matchable: string[] = [];

  for (const entry of GLOSSARY) {
    entryById.set(entry.id, entry);
    for (const alias of [entry.name, ...(entry.aliases ?? [])]) {
      aliasToId.set(normalize(alias), entry.id);
      if (!entry.noAutoLink) {
        matchable.push(alias);
      }
    }
  }

  matchable.sort((a, b) => b.length - a.length);

  const regex =
    matchable.length > 0
      ? new RegExp(
          `(^|[^${BOUNDARY}])(${matchable.map(escapeRegExp).join('|')})( (\\d+))?(?![${BOUNDARY}])`,
          'gi'
        )
      : null;

  return { entryById, aliasToId, regex };
};

const getState = (): MatcherState => {
  if (!state) {
    state = buildState();
  }
  return state;
};

export const matchKeywords = (text: string): KeywordMatch[] => {
  const { aliasToId, entryById, regex } = getState();
  if (!regex || !text) return [];

  const matches: KeywordMatch[] = [];
  regex.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const lead = m[1] ?? '';
    const word = m[2];
    const num = m[4];
    const id = aliasToId.get(normalize(word));
    if (!id) continue;
    const entry = entryById.get(id);
    if (!entry) continue;

    const start = m.index + lead.length;
    const display =
      num !== undefined && entry.parameterized ? `${word} ${num}` : word;
    matches.push({ start, end: start + display.length, id, display });
  }
  return matches;
};

export const normalizeKeyword = (raw: string): string | undefined => {
  const { aliasToId } = getState();
  return aliasToId.get(normalize(raw.replace(/\s+\d+$/, '')));
};

export const getKeywordEntry = (id: string): KeywordEntry | undefined =>
  getState().entryById.get(id);
