import { describe, expect, it } from 'vitest';
import {
  AI_DECK,
  AI_DECKS_FOR_FORMAT,
  GAME_FORMAT,
  GAME_FORMAT_NUMBER
} from './appConstants';

describe('AI decks by format', () => {
  it.each([
    GAME_FORMAT.DRAFT,
    GAME_FORMAT_NUMBER.DRAFT,
    GAME_FORMAT.SEALED,
    GAME_FORMAT_NUMBER.SEALED,
    GAME_FORMAT.CLASH
  ])('offers SAGE bots for limited format %s', (format) => {
    expect(AI_DECKS_FOR_FORMAT(format).map(({ value }) => value)).toEqual([
      AI_DECK.DUMMY,
      AI_DECK.BRIARSAGE,
      AI_DECK.BRAVOSAGE,
      AI_DECK.IRASAGE,
      AI_DECK.KAYOSAGE,
      AI_DECK.DORINTHEASAGE
    ]);
  });

  it('keeps Classic Constructed bots in CC', () => {
    expect(
      AI_DECKS_FOR_FORMAT(GAME_FORMAT.CLASSIC_CONSTRUCTED).map(
        ({ value }) => value
      )
    ).toEqual([
      AI_DECK.DUMMY,
      AI_DECK.IRACC,
      AI_DECK.FAICC,
      AI_DECK.CINDRACC,
      AI_DECK.HALACC,
      AI_DECK.JARLCC,
      AI_DECK.LEVIACC,
      AI_DECK.STARVOCC,
      AI_DECK.BOLTYNCC,
      AI_DECK.AURORACC,
      AI_DECK.FANGCC
    ]);
  });
});
