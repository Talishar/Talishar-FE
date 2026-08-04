import { beforeEach, describe, expect, it } from 'vitest';
import {
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
  });

  describe('shouldDismissStickyPreviewOnOutsideTap', () => {
    it('dismisses when preview is active and tap is outside hand cards', () => {
      expect(
        shouldDismissStickyPreviewOnOutsideTap({
          enabled: true,
          selectedKey: 'id:card-a',
          isTapOnHandCard: false
        })
      ).toBe(true);
    });

    it('does not dismiss when tapping another hand card', () => {
      expect(
        shouldDismissStickyPreviewOnOutsideTap({
          enabled: true,
          selectedKey: 'id:card-a',
          isTapOnHandCard: true
        })
      ).toBe(false);
    });

    it('does not dismiss when option is off or nothing is selected', () => {
      expect(
        shouldDismissStickyPreviewOnOutsideTap({
          enabled: false,
          selectedKey: 'id:card-a',
          isTapOnHandCard: false
        })
      ).toBe(false);
      expect(
        shouldDismissStickyPreviewOnOutsideTap({
          enabled: true,
          selectedKey: null,
          isTapOnHandCard: false
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
});
