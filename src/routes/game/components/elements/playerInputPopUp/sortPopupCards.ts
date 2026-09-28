import { Card } from 'features/Card';

const MIN_SORTED_CARDS = 8;

const SINGLE_ZONE_PHASES = new Set([
  'CHOOSEDECK',
  'MAYCHOOSEDECK',
  'CHOOSETHEIRDECK',
  'MAYCHOOSETHEIRDECK',
  'CHOOSEDISCARD',
  'MAYCHOOSEDISCARD',
  'CHOOSEDISCARDCANCEL',
  'MAYCHOOSETHEIRDISCARD',
  'CHOOSEBANISH',
  'MULTICHOOSEDISCARD',
  'MULTICHOOSETHEIRDISCARD',
  'MULTICHOOSEBANISH',
  'MULTICHOOSEDECK',
  'MULTICHOOSETHEIRDECK'
]);

const MULTIZONE_PHASES = new Set(['CHOOSEMULTIZONE', 'MAYCHOOSEMULTIZONE']);

const DECK_PICK_PHASES = new Set([
  'CHOOSEDECK',
  'MAYCHOOSEDECK',
  'CHOOSETHEIRDECK',
  'MAYCHOOSETHEIRDECK'
]);

const SORTABLE_ZONE = /^((?:MY|THEIR)(?:DISCARD|BANISH|DECK))-\d/;
const PITCH_SUFFIX = /_(red|yellow|blue)$/;
const PITCH_ORDER: Record<string, number> = { red: 1, yellow: 2, blue: 3 };

const cardZone = (card: Card, phase: string) => {
  if (SINGLE_ZONE_PHASES.has(phase)) return phase;
  const match = SORTABLE_ZONE.exec(String(card.actionDataOverride ?? ''));
  return match ? match[1] : null;
};

const compareCards = (a: Card, b: Card) => {
  const aPitch = PITCH_SUFFIX.exec(a.cardNumber);
  const bPitch = PITCH_SUFFIX.exec(b.cardNumber);
  const aName = aPitch ? a.cardNumber.slice(0, aPitch.index) : a.cardNumber;
  const bName = bPitch ? b.cardNumber.slice(0, bPitch.index) : b.cardNumber;
  if (aName !== bName) return aName < bName ? -1 : 1;
  return (
    (aPitch ? PITCH_ORDER[aPitch[1]] : 0) -
    (bPitch ? PITCH_ORDER[bPitch[1]] : 0)
  );
};

// Graveyard, banish and deck runs are grouped by name; other zones keep server order.
export const popupCardDisplayOrder = (
  cards: Card[] | undefined,
  phase: string
): number[] => {
  const order = (cards ?? []).map((_, index) => index);
  if (!cards || cards.length < MIN_SORTED_CARDS) return order;
  if (!SINGLE_ZONE_PHASES.has(phase) && !MULTIZONE_PHASES.has(phase)) {
    return order;
  }

  let start = 0;
  while (start < cards.length) {
    const zone = cardZone(cards[start], phase);
    let end = start + 1;
    while (end < cards.length && cardZone(cards[end], phase) === zone) ++end;
    if (zone !== null && end - start > 1) {
      const run = order.slice(start, end);
      run.sort((a, b) => compareCards(cards[a], cards[b]) || a - b);
      order.splice(start, run.length, ...run);
    }
    start = end;
  }
  return order;
};

const deckPickZone = (card: Card, phase: string) => {
  if (DECK_PICK_PHASES.has(phase)) return phase;
  if (!MULTIZONE_PHASES.has(phase)) return null;
  const zone = cardZone(card, phase);
  return zone === 'MYDECK' || zone === 'THEIRDECK' ? zone : null;
};

export const stackDeckCopies = (
  cards: Card[] | undefined,
  order: number[],
  phase: string
): { order: number[]; counts: number[] } => {
  if (!cards || cards.length < MIN_SORTED_CARDS) {
    return { order, counts: order.map(() => 1) };
  }

  const stackedOrder: number[] = [];
  const counts: number[] = [];
  let previousZone: string | null = null;
  for (const index of order) {
    const zone = deckPickZone(cards[index], phase);
    const last = stackedOrder.length - 1;
    if (
      zone !== null &&
      zone === previousZone &&
      cards[stackedOrder[last]].cardNumber === cards[index].cardNumber
    ) {
      ++counts[last];
    } else {
      stackedOrder.push(index);
      counts.push(1);
    }
    previousZone = zone;
  }
  return { order: stackedOrder, counts };
};
