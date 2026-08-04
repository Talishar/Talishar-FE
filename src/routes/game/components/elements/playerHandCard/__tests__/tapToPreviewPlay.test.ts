import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildBoardCardSelectionKey,
  buildHandCardSelectionKey,
  clearTapToPreviewSelection,
  getTapToPreviewSelectedCardKey,
  isTapToPreviewPlayEnabled,
  resolveTapToPreviewPlay,
  setTapToPreviewSelectedCardKey,
  shouldDismissStickyPreviewOnOutsideTap
} from '../tapToPreviewPlay';

describe('tapToPreviewPlay', () => {
  beforeEach(() => {
    clearTapToPreviewSelection();
  });

  describe('isTapToPreviewPlayEnabled', () => {
    it('is disabled by default when cookie is absent', () => {
      expect(isTapToPreviewPlayEnabled(undefined)).toBe(false);
    });

    it('is disabled when cookie is not the string true', () => {
      expect(isTapToPreviewPlayEnabled('false')).toBe(false);
      expect(isTapToPreviewPlayEnabled('')).toBe(false);
      expect(isTapToPreviewPlayEnabled('1')).toBe(false);
    });

    it('is enabled only when cookie is true', () => {
      expect(isTapToPreviewPlayEnabled('true')).toBe(true);
    });
  });

  describe('resolveTapToPreviewPlay contract', () => {
    it('plays immediately when the option is disabled', () => {
      expect(
        resolveTapToPreviewPlay({
          enabled: false,
          cardKey: 'id:card-a',
          selectedKey: null
        })
      ).toEqual({ action: 'play', nextSelectedKey: null });
    });

    it('tap A with no selection → preview A', () => {
      expect(
        resolveTapToPreviewPlay({
          enabled: true,
          cardKey: 'id:card-a',
          selectedKey: null
        })
      ).toEqual({ action: 'preview', nextSelectedKey: 'id:card-a' });
    });

    it('tap A while A is selected → play A', () => {
      expect(
        resolveTapToPreviewPlay({
          enabled: true,
          cardKey: 'id:card-a',
          selectedKey: 'id:card-a'
        })
      ).toEqual({ action: 'play', nextSelectedKey: null });
    });

    it('tap B while A is selected → preview B (do not play)', () => {
      expect(
        resolveTapToPreviewPlay({
          enabled: true,
          cardKey: 'id:card-b',
          selectedKey: 'id:card-a'
        })
      ).toEqual({ action: 'preview', nextSelectedKey: 'id:card-b' });
    });

    it('after dismiss (selection cleared), tap A again → preview A (not play)', () => {
      expect(
        resolveTapToPreviewPlay({
          enabled: true,
          cardKey: 'id:card-a',
          selectedKey: null
        })
      ).toEqual({ action: 'preview', nextSelectedKey: 'id:card-a' });
    });

    it('shares selection between hand and board keys', () => {
      expect(
        resolveTapToPreviewPlay({
          enabled: true,
          cardKey: 'board:me:WTR001',
          selectedKey: 'id:hand-1'
        })
      ).toEqual({ action: 'preview', nextSelectedKey: 'board:me:WTR001' });
    });
  });

  describe('shouldDismissStickyPreviewOnOutsideTap', () => {
    it('dismisses when preview is active and tap is outside previewable cards', () => {
      expect(
        shouldDismissStickyPreviewOnOutsideTap({
          enabled: true,
          selectedKey: 'id:card-a',
          isTapOnPreviewableCard: false
        })
      ).toBe(true);
    });

    it('does not dismiss when tapping another previewable card', () => {
      expect(
        shouldDismissStickyPreviewOnOutsideTap({
          enabled: true,
          selectedKey: 'id:card-a',
          isTapOnPreviewableCard: true
        })
      ).toBe(false);
    });

    it('does not dismiss when option is off or nothing is selected', () => {
      expect(
        shouldDismissStickyPreviewOnOutsideTap({
          enabled: false,
          selectedKey: 'id:card-a',
          isTapOnPreviewableCard: false
        })
      ).toBe(false);
      expect(
        shouldDismissStickyPreviewOnOutsideTap({
          enabled: true,
          selectedKey: null,
          isTapOnPreviewableCard: false
        })
      ).toBe(false);
    });
  });

  describe('selection helpers', () => {
    it('tracks and clears the selected card key', () => {
      expect(getTapToPreviewSelectedCardKey()).toBeNull();
      setTapToPreviewSelectedCardKey('id:card-a');
      expect(getTapToPreviewSelectedCardKey()).toBe('id:card-a');
      clearTapToPreviewSelection();
      expect(getTapToPreviewSelectedCardKey()).toBeNull();
    });

    it('uses module selection when selectedKey is omitted', () => {
      setTapToPreviewSelectedCardKey('id:card-a');
      expect(
        resolveTapToPreviewPlay({ enabled: true, cardKey: 'id:card-a' })
      ).toEqual({ action: 'play', nextSelectedKey: null });
    });
  });

  describe('buildHandCardSelectionKey', () => {
    it('prefers cardId when present', () => {
      expect(
        buildHandCardSelectionKey({
          cardId: 'hand-1',
          cardNumber: 'WTR001',
          zone: 'hand'
        })
      ).toBe('id:hand-1');
    });

    it('falls back to zone + card number + index', () => {
      expect(
        buildHandCardSelectionKey({
          cardNumber: 'WTR001',
          cardIndex: 2,
          zone: 'arsenal'
        })
      ).toBe('arsenal:WTR001:2');
    });
  });

  describe('buildBoardCardSelectionKey', () => {
    it('builds a stable board key', () => {
      expect(
        buildBoardCardSelectionKey({ cardNumber: 'WTR001', isOpponent: false })
      ).toBe('board:me:WTR001');
      expect(
        buildBoardCardSelectionKey({ cardNumber: 'WTR001', isOpponent: true })
      ).toBe('board:opp:WTR001');
    });
  });
});
