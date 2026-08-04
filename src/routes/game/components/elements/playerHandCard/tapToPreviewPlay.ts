/** Cookie name for the client-only "tap to preview before playing" option. */
export const TAP_TO_PREVIEW_PLAY_COOKIE = 'tapToPreviewPlay';

/** Module-level selection so tapping a different hand card switches the preview. */
let selectedCardKey: string | null = null;

export function getTapToPreviewSelectedCardKey(): string | null {
  return selectedCardKey;
}

export function setTapToPreviewSelectedCardKey(cardKey: string | null): void {
  selectedCardKey = cardKey;
}

export function clearTapToPreviewSelection(): void {
  selectedCardKey = null;
}

export type TapToPreviewAction = 'preview' | 'play';

/**
 * Resolves a hand-card tap when the tap-to-preview option is considered.
 * - Option off → always play (legacy one-tap behavior).
 * - Option on, first tap on a card → preview and remember selection.
 * - Option on, second tap on the same card → play and clear selection.
 * - Option on, tap on a different card → preview that card instead.
 */
export function resolveTapToPreviewPlay({
  enabled,
  cardKey,
  selectedKey = selectedCardKey
}: {
  enabled: boolean;
  cardKey: string;
  selectedKey?: string | null;
}): { action: TapToPreviewAction; nextSelectedKey: string | null } {
  if (!enabled) {
    return { action: 'play', nextSelectedKey: null };
  }

  if (selectedKey === cardKey) {
    return { action: 'play', nextSelectedKey: null };
  }

  return { action: 'preview', nextSelectedKey: cardKey };
}

export function buildHandCardSelectionKey({
  cardId,
  cardNumber,
  cardIndex,
  zone
}: {
  cardId?: string;
  cardNumber: string;
  cardIndex?: number;
  zone: 'hand' | 'arsenal' | 'banished' | 'graveyard';
}): string {
  if (cardId) {
    return `id:${cardId}`;
  }
  return `${zone}:${cardNumber}:${cardIndex ?? ''}`;
}

export function isTapToPreviewPlayEnabled(
  cookieValue: string | undefined
): boolean {
  return cookieValue === 'true';
}
