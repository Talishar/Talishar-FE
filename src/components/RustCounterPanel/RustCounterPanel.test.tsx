import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RustCounterPanel from './RustCounterPanel';

describe('RustCounterPanel rewarded ad fallback', () => {
  afterEach(() => {
    vi.useRealTimers();
    delete (window as any)._talishar_showRewarded;
  });

  it('uses the provider ad when one is ready', () => {
    const onFallbackAdComplete = vi.fn();
    (window as any)._talishar_showRewarded = vi.fn(() => true);

    render(
      <RustCounterPanel
        rustCounters={3}
        isSupporter={false}
        onFallbackAdComplete={onFallbackAdComplete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Watch Ad to Clear' }));

    expect((window as any)._talishar_showRewarded).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onFallbackAdComplete).not.toHaveBeenCalled();
  });

  it('keeps rewarded-ad testing available to supporters in development', () => {
    render(<RustCounterPanel rustCounters={0} isSupporter />);

    expect(
      screen.getByRole('button', { name: 'Watch Ad to Clear' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Development mode: rust counters do not block games.')
    ).toBeInTheDocument();
  });

  it('requires 8 visible seconds before clearing counters', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-25T12:00:00Z'));
    const onFallbackAdComplete = vi.fn();
    (window as any)._talishar_showRewarded = vi.fn(() => false);

    render(
      <RustCounterPanel
        rustCounters={3}
        isSupporter={false}
        onFallbackAdComplete={onFallbackAdComplete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Watch Ad to Clear' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const continueButton = screen.getByRole('button', {
      name: 'Continue in 8s'
    });
    expect(continueButton).toBeDisabled();
    expect(onFallbackAdComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(8_000);
    });

    const rewardButton = screen.getByRole('button', {
      name: 'Continue - Clear Your Rust Counters!'
    });
    expect(rewardButton).toBeEnabled();

    fireEvent.click(rewardButton);

    expect(onFallbackAdComplete).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
