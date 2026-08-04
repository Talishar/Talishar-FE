/** Cookie name for the client-only "tap to preview before playing" option. */
export const TAP_TO_PREVIEW_PLAY_COOKIE = 'tapToPreviewPlay';

/**
 * Module-level sticky selection shared across CardPopUp instances (hand + board).
 * Notified via subscribeTapToPreviewSelection so React can re-render with
 * useSyncExternalStore — no Redux popup-card hack required.
 */
let selectedCardKey: string | null = null;
const selectionListeners = new Set<() => void>();

export function getTapToPreviewSelectedCardKey(): string | null {
  return selectedCardKey;
}

export function subscribeTapToPreviewSelection(
  onStoreChange: () => void
): () => void {
  selectionListeners.add(onStoreChange);
  return () => {
    selectionListeners.delete(onStoreChange);
  };
}

function notifyTapToPreviewSelectionListeners(): void {
  selectionListeners.forEach((listener) => listener());
}

export function setTapToPreviewSelectedCardKey(cardKey: string | null): void {
  if (selectedCardKey === cardKey) {
    return;
  }
  selectedCardKey = cardKey;
  notifyTapToPreviewSelectionListeners();
}

export function clearTapToPreviewSelection(): void {
  setTapToPreviewSelectedCardKey(null);
}

export type TapToPreviewAction = 'preview' | 'play';

/**
 * Resolves a card tap when the tap-to-preview option is considered.
 * - Option off → always play / activate (legacy one-tap behavior).
 * - Option on, first tap on a card → preview and remember selection.
 * - Option on, second tap on the same card → activate and clear selection.
 * - Option on, tap on a different card → preview that card instead (do not activate).
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

/**
 * Outside taps dismiss a sticky preview. Taps on another previewable card
 * (hand or board) are ignored here so that card can switch the preview itself.
 */
export function shouldDismissStickyPreviewOnOutsideTap({
  enabled,
  selectedKey,
  isTapOnPreviewableCard
}: {
  enabled: boolean;
  selectedKey: string | null;
  isTapOnPreviewableCard: boolean;
}): boolean {
  if (!enabled || selectedKey == null || isTapOnPreviewableCard) {
    return false;
  }
  return true;
}

/** CSS selector for cards that participate in tap-to-preview switching. */
export const TAP_PREVIEW_CARD_SELECTOR = '[data-tap-preview-card="true"]';

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

export function buildBoardCardSelectionKey({
  cardNumber,
  isOpponent,
  instanceId
}: {
  cardNumber: string;
  isOpponent?: boolean;
  /** React useId (or other stable per-mount id) — required to distinguish duplicates. */
  instanceId: string;
}): string {
  return `board:${isOpponent ? 'opp' : 'me'}:${cardNumber}:${instanceId}`;
}

export function isTapToPreviewPlayEnabled(
  cookieValue: string | undefined
): boolean {
  return cookieValue === 'true';
}
