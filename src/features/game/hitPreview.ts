import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from 'app/Store';
import { Card } from 'features/Card';
import Player from 'features/Player';

type Side = { side: 'player' | 'opponent' };
type HandChange = Side & { kind: 'hand'; gained: number; lost: number };
type MaybeToken = Side & {
  kind: 'maybeToken';
  cardID: string;
  source: string;
  max: number;
};
export type HitPreviewChange = HandChange | MaybeToken;

export interface HitPreviewPlayer {
  real: Player;
  hand?: HandChange;
  maybe: MaybeToken[];
}

export interface HitPreviewMark {
  glow?: 'gain' | 'loss';
  badge?: number;
}

const BOARD_ZONES = [
  'HeadEq',
  'ChestEq',
  'ArmsEq',
  'LegsEq',
  'WeaponLEq',
  'Hero',
  'WeaponREq',
  'Arsenal',
  'Permanents',
  'Banish',
  'Graveyard',
  'Pitch',
  'Soul'
] as const;

const USABLE_BORDERS = new Set(['6', '7', '8']);
const CARD_FIELDS = [
  ...BOARD_ZONES,
  'Hand',
  'Deck',
  'DeckBack',
  'Effects'
] as const;

export const viewOnlyCard = (card: Card): Card => ({
  ...card,
  action: undefined,
  borderColor: USABLE_BORDERS.has(card.borderColor ?? '')
    ? undefined
    : card.borderColor
});

export const viewOnlyPlayer = (player: Player): Player => {
  const result: Player = { ...player };
  for (const field of CARD_FIELDS) {
    const value = player[field];
    if (Array.isArray(value))
      (result[field] as Card[]) = value.map(viewOnlyCard);
    else if (value) (result[field] as Card) = viewOnlyCard(value);
  }
  return result;
};

export const realPlayer = (player: Player): Player =>
  player.hitPreview?.real ?? player;

export const hitPreviewPlayer = (
  real: Player,
  changes: HitPreviewChange[],
  key: 'playerOne' | 'playerTwo'
): HitPreviewPlayer => {
  const side = key === 'playerOne' ? 'player' : 'opponent';
  return {
    real,
    hand: changes.find(
      (change): change is HandChange =>
        change.kind === 'hand' && change.side === side
    ),
    maybe: changes.filter(
      (change): change is MaybeToken =>
        change.kind === 'maybeToken' && change.side === side
    )
  };
};

export const selectIsHitPreviewing = (state: RootState): boolean =>
  !!state.game.playerOne.hitPreview;

export const hitPreviewDelta = (
  player: Player,
  pick: (player: Player) => number | undefined
): number =>
  player.hitPreview
    ? Number(pick(player) ?? 0) - Number(pick(player.hitPreview.real) ?? 0)
    : 0;

const boardCards = (players: Player[]): Map<string, Card> => {
  const cards = new Map<string, Card>();
  for (const player of players) {
    for (const zone of BOARD_ZONES) {
      for (const card of [player[zone] ?? []].flat()) {
        if (card.uniqueId && card.uniqueId !== '-')
          cards.set(card.uniqueId, card);
      }
    }
  }
  return cards;
};

const counterDelta = (before: Card, after: Card): number => {
  const keys = new Set([
    ...Object.keys(before.countersMap ?? {}),
    ...Object.keys(after.countersMap ?? {})
  ]);
  for (const key of keys) {
    const delta =
      Number(after.countersMap?.[key] ?? 0) -
      Number(before.countersMap?.[key] ?? 0);
    if (delta !== 0 && Number.isFinite(delta)) return delta;
  }
  return 0;
};

const selectCardMarks = createSelector(
  [
    (state: RootState) => state.game.playerOne,
    (state: RootState) => state.game.playerTwo
  ],
  (playerOne, playerTwo) => {
    const marks = new Map<string, HitPreviewMark>();
    if (!playerOne.hitPreview) return marks;
    const real = boardCards([realPlayer(playerOne), realPlayer(playerTwo)]);
    boardCards([playerOne, playerTwo]).forEach((card, uniqueId) => {
      const before = real.get(uniqueId);
      const badge = before ? counterDelta(before, card) : 0;
      if (!before) marks.set(uniqueId, { glow: 'gain' });
      else if (badge !== 0) marks.set(uniqueId, { badge });
    });
    return marks;
  }
);

export const selectHitPreviewCardMark = (
  state: RootState,
  uniqueId: string | undefined
): HitPreviewMark | undefined =>
  uniqueId ? selectCardMarks(state).get(uniqueId) : undefined;

export const hitPreviewHandMarks = (
  ids: string[],
  badgeId: string | undefined,
  change: HandChange | undefined
): Map<string, HitPreviewMark> => {
  const marks = new Map<string, HitPreviewMark>();
  if (!change) return marks;
  ids.forEach((id, index) => {
    if (index >= ids.length - change.gained) marks.set(id, { glow: 'gain' });
    else if (change.lost > 0) marks.set(id, { glow: 'loss' });
  });
  if (change.lost > 0 && badgeId !== undefined) {
    marks.set(badgeId, {
      glow: marks.get(badgeId)?.glow ?? 'loss',
      badge: -change.lost
    });
  }
  return marks;
};
