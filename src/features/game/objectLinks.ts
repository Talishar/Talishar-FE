import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from 'app/Store';
import { Card } from 'features/Card';
import Player from 'features/Player';
import isEqual from 'react-fast-compare';

export const NOT_NUMBERED = 0;

export const linkKeyOf = (card: Card | undefined): string | undefined => {
  const key = card?.linkUid ?? card?.uniqueId;
  return key && key !== '-' ? key : undefined;
};

export const stacksTogether = (a: Card, b: Card): boolean => {
  const aKeys = Object.keys(a) as (keyof Card)[];
  const bKeys = Object.keys(b) as (keyof Card)[];
  let aCount = 0;
  for (const key of aKeys) {
    if (key === 'actionDataOverride' || key === 'uniqueId') continue;
    aCount++;
    if (!(key in b)) return false;
    const aValue = a[key];
    const bValue = b[key];
    if (aValue === bValue) continue;
    if (!isEqual(aValue, bValue)) return false;
  }
  let bCount = 0;
  for (const key of bKeys) {
    if (key !== 'actionDataOverride' && key !== 'uniqueId') bCount++;
  }
  return aCount === bCount;
};

type BoardCard = { order: number; card: Card; permanent: boolean };

const BOARD_EQUIPMENT: (keyof Player)[] = [
  'Hero',
  'WeaponLEq',
  'HeadEq',
  'ChestEq',
  'ArmsEq',
  'LegsEq',
  'WeaponREq'
];

const addBoardCard = (
  board: Map<string, BoardCard>,
  card: Card | undefined,
  permanent = false
) => {
  const key = linkKeyOf(card);
  if (card && key && !board.has(key)) {
    board.set(key, { order: board.size, card, permanent });
  }
};

const addPlayerBoard = (board: Map<string, BoardCard>, player: Player) => {
  for (const slot of BOARD_EQUIPMENT) addBoardCard(board, player[slot] as Card);
  for (const card of player.Permanents ?? []) addBoardCard(board, card, true);
  for (const card of player.Arsenal ?? []) addBoardCard(board, card);
};

const isOneStack = (group: string[], board: Map<string, BoardCard>) => {
  const first = board.get(group[0]);
  if (!first?.permanent || first.card.cardNumber === 'EVR070') return false;
  return group.every((key) => {
    const other = board.get(key);
    return other?.permanent && stacksTogether(first.card, other.card);
  });
};

const EMPTY_LINKS = new Map<string, number>();

export const selectObjectLinks = createSelector(
  [
    (state: RootState) => state.game.playerInputPopUp,
    (state: RootState) => state.game.activeLayers?.cardList,
    (state: RootState) => state.game.playerOne,
    (state: RootState) => state.game.playerTwo
  ],
  (inputPopUp, layers, playerOne, playerTwo): Map<string, number> => {
    const popup = inputPopUp?.active ? inputPopUp.popup : undefined;
    const sources = [popup?.cards, popup?.topCards, layers];
    if (!sources.some((cards) => cards?.some((card) => linkKeyOf(card)))) {
      return EMPTY_LINKS;
    }

    const board = new Map<string, BoardCard>();
    addPlayerBoard(board, playerOne);
    addPlayerBoard(board, playerTwo);

    const groups = new Map<string, string[]>();
    for (const cards of sources) {
      for (const card of cards ?? []) {
        const key = linkKeyOf(card);
        const boardCard = key ? board.get(key) : undefined;
        if (!key || !boardCard) continue;
        const group = groups.get(boardCard.card.cardNumber);
        if (!group) groups.set(boardCard.card.cardNumber, [key]);
        else if (!group.includes(key)) group.push(key);
      }
    }
    if (groups.size === 0) return EMPTY_LINKS;

    const links = new Map<string, number>();
    for (const group of groups.values()) {
      if (group.length === 1 || isOneStack(group, board)) {
        for (const key of group) links.set(key, NOT_NUMBERED);
        continue;
      }
      group.sort(
        (a, b) => (board.get(a)?.order ?? 0) - (board.get(b)?.order ?? 0)
      );
      group.forEach((key, index) => links.set(key, index + 1));
    }
    return links;
  }
);

export const objectLinkLabel = (
  links: Map<string, number>,
  keys: (string | undefined)[]
): string | undefined => {
  let linked = false;
  let label = '';
  for (const key of keys) {
    const number = key ? links.get(key) : undefined;
    if (number === undefined) continue;
    linked = true;
    if (number !== NOT_NUMBERED) label += (label ? ' ' : '') + `#${number}`;
  }
  return linked ? label : undefined;
};

const LINK_ACTIVE_CLASS = 'objectLinkActive';

export const highlightLinkedObjects = (key: string, active: boolean) => {
  document
    .querySelectorAll(`[data-object-link~="${CSS.escape(key)}"]`)
    .forEach((element) => element.classList.toggle(LINK_ACTIVE_CLASS, active));
};
