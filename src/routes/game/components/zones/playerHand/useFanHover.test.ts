import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FAN_UNHOVER_GRACE_MS, useFanHover } from './useFanHover';

describe('useFanHover', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('never passes through an unhovered state when moving between cards', () => {
    const { result } = renderHook(() => useFanHover());
    const seen: (string | null)[] = [];

    act(() => result.current.handleHoverChange('a', true));
    seen.push(result.current.hoveredCardId);
    act(() => result.current.handleHoverChange('a', false));
    seen.push(result.current.hoveredCardId);
    act(() => result.current.handleHoverChange('b', true));
    seen.push(result.current.hoveredCardId);
    act(() => vi.advanceTimersByTime(FAN_UNHOVER_GRACE_MS * 2));
    seen.push(result.current.hoveredCardId);

    expect(seen).toEqual(['a', 'a', 'b', 'b']);
  });

  it('clears the hover after the grace period when the pointer leaves the hand', () => {
    const { result } = renderHook(() => useFanHover());

    act(() => result.current.handleHoverChange('a', true));
    act(() => result.current.handleHoverChange('a', false));
    act(() => vi.advanceTimersByTime(FAN_UNHOVER_GRACE_MS - 1));
    expect(result.current.hoveredCardId).toBe('a');

    act(() => result.current.handleHoverChange('a', false));
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.hoveredCardId).toBeNull();
  });

  it('keeps the hover when the same card is re-entered within the grace period', () => {
    const { result } = renderHook(() => useFanHover());

    act(() => result.current.handleHoverChange('a', true));
    act(() => result.current.handleHoverChange('a', false));
    act(() => result.current.handleHoverChange('a', true));
    act(() => vi.advanceTimersByTime(FAN_UNHOVER_GRACE_MS * 2));

    expect(result.current.hoveredCardId).toBe('a');
  });

  it('clears immediately on clearHover', () => {
    const { result } = renderHook(() => useFanHover());

    act(() => result.current.handleHoverChange('a', true));
    act(() => result.current.handleHoverChange('a', false));
    act(() => result.current.clearHover());
    expect(result.current.hoveredCardId).toBeNull();

    act(() => result.current.handleHoverChange('b', true));
    act(() => vi.advanceTimersByTime(FAN_UNHOVER_GRACE_MS * 2));
    expect(result.current.hoveredCardId).toBe('b');
  });
});
