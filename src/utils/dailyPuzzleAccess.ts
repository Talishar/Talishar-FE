// The daily puzzle is still being tested: only these accounts see the page and its header link.
const DAILY_PUZZLE_TESTERS = new Set(['PvtVoid']);

export const canSeeDailyPuzzle = (userName?: string | null) =>
  DAILY_PUZZLE_TESTERS.has(userName ?? '');
